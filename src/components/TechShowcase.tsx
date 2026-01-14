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
  Binary
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
    label: "Image Analysis",
    icon: Eye,
    color: "text-cyan-400",
    methods: [
      { name: "Noise Pattern Analysis", description: "Detects uniform GAN noise via coefficient of variation", score: "25%" },
      { name: "Sobel Edge Detection", description: "Identifies artificial sharpening and edge irregularities", score: "15%" },
      { name: "Color Histogram Analysis", description: "Finds unnatural color spikes and channel decorrelation", score: "15%" },
      { name: "JPEG Artifact Detection", description: "Detects 8x8 block boundaries from double compression", score: "15%" },
      { name: "Bilateral Symmetry Check", description: "Flags over-symmetric faces (GAN) or spliced regions", score: "15%" },
      { name: "LBP Texture Analysis", description: "Local Binary Pattern for texture consistency check", score: "15%" }
    ],
    realCode: `// Real implementation in src/lib/imageAnalyzer.ts
const analyzeNoise = (data, width, height) => {
  // Sample noise by looking at differences between adjacent pixels
  for (let y = 1; y < height - 1; y += 3) {
    for (let x = 1; x < width - 1; x += 3) {
      const idx = (y * width + x) * 4;
      const diffR = Math.abs(data[idx] - data[idxRight]);
      noiseValues.push((diffR + diffG + diffB) / 3);
    }
  }
  // Calculate coefficient of variation
  const coefficientOfVariation = (stdDev / mean) * 100;
  // GAN images have unnaturally uniform noise (CV < 30%)
}`
  },
  {
    id: "video",
    label: "Video Analysis",
    icon: Film,
    color: "text-purple-400",
    methods: [
      { name: "Frame Consistency", description: "Detects flickering via inter-frame difference variance", score: "20%" },
      { name: "Temporal Coherence", description: "Optical flow analysis for motion discontinuities", score: "20%" },
      { name: "Face Region Tracking", description: "Compares face vs background change ratios", score: "20%" },
      { name: "Compression Analysis", description: "Multi-frame 8x8 block artifact variance", score: "15%" },
      { name: "Motion Flow Analysis", description: "Acceleration-based unnatural motion detection", score: "15%" },
      { name: "Frame Extraction", description: "Samples 5-15 frames based on duration", score: "10%" }
    ],
    realCode: `// Real implementation in src/lib/videoAnalyzer.ts
const extractFrames = async (video, numFrames) => {
  const frames: ImageData[] = [];
  const interval = duration / (numFrames + 1);
  // Seek through video and capture frames
  video.onseeked = () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };
};

const analyzeTemporalCoherence = (frames) => {
  // Calculate optical flow between frames
  // Check for sudden motion discontinuities
  if (ratio > 3 || ratio < 0.33) discontinuities++;
};`
  },
  {
    id: "audio",
    label: "Audio Analysis",
    icon: AudioLines,
    color: "text-green-400",
    methods: [
      { name: "FFT Spectral Analysis", description: "Spectral centroid and flatness for TTS detection", score: "20%" },
      { name: "Autocorrelation Pitch", description: "Pitch consistency check via autocorrelation", score: "20%" },
      { name: "Noise Floor Detection", description: "Identifies unnaturally clean synthesized audio", score: "15%" },
      { name: "Quantization Analysis", description: "Detects heavy compression artifacts", score: "15%" },
      { name: "Voice Envelope", description: "Attack/decay pattern analysis for naturalness", score: "15%" },
      { name: "Frequency Distribution", description: "Band energy analysis (TTS lacks high-freq)", score: "15%" }
    ],
    realCode: `// Real implementation in src/lib/audioAnalyzer.ts
const computeFFT = (samples, fftSize) => {
  // Simple DFT implementation
  for (let k = 0; k < fftSize / 2; k++) {
    for (let n = 0; n < fftSize; n++) {
      const angle = (2 * Math.PI * k * n) / fftSize;
      realSum += real[n] * Math.cos(angle);
      imagSum -= real[n] * Math.sin(angle);
    }
    magnitudes[k] = Math.sqrt(realSum² + imagSum²) / fftSize;
  }
};

const analyzePitch = (audioBuffer) => {
  // Autocorrelation-based pitch detection
  // Natural speech has CV > 10%, TTS < 5%
};`
  },
  {
    id: "document",
    label: "Document Analysis",
    icon: FileText,
    color: "text-orange-400",
    methods: [
      { name: "PDF Metadata Forensics", description: "Parses producer, creator, dates for inconsistencies", score: "20%" },
      { name: "Byte Entropy Analysis", description: "High entropy (>90%) suggests obfuscation", score: "20%" },
      { name: "Content Consistency", description: "Null byte ratio and ASCII distribution check", score: "15%" },
      { name: "Creation Patterns", description: "Verifies legitimate producers and date formats", score: "15%" },
      { name: "Embedded Media Scan", description: "Detects JavaScript, embedded files, forms", score: "15%" },
      { name: "Modification History", description: "Creation vs modification date analysis", score: "15%" }
    ],
    realCode: `// Real implementation in src/lib/documentAnalyzer.ts
const parsePDFMetadata = async (file) => {
  const bytes = new Uint8Array(buffer);
  const text = new TextDecoder('latin1').decode(bytes);
  
  // Parse PDF version and metadata
  const versionMatch = text.match(/%PDF-(\\d+\\.\\d+)/);
  const producerMatch = text.match(/\\/Producer\\s*\\(([^)]*)\\)/);
  const hasEncryption = text.includes('/Encrypt');
  
  return { version, producer, creator, hasEncryption };
};

const analyzeBytePatterns = async (file) => {
  // Calculate Shannon entropy
  entropy -= p * Math.log2(p);
  return entropyScore / 8 * 100; // Normalize to 0-100
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
      { name: "Camera Switching", description: "Supports front/back camera toggle", score: "—" },
      { name: "Audio+Video Sync", description: "Records with microphone when permitted", score: "—" }
    ],
    realCode: `// Real implementation in MediaUploader.tsx
const startCamera = async (mode) => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: mode, width: { ideal: 1920 } },
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
      { name: "Real-time Levels", description: "FFT-based frequency visualization", score: "—" },
      { name: "Opus Recording", description: "MediaRecorder with WebM/Opus encoding", score: "—" },
      { name: "Level Monitoring", description: "RequestAnimationFrame for smooth meters", score: "—" }
    ],
    realCode: `// Real implementation in MediaUploader.tsx
const startAudioCapture = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: { echoCancellation: true, noiseSuppression: true }
  });
  
  // Set up audio visualization
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  analyser.fftSize = 256;
  
  // Real-time level monitoring
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
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
            All analysis is performed client-side using real algorithms — no simulated or random data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <span>Browser-Based ML</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechShowcase;
