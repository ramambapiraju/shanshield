import { useState } from "react";
import { 
  Eye, 
  AudioLines, 
  Film, 
  FileText, 
  Camera, 
  Mic, 
  Cpu, 
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Binary,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TechMethod {
  name: string;
  description: string;
  score?: string;
}

interface TechCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  methods: TechMethod[];
  realCode: string;
}

const techCategories: TechCategory[] = [
  {
    id: "image",
    label: "Visual Agent",
    icon: Eye,
    color: "text-cyan-400",
    methods: [
      { name: "Noise Pattern Analysis", description: "Detects uniform GAN noise via coefficient of variation on local blocks", score: "20%" },
      { name: "Sobel Edge Detection", description: "Identifies artificial sharpening using mean/median edge ratio", score: "15%" },
      { name: "Color Histogram Analysis", description: "Finds unnatural color spikes and channel decorrelation", score: "15%" },
      { name: "JPEG Artifact Detection", description: "Detects 8x8 block boundaries from double compression", score: "15%" },
      { name: "Bilateral Symmetry Check", description: "Flags over-symmetric faces (GAN) or spliced regions", score: "15%" },
      { name: "LBP Texture Analysis", description: "Local Binary Pattern for texture consistency check", score: "10%" },
      { name: "Repetition Detection", description: "Detects micro-pattern tiling artifacts in AI images", score: "5%" },
      { name: "Gradient Analysis", description: "Identifies unnaturally smooth banded gradients", score: "5%" }
    ],
    realCode: `// From src/lib/imageAnalyzer.ts - analyzeNoise()
const analyzeNoise = (data, width, height) => {
  const noiseValues = [];
  const localVariances = [];
  
  // Sample noise by looking at differences between adjacent pixels
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const idx = (y * width + x) * 4;
      const idxRight = (y * width + x + 1) * 4;
      const idxDown = ((y + 1) * width + x) * 4;
      
      const diffR = Math.abs(data[idx] - data[idxRight]) + Math.abs(data[idx] - data[idxDown]);
      noiseValues.push((diffR + diffG + diffB) / 3);
    }
  }
  
  // Calculate coefficient of variation
  const coefficientOfVariation = (stdDev / mean) * 100;
  
  // GAN images have unnaturally uniform noise (CV < 25% AND local < 30%)
  if (coefficientOfVariation < 25 && localCV < 30) {
    score = 75 + (25 - coefficientOfVariation) * 1.5;
  }
};`
  },
  {
    id: "video",
    label: "Temporal Agent",
    icon: Film,
    color: "text-purple-400",
    methods: [
      { name: "Frame Consistency", description: "Detects flickering via inter-frame difference variance", score: "20%" },
      { name: "Temporal Coherence", description: "Optical flow approximation for motion discontinuities", score: "20%" },
      { name: "Face Region Tracking", description: "Compares face vs background change ratios for warping", score: "20%" },
      { name: "Compression Analysis", description: "Multi-frame 8x8 block artifact variance detection", score: "15%" },
      { name: "Motion Flow Analysis", description: "Acceleration-based unnatural motion detection", score: "15%" },
      { name: "Audio-Video Sync", description: "Baseline temporal correlation check", score: "10%" }
    ],
    realCode: `// From src/lib/videoAnalyzer.ts - extractFrames() & analyzeTemporalCoherence()
const extractFrames = (video, numFrames = 10) => {
  const frames = [];
  const interval = duration / (numFrames + 1);
  
  video.onseeked = () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };
};

const analyzeTemporalCoherence = (frames) => {
  // Calculate optical flow approximation between frames
  for (let i = 1; i < frames.length; i++) {
    // Gradient calculation for motion vectors
    const dx = ((curr[dxIdx] + curr[dxIdx+1] + curr[dxIdx+2]) / 3) - currGray;
    const dy = ((curr[dyIdx] + curr[dyIdx+1] + curr[dyIdx+2]) / 3) - currGray;
    
    // Check for sudden motion discontinuities
    const ratio = motionVectors[i] / (motionVectors[i-1] + 0.01);
    if (ratio > 3 || ratio < 0.33) discontinuities++;
  }
};`
  },
  {
    id: "audio",
    label: "Audio Agent",
    icon: AudioLines,
    color: "text-green-400",
    methods: [
      { name: "FFT Spectral Analysis", description: "Spectral centroid and flatness for TTS detection", score: "20%" },
      { name: "Autocorrelation Pitch", description: "Pitch consistency check via autocorrelation", score: "20%" },
      { name: "Noise Floor Detection", description: "Identifies unnaturally clean synthesized audio", score: "15%" },
      { name: "Quantization Analysis", description: "Detects heavy compression via unique level count", score: "15%" },
      { name: "Voice Envelope", description: "Attack/decay pattern analysis for naturalness", score: "15%" },
      { name: "Frequency Distribution", description: "Band energy analysis (TTS lacks high-freq)", score: "15%" }
    ],
    realCode: `// From src/lib/audioAnalyzer.ts - computeFFT() & analyzePitch()
const computeFFT = (samples, fftSize = 2048) => {
  const magnitudes = new Float32Array(fftSize / 2);
  
  for (let k = 0; k < fftSize / 2; k++) {
    let realSum = 0, imagSum = 0;
    for (let n = 0; n < fftSize; n++) {
      const angle = (2 * Math.PI * k * n) / fftSize;
      realSum += real[n] * Math.cos(angle);
      imagSum -= real[n] * Math.sin(angle);
    }
    magnitudes[k] = Math.sqrt(realSum*realSum + imagSum*imagSum) / fftSize;
  }
};

const analyzePitch = (audioBuffer) => {
  // Autocorrelation-based pitch detection
  for (let lag = 20; lag < frameSize / 2; lag++) {
    let sum = 0;
    for (let i = 0; i < frameSize - lag; i++) {
      sum += frame[i] * frame[i + lag];
    }
    autocorr[lag] = sum;
  }
  // Natural speech has CV > 10%, TTS often < 5%
};`
  },
  {
    id: "document",
    label: "Metadata Agent",
    icon: FileText,
    color: "text-orange-400",
    methods: [
      { name: "PDF Metadata Forensics", description: "Parses producer, creator, dates for inconsistencies", score: "20%" },
      { name: "Byte Entropy Analysis", description: "Shannon entropy calculation - high entropy suggests obfuscation", score: "20%" },
      { name: "Structure Analysis", description: "Stream count and binary ratio examination", score: "15%" },
      { name: "Content Consistency", description: "Null byte ratio and ASCII distribution check", score: "15%" },
      { name: "Embedded Media Scan", description: "Detects JavaScript, embedded files, forms", score: "15%" },
      { name: "Modification History", description: "Creation vs modification date comparison", score: "15%" }
    ],
    realCode: `// From src/lib/documentAnalyzer.ts - parsePDFMetadata() & analyzeBytePatterns()
const parsePDFMetadata = async (file) => {
  const bytes = new Uint8Array(buffer);
  const text = new TextDecoder('latin1').decode(bytes);
  
  const versionMatch = text.match(/%PDF-(\\d+\\.\\d+)/);
  const producerMatch = text.match(/\\/Producer\\s*\\(([^)]*)\\)/);
  const hasEncryption = text.includes('/Encrypt');
  
  return { version, producer, creator, hasEncryption, streamCount };
};

const analyzeBytePatterns = async (file) => {
  // Calculate Shannon entropy
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (byteCounts[i] > 0) {
      const p = byteCounts[i] / sampleSize;
      entropy -= p * Math.log2(p);
    }
  }
  return { entropyScore: entropy / 8 * 100, nullByteRatio, binaryRatio };
};`
  },
  {
    id: "arbiter",
    label: "Arbiter Agent",
    icon: Brain,
    color: "text-primary",
    methods: [
      { name: "Weighted Score Fusion", description: "Combines agent scores with media-type specific weights", score: "40%" },
      { name: "Signal Aggregation", description: "Collects signals above threshold from all agents", score: "25%" },
      { name: "Confidence Calibration", description: "Adjusts final verdict based on signal count", score: "20%" },
      { name: "Verdict Generation", description: "Produces AUTHENTIC/SUSPICIOUS/MANIPULATED label", score: "15%" }
    ],
    realCode: `// From src/hooks/useAnalysis.ts - Score fusion logic
const calculateOverallScore = (results) => {
  // Each analyzer returns weighted subscores
  // Image: noise 20%, edge 15%, color 15%, compression 15%, symmetry 15%, texture 10%...
  // Video: frameConsistency 20%, temporalCoherence 20%, faceTracking 20%...
  // Audio: spectral 20%, pitch 20%, noiseFloor 15%, compression 15%...
  // Document: metadata 20%, structure 20%, content 15%...
  
  const signals = [];
  const threshold = 50;
  
  // Collect all signals above threshold
  if (analysisScore > threshold) signals.push(description);
  
  // Final verdict based on overall score
  return score < 35 ? 'AUTHENTIC' : score < 65 ? 'SUSPICIOUS' : 'MANIPULATED';
};`
  },
  {
    id: "live-capture",
    label: "Live Capture",
    icon: Camera,
    color: "text-red-400",
    methods: [
      { name: "WebRTC Camera Access", description: "getUserMedia with 1920x1080 resolution", score: "—" },
      { name: "Frame Capture", description: "Canvas-based JPEG capture at 95% quality", score: "—" },
      { name: "Video Recording", description: "MediaRecorder with VP9/H.264 codecs", score: "—" },
      { name: "Camera Switching", description: "Supports front/back camera toggle", score: "—" }
    ],
    realCode: `// From src/components/analysis/MediaUploader.tsx
const startCamera = async (mode) => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
    audio: true 
  });
  videoRef.current.srcObject = stream;
};

const captureFromCamera = () => {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob((blob) => {
    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
    processFiles([file]);
  }, 'image/jpeg', 0.95);
};`
  },
  {
    id: "live-audio",
    label: "Live Audio",
    icon: Mic,
    color: "text-yellow-400",
    methods: [
      { name: "Audio Context API", description: "Web Audio API with echo/noise cancellation", score: "—" },
      { name: "Real-time FFT", description: "AnalyserNode for live frequency visualization", score: "—" },
      { name: "WebM Recording", description: "MediaRecorder with Opus encoding", score: "—" },
      { name: "Level Monitoring", description: "RequestAnimationFrame for smooth meters", score: "—" }
    ],
    realCode: `// From src/components/analysis/MediaUploader.tsx
const startAudioCapture = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: { echoCancellation: true, noiseSuppression: true }
  });
  
  // Set up audio visualization with Web Audio API
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  analyser.fftSize = 256;
  
  // Real-time level monitoring
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
};`
  }
];

