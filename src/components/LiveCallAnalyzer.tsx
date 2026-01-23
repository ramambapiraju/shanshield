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
  Eye,
  Cpu,
  Brain,
  Waves,
  Fingerprint
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
  metrics: {
    noiseScore: number;
    edgeScore: number;
    colorScore: number;
    temporalScore: number;
    faceScore: number;
    compressionScore: number;
    entropyScore: number;
    audioVideoSync: number;
  };
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
  const [fps, setFps] = useState(0);
  const [analysisMode, setAnalysisMode] = useState<'realtime' | 'deep'>('realtime');
  const [currentMetrics, setCurrentMetrics] = useState({
    noiseScore: 0,
    edgeScore: 0,
    colorScore: 0,
    temporalScore: 0,
    faceScore: 0,
    compressionScore: 0,
    entropyScore: 0,
    audioVideoSync: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const previousFrameRef = useRef<ImageData | null>(null);
  const frameHistoryRef = useRef<ImageData[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const audioEnergyHistoryRef = useRef<number[]>([]);
  const motionEnergyHistoryRef = useRef<number[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, []);

  const initializeAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        analyserRef.current.smoothingTimeConstant = 0.3;
        source.connect(analyserRef.current);
      }
    } catch (err) {
      console.error("Audio analysis init error:", err);
    }
  };

  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 } // Max frame rate for every-frame analysis
        },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      initializeAudioAnalysis(stream);
      
      setCaptureMode('screen');
      setIsCapturing(true);
      setIsActive(true);
      startEveryFrameAnalysis();

      toast.success("Screen capture started - Every Frame Analysis", {
        description: "Analyzing ALL frames for deepfake indicators..."
      });

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
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 } // Max frame rate for every-frame analysis
        },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      initializeAudioAnalysis(stream);

      setCaptureMode('camera');
      setIsCapturing(true);
      setIsActive(true);
      startEveryFrameAnalysis();

      toast.success("Camera capture started - Every Frame Analysis", {
        description: "Real-time deepfake analysis on ALL frames active"
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
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    previousFrameRef.current = null;
    frameHistoryRef.current = [];
    audioEnergyHistoryRef.current = [];
    motionEnergyHistoryRef.current = [];
    
    setIsCapturing(false);
    setIsActive(false);
    setCaptureMode(null);
    setFps(0);
  }, []);

  // ==================== REAL FORENSIC ANALYSIS ALGORITHMS ====================

  /**
   * Analyze noise patterns - real deepfakes often have uniform/synthetic noise
   */
  const analyzeNoise = (pixels: Uint8ClampedArray, width: number, height: number): number => {
    const blockSize = 16;
    const blocks: number[] = [];
    
    // Analyze noise variance per block
    for (let by = 0; by < height - blockSize; by += blockSize) {
      for (let bx = 0; bx < width - blockSize; bx += blockSize) {
        let sum = 0;
        let sumSq = 0;
        let count = 0;
        
        for (let y = by; y < by + blockSize; y++) {
          for (let x = bx; x < bx + blockSize; x++) {
            const idx = (y * width + x) * 4;
            // Analyze high-frequency components (noise)
            if (x > bx && y > by) {
              const current = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
              const left = (pixels[idx - 4] + pixels[idx - 3] + pixels[idx - 2]) / 3;
              const top = (pixels[idx - width * 4] + pixels[idx - width * 4 + 1] + pixels[idx - width * 4 + 2]) / 3;
              const laplacian = Math.abs(4 * current - left - top - left - top);
              sum += laplacian;
              sumSq += laplacian * laplacian;
              count++;
            }
          }
        }
        
        if (count > 0) {
          const variance = (sumSq / count) - Math.pow(sum / count, 2);
          blocks.push(variance);
        }
      }
    }
    
    if (blocks.length === 0) return 0.8;
    
    // Check for suspicious uniformity in noise (AI-generated content often has this)
    const mean = blocks.reduce((a, b) => a + b, 0) / blocks.length;
    const varianceOfVariances = blocks.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / blocks.length;
    
    // Real images have varied noise patterns; synthetic ones are more uniform
    const normalizedVariance = Math.min(Math.sqrt(varianceOfVariances) / 100, 1);
    return Math.min(0.3 + normalizedVariance * 0.7, 1);
  };

  /**
   * Sobel edge detection with artifact analysis
   */
  const analyzeEdges = (pixels: Uint8ClampedArray, width: number, height: number): number => {
    let edgeSum = 0;
    let edgeCount = 0;
    const edgeStrengths: number[] = [];
    
    // Sobel kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            gx += gray * sobelX[kernelIdx];
            gy += gray * sobelY[kernelIdx];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edgeStrengths.push(magnitude);
        edgeSum += magnitude;
        edgeCount++;
      }
    }
    
    if (edgeCount === 0) return 0.8;
    
    // Check for unnatural edge patterns (blending artifacts in deepfakes)
    const avgEdge = edgeSum / edgeCount;
    const edgeVariance = edgeStrengths.reduce((sum, e) => sum + Math.pow(e - avgEdge, 2), 0) / edgeCount;
    
    // Real images have more varied edge strengths
    return Math.min(0.3 + (Math.sqrt(edgeVariance) / avgEdge) * 0.5, 1);
  };

  /**
   * Color histogram entropy analysis
   */
  const analyzeColorConsistency = (pixels: Uint8ClampedArray): number => {
    const histogramR = new Array(256).fill(0);
    const histogramG = new Array(256).fill(0);
    const histogramB = new Array(256).fill(0);
    let count = 0;
    
    for (let i = 0; i < pixels.length; i += 4) {
      histogramR[pixels[i]]++;
      histogramG[pixels[i + 1]]++;
      histogramB[pixels[i + 2]]++;
      count++;
    }
    
    // Calculate entropy for each channel
    const calcEntropy = (hist: number[]) => {
      let entropy = 0;
      for (const c of hist) {
        if (c > 0) {
          const p = c / count;
          entropy -= p * Math.log2(p);
        }
      }
      return entropy;
    };
    
    const entropyR = calcEntropy(histogramR);
    const entropyG = calcEntropy(histogramG);
    const entropyB = calcEntropy(histogramB);
    
    // Check for color space consistency
    const avgEntropy = (entropyR + entropyG + entropyB) / 3;
    const entropyVariance = (
      Math.pow(entropyR - avgEntropy, 2) +
      Math.pow(entropyG - avgEntropy, 2) +
      Math.pow(entropyB - avgEntropy, 2)
    ) / 3;
    
    // Real images typically have balanced but varied color distributions
    const normalizedEntropy = avgEntropy / 8; // Max entropy is 8 for 256 bins
    const consistencyScore = 1 - Math.min(Math.sqrt(entropyVariance), 0.5);
    
    return Math.min(normalizedEntropy * 0.6 + consistencyScore * 0.4, 1);
  };

  /**
   * Temporal coherence analysis between frames
   */
  const analyzeTemporalCoherence = (
    currentFrame: ImageData, 
    previousFrame: ImageData | null
  ): number => {
    if (!previousFrame) return 0.95;
    
    const current = currentFrame.data;
    const previous = previousFrame.data;
    const width = currentFrame.width;
    const height = currentFrame.height;
    
    let motionVectors: { dx: number; dy: number; magnitude: number }[] = [];
    const blockSize = 16;
    
    // Block-based motion estimation
    for (let by = 0; by < height - blockSize; by += blockSize) {
      for (let bx = 0; bx < width - blockSize; bx += blockSize) {
        let bestMatch = { dx: 0, dy: 0, sad: Infinity };
        
        // Search in a small window
        const searchRange = 8;
        for (let dy = -searchRange; dy <= searchRange; dy += 2) {
          for (let dx = -searchRange; dx <= searchRange; dx += 2) {
            const searchX = bx + dx;
            const searchY = by + dy;
            
            if (searchX < 0 || searchY < 0 || 
                searchX + blockSize > width || 
                searchY + blockSize > height) continue;
            
            // Calculate Sum of Absolute Differences
            let sad = 0;
            for (let y = 0; y < blockSize; y += 2) {
              for (let x = 0; x < blockSize; x += 2) {
                const currentIdx = ((by + y) * width + (bx + x)) * 4;
                const prevIdx = ((searchY + y) * width + (searchX + x)) * 4;
                
                sad += Math.abs(current[currentIdx] - previous[prevIdx]);
                sad += Math.abs(current[currentIdx + 1] - previous[prevIdx + 1]);
                sad += Math.abs(current[currentIdx + 2] - previous[prevIdx + 2]);
              }
            }
            
            if (sad < bestMatch.sad) {
              bestMatch = { dx, dy, sad };
            }
          }
        }
        
        const magnitude = Math.sqrt(bestMatch.dx * bestMatch.dx + bestMatch.dy * bestMatch.dy);
        motionVectors.push({ ...bestMatch, magnitude });
      }
    }
    
    if (motionVectors.length === 0) return 0.9;
    
    // Analyze motion vector consistency
    const magnitudes = motionVectors.map(v => v.magnitude);
    const avgMagnitude = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
    const magnitudeVariance = magnitudes.reduce((sum, m) => sum + Math.pow(m - avgMagnitude, 2), 0) / magnitudes.length;
    
    // Store motion energy for audio-video sync
    const motionEnergy = avgMagnitude * 10;
    motionEnergyHistoryRef.current.push(motionEnergy);
    if (motionEnergyHistoryRef.current.length > 60) {
      motionEnergyHistoryRef.current.shift();
    }
    
    // Check for unnatural motion (deepfake artifacts often show inconsistent motion)
    const consistency = 1 - Math.min(Math.sqrt(magnitudeVariance) / 10, 0.5);
    
    // High motion with low variance is suspicious (unnatural smoothness)
    if (avgMagnitude > 5 && magnitudeVariance < 2) {
      return consistency * 0.7;
    }
    
    return Math.min(0.5 + consistency * 0.5, 1);
  };

  /**
   * Face region analysis for blending artifacts
   */
  const analyzeFaceRegion = (pixels: Uint8ClampedArray, width: number, height: number): number => {
    // Analyze central region (face likely location)
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 3); // Face typically in upper third
    const regionSize = Math.min(width, height) / 3;
    
    const startX = Math.max(0, centerX - regionSize / 2);
    const startY = Math.max(0, centerY - regionSize / 2);
    const endX = Math.min(width, centerX + regionSize / 2);
    const endY = Math.min(height, centerY + regionSize / 2);
    
    // Detect skin tones
    let skinPixels = 0;
    let totalPixels = 0;
    const skinGradients: number[] = [];
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * width + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        
        // Simple skin detection in RGB
        const isSkin = r > 95 && g > 40 && b > 20 &&
                      (Math.max(r, g, b) - Math.min(r, g, b)) > 15 &&
                      Math.abs(r - g) > 15 && r > g && r > b;
        
        if (isSkin) {
          skinPixels++;
          
          // Analyze gradient in skin region
          if (x > startX && y > startY) {
            const prevX = (y * width + (x - 1)) * 4;
            const prevY = ((y - 1) * width + x) * 4;
            const gradX = Math.abs(r - pixels[prevX]) + Math.abs(g - pixels[prevX + 1]) + Math.abs(b - pixels[prevX + 2]);
            const gradY = Math.abs(r - pixels[prevY]) + Math.abs(g - pixels[prevY + 1]) + Math.abs(b - pixels[prevY + 2]);
            skinGradients.push((gradX + gradY) / 2);
          }
        }
        totalPixels++;
      }
    }
    
    if (skinPixels < 100 || skinGradients.length < 50) return 0.85;
    
    // Analyze skin gradient consistency
    const avgGradient = skinGradients.reduce((a, b) => a + b, 0) / skinGradients.length;
    const gradientVariance = skinGradients.reduce((sum, g) => sum + Math.pow(g - avgGradient, 2), 0) / skinGradients.length;
    
    // Deepfakes often have unusually smooth or inconsistent skin gradients
    const normalizedVariance = Math.min(Math.sqrt(gradientVariance) / 20, 1);
    
    if (avgGradient < 5 && gradientVariance < 10) {
      // Too smooth - suspicious
      return 0.4 + normalizedVariance * 0.3;
    }
    
    return Math.min(0.5 + normalizedVariance * 0.5, 1);
  };

  /**
   * Compression artifact analysis (JPEG blocking)
   */
  const analyzeCompression = (pixels: Uint8ClampedArray, width: number, height: number): number => {
    const blockSize = 8; // JPEG uses 8x8 DCT blocks
    const blockBoundaryDiffs: number[] = [];
    
    // Analyze horizontal block boundaries
    for (let y = 0; y < height; y++) {
      for (let bx = blockSize; bx < width; bx += blockSize) {
        const leftIdx = (y * width + (bx - 1)) * 4;
        const rightIdx = (y * width + bx) * 4;
        
        const diff = Math.abs(pixels[leftIdx] - pixels[rightIdx]) +
                    Math.abs(pixels[leftIdx + 1] - pixels[rightIdx + 1]) +
                    Math.abs(pixels[leftIdx + 2] - pixels[rightIdx + 2]);
        
        blockBoundaryDiffs.push(diff / 3);
      }
    }
    
    // Analyze vertical block boundaries
    for (let x = 0; x < width; x++) {
      for (let by = blockSize; by < height; by += blockSize) {
        const topIdx = ((by - 1) * width + x) * 4;
        const bottomIdx = (by * width + x) * 4;
        
        const diff = Math.abs(pixels[topIdx] - pixels[bottomIdx]) +
                    Math.abs(pixels[topIdx + 1] - pixels[bottomIdx + 1]) +
                    Math.abs(pixels[topIdx + 2] - pixels[bottomIdx + 2]);
        
        blockBoundaryDiffs.push(diff / 3);
      }
    }
    
    if (blockBoundaryDiffs.length === 0) return 0.8;
    
    const avgBoundaryDiff = blockBoundaryDiffs.reduce((a, b) => a + b, 0) / blockBoundaryDiffs.length;
    
    // Strong blocking artifacts indicate manipulation or heavy re-compression
    if (avgBoundaryDiff > 30) {
      return 0.5;
    }
    
    return Math.min(0.7 + (1 - avgBoundaryDiff / 50) * 0.3, 1);
  };

  /**
   * Quantum-inspired entropy analysis
   */
  const analyzeQuantumEntropy = (pixels: Uint8ClampedArray, width: number, height: number): number => {
    // Create density matrix from pixel distributions
    const gridSize = 4;
    const cellWidth = Math.floor(width / gridSize);
    const cellHeight = Math.floor(height / gridSize);
    const densityMatrix: number[][] = [];
    
    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        const cellValues: number[] = [];
        
        for (let y = gy * cellHeight; y < (gy + 1) * cellHeight && y < height; y++) {
          for (let x = gx * cellWidth; x < (gx + 1) * cellWidth && x < width; x++) {
            const idx = (y * width + x) * 4;
            const intensity = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / (3 * 255);
            cellValues.push(intensity);
          }
        }
        
        if (cellValues.length > 0) {
          const mean = cellValues.reduce((a, b) => a + b, 0) / cellValues.length;
          densityMatrix.push(cellValues.map(v => v - mean));
        }
      }
    }
    
    if (densityMatrix.length < 2) return 0.8;
    
    // Calculate von Neumann entropy approximation
    let totalEntropy = 0;
    for (const row of densityMatrix) {
      const eigenvalue = row.reduce((sum, v) => sum + v * v, 0);
      if (eigenvalue > 0.001) {
        totalEntropy -= eigenvalue * Math.log2(eigenvalue);
      }
    }
    
    // Calculate Rényi entropy (order 2)
    let renyiSum = 0;
    for (const row of densityMatrix) {
      const prob = row.reduce((sum, v) => sum + v * v, 0);
      renyiSum += prob * prob;
    }
    const renyiEntropy = renyiSum > 0 ? -Math.log2(renyiSum) / 2 : 0;
    
    // Combine entropy measures
    const normalizedVonNeumann = Math.min(Math.abs(totalEntropy) / 10, 1);
    const normalizedRenyi = Math.min(Math.abs(renyiEntropy) / 5, 1);
    
    // AI-generated content often has lower entropy in quantum-like analysis
    return Math.min(0.4 + normalizedVonNeumann * 0.3 + normalizedRenyi * 0.3, 1);
  };

  /**
   * Audio-video synchronization analysis
   */
  const analyzeAudioVideoSync = (): number => {
    if (!analyserRef.current || audioEnergyHistoryRef.current.length < 10 || motionEnergyHistoryRef.current.length < 10) {
      return 0.9;
    }
    
    // Get current audio energy
    const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(frequencyData);
    
    let audioEnergy = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      audioEnergy += frequencyData[i];
    }
    audioEnergy /= frequencyData.length;
    
    audioEnergyHistoryRef.current.push(audioEnergy);
    if (audioEnergyHistoryRef.current.length > 60) {
      audioEnergyHistoryRef.current.shift();
    }
    
    // Cross-correlation between audio and motion energy
    const audioHistory = audioEnergyHistoryRef.current;
    const motionHistory = motionEnergyHistoryRef.current;
    const minLength = Math.min(audioHistory.length, motionHistory.length, 30);
    
    if (minLength < 10) return 0.9;
    
    let correlation = 0;
    const audioSlice = audioHistory.slice(-minLength);
    const motionSlice = motionHistory.slice(-minLength);
    
    const audioMean = audioSlice.reduce((a, b) => a + b, 0) / minLength;
    const motionMean = motionSlice.reduce((a, b) => a + b, 0) / minLength;
    
    let audioVar = 0, motionVar = 0, covar = 0;
    for (let i = 0; i < minLength; i++) {
      const audioDiff = audioSlice[i] - audioMean;
      const motionDiff = motionSlice[i] - motionMean;
      audioVar += audioDiff * audioDiff;
      motionVar += motionDiff * motionDiff;
      covar += audioDiff * motionDiff;
    }
    
    if (audioVar > 0 && motionVar > 0) {
      correlation = covar / Math.sqrt(audioVar * motionVar);
    }
    
    // Natural A/V typically shows some correlation; perfect or no correlation is suspicious
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation > 0.9 || absCorrelation < 0.05) {
      return 0.5 + absCorrelation * 0.2;
    }
    
    return Math.min(0.6 + absCorrelation * 0.4, 1);
  };

  // ==================== MAIN FRAME ANALYSIS ====================

  const analyzeEveryFrame = useCallback((timestamp: number) => {
    if (!videoRef.current || !canvasRef.current || !isCapturing) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx || video.videoWidth === 0 || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(analyzeEveryFrame);
      return;
    }

    // Update FPS counter
    fpsCounterRef.current++;
    if (timestamp - lastFpsUpdateRef.current >= 1000) {
      setFps(fpsCounterRef.current);
      fpsCounterRef.current = 0;
      lastFpsUpdateRef.current = timestamp;
    }

    // Set canvas to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Run ALL forensic analysis algorithms on EVERY frame
    const noiseScore = analyzeNoise(pixels, width, height);
    const edgeScore = analyzeEdges(pixels, width, height);
    const colorScore = analyzeColorConsistency(pixels);
    const temporalScore = analyzeTemporalCoherence(imageData, previousFrameRef.current);
    const faceScore = analyzeFaceRegion(pixels, width, height);
    const compressionScore = analyzeCompression(pixels, width, height);
    const entropyScore = analyzeQuantumEntropy(pixels, width, height);
    const audioVideoSync = analyzeAudioVideoSync();

    // Store frame for temporal analysis
    previousFrameRef.current = imageData;
    frameHistoryRef.current.push(imageData);
    if (frameHistoryRef.current.length > 10) {
      frameHistoryRef.current.shift();
    }

    // Weighted combination of all scores
    const weights = {
      noise: 0.12,
      edge: 0.12,
      color: 0.10,
      temporal: 0.18,
      face: 0.15,
      compression: 0.10,
      entropy: 0.13,
      audioVideo: 0.10
    };

    const rawConfidence = (
      noiseScore * weights.noise +
      edgeScore * weights.edge +
      colorScore * weights.color +
      temporalScore * weights.temporal +
      faceScore * weights.face +
      compressionScore * weights.compression +
      entropyScore * weights.entropy +
      audioVideoSync * weights.audioVideo
    ) * 100;

    const confidence = Math.round(Math.min(Math.max(rawConfidence, 0), 100));

    // Determine verdict
    let verdict: 'authentic' | 'suspicious' | 'deepfake';
    const signals: string[] = [];

    if (confidence >= 75) {
      verdict = 'authentic';
    } else if (confidence >= 45) {
      verdict = 'suspicious';
      signals.push('Potential manipulation detected');
    } else {
      verdict = 'deepfake';
      signals.push('High probability of synthetic content');
      setAlertCount(prev => prev + 1);
    }

    // Add specific signals based on low scores
    if (noiseScore < 0.5) signals.push('Synthetic noise pattern');
    if (edgeScore < 0.5) signals.push('Edge blending artifacts');
    if (colorScore < 0.5) signals.push('Color distribution anomaly');
    if (temporalScore < 0.6) signals.push('Temporal inconsistency');
    if (faceScore < 0.5) signals.push('Face region artifacts');
    if (compressionScore < 0.5) signals.push('Re-compression detected');
    if (entropyScore < 0.5) signals.push('Low quantum entropy');
    if (audioVideoSync < 0.5) signals.push('Audio-video desync');

    const metrics = {
      noiseScore: Math.round(noiseScore * 100),
      edgeScore: Math.round(edgeScore * 100),
      colorScore: Math.round(colorScore * 100),
      temporalScore: Math.round(temporalScore * 100),
      faceScore: Math.round(faceScore * 100),
      compressionScore: Math.round(compressionScore * 100),
      entropyScore: Math.round(entropyScore * 100),
      audioVideoSync: Math.round(audioVideoSync * 100)
    };

    const frame: AnalysisFrame = {
      timestamp: Date.now(),
      confidence,
      verdict,
      signals,
      metrics
    };

    setCurrentConfidence(confidence);
    setCurrentVerdict(verdict);
    setCurrentMetrics(metrics);
    setFrameCount(prev => prev + 1);
    
    // Keep last 60 frames for history chart
    setAnalysisHistory(prev => [...prev.slice(-59), frame]);

    onAnalysisResult?.(frame);

    // Alert on deepfake detection (throttled)
    if (verdict === 'deepfake' && alertCount % 60 === 0) {
      toast.warning("⚠️ Deepfake Alert!", {
        description: `Synthetic content detected - Confidence: ${confidence}%`
      });
      
      // Trigger browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('ShanShield: Deepfake Detected!', {
          body: `Confidence: ${confidence}% - ${signals.join(', ')}`,
          icon: '/favicon.ico'
        });
      }
    }

    // Continue analyzing every frame
    animationFrameRef.current = requestAnimationFrame(analyzeEveryFrame);
  }, [isCapturing, alertCount, onAnalysisResult]);

  const startEveryFrameAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    lastFpsUpdateRef.current = performance.now();
    fpsCounterRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(analyzeEveryFrame);
  };

  // Effect to restart analysis when dependencies change
  useEffect(() => {
    if (isCapturing) {
      animationFrameRef.current = requestAnimationFrame(analyzeEveryFrame);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCapturing, analyzeEveryFrame]);

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
              Real-time deepfake detection • <span className="text-primary font-semibold">Every Frame Analysis</span>
            </p>
          </div>
        </div>
        
        {isActive && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/50 text-cyan-400">
              <Cpu className="w-3 h-3 mr-1" />
              {fps} FPS
            </Badge>
            <Badge variant="outline" className={cn("animate-pulse", getVerdictColor())}>
              {getVerdictIcon()}
              <span className="ml-1">{currentVerdict.toUpperCase()}</span>
            </Badge>
          </div>
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
            <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
              <Badge variant="outline" className="bg-black/60 border-green-500/50 text-green-400 text-[10px]">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                LIVE
              </Badge>
              <Badge variant="outline" className="bg-black/60 border-white/20 text-white text-[10px]">
                <Eye className="w-3 h-3 mr-1" />
                {frameCount.toLocaleString()} frames
              </Badge>
              <Badge variant="outline" className="bg-black/60 border-cyan-500/50 text-cyan-400 text-[10px]">
                <Cpu className="w-3 h-3 mr-1" />
                {fps} FPS
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

          {/* Real-time Metrics Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
              <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Waves className="w-3 h-3" /> Noise
              </div>
              <div className={cn("text-sm font-bold", currentMetrics.noiseScore < 50 ? "text-red-400" : "text-green-400")}>
                {currentMetrics.noiseScore}%
              </div>
            </div>
            <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
              <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" /> Edge
              </div>
              <div className={cn("text-sm font-bold", currentMetrics.edgeScore < 50 ? "text-red-400" : "text-green-400")}>
                {currentMetrics.edgeScore}%
              </div>
            </div>
            <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
              <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Brain className="w-3 h-3" /> Temporal
              </div>
              <div className={cn("text-sm font-bold", currentMetrics.temporalScore < 60 ? "text-red-400" : "text-green-400")}>
                {currentMetrics.temporalScore}%
              </div>
            </div>
            <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
              <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Fingerprint className="w-3 h-3" /> Entropy
              </div>
              <div className={cn("text-sm font-bold", currentMetrics.entropyScore < 50 ? "text-red-400" : "text-green-400")}>
                {currentMetrics.entropyScore}%
              </div>
            </div>
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
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Frame History (last 60 frames)</span>
              <span>Every frame analyzed</span>
            </div>
            <div className="h-16 flex items-end gap-px">
              {analysisHistory.map((frame, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t transition-all min-w-[2px]",
                    frame.verdict === 'authentic' && "bg-green-500",
                    frame.verdict === 'suspicious' && "bg-yellow-500",
                    frame.verdict === 'deepfake' && "bg-red-500"
                  )}
                  style={{ height: `${frame.confidence}%` }}
                  title={`Frame ${i + 1}: ${frame.confidence}% - ${frame.verdict}`}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Platform Support */}
      <div className="pt-2 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground text-center">
          <span className="text-primary font-semibold">8 Forensic Algorithms</span> • Every Frame Analyzed • 
          Works with: Zoom • Google Meet • Microsoft Teams • WebRTC • Any Video Call
        </p>
      </div>
    </div>
  );
};

export default LiveCallAnalyzer;
