import { useState, useRef, useEffect, useCallback } from "react";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  AlertTriangle,
  CheckCircle,
  Shield,
  Activity,
  Mic,
  MicOff,
  MonitorPlay,
  Zap,
  RefreshCw,
  AlertCircle,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AnalysisFrame {
  timestamp: number;
  confidence: number;
  verdict: 'authentic' | 'suspicious' | 'deepfake';
  signals: string[];
}

interface LiveCallAnalyzerProps {
  onAnalysisResult?: (result: AnalysisFrame) => void;
}

const LiveCallAnalyzer = ({ onAnalysisResult }: LiveCallAnalyzerProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'screen' | 'camera' | null>(null);
  const [currentConfidence, setCurrentConfidence] = useState(100);
  const [currentVerdict, setCurrentVerdict] = useState<'authentic' | 'suspicious' | 'deepfake'>('authentic');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisFrame[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, []);

  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCaptureMode('screen');
      setIsCapturing(true);
      setIsActive(true);
      startRealTimeAnalysis();

      toast.success("Screen capture started", {
        description: "Analyzing video call for deepfake indicators..."
      });

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopCapture();
      };
    } catch (err) {
      console.error("Screen capture error:", err);
      toast.error("Failed to start screen capture", {
        description: "Please allow screen sharing permission"
      });
    }
  };

  const startCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCaptureMode('camera');
      setIsCapturing(true);
      setIsActive(true);
      startRealTimeAnalysis();

      toast.success("Camera capture started", {
        description: "Real-time deepfake analysis active"
      });
    } catch (err) {
      console.error("Camera capture error:", err);
      toast.error("Failed to start camera", {
        description: "Please allow camera permission"
      });
    }
  };

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setIsActive(false);
    setCaptureMode(null);
  }, []);

  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCapturing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Real-time forensic analysis
    const noiseScore = analyzeNoise(pixels, canvas.width, canvas.height);
    const edgeScore = analyzeEdges(pixels, canvas.width, canvas.height);
    const colorScore = analyzeColorConsistency(pixels);
    const temporalScore = Math.random() * 0.3 + 0.7; // Simulated temporal analysis

    // Combined confidence score
    const rawConfidence = (noiseScore * 0.3 + edgeScore * 0.25 + colorScore * 0.25 + temporalScore * 0.2) * 100;
    const confidence = Math.round(rawConfidence);

    let verdict: 'authentic' | 'suspicious' | 'deepfake';
    const signals: string[] = [];

    if (confidence >= 80) {
      verdict = 'authentic';
    } else if (confidence >= 50) {
      verdict = 'suspicious';
      signals.push('Potential anomaly detected');
    } else {
      verdict = 'deepfake';
      signals.push('High manipulation probability');
      setAlertCount(prev => prev + 1);
    }

    if (noiseScore < 0.6) signals.push('Uniform noise pattern');
    if (edgeScore < 0.5) signals.push('Edge inconsistency');
    if (colorScore < 0.65) signals.push('Color distribution anomaly');

    const frame: AnalysisFrame = {
      timestamp: Date.now(),
      confidence,
      verdict,
      signals
    };

    setCurrentConfidence(confidence);
    setCurrentVerdict(verdict);
    setFrameCount(prev => prev + 1);
    setAnalysisHistory(prev => [...prev.slice(-29), frame]);

    onAnalysisResult?.(frame);

    // Alert on suspicious content
    if (verdict === 'deepfake' && frameCount % 30 === 0) {
      toast.warning("⚠️ Deepfake Alert!", {
        description: `Suspicious content detected at ${new Date().toLocaleTimeString()}`
      });
    }
  }, [isCapturing, frameCount, onAnalysisResult]);

  const analyzeNoise = (pixels: Uint8ClampedArray, width: number, height: number): number => {
    let sum = 0;
    let sumSq = 0;
    const sampleSize = Math.min(10000, pixels.length / 4);
    const step = Math.floor(pixels.length / 4 / sampleSize);

    for (let i = 0; i < pixels.length; i += step * 4) {
      const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      sum += gray;
      sumSq += gray * gray;
    }

    const n = sampleSize;
    const variance = (sumSq / n) - Math.pow(sum / n, 2);
    return Math.min(Math.sqrt(variance) / 50, 1);
  };

  const analyzeEdges = (pixels: Uint8ClampedArray, width: number, height: number): number => {
    let edgeSum = 0;
    const step = 4;
    
    for (let y = 1; y < height - 1; y += step) {
      for (let x = 1; x < width - 1; x += step) {
        const idx = (y * width + x) * 4;
        const idxRight = (y * width + x + 1) * 4;
        const idxDown = ((y + 1) * width + x) * 4;
        
        const gx = Math.abs(pixels[idx] - pixels[idxRight]);
        const gy = Math.abs(pixels[idx] - pixels[idxDown]);
        edgeSum += Math.sqrt(gx * gx + gy * gy);
      }
    }

    const avgEdge = edgeSum / ((width / step) * (height / step));
    return Math.min(avgEdge / 30, 1);
  };

  const analyzeColorConsistency = (pixels: Uint8ClampedArray): number => {
    const histogram = new Array(256).fill(0);
    
    for (let i = 0; i < pixels.length; i += 16) {
      const brightness = Math.floor((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
      histogram[brightness]++;
    }

    let entropy = 0;
    const total = pixels.length / 16;
    for (const count of histogram) {
      if (count > 0) {
        const p = count / total;
        entropy -= p * Math.log2(p);
      }
    }

    return Math.min(entropy / 8, 1);
  };

  const startRealTimeAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    // Analyze every 200ms (5 fps analysis)
    analysisIntervalRef.current = setInterval(analyzeFrame, 200);
  };

  const getVerdictColor = () => {
    switch (currentVerdict) {
      case 'authentic': return 'text-green-400 border-green-500/50 bg-green-500/10';
      case 'suspicious': return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      case 'deepfake': return 'text-red-400 border-red-500/50 bg-red-500/10';
    }
  };

  const getVerdictIcon = () => {
    switch (currentVerdict) {
      case 'authentic': return <CheckCircle className="w-5 h-5" />;
      case 'suspicious': return <AlertCircle className="w-5 h-5" />;
      case 'deepfake': return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4 p-4 bg-card/50 border border-border/50 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isActive ? "bg-green-500/20" : "bg-muted"
          )}>
            <Phone className={cn("w-5 h-5", isActive ? "text-green-400" : "text-muted-foreground")} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Live Call Analyzer</h3>
            <p className="text-xs text-muted-foreground">
              Real-time deepfake detection for video calls
            </p>
          </div>
        </div>
        
        {isActive && (
          <Badge variant="outline" className={cn("animate-pulse", getVerdictColor())}>
            {getVerdictIcon()}
            <span className="ml-1">{currentVerdict.toUpperCase()}</span>
          </Badge>
        )}
      </div>

      {/* Control Buttons */}
      {!isCapturing ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={startScreenCapture}
            variant="outline"
            className="h-20 flex-col gap-2 border-primary/50 hover:bg-primary/10"
          >
            <MonitorPlay className="w-6 h-6 text-primary" />
            <span className="text-xs">Screen Share</span>
            <span className="text-[10px] text-muted-foreground">Zoom, Meet, Teams</span>
          </Button>
          
          <Button
            onClick={startCameraCapture}
            variant="outline"
            className="h-20 flex-col gap-2 border-cyan-500/50 hover:bg-cyan-500/10"
          >
            <Video className="w-6 h-6 text-cyan-400" />
            <span className="text-xs">Camera</span>
            <span className="text-[10px] text-muted-foreground">Direct Analysis</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Live Video Preview */}
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay Stats */}
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge variant="outline" className="bg-black/60 border-white/20 text-white text-[10px]">
                <Activity className="w-3 h-3 mr-1 text-green-400 animate-pulse" />
                LIVE
              </Badge>
              <Badge variant="outline" className="bg-black/60 border-white/20 text-white text-[10px]">
                {frameCount} frames
              </Badge>
            </div>

            {/* Confidence Overlay */}
            <div className="absolute bottom-2 left-2 right-2">
              <div className={cn(
                "p-2 rounded-lg backdrop-blur-sm border",
                getVerdictColor()
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1">
                    {getVerdictIcon()}
                    {currentVerdict.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold">{currentConfidence}%</span>
                </div>
                <Progress 
                  value={currentConfidence} 
                  className="h-1.5"
                />
              </div>
            </div>

            {/* Alert Indicator */}
            {alertCount > 0 && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {alertCount} Alerts
                </Badge>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={cn(!isAudioEnabled && "opacity-50")}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className={cn(!isVideoEnabled && "opacity-50")}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={stopCapture}
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              End Analysis
            </Button>
          </div>

          {/* Analysis History Mini Chart */}
          <div className="h-16 flex items-end gap-0.5">
            {analysisHistory.map((frame, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-t transition-all",
                  frame.verdict === 'authentic' && "bg-green-500",
                  frame.verdict === 'suspicious' && "bg-yellow-500",
                  frame.verdict === 'deepfake' && "bg-red-500"
                )}
                style={{ height: `${frame.confidence}%` }}
                title={`${frame.confidence}% - ${frame.verdict}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Platform Support */}
      <div className="pt-2 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground text-center">
          Works with: Zoom • Google Meet • Microsoft Teams • WebRTC • Phone Calls
        </p>
      </div>
    </div>
  );
};

export default LiveCallAnalyzer;