const TechShowcase = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showCode, setShowCode] = useState<string | null>(null);

  return (
    <section className="relative border-t border-border/50 bg-card/30 backdrop-blur-xl mt-8">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-gradient-cyber tracking-wider">
              REAL DETECTION METHODS
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            All analysis is performed client-side using real algorithms — no external APIs or simulated data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {techCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategory === category.id;
            const isCodeVisible = showCode === category.id;

            return (
              <div
                key={category.id}
                className={cn(
                  "bg-card/60 border rounded-lg transition-all duration-300",
                  isExpanded ? "border-primary/50 ring-1 ring-primary/20" : "border-border/50 hover:border-border"
                )}
              >
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10")}>
                      <Icon className={cn("w-5 h-5", category.color)} />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-semibold text-foreground tracking-wide">
                        {category.label}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        {category.methods.length} detection methods
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="space-y-2">
                      {category.methods.map((method, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 rounded bg-background/50 border border-border/30"
                        >
                          <Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-foreground truncate">
                                {method.name}
                              </span>
                              {method.score && (
                                <span className="text-[10px] text-primary font-mono flex-shrink-0">
                                  {method.score}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCode(isCodeVisible ? null : category.id);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
                    >
                      <Binary className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-display text-primary tracking-wider uppercase">
                        {isCodeVisible ? "Hide Code" : "View Real Code"}
                      </span>
                    </button>

                    {isCodeVisible && (
                      <div className="mt-2 p-3 rounded bg-background/80 border border-border/50 overflow-x-auto">
                        <pre className="text-[9px] text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">
                          {category.realCode}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-success" />
            <span>100% Client-Side</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-primary" />
            <span>No External APIs</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Browser-Native Processing</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechShowcase;
