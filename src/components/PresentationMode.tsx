import { useState, useEffect, useCallback } from "react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Shield,
  Eye,
  Mic,
  Database,
  Brain,
  Target,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Lock,
  Activity,
  Layers,
  Wifi,
  Maximize2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SlideData {
  id: string;
  title: string;
  subtitle?: string;
  duration: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

interface PresentationModeProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const PresentationMode = ({ isOpen, onClose }: PresentationModeProps) => {
  const [isVisible, setIsVisible] = useState(isOpen ?? false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen !== undefined) {
      setIsVisible(isOpen);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [onClose]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5" || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "p")) {
        e.preventDefault();
        if (isVisible) {
          handleClose();
        } else {
          setIsVisible(true);
        }
      }
      if (e.key === "Escape" && isVisible) {
        handleClose();
      }
      if (isVisible) {
        if (e.key === "ArrowRight" || e.key === " ") {
          e.preventDefault();
          setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setCurrentSlide((prev) => Math.max(prev - 1, 0));
        }
        if (e.key === "f" || e.key === "F") {
          toggleFullscreen();
        }
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isVisible, toggleFullscreen, handleClose]);

  const slides: SlideData[] = [
    // SLIDE 1: TITLE
    {
      id: "title",
      title: "SHANSHIELD",
      subtitle: "Multi-Agent Forensic Intelligence for Deepfake Detection",
      duration: "30 sec",
      icon: Shield,
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <div className="relative">
            <Shield className="w-32 h-32 text-primary animate-pulse" />
            <div className="absolute inset-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          </div>
          <div className="space-y-4">
            <h1 className="text-7xl font-bold text-gradient-cyber font-display tracking-wider">
              SHANSHIELD
            </h1>
            <p className="text-2xl text-muted-foreground max-w-3xl">
              Multi-Agent Forensic Intelligence for Deepfake Detection
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">5s</div>
              <div className="text-sm text-muted-foreground">Avg Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">4+1</div>
              <div className="text-sm text-muted-foreground">AI Agents + Arbiter</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Client-Side / Offline</div>
            </div>
          </div>
          <p className="text-xl text-foreground mt-8">
            Presented by <span className="text-primary font-bold">Shanmuka Sai Varma</span>
          </p>
        </div>
      )
    },

    // SLIDE 2: THE PROBLEM
    {
      id: "problem",
      title: "The Problem",
      subtitle: "Why Current Detection Systems Fail",
      duration: "1 min",
      icon: AlertTriangle,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-foreground font-display">The Deepfake Crisis</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center p-8 bg-destructive/10 rounded-2xl border border-destructive/30">
              <div className="text-6xl font-bold text-destructive">$25B</div>
              <div className="text-lg text-muted-foreground mt-2">Annual fraud losses (2024)</div>
            </div>
            <div className="text-center p-8 bg-warning/10 rounded-2xl border border-warning/30">
              <div className="text-6xl font-bold text-warning">500K+</div>
              <div className="text-lg text-muted-foreground mt-2">Deepfakes shared daily</div>
            </div>
            <div className="text-center p-8 bg-destructive/10 rounded-2xl border border-destructive/30">
              <div className="text-6xl font-bold text-destructive">73%</div>
              <div className="text-lg text-muted-foreground mt-2">Humans fail to detect</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-card border border-border rounded-xl">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold mb-4">1</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Single-Modal Blindness</h3>
              <p className="text-muted-foreground">Tools analyze video OR audio — never both. Attackers exploit this gap.</p>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold mb-4">2</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Black Box Crisis</h3>
              <p className="text-muted-foreground">"85% fake" is USELESS in court. No explanation of WHY or WHERE.</p>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold mb-4">3</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Cloud Dependency</h3>
              <p className="text-muted-foreground">Border agents, analysts need offline detection. None exists.</p>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 3: MULTI-AGENT ARCHITECTURE
    {
      id: "architecture",
      title: "Multi-Agent Architecture",
      subtitle: "Four Specialized AI Agents That Collaborate",
      duration: "1 min 30 sec",
      icon: Brain,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-8">
            Agentic AI Defense System
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-10 h-10 text-blue-400" />
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Visual Agent</h3>
                  <span className="text-blue-400 font-semibold">35% weight</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2">
                <li>• <span className="text-blue-400 font-semibold">Noise Pattern Analysis</span> — GAN uniformity detection</li>
                <li>• Sobel Edge Detection for artificial sharpening</li>
                <li>• Color histogram & channel decorrelation</li>
                <li>• JPEG double compression artifacts</li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-2 border-purple-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Mic className="w-10 h-10 text-purple-400" />
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Audio Agent</h3>
                  <span className="text-purple-400 font-semibold">25% weight</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2">
                <li>• <span className="text-purple-400 font-semibold">FFT Spectral Analysis</span> — TTS detection</li>
                <li>• Autocorrelation pitch consistency</li>
                <li>• Noise floor anomaly detection</li>
                <li>• Voice envelope naturalness scoring</li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-2 border-cyan-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-10 h-10 text-cyan-400" />
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Temporal Agent</h3>
                  <span className="text-cyan-400 font-semibold">25% weight</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2">
                <li>• <span className="text-cyan-400 font-semibold">Frame Consistency</span> — Flicker detection</li>
                <li>• Motion vector coherence analysis</li>
                <li>• Face vs background change ratios</li>
                <li>• Compression artifact variance</li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-10 h-10 text-amber-400" />
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Metadata Agent</h3>
                  <span className="text-amber-400 font-semibold">15% weight</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2">
                <li>• <span className="text-amber-400 font-semibold">SHA-256 Hashing</span> — Integrity verification</li>
                <li>• EXIF/XMP AI generation markers</li>
                <li>• Byte entropy analysis for obfuscation</li>
                <li>• Fuzzy hashing for similarity detection</li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-primary/50 rounded-2xl">
            <div className="flex items-center gap-4">
              <Brain className="w-12 h-12 text-primary" />
              <div>
                <h3 className="text-2xl font-bold text-foreground">Arbiter Agent — The Judge</h3>
                <p className="text-muted-foreground">Dempster-Shafer belief fusion • Conflict detection • Weighted consensus</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 4: VISUAL AGENT DEEP-DIVE WITH CODE
    {
      id: "visual-deep",
      title: "Visual Agent Deep-Dive",
      subtitle: "Seeing What Humans Can't — With Code",
      duration: "1 min 30 sec",
      icon: Eye,
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-center font-display text-foreground mb-4">
            Visual Agent — src/lib/imageAnalyzer.ts
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Noise Analysis with Code */}
            <div className="p-4 bg-card border border-blue-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Noise Pattern Analysis
              </h3>
              <pre className="p-3 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Sample adjacent pixel differences
for (let y = 1; y < height - 1; y += 2) {
  const idx = (y * width + x) * 4;
  const idxRight = (y * width + x + 1) * 4;
  const diffR = Math.abs(data[idx] - data[idxRight]);
  noiseValues.push((diffR + diffG + diffB) / 3);
}
// Calculate coefficient of variation
const cv = (stdDev / mean) * 100;
// CV < 30% = synthetic origin (GAN)`}</pre>
              <p className="text-xs text-muted-foreground">GAN images have unnaturally uniform noise patterns</p>
            </div>

            {/* Sobel Edge Detection with Code */}
            <div className="p-4 bg-card border border-cyan-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Sobel Edge Detection
              </h3>
              <pre className="p-3 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Sobel kernels for gradient detection
const Gx = [[-1,0,1],[-2,0,2],[-1,0,1]];
const Gy = [[-1,-2,-1],[0,0,0],[1,2,1]];

// Compute gradient magnitude
const gradX = convolve(pixels, Gx);
const gradY = convolve(pixels, Gy);
const magnitude = Math.sqrt(gradX² + gradY²);

// Detect artificial sharpening artifacts`}</pre>
              <p className="text-xs text-muted-foreground">Detects artificial sharpening & edge artifacts</p>
            </div>

            {/* LBP Texture Analysis */}
            <div className="p-4 bg-card border border-purple-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Local Binary Patterns (LBP)
              </h3>
              <pre className="p-3 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Compare center pixel to 8 neighbors
let lbpCode = 0;
for (let i = 0; i < 8; i++) {
  const neighbor = getNeighbor(x, y, i);
  if (neighbor >= centerPixel) {
    lbpCode |= (1 << i);
  }
}
// Build histogram of LBP codes
histogram[lbpCode]++;`}</pre>
              <p className="text-xs text-muted-foreground">Detects texture inconsistencies in skin regions</p>
            </div>

            {/* Color Histogram Analysis */}
            <div className="p-4 bg-card border border-amber-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Color Histogram Analysis
              </h3>
              <pre className="p-3 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Build color histograms per channel
const histR = new Array(256).fill(0);
const histG = new Array(256).fill(0);
const histB = new Array(256).fill(0);

for (let i = 0; i < data.length; i += 4) {
  histR[data[i]]++;
  histG[data[i+1]]++;
  histB[data[i+2]]++;
}`}</pre>
              <p className="text-xs text-muted-foreground">Analyzes color distribution for AI patterns</p>
            </div>
          </div>

          {/* Formula Box */}
          <div className="p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/40 rounded-xl">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="font-mono text-lg text-blue-400">CV = (σ / μ) × 100</div>
                <div className="text-xs text-muted-foreground">Coefficient of Variation</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="font-mono text-lg text-cyan-400">G = √(Gx² + Gy²)</div>
                <div className="text-xs text-muted-foreground">Sobel Gradient Magnitude</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="font-mono text-lg text-purple-400">LBP = Σ s(pᵢ - c) × 2ⁱ</div>
                <div className="text-xs text-muted-foreground">Local Binary Pattern</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 5: AUDIO & TEMPORAL AGENTS WITH CODE
    {
      id: "audio-temporal",
      title: "Audio & Temporal Analysis",
      subtitle: "Hearing and Timing What's Wrong — With Code",
      duration: "1 min 30 sec",
      icon: Mic,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Audio Agent */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
                <Mic className="w-6 h-6 text-purple-400" />
                Audio Agent — src/lib/audioAnalyzer.ts
              </h2>
              
              {/* FFT Code */}
              <div className="p-3 bg-card border border-purple-500/40 rounded-xl">
                <h4 className="text-lg font-bold text-purple-400 mb-2">FFT Spectral Analysis</h4>
                <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Discrete Fourier Transform
const computeFFT = (samples, fftSize = 2048) => {
  const magnitudes = new Float32Array(fftSize / 2);
  for (let k = 0; k < fftSize / 2; k++) {
    let realSum = 0, imagSum = 0;
    for (let n = 0; n < fftSize; n++) {
      const angle = (2 * Math.PI * k * n) / fftSize;
      realSum += real[n] * Math.cos(angle);
      imagSum -= real[n] * Math.sin(angle);
    }
    magnitudes[k] = Math.sqrt(realSum² + imagSum²);
  }
  return magnitudes;
};`}</pre>
              </div>

              {/* Pitch Tracking */}
              <div className="p-3 bg-card border border-purple-500/40 rounded-xl">
                <h4 className="text-lg font-bold text-purple-400 mb-2">Pitch Autocorrelation</h4>
                <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Autocorrelation for pitch detection
// R(τ) = Σ x(n) × x(n + τ)
const R_tau = computeAutocorrelation(samples);
const pitchVariance = calculateVariance(pitches);
// TTS: low variance = synthetic voice`}</pre>
              </div>
            </div>

            {/* Temporal Agent */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
                <Activity className="w-6 h-6 text-cyan-400" />
                Temporal Agent — src/lib/videoAnalyzer.ts
              </h2>
              
              {/* Frame Extraction */}
              <div className="p-3 bg-card border border-cyan-500/40 rounded-xl">
                <h4 className="text-lg font-bold text-cyan-400 mb-2">Frame Extraction & Analysis</h4>
                <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Extract frames at intervals
video.currentTime = i * interval;
await new Promise(r => video.onseeked = r);
ctx.drawImage(video, 0, 0, width, height);
const frameData = ctx.getImageData(0, 0, w, h);

// Inter-frame difference analysis
for (let p = 0; p < curr.length; p += 4) {
  diff += Math.abs(curr[p] - prev[p]);
}
const avgDiff = diff / (w * h);`}</pre>
              </div>

              {/* Flicker Detection */}
              <div className="p-3 bg-card border border-cyan-500/40 rounded-xl">
                <h4 className="text-lg font-bold text-cyan-400 mb-2">Flicker Detection</h4>
                <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Detect high-frequency brightness changes
const flickerScore = detectFlicker(diffs);
// High variance = temporal inconsistency
// Deepfakes often have frame-level glitches`}</pre>
              </div>
            </div>
          </div>

          {/* Formula Box */}
          <div className="p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/40 rounded-xl">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-mono text-lg text-purple-400">X(k) = Σ x(n)·e^(-2πikn/N)</div>
                <div className="text-xs text-muted-foreground">Discrete Fourier Transform</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="font-mono text-lg text-purple-400">R(τ) = Σ x(n)·x(n+τ)</div>
                <div className="text-xs text-muted-foreground">Autocorrelation</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="font-mono text-lg text-cyan-400">Δf = |F(t) - F(t-1)|</div>
                <div className="text-xs text-muted-foreground">Inter-Frame Difference</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 6: EXPLAINABLE AI & CHAIN OF CUSTODY
    {
      id: "explainability",
      title: "Explainable AI",
      subtitle: "Court-Ready Evidence Generation",
      duration: "1 min",
      icon: CheckCircle,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-6">
            From Black Box to Glass Box
          </h2>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-primary">Why Explainability Matters</h3>
              <div className="p-6 bg-card border border-border rounded-xl space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Legal Requirement</p>
                    <p className="text-muted-foreground">EU AI Act mandates explainability for high-stakes decisions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Court Admissibility</p>
                    <p className="text-muted-foreground">Evidence must show WHERE and WHY manipulation occurred</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Trust Building</p>
                    <p className="text-muted-foreground">Operators need to understand AI decisions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-primary">How SHANSHIELD Explains</h3>
              <div className="p-6 bg-card border border-border rounded-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <p className="font-semibold text-foreground">Per-Agent Reasoning</p>
                    <p className="text-sm text-muted-foreground">Each agent provides its own analysis and score</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <p className="font-semibold text-foreground">Conflict Detection</p>
                    <p className="text-sm text-muted-foreground">When agents disagree, we flag it explicitly</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <p className="font-semibold text-foreground">Natural Language Reports</p>
                    <p className="text-sm text-muted-foreground">Human-readable forensic summaries</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">4</div>
                  <div>
                    <p className="font-semibold text-foreground">Confidence Intervals</p>
                    <p className="text-sm text-muted-foreground">Statistical uncertainty quantification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl">
            <h4 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              Chain of Custody — Cryptographic Evidence Trail
            </h4>
            <div className="grid grid-cols-4 gap-4 text-center text-sm text-muted-foreground">
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="text-primary font-bold">SHA-256</div>
                <div>File hashing</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="text-primary font-bold">Timestamps</div>
                <div>Analysis time</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="text-primary font-bold">EXIF Parse</div>
                <div>Metadata extraction</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="text-primary font-bold">Audit Logs</div>
                <div>Immutable records</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 7: FIELD MODE
    {
      id: "field-mode",
      title: "Field Mode",
      subtitle: "True Offline Client-Side Detection",
      duration: "45 sec",
      icon: Wifi,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-6">
            Detection Anywhere — No Cloud Required
          </h2>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 bg-card border border-border rounded-xl">
              <Cpu className="w-12 h-12 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">100%</div>
              <div className="text-muted-foreground">Client-Side</div>
            </div>
            <div className="text-center p-6 bg-card border border-border rounded-xl">
              <Zap className="w-12 h-12 text-warning mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">&lt;6s</div>
              <div className="text-muted-foreground">Analysis time</div>
            </div>
            <div className="text-center p-6 bg-card border border-border rounded-xl">
              <Wifi className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">0</div>
              <div className="text-muted-foreground">External API calls</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="text-xl font-bold text-foreground mb-4">Browser-Native Technologies</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Canvas API</strong> — Frame extraction & processing</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Web Audio API</strong> — FFT & spectral analysis</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Web Crypto API</strong> — SHA-256 hashing</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-muted-foreground"><strong className="text-foreground">FileReader API</strong> — Binary parsing</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="text-xl font-bold text-foreground mb-4">Deployment Benefits</h3>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Works offline / air-gapped environments</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>No data leaves user's device</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>No API keys or subscriptions needed</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Scales to unlimited users at zero cost</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>GDPR/privacy compliant by design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 8: METADATA AGENT WITH CODE
    {
      id: "metadata-agent",
      title: "Metadata Agent",
      subtitle: "Document Forensics & Integrity — With Code",
      duration: "45 sec",
      icon: Database,
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-center font-display text-foreground mb-4">
            Metadata Agent — src/lib/documentAnalyzer.ts
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* SHA-256 Hashing */}
            <div className="p-4 bg-card border border-amber-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                SHA-256 File Hashing
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Web Crypto API for integrity hashing
const hashBuffer = await crypto.subtle.digest(
  'SHA-256', 
  arrayBuffer
);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hashHex = hashArray
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');
// 64-char hex = unique file fingerprint`}</pre>
            </div>

            {/* Shannon Entropy */}
            <div className="p-4 bg-card border border-amber-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Shannon Entropy Analysis
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Byte-level entropy calculation
const byteCounts = new Array(256).fill(0);
for (let i = 0; i < sampleSize; i++) {
  byteCounts[bytes[i]]++;
}
let entropy = 0;
for (let i = 0; i < 256; i++) {
  if (byteCounts[i] > 0) {
    const p = byteCounts[i] / sampleSize;
    entropy -= p * Math.log2(p);
  }
}`}</pre>
            </div>

            {/* EXIF Parsing */}
            <div className="p-4 bg-card border border-amber-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                <Database className="w-5 h-5" />
                EXIF/XMP Extraction
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Parse embedded metadata
const producerMatch = text.match(
  /\\/Producer\\s*\\(([^)]*)\\)/
);
const creatorMatch = text.match(
  /\\/Creator\\s*\\(([^)]*)\\)/
);
// Detect AI generation markers:
// "DALL-E", "Midjourney", "Stable Diffusion"`}</pre>
            </div>

            {/* Magic Bytes */}
            <div className="p-4 bg-card border border-amber-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Magic Byte Verification
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Verify file signature matches extension
const pngMagic = [0x89, 0x50, 0x4E, 0x47];
const jpegMagic = [0xFF, 0xD8, 0xFF];

const headerBytes = bytes.slice(0, 8);
const isPNG = pngMagic.every(
  (b, i) => headerBytes[i] === b
);
// Mismatch = possible tampering`}</pre>
            </div>
          </div>

          {/* Formula Box */}
          <div className="p-3 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/40 rounded-xl">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="font-mono text-lg text-amber-400">H = -Σ p(x) × log₂(p(x))</div>
                <div className="text-xs text-muted-foreground">Shannon Entropy Formula</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="font-mono text-lg text-amber-400">Max H = 8 bits/byte</div>
                <div className="text-xs text-muted-foreground">Random data = high entropy</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 9: ARBITER AGENT WITH CODE
    {
      id: "arbiter",
      title: "The Arbiter",
      subtitle: "Dempster-Shafer Belief Fusion — With Code",
      duration: "1 min",
      icon: Brain,
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-center font-display text-foreground mb-4">
            Arbiter Agent — Belief Fusion
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Dempster-Shafer Theory */}
            <div className="p-4 bg-card border border-primary/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Dempster-Shafer Combination Rule
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Dempster-Shafer Belief Fusion
// m₁₂(A) = Σ m₁(B)×m₂(C) / (1 - K)
// K = conflict measure

const combineBeliefs = (agents) => {
  let belief_fake = 1, belief_real = 1;
  
  for (const agent of agents) {
    belief_fake *= agent.fakeScore;
    belief_real *= agent.realScore;
  }
  
  // Normalize
  const K = 1 - (belief_fake + belief_real);
  return {
    fake: belief_fake / (1 - K),
    real: belief_real / (1 - K),
    conflict: K
  };
};`}</pre>
            </div>

            {/* Weighted Consensus */}
            <div className="p-4 bg-card border border-primary/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <Target className="w-5 h-5" />
                Weighted Agent Scores
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Agent weight configuration
const weights = {
  visual:   0.35,  // Primary signal
  audio:    0.25,  // Voice analysis
  temporal: 0.25,  // Frame consistency
  metadata: 0.15   // Supporting evidence
};

// Weighted combination
const finalScore = 
  visual   * weights.visual   +
  audio    * weights.audio    +
  temporal * weights.temporal +
  metadata * weights.metadata;`}</pre>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-xs text-muted-foreground">Visual: 35%</span>
                  <div className="flex-1 h-1 bg-blue-400/30 rounded">
                    <div className="h-1 bg-blue-400 rounded" style={{ width: '35%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-xs text-muted-foreground">Audio: 25%</span>
                  <div className="flex-1 h-1 bg-purple-400/30 rounded">
                    <div className="h-1 bg-purple-400 rounded" style={{ width: '25%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs text-muted-foreground">Temporal: 25%</span>
                  <div className="flex-1 h-1 bg-cyan-400/30 rounded">
                    <div className="h-1 bg-cyan-400 rounded" style={{ width: '25%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs text-muted-foreground">Metadata: 15%</span>
                  <div className="flex-1 h-1 bg-amber-400/30 rounded">
                    <div className="h-1 bg-amber-400 rounded" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conflict Detection */}
          <div className="p-4 bg-gradient-to-r from-destructive/10 to-primary/10 border-2 border-primary/50 rounded-xl">
            <h4 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Conflict Detection
            </h4>
            <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground">
{`// Flag when agents strongly disagree
if (conflict > 0.7) {
  verdict = "CONFLICT_DETECTED";
  reason = "Visual says FAKE but Audio says REAL — sophisticated attack possible";
}`}</pre>
          </div>
        </div>
      )
    },

    // SLIDE 9: DEMO WALKTHROUGH
    {
      id: "demo",
      title: "Live Demo",
      subtitle: "See SHANSHIELD in Action",
      duration: "2 min",
      icon: Zap,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-8">
            Demo Walkthrough
          </h2>

          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-card border border-border rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-4">1</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Upload Media</h3>
              <p className="text-muted-foreground">
                Drag & drop any image, video, audio, or document. Or use live camera/microphone capture.
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-4">2</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Watch Analysis</h3>
              <p className="text-muted-foreground">
                See each agent work in real-time. Visual, Audio, Temporal, and Metadata agents analyze simultaneously.
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-4">3</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Review Results</h3>
              <p className="text-muted-foreground">
                Get detailed verdict with per-agent scores, conflict detection, and explainable reasoning.
              </p>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Try It Now!</h3>
            <p className="text-lg text-muted-foreground mb-4">
              Exit presentation mode and upload a file to see real client-side deepfake detection.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                No signup required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                100% private
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Works offline
              </span>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 10: FUTURE ROADMAP
    {
      id: "roadmap",
      title: "Future Roadmap",
      subtitle: "Advanced Features in Development",
      duration: "45 sec",
      icon: Target,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-6">
            Coming Soon — Advanced Detection
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-10 h-10 text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">Neural Network Models</h3>
                  <span className="text-blue-400 font-semibold">Planned</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• <span className="text-blue-400 font-semibold">EfficientNetV2-L</span> — 118M parameter detection</li>
                <li>• GAN/Diffusion fingerprint classification</li>
                <li>• Generator ID: Sora, Runway, DALL-E 4</li>
                <li>• Requires WebGPU/WASM inference</li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-2 border-purple-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Mic className="w-10 h-10 text-purple-400" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">Advanced Voice Analysis</h3>
                  <span className="text-purple-400 font-semibold">Planned</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• <span className="text-purple-400 font-semibold">RawNet3</span> vocoder detection</li>
                <li>• Wav2Vec2 semantic analysis</li>
                <li>• Clone ID: ElevenLabs, XTTS, Bark</li>
                <li>• Breathing pattern verification</li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-2 border-cyan-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-10 h-10 text-cyan-400" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">Biometric Analysis</h3>
                  <span className="text-cyan-400 font-semibold">Planned</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• <span className="text-cyan-400 font-semibold">rPPG</span> heartbeat detection (0.8-2Hz)</li>
                <li>• 478-point facial landmark tracking</li>
                <li>• Blink pattern validation (PERCLOS)</li>
                <li>• RAFT optical flow analysis</li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-10 h-10 text-amber-400" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">Provenance Verification</h3>
                  <span className="text-amber-400 font-semibold">Planned</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• <span className="text-amber-400 font-semibold">C2PA</span> content credentials</li>
                <li>• SHA-3/256 cryptographic chaining</li>
                <li>• Blockchain audit trail</li>
                <li>• Digital watermark detection</li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-primary/50 rounded-xl">
            <h4 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-primary" />
              Technical Requirements
            </h4>
            <p className="text-muted-foreground">
              These advanced features require <span className="text-primary font-bold">WebGPU</span> for neural network inference, 
              <span className="text-primary font-bold"> MediaPipe</span> for facial landmarks, and 
              <span className="text-primary font-bold"> server-side processing</span> for C2PA verification. 
              Current implementation uses optimized browser-native algorithms that work 100% offline.
            </p>
          </div>
        </div>
      )
    },

    // SLIDE 11: QUANTUM INFORMATION THEORY - UNIQUE FEATURE
    {
      id: "quantum-feature",
      title: "Quantum Entropy Analysis",
      subtitle: "Our Unique Differentiator",
      duration: "1.5 min",
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold text-gradient-cyber font-display">Quantum Information Theory</h2>
            <p className="text-muted-foreground mt-2">Real algorithms from quantum physics — honestly executed on classical hardware</p>
          </div>

          {/* Academic References Banner */}
          <div className="p-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/40 rounded-xl">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-purple-400 font-bold">Von Neumann (1932)</div>
                <div className="text-muted-foreground">Mathematical Foundations of Quantum Mechanics</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-cyan-400 font-bold">Rényi (1961)</div>
                <div className="text-muted-foreground">On Measures of Entropy and Information</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-primary font-bold">Tomamichel (2015)</div>
                <div className="text-muted-foreground">Quantum Information Processing</div>
              </div>
            </div>
          </div>

          {/* The Three Entropy Formulas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 bg-card border border-purple-500/40 rounded-xl text-center">
              <div className="text-purple-400 text-sm font-semibold mb-2">Von Neumann Entropy</div>
              <div className="text-2xl font-mono text-foreground mb-2">S(ρ) = -Tr(ρ log₂ ρ)</div>
              <div className="text-xl font-mono text-purple-400 mb-2">= -Σᵢ λᵢ log₂(λᵢ)</div>
              <p className="text-xs text-muted-foreground">Quantum generalization of Shannon entropy. Measures information content of quantum state.</p>
            </div>
            <div className="p-5 bg-card border border-cyan-500/40 rounded-xl text-center">
              <div className="text-cyan-400 text-sm font-semibold mb-2">Min-Entropy</div>
              <div className="text-2xl font-mono text-foreground mb-2">H_min(ρ) = -log₂(max λᵢ)</div>
              <div className="text-xl font-mono text-cyan-400 mb-2">Used in QKD</div>
              <p className="text-xs text-muted-foreground">Worst-case unpredictability measure. Used in quantum key distribution protocols.</p>
            </div>
            <div className="p-5 bg-card border border-primary/40 rounded-xl text-center">
              <div className="text-primary text-sm font-semibold mb-2">Rényi Entropy (α=2)</div>
              <div className="text-2xl font-mono text-foreground mb-2">H₂ = -log₂(Σᵢ λᵢ²)</div>
              <div className="text-xl font-mono text-primary mb-2">Collision Entropy</div>
              <p className="text-xs text-muted-foreground">Family of entropies. α=2 gives collision entropy used in cryptographic security.</p>
            </div>
          </div>

          {/* Code Implementation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-card border border-purple-500/40 rounded-xl">
              <h4 className="text-lg font-bold text-purple-400 mb-2">src/lib/quantumEntropyAnalyzer.ts</h4>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Construct density matrix ρ = |ψ⟩⟨ψ|
const densityMatrix = [];
for (let i = 0; i < dimension; i++) {
  densityMatrix[i] = [];
  for (let j = 0; j < dimension; j++) {
    densityMatrix[i][j] = normalized[i] * normalized[j];
  }
}

// Von Neumann Entropy: S(ρ) = -Σᵢ λᵢ log₂(λᵢ)
let vonNeumann = 0;
for (const λ of eigenvalues) {
  if (λ > 1e-10) {
    vonNeumann -= λ * Math.log2(λ);
  }
}`}</pre>
            </div>
            <div className="p-4 bg-card border border-cyan-500/40 rounded-xl">
              <h4 className="text-lg font-bold text-cyan-400 mb-2">Entropy Calculations</h4>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Min-Entropy: H_min = -log₂(max λᵢ)
const maxEigenvalue = Math.max(...eigenvalues);
const minEntropy = -Math.log2(maxEigenvalue);

// Rényi Entropy (α=2): H₂ = -log₂(Σᵢ λᵢ²)
const sumSquares = eigenvalues.reduce(
  (sum, λ) => sum + λ * λ, 0
);
const renyiEntropy = -Math.log2(sumSquares);

// Purity: Tr(ρ²) - pure state = 1
const purity = sumSquares;`}</pre>
            </div>
          </div>

          {/* Media Support */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 border border-primary/30 rounded-xl">
            <div className="flex items-center justify-center gap-12">
              <div className="text-center">
                <Eye className="w-8 h-8 text-blue-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-foreground">Images</div>
                <div className="text-xs text-muted-foreground">Pixel density matrix</div>
              </div>
              <div className="text-center">
                <Activity className="w-8 h-8 text-cyan-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-foreground">Video</div>
                <div className="text-xs text-muted-foreground">Frame entropy analysis</div>
              </div>
              <div className="text-center">
                <Mic className="w-8 h-8 text-purple-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-foreground">Audio</div>
                <div className="text-xs text-muted-foreground">Spectral density matrix</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-1" />
                <div className="text-sm font-bold text-primary">Unique Feature</div>
                <div className="text-xs text-muted-foreground">First deepfake tool with quantum entropy</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 12: TECH STACK & CREDITS
    {
      id: "tech-credits",
      title: "Technology Stack & Credits",
      subtitle: "Built With Transparency",
      duration: "1 min",
      icon: Cpu,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center font-display text-foreground mb-4">
            Complete Technology Disclosure
          </h2>

          {/* Agents Overview */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/40 rounded-xl text-center">
              <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-bold text-foreground text-sm">Visual Agent</h4>
              <p className="text-xs text-muted-foreground mt-1">Noise, Edge, LBP, Histograms</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/15 to-purple-600/5 border border-purple-500/40 rounded-xl text-center">
              <Mic className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-bold text-foreground text-sm">Audio Agent</h4>
              <p className="text-xs text-muted-foreground mt-1">FFT, Pitch, Quantum Entropy</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/40 rounded-xl text-center">
              <Activity className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <h4 className="font-bold text-foreground text-sm">Temporal Agent</h4>
              <p className="text-xs text-muted-foreground mt-1">Frame, Motion, Flicker Detection</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/40 rounded-xl text-center">
              <Database className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="font-bold text-foreground text-sm">Metadata Agent</h4>
              <p className="text-xs text-muted-foreground mt-1">EXIF, Hashing, Entropy</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/40 rounded-xl text-center">
              <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-bold text-foreground text-sm">Arbiter Agent</h4>
              <p className="text-xs text-muted-foreground mt-1">Belief Fusion, Consensus</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left: What's Implemented */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Implemented Algorithms
              </h3>
              <div className="p-4 bg-card border border-green-500/30 rounded-xl space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div><span className="text-blue-400 font-semibold">Noise Analysis:</span> <span className="text-muted-foreground">GAN uniformity detection via coefficient of variation</span></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div><span className="text-blue-400 font-semibold">Sobel Edge:</span> <span className="text-muted-foreground">Gradient magnitude for sharpening artifacts</span></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <div><span className="text-purple-400 font-semibold">FFT Spectral:</span> <span className="text-muted-foreground">Discrete Fourier Transform via Web Audio API</span></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <div><span className="text-purple-400 font-semibold">Autocorrelation:</span> <span className="text-muted-foreground">Pitch consistency measurement</span></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <div><span className="text-cyan-400 font-semibold">Frame Analysis:</span> <span className="text-muted-foreground">Temporal coherence & flicker detection</span></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div><span className="text-amber-400 font-semibold">Shannon Entropy:</span> <span className="text-muted-foreground">Byte pattern obfuscation detection</span></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <div><span className="text-purple-400 font-semibold">Quantum Entropy:</span> <span className="text-muted-foreground">Von Neumann, Rényi, min-entropy (1932/1961)</span></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div><span className="text-primary font-semibold">Dempster-Shafer:</span> <span className="text-muted-foreground">Belief fusion for multi-agent consensus</span></div>
                </div>
              </div>
            </div>

            {/* Right: Technology Stack */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Technology Stack
              </h3>
              <div className="p-4 bg-card border border-primary/30 rounded-xl space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-semibold">Framework</span>
                  <span className="text-primary font-mono">React 18 + TypeScript</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-semibold">Build Tool</span>
                  <span className="text-primary font-mono">Vite 5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-semibold">Styling</span>
                  <span className="text-primary font-mono">Tailwind CSS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-semibold">UI Components</span>
                  <span className="text-primary font-mono">shadcn/ui + Radix</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-semibold">State Management</span>
                  <span className="text-primary font-mono">React Query</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-semibold">PDF Generation</span>
                  <span className="text-primary font-mono">jsPDF</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-semibold">Charts</span>
                  <span className="text-primary font-mono">Recharts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Credits Banner */}
          <div className="p-5 bg-gradient-to-r from-[#8B5CF6]/20 via-primary/10 to-cyan-500/20 border-2 border-primary/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">♥</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-foreground">Built with Lovable</h4>
                  <p className="text-sm text-muted-foreground">AI-powered development platform for rapid prototyping</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-foreground font-semibold">100% Client-Side</div>
                <div className="text-xs text-muted-foreground">No external AI APIs for detection</div>
              </div>
            </div>
          </div>

          {/* Technical Note */}
          <div className="p-4 bg-card border border-green-500/30 rounded-xl">
            <h4 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              What This System Does
            </h4>
            <p className="text-sm text-muted-foreground">
              <span className="text-green-400 font-semibold">Fully functional forensic detection system</span> implementing 
              real algorithms from published research — noise pattern analysis, FFT spectral detection, entropy calculations, 
              and Dempster-Shafer belief fusion. All detection runs <span className="text-primary font-semibold">100% in-browser</span> with 
              no external APIs. For even higher accuracy, production systems may additionally integrate trained neural networks.
            </p>
          </div>
        </div>
      )
    },

    // SLIDE 12: THANK YOU
    {
      id: "closing",
      title: "Thank You",
      subtitle: "SHANSHIELD",
      duration: "30 sec",
      icon: Award,
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <div className="relative">
            <Award className="w-24 h-24 text-primary" />
            <div className="absolute inset-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-gradient-cyber font-display">Thank You!</h1>
          </div>

          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="text-center p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">4+1</div>
              <div className="text-sm text-muted-foreground">AI Agents</div>
            </div>
            <div className="text-center p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Client-Side</div>
            </div>
            <div className="text-center p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">Real</div>
              <div className="text-sm text-muted-foreground">Algorithms</div>
            </div>
            <div className="text-center p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">Free</div>
              <div className="text-sm text-muted-foreground">No API Keys</div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-primary/10 border border-primary/30 rounded-xl">
            <p className="text-lg text-foreground">
              <span className="font-bold text-primary">Shanmuka Sai Varma</span>
            </p>
            <p className="text-muted-foreground">SHANSHIELD — Multi-Agent Forensic Intelligence</p>
          </div>
        </div>
      )
    }
  ];

  if (!isVisible) return null;

  const currentSlideData = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;
  const Icon = currentSlideData.icon;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">SHANSHIELD</h1>
            <p className="text-xs text-muted-foreground">Presentation Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {currentSlide + 1} / {slides.length}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-16 left-0 right-0 h-1 bg-border">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide content */}
      <div className="absolute top-20 bottom-20 left-0 right-0 overflow-auto p-8">
        <div className="max-w-7xl mx-auto h-full">
          {/* Slide header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold font-display text-foreground">
                {currentSlideData.title}
              </h2>
              {currentSlideData.subtitle && (
                <p className="text-lg text-muted-foreground">{currentSlideData.subtitle}</p>
              )}
            </div>
          </div>

          {/* Slide content */}
          {currentSlideData.content}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-xl border-t border-border flex items-center justify-between px-6">
        <Button
          variant="outline"
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                idx === currentSlide
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlide === slides.length - 1}
          className="gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
};

export default PresentationMode;
