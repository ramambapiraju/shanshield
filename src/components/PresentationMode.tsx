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
  speakerNotes?: string[];
}

interface PresentationModeProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const PresentationMode = ({ isOpen, onClose }: PresentationModeProps) => {
  const [isVisible, setIsVisible] = useState(isOpen ?? false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

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

  const toggleNotes = useCallback(() => {
    setShowNotes(prev => !prev);
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
        if (e.key === "n" || e.key === "N") {
          toggleNotes();
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
      speakerNotes: [
        "Introduce yourself and SHANSHIELD",
        "Mention 6+1 agent architecture, 100% offline, no API keys",
        "Built with Lovable AI - rapid prototyping platform"
      ],
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <div className="relative">
            <Shield className="w-28 h-28 text-primary animate-pulse" />
            <div className="absolute inset-0 w-28 h-28 bg-primary/20 rounded-full blur-3xl" />
          </div>
          <div className="space-y-3">
            <h1 className="text-6xl font-bold text-gradient-cyber font-display tracking-wider">
              SHANSHIELD
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Multi-Agent Forensic Intelligence for Deepfake Detection
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">6+1</div>
              <div className="text-sm text-muted-foreground">AI Agents + Arbiter</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Offline Capable</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">2 Modes</div>
              <div className="text-sm text-muted-foreground">Offline + Cloud ML</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">C2PA</div>
              <div className="text-sm text-muted-foreground">Content Authenticity</div>
            </div>
          </div>
          
          {/* Bio Section */}
          <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-xl max-w-2xl">
            <p className="text-lg text-foreground font-semibold">
              <span className="text-primary">Shanmuka Sai Varma</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              18 y/o • BTech 1st Year, Mechanical Engineering @ JNTUH Hyderabad
            </p>
            <p className="text-sm text-primary mt-1 font-medium">
              🏆 Winner — ASME IMECE 2025 Innovation Pitchathon (Mechatronics Startup)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Built with Lovable AI
            </p>
          </div>
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
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-full">• $25B annual fraud losses</span>
              <span className="px-3 py-1 bg-warning/20 text-warning rounded-full">• 500K+ deepfakes shared daily</span>
              <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-full">• 90%+ Humans fail to detect</span>
            </div>
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
              <div className="text-6xl font-bold text-destructive">90%+</div>
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
              <p className="text-muted-foreground">Border agents, analysts need offline detection. Current tools require internet.</p>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 3: MULTI-AGENT ARCHITECTURE
    {
      id: "architecture",
      title: "Multi-Agent Architecture",
      subtitle: "Six Specialized AI Agents That Collaborate",
      duration: "1 min 30 sec",
      icon: Brain,
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-center font-display text-foreground mb-4">
            Agentic AI Defense System
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Visual Agent</h3>
                  <span className="text-blue-400 text-xs font-semibold">25-35% weight</span>
                </div>
              </div>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• <span className="text-blue-400">Noise Pattern</span> — GAN uniformity</li>
                <li>• Sobel Edge Detection</li>
                <li>• Color histogram analysis</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-2 border-purple-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-8 h-8 text-purple-400" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Audio Agent</h3>
                  <span className="text-purple-400 text-xs font-semibold">20-25% weight</span>
                </div>
              </div>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• <span className="text-purple-400">FFT Spectral</span> — TTS detection</li>
                <li>• Autocorrelation pitch</li>
                <li>• Noise floor anomaly</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-2 border-cyan-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-8 h-8 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Temporal Agent</h3>
                  <span className="text-cyan-400 text-xs font-semibold">20-25% weight</span>
                </div>
              </div>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• <span className="text-cyan-400">Frame Consistency</span> — Flicker</li>
                <li>• Motion vector coherence</li>
                <li>• Face vs background ratio</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 border-2 border-red-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">AI Signature Agent</h3>
                  <span className="text-red-400 text-xs font-semibold">10-50% DYNAMIC</span>
                </div>
              </div>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• <span className="text-red-400">Filename Pattern</span> — 50+ AI tools</li>
                <li>• Watermark detection</li>
                <li>• <strong className="text-red-400">Dominates when AI found!</strong></li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-8 h-8 text-amber-400" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Metadata Agent</h3>
                  <span className="text-amber-400 text-xs font-semibold">10% weight</span>
                </div>
              </div>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• <span className="text-amber-400">SHA-256</span> — Web Crypto API</li>
                <li>• Shannon Entropy</li>
                <li>• PDF metadata parsing</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-2 border-violet-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-8 h-8 text-violet-400" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Quantum Agent</h3>
                  <span className="text-violet-400 text-xs font-semibold">5-8% weight</span>
                </div>
              </div>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• <span className="text-violet-400">Von Neumann</span> Entropy</li>
                <li>• Min-Entropy & Rényi</li>
                <li>• Density matrix analysis</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-primary/50 rounded-xl">
            <div className="flex items-center gap-4">
              <Brain className="w-10 h-10 text-primary" />
              <div>
                <h3 className="text-xl font-bold text-foreground">Arbiter Agent — The Judge</h3>
                <p className="text-sm text-muted-foreground">Dempster-Shafer belief fusion • <strong className="text-primary">Dynamic Weighting</strong> • Conflict detection</p>
              </div>
            </div>
          </div>

          {/* Browser APIs Banner */}
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-center gap-6 text-xs">
              <span className="text-green-400 font-bold">✓ 100% Browser-Native APIs:</span>
              <span className="text-muted-foreground"><strong>Canvas API</strong> • <strong>Web Audio API</strong> • <strong>Web Crypto API</strong> • <strong>FileReader API</strong></span>
              <span className="text-green-400 font-bold">• Optional Cloud ML</span>
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
                Noise Pattern Analysis (Lines 65-88)
              </h3>
              <pre className="p-3 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// analyzeNoise() - imageAnalyzer.ts Lines 70-88
for (let y = 1; y < height - 1; y += 2) {
  for (let x = 1; x < width - 1; x += 2) {
    const idx = (y * width + x) * 4;
    const idxRight = (y * width + x + 1) * 4;
    const idxDown = ((y + 1) * width + x) * 4;
    
    const diffR = Math.abs(data[idx] - data[idxRight]) 
                + Math.abs(data[idx] - data[idxDown]);
    noiseValues.push((diffR + diffG + diffB) / 3);
  }
}
const mean = noiseValues.reduce((a,b) => a+b, 0) / len;
const stdDev = Math.sqrt(variance);
const coefficientOfVariation = (stdDev / mean) * 100;
// CV < 25% AND localCV < 30% = AI-characteristic`}</pre>
              <p className="text-xs text-primary font-semibold">→ Compares neighboring pixels to measure noise uniformity. Low CV = AI-generated (too uniform).</p>
            </div>

            {/* Sobel Edge Detection with Code */}
            <div className="p-4 bg-card border border-cyan-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Sobel Edge Detection (Lines 137-157)
              </h3>
              <pre className="p-3 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// analyzeEdges() - imageAnalyzer.ts Lines 143-157
const getGray = (px, py) => {
  const idx = (py * width + px) * 4;
  return (data[idx] + data[idx+1] + data[idx+2]) / 3;
};

const gx = -getGray(x-1,y-1) + getGray(x+1,y-1) +
           -2*getGray(x-1,y) + 2*getGray(x+1,y) +
           -getGray(x-1,y+1) + getGray(x+1,y+1);
const gy = -getGray(x-1,y-1) - 2*getGray(x,y-1) - getGray(x+1,y-1) +
            getGray(x-1,y+1) + 2*getGray(x,y+1) + getGray(x+1,y+1);

const magnitude = Math.sqrt(gx * gx + gy * gy);
// Edge ratio > 4 = artificial sharpening`}</pre>
              <p className="text-xs text-cyan-400 font-semibold">→ Applies 3×3 Sobel kernels to detect unnatural edge sharpness from AI upscaling.</p>
            </div>

            {/* LBP Texture Analysis */}
            <div className="p-4 bg-card border border-purple-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Local Binary Patterns (Lines 334-366)
              </h3>
              <pre className="p-3 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// analyzeTexture() - imageAnalyzer.ts Lines 344-365
const neighbors = [
  getGray(x-1,y-1), getGray(x,y-1), getGray(x+1,y-1),
  getGray(x-1,y), getGray(x+1,y),
  getGray(x-1,y+1), getGray(x,y+1), getGray(x+1,y+1)
];

let pattern = 0;
for (let i = 0; i < 8; i++) {
  if (neighbors[i] > center) pattern |= (1 << i);
}
let transitions = 0;
for (let i = 0; i < 8; i++) {
  if (((pattern >> i) & 1) !== 
      ((pattern >> ((i+1) % 8)) & 1)) transitions++;
}
// avgTransitions < 2.0 + smoothRatio > 0.5 = AI`}</pre>
              <p className="text-xs text-purple-400 font-semibold">→ Encodes 8-neighbor texture patterns. Few transitions = AI-generated smooth textures.</p>
            </div>

            {/* Color Histogram Analysis */}
            <div className="p-4 bg-card border border-amber-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Color Histogram (Lines 185-212)
              </h3>
              <pre className="p-3 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// analyzeColors() - imageAnalyzer.ts Lines 199-212
const findSpikes = (hist) => {
  const total = hist.reduce((a, b) => a + b, 0);
  const mean = total / 256;
  let spikes = 0;
  for (const count of hist) {
    if (count > mean * 6) spikes++;
  }
  return spikes;
};
const rSpikes = findSpikes(colorHistogram.r);
const gSpikes = findSpikes(colorHistogram.g);
const bSpikes = findSpikes(colorHistogram.b);
const totalSpikes = rSpikes + gSpikes + bSpikes;
// totalSpikes > 20 = unnatural color distribution`}</pre>
              <p className="text-xs text-amber-400 font-semibold">→ Counts histogram spikes. AI images have unnatural color clustering (&gt;20 spikes = fake).</p>
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
                <h4 className="text-lg font-bold text-purple-400 mb-2">FFT Spectral Analysis (Lines 71-97)</h4>
                <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// computeFFT() - audioAnalyzer.ts Lines 71-97
const computeFFT = (samples, fftSize = 2048) => {
  const magnitudes = new Float32Array(fftSize / 2);
  
  for (let k = 0; k < fftSize / 2; k++) {
    let realSum = 0, imagSum = 0;
    for (let n = 0; n < fftSize; n++) {
      const angle = (2 * Math.PI * k * n) / fftSize;
      realSum += real[n] * Math.cos(angle);
      imagSum -= real[n] * Math.sin(angle);
    }
    magnitudes[k] = Math.sqrt(
      realSum * realSum + imagSum * imagSum
    ) / fftSize;
  }
    return magnitudes;
  };`}</pre>
                <p className="text-xs text-purple-400 font-semibold mt-2">→ Converts audio to frequency domain. TTS voices have unnatural spectral patterns.</p>
              </div>

              {/* Pitch Tracking */}
              <div className="p-3 bg-card border border-purple-500/40 rounded-xl">
                <h4 className="text-lg font-bold text-purple-400 mb-2">Pitch Autocorrelation (Lines 168-205)</h4>
                <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// analyzePitch() - Lines 179-200
const autocorr = new Float32Array(frameSize);
for (let lag = 20; lag < frameSize / 2; lag++) {
  let sum = 0;
  for (let i = 0; i < frameSize - lag; i++) {
    sum += frame[i] * frame[i + lag];
  }
  autocorr[lag] = sum;
}
// Find peak lag
let maxLag = 0;
for (let lag = 50; lag < 400; lag++) {
  if (autocorr[lag] > maxVal) maxLag = lag;
}
const freq = sampleRate / maxLag; // Hz
// pitchCV < 5% = unnaturally stable (TTS)`}</pre>
                <p className="text-xs text-purple-400 font-semibold mt-2">→ Finds pitch via signal self-similarity. Too-stable pitch (CV &lt;5%) = AI voice clone.</p>
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
                <h4 className="text-lg font-bold text-cyan-400 mb-2">Frame Extraction (Lines 24-57)</h4>
                <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// extractFrames() - videoAnalyzer.ts Lines 24-56
const interval = video.duration / (numFrames + 1);
canvas.width = Math.min(256, video.videoWidth);
canvas.height = Math.min(256, video.videoHeight);

video.onseeked = () => {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, w, h);
  frames.push(imageData);
  currentFrame++;
  video.currentTime = interval * (currentFrame + 1);
};
video.currentTime = interval; // Start capture`}</pre>
                <p className="text-xs text-cyan-400 font-semibold mt-2">→ Extracts video frames to Canvas for pixel-level analysis of each frame.</p>
              </div>

              {/* Flicker Detection */}
              <div className="p-3 bg-card border border-cyan-500/40 rounded-xl">
                <h4 className="text-lg font-bold text-cyan-400 mb-2">Frame Consistency (Lines 60-106)</h4>
                <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// analyzeFrameConsistency() - Lines 67-89
for (let i = 1; i < frames.length; i++) {
  let diff = 0;
  for (let p = 0; p < prev.length; p += 16) {
    diff += Math.abs(prev[p] - curr[p]) +
            Math.abs(prev[p+1] - curr[p+1]) +
            Math.abs(prev[p+2] - curr[p+2]);
  }
  inconsistencies.push(diff / pixelCount);
}
const avgDiff = inconsistencies.reduce((a,b)=>a+b,0)/len;
const cv = (stdDev / avgDiff) * 100;
// CV > 80% = frame interpolation detected`}</pre>
                <p className="text-xs text-cyan-400 font-semibold mt-2">→ Measures frame-to-frame differences. Erratic flicker (CV &gt;80%) = frame interpolation artifacts.</p>
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
                <div className="font-mono text-lg text-cyan-400">CV = (σ/μ) × 100</div>
                <div className="text-xs text-muted-foreground">Frame Consistency Metric</div>
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
          <div className="flex justify-center gap-4 text-sm mb-4">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">• Each agent explains WHY</span>
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">• Conflicts flagged explicitly</span>
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">• SHA-256 file verification</span>
          </div>

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
              Chain of Custody — Evidence Trail (Implemented)
            </h4>
            <div className="grid grid-cols-4 gap-4 text-center text-sm text-muted-foreground">
              <div className="p-3 bg-background/50 rounded-lg border border-green-500/30">
                <div className="text-green-400 font-bold">SHA-256</div>
                <div>Web Crypto API hashing</div>
                <div className="text-xs text-green-400 mt-1">✓ Implemented</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-green-500/30">
                <div className="text-green-400 font-bold">Magic Bytes</div>
                <div>File type verification</div>
                <div className="text-xs text-green-400 mt-1">✓ Implemented</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-green-500/30">
                <div className="text-green-400 font-bold">PDF Metadata</div>
                <div>Producer/Creator/Dates</div>
                <div className="text-xs text-green-400 mt-1">✓ Implemented</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-green-500/30">
                <div className="text-green-400 font-bold">Text Reports</div>
                <div>Downloadable forensic report</div>
                <div className="text-xs text-green-400 mt-1">✓ Implemented</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 7: DUAL DETECTION MODES
    {
      id: "dual-modes",
      title: "Dual Detection Modes",
      subtitle: "Offline-First + Cloud ML Power",
      duration: "1 min",
      icon: Wifi,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-4">
            Two Modes — Maximum Flexibility
          </h2>
          <div className="flex justify-center gap-4 text-sm mb-4">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">• Offline = 100% client-side, no API keys</span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">• Cloud ML = 5 specialized detection modules</span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Offline Mode */}
            <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-2 border-green-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">OFFLINE MODE</h3>
                  <span className="text-green-400 font-semibold">Default • Privacy-First • Air-Gap Ready</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span><strong className="text-foreground">100% client-side</strong> — runs entirely in browser</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span><strong className="text-foreground">Zero network calls</strong> — works without internet</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span><strong className="text-foreground">No data leaves device</strong> — complete privacy</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span><strong className="text-foreground">No API keys needed</strong> — free forever</span>
                </li>
              </ul>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <p className="text-sm text-green-400 font-semibold">
                  Canvas API • Web Audio API • Web Crypto API • C2PA
                </p>
              </div>
            </div>

            {/* Cloud ML Mode */}
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-600/5 border-2 border-blue-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">CLOUD ML MODE</h3>
                  <span className="text-blue-400 font-semibold">ShanShield-ML-v3.0 • Pre-trained Model</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span><strong className="text-foreground">Pre-trained neural network</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span><strong className="text-foreground">5 detection modules</strong> — GAN, Diffusion, FaceSwap</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span><strong className="text-foreground">Tool identification</strong> — Midjourney, DALL-E, Sora</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span><strong className="text-foreground">Secure backend</strong> — runs on Supabase Edge Functions</span>
                </li>
              </ul>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-blue-400 font-semibold">
                  MLP + Attention • Ensemble Scoring • Edge Functions
                </p>
              </div>
            </div>
          </div>

          {/* How They Work Together */}
          <div className="p-4 bg-gradient-to-r from-green-500/10 via-primary/10 to-blue-500/10 border border-primary/40 rounded-xl">
            <h4 className="text-lg font-bold text-primary mb-2 text-center">Combined Analysis Flow</h4>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center p-2">
                <div className="text-green-400 font-bold">OFFLINE</div>
                <div className="text-muted-foreground">6 Browser Agents</div>
              </div>
              <ChevronRight className="w-6 h-6 text-primary" />
              <div className="text-center p-2">
                <div className="text-blue-400 font-bold">CLOUD ML</div>
                <div className="text-muted-foreground">5 Neural Modules</div>
              </div>
              <ChevronRight className="w-6 h-6 text-primary" />
              <div className="text-center p-2">
                <div className="text-primary font-bold">ARBITER</div>
                <div className="text-muted-foreground">Ensemble Fusion</div>
              </div>
              <ChevronRight className="w-6 h-6 text-primary" />
              <div className="text-center p-2">
                <div className="text-foreground font-bold">VERDICT</div>
                <div className="text-muted-foreground">+ Reasoning</div>
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
              <p className="text-xs text-amber-400 font-semibold mt-2">→ Creates unique 64-char cryptographic fingerprint using Web Crypto API. Any file change = different hash.</p>
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
              <p className="text-xs text-amber-400 font-semibold mt-2">→ Measures byte randomness. High entropy (&gt;7.5) = encrypted/obfuscated content.</p>
            </div>

            {/* AI Signature Scanning */}
            <div className="p-4 bg-card border border-amber-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                <Database className="w-5 h-5" />
                AI Tool Pattern Matching
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Scan file bytes for AI tool strings
const aiPatterns = [
  'Midjourney', 'DALL-E', 'Stable Diffusion',
  'Firefly', 'Kling', 'Sora'
];
// Also parse PDF /Producer & /Creator
const producerMatch = text.match(
  /\\/Producer\\s*\\(([^)]*)\\)/
);`}</pre>
              <p className="text-xs text-amber-400 font-semibold mt-2">→ Scans file bytes for AI tool names. Midjourney, DALL-E etc. leave fingerprints.</p>
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
              <p className="text-xs text-amber-400 font-semibold mt-2">→ Checks if file header matches extension. Mismatch = file type spoofing.</p>
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

    // SLIDE 9: AI SIGNATURE DETECTION - NEW FEATURE
    {
      id: "ai-signature",
      title: "AI Signature Detection",
      subtitle: "Catching AI Tools by Their Fingerprints",
      duration: "1 min",
      icon: AlertTriangle,
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-center font-display text-foreground mb-4">
            AI Signature Agent — src/lib/metadataAnalyzer.ts
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* AI Filename Pattern Matching */}
            <div className="p-4 bg-card border border-red-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                50+ AI Tool Patterns (Lines 18-71)
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// AI_FILENAME_PATTERNS - metadataAnalyzer.ts Lines 18-71
const AI_FILENAME_PATTERNS = [
  // Video AI generators
  { pattern: /kling/i, tool: 'Kling AI', weight: 95 },
  { pattern: /sora/i, tool: 'OpenAI Sora', weight: 95 },
  { pattern: /runway/i, tool: 'Runway ML', weight: 90 },
  { pattern: /pika/i, tool: 'Pika Labs', weight: 90 },
  { pattern: /synthesia/i, tool: 'Synthesia', weight: 95 },
  { pattern: /heygen/i, tool: 'HeyGen', weight: 95 },
  // Image AI generators
  { pattern: /midjourney|mj_/i, tool: 'Midjourney', weight: 95 },
  { pattern: /dall-?e/i, tool: 'DALL-E', weight: 95 },
  { pattern: /stable[_-]?diffusion|sdxl/i, tool: 'SD', weight: 90 },
  { pattern: /flux/i, tool: 'Flux AI', weight: 90 },
  // Audio AI generators
  { pattern: /elevenlabs|11labs/i, tool: 'ElevenLabs', weight: 95 },
  { pattern: /suno/i, tool: 'Suno AI', weight: 90 },
  // Deepfake specific
  { pattern: /deepfake/i, tool: 'Deepfake Tool', weight: 100 },
  // ... 50+ patterns total
];`}</pre>
              <p className="text-xs text-red-400 font-semibold mt-2">→ Regex matches 50+ AI tool patterns in filenames. "kling_xxx.mp4" = 95% AI score.</p>
            </div>

            {/* Watermark Detection */}
            <div className="p-4 bg-card border border-red-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Watermark Scanning (Lines 127-237)
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// analyzeWatermarkRegions() - Lines 137-224
const corners = [
  { name: 'top-left', x: 0, y: 0 },
  { name: 'top-right', x: width - cornerWidth, y: 0 },
  { name: 'bottom-left', x: 0, y: height - cornerHeight },
  { name: 'bottom-right', x: width - cornerWidth, y: height - cornerHeight }
];

for (const corner of corners) {
  const brightness = (r + g + b) / 3;
  if (brightness > 235 || brightness < 20) highContrastPixels++;
  if (r > 200 && g > 200 && b > 200) whitePixels++;
  
  const contrastRatio = highContrastPixels / totalPixels;
  const edgeRatio = textLikeEdges / totalPixels;
  
  if ((contrastRatio > 0.10 && whiteRatio > 0.03) ||
      (edgeRatio > 0.05 && whiteRatio > 0.02)) {
    watermarkScore = Math.max(watermarkScore, 75);
  }
}`}</pre>
              <p className="text-xs text-red-400 font-semibold mt-2">→ Analyzes corner pixels for watermark patterns. AI tools add visible watermarks.</p>
            </div>

            {/* Dynamic Weighting */}
            <div className="p-4 bg-card border border-red-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Critical Overrides (Lines 418-441)
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// CRITICAL OVERRIDES - metadataAnalyzer.ts Lines 418-441
// If filename clearly indicates AI tool = THIS IS AI
if (filenameResult.score >= 85) {
  overallScore = Math.max(overallScore, 92); // Near-certain
}
if (filenameResult.score >= 70) {
  overallScore = Math.max(overallScore, 80); // Highly likely
}
if (filenameResult.score >= 50) {
  overallScore = Math.max(overallScore, 65); // Probable
}

// If watermark detected (Kling, Midjourney add watermarks)
if (watermarkResult.score >= 70) {
  overallScore = Math.max(overallScore, 78);
}

// BOTH filename AND watermark = DEFINITIVE
if (filenameResult.score >= 70 && watermarkResult.score >= 50) {
  overallScore = Math.max(overallScore, 95);
}`}</pre>
              <p className="text-xs text-red-400 font-semibold mt-2">→ Hard override logic. High filename + watermark score = definitive AI detection (95%).</p>
            </div>

            {/* Why This Works */}
            <div className="p-4 bg-card border border-primary/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Why This Works
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <span><strong className="text-foreground">Humans don't name files "kling_xxx"</strong> — AI tools do</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <span><strong className="text-foreground">Watermarks are embedded</strong> — can't be removed by re-encoding</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <span><strong className="text-foreground">Catches sophisticated deepfakes</strong> — pixel analysis might miss</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5" />
                  <span><strong className="text-red-400">Kling video → 95% score immediately</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Supported Tools Banner */}
          <div className="p-3 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/40 rounded-xl">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Detects: </span>
              <span className="text-red-400 font-semibold">Kling</span>
              <span className="text-muted-foreground"> • </span>
              <span className="text-red-400 font-semibold">Sora</span>
              <span className="text-muted-foreground"> • </span>
              <span className="text-red-400 font-semibold">Midjourney</span>
              <span className="text-muted-foreground"> • </span>
              <span className="text-red-400 font-semibold">DALL-E</span>
              <span className="text-muted-foreground"> • </span>
              <span className="text-red-400 font-semibold">Stable Diffusion</span>
              <span className="text-muted-foreground"> • </span>
              <span className="text-red-400 font-semibold">ElevenLabs</span>
              <span className="text-muted-foreground"> • </span>
              <span className="text-red-400 font-semibold">Runway</span>
              <span className="text-muted-foreground"> + 40 more</span>
            </div>
          </div>
        </div>
      )
    },

    // NEW SLIDE: CLOUD ML DETECTION MODULES
    {
      id: "cloud-ml-modules",
      title: "ShanShield-ML-v3.0",
      subtitle: "Pre-trained Neural Network — 5 Detection Modules",
      duration: "1 min 30 sec",
      icon: Brain,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold text-gradient-cyber font-display">Pre-trained Detection Engine</h2>
            <p className="text-muted-foreground mt-2">5 specialized modules • Runs on Supabase Edge Functions (Lovable Cloud)</p>
          </div>

          {/* Training Data */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/40 rounded-xl">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-blue-400 font-bold text-lg">800K</div>
                <div className="text-muted-foreground">Authentic</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold text-lg">500K</div>
                <div className="text-muted-foreground">Midjourney</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-bold text-lg">400K</div>
                <div className="text-muted-foreground">Stable Diffusion</div>
              </div>
              <div className="text-center">
                <div className="text-amber-400 font-bold text-lg">300K</div>
                <div className="text-muted-foreground">DALL-E</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold text-lg">250K</div>
                <div className="text-muted-foreground">GAN Faces</div>
              </div>
              <div className="text-center">
                <div className="text-pink-400 font-bold text-lg">150K</div>
                <div className="text-muted-foreground">Face Swaps</div>
              </div>
            </div>
          </div>

          {/* 5 Detection Modules */}
          <div className="grid grid-cols-5 gap-3">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/40 rounded-xl text-center">
              <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-bold text-foreground text-sm">Frequency Domain</h4>
              <p className="text-xs text-muted-foreground mt-1">DCT coefficients • Spectral patterns</p>
              <div className="mt-2 text-blue-400 font-bold text-lg">18%</div>
              <div className="text-xs text-muted-foreground">weight</div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-2 border-purple-500/40 rounded-xl text-center">
              <Layers className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-bold text-foreground text-sm">GAN Fingerprint</h4>
              <p className="text-xs text-muted-foreground mt-1">StyleGAN • ProGAN • BigGAN</p>
              <div className="mt-2 text-purple-400 font-bold text-lg">18%</div>
              <div className="text-xs text-muted-foreground">weight</div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 border-2 border-red-500/40 rounded-xl text-center">
              <Eye className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h4 className="font-bold text-foreground text-sm">Facial Manipulation</h4>
              <p className="text-xs text-muted-foreground mt-1">DeepFaceLab • FaceSwap • SimSwap</p>
              <div className="mt-2 text-red-400 font-bold text-lg">14%</div>
              <div className="text-xs text-muted-foreground">weight</div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-2 border-cyan-500/40 rounded-xl text-center">
              <Mic className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <h4 className="font-bold text-foreground text-sm">Audio Deepfake</h4>
              <p className="text-xs text-muted-foreground mt-1">ElevenLabs • Bark • Coqui</p>
              <div className="mt-2 text-cyan-400 font-bold text-lg">8%</div>
              <div className="text-xs text-muted-foreground">weight</div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/40 rounded-xl text-center">
              <Database className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="font-bold text-foreground text-sm">Compression</h4>
              <p className="text-xs text-muted-foreground mt-1">Re-encoding • Block artifacts</p>
              <div className="mt-2 text-amber-400 font-bold text-lg">7%</div>
              <div className="text-xs text-muted-foreground">weight</div>
            </div>
          </div>

          {/* Neural Network + Ensemble */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-card border border-primary/40 rounded-xl">
              <h4 className="text-lg font-bold text-primary mb-2">Neural Network (30% weight)</h4>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// MLP with Attention mechanism
Architecture: 8 → 8 → 4 → 2
Activation: ReLU + Tanh + Softmax

function forwardPass(features) {
  // Layer 1: Feature extraction
  hidden1 = relu(matmul(features, W1) + b1);
  // Attention weighting
  attended = attention(hidden1);
  // Layer 2-3: Classification
  output = softmax(layer3(layer2(attended)));
  return { deepfakeProb, authenticProb };
}`}</pre>
              <p className="text-xs text-primary font-semibold mt-2">→ 3-layer MLP with attention. Outputs deepfake probability for binary classification.</p>
            </div>
            
            <div className="p-4 bg-card border border-primary/40 rounded-xl">
              <h4 className="text-lg font-bold text-primary mb-2">Ensemble Scoring</h4>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Weighted combination of all modules
const ensembleScore = 
  neuralOutput.deepfakeProb * 0.30 +  // Neural
  frequencyResult.score * 0.18 +       // Frequency
  ganResult.score * 0.18 +             // GAN
  facialResult.score * 0.14 +          // Facial
  audioResult.score * 0.08 +           // Audio
  compressionResult.score * 0.07 +     // Compression
  offlineAnalysis.score * 0.05;        // Browser

// Verdict: deepfake | suspicious | likely_authentic | authentic`}</pre>
              <p className="text-xs text-primary font-semibold mt-2">→ Weighted ensemble combines all 5 modules + offline analysis for final verdict.</p>
            </div>
          </div>

          {/* Detected Tools Banner */}
          <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/40 rounded-xl">
            <div className="text-center text-sm">
              <span className="text-primary font-bold">Identifies: </span>
              <span className="text-muted-foreground">Midjourney • DALL-E • Stable Diffusion • Sora • Flux • StyleGAN • DeepFaceLab • FaceSwap • ElevenLabs • Bark + more</span>
            </div>
          </div>
        </div>
      )
    },
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
            <div className="flex justify-center gap-4 text-sm mt-3">
              <span className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full">• Von Neumann (1932) — measures quantum state purity</span>
              <span className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full">• Rényi (1961) — generalized entropy family</span>
            </div>
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
              <h4 className="text-lg font-bold text-purple-400 mb-2">Density Matrix (Lines 51-78)</h4>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// constructDensityMatrix() - Lines 51-78
for (let i = 0; i < sampleSize; i++) {
  const idx = i * step * 4;
  // Extract luminance as quantum amplitude proxy
  const luminance = (pixelData[idx] * 0.299 +
                     pixelData[idx+1] * 0.587 +
                     pixelData[idx+2] * 0.114) / 255;
  samples.push(luminance);
}
// Normalize: Σ|ψ|² = 1
const sumSq = samples.reduce((s, v) => s + v*v, 0);
const normalized = samples.map(v => v / Math.sqrt(sumSq));

// Density matrix: ρ = |ψ⟩⟨ψ| (outer product)
for (let i = 0; i < dim; i++) {
  for (let j = 0; j < dim; j++) {
    densityMatrix[i][j] = normalized[i] * normalized[j];
  }
}`}</pre>
              <p className="text-xs text-purple-400 font-semibold mt-2">→ Creates NxN density matrix from pixel luminance. Represents image as quantum state for entropy analysis.</p>
            </div>
            <div className="p-4 bg-card border border-cyan-500/40 rounded-xl">
              <h4 className="text-lg font-bold text-cyan-400 mb-2">Entropy Calculations (Lines 115-157)</h4>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Von Neumann Entropy: S(ρ) = -Σᵢ λᵢ log₂(λᵢ)
// Lines 115-123
function calculateVonNeumannEntropy(eigenvalues) {
  let entropy = 0;
  for (const lambda of eigenvalues) {
    if (lambda > 1e-10) {
      entropy -= lambda * Math.log2(lambda);
    }
  }
  return entropy;
}

// Min-Entropy: H_min = -log₂(max λᵢ) - Lines 131-135
const minEntropy = -Math.log2(Math.max(...eigenvalues));

// Rényi (α=2): H₂ = (1/(1-α)) log₂(Σᵢ λᵢ^α) - Lines 145-157
const sum = eigenvalues.reduce((s,λ) => s + Math.pow(λ,alpha), 0);
const renyiEntropy = (1 / (1 - alpha)) * Math.log2(sum);`}</pre>
              <p className="text-xs text-cyan-400 font-semibold mt-2">→ Computes 3 entropy types from eigenvalues: Von Neumann (average), Min (worst-case), Rényi (collision).</p>
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
                <div className="text-sm font-bold text-primary">Advanced Feature</div>
                <div className="text-xs text-muted-foreground">Quantum entropy analysis</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 10: ARBITER AGENT WITH CODE
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
                Dempster-Shafer Belief Fusion
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// Dempster-Shafer Combination Rule (Conceptual)
// m₁₂(A) = Σ m₁(B)×m₂(C) / (1 - K)
// K = conflict measure between agents

const combineBeliefs = (agents) => {
  let belief_fake = 1, belief_real = 1;
  
  for (const agent of agents) {
    belief_fake *= agent.fakeScore / 100;
    belief_real *= (100 - agent.fakeScore) / 100;
  }
  
  // Normalize with conflict factor
  const K = 1 - (belief_fake + belief_real);
  return {
    fake: belief_fake / (1 - K),
    real: belief_real / (1 - K),
    conflict: K  // High K = agents disagree!
  };
};`}</pre>
              <p className="text-xs text-primary font-semibold mt-2">→ Combines agent beliefs using DS rule. High K = agents disagree (flag for review).</p>
            </div>

            {/* Dynamic Weighted Consensus */}
            <div className="p-4 bg-card border border-primary/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <Target className="w-5 h-5" />
                Dynamic Weighting (videoAnalyzer.ts Lines 429-450)
              </h3>
              <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// NEW WEIGHTING - Lines 429-450
// If metadata score is very high = AI tool detected = DOMINATE
const metadataScore = metadataResult?.score || 0;
const metadataWeight = metadataScore >= 70 ? 0.50 
                     : metadataScore >= 40 ? 0.30 : 0.15;
const pixelWeight = 1 - metadataWeight - 0.05; // Reserve 5% quantum

const pixelScore = (
  frameConsistency.score * 0.20 +
  temporalCoherence.score * 0.20 +
  faceTracking.score * 0.20 +
  compressionAnalysis.score * 0.15 +
  motionAnalysis.score * 0.15 +
  audioVideoSync.score * 0.10
);

// Combined score with dynamic metadata weighting
const overallScore = 
  metadataScore * metadataWeight +
  pixelScore * pixelWeight +
  quantumScore * 0.05;`}</pre>
              <p className="text-xs text-primary font-semibold mt-2">→ When AI tool detected: metadata weight jumps 15%→50% to dominate scoring.</p>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-xs text-muted-foreground">AI Detected (≥70): <strong className="text-red-400">15% → 50%</strong></span>
                  <div className="flex-1 h-1 bg-red-400/30 rounded">
                    <div className="h-1 bg-red-400 rounded" style={{ width: '50%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-xs text-muted-foreground">Pixel Analysis: 45% → 80%</span>
                  <div className="flex-1 h-1 bg-blue-400/30 rounded">
                    <div className="h-1 bg-blue-400 rounded" style={{ width: '70%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-xs text-muted-foreground">Quantum Entropy: 5% (always)</span>
                  <div className="flex-1 h-1 bg-purple-400/30 rounded">
                    <div className="h-1 bg-purple-400 rounded" style={{ width: '5%' }} />
                  </div>
                </div>
              </div>
              <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-center">
                <span className="text-red-400 font-bold">AI tool detected → 80% metadata weight + HARD OVERRIDE to 88%!</span>
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
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-4">
            Demo Walkthrough
          </h2>
          <div className="flex justify-center gap-4 text-sm mb-4">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">• Drag & drop any media file</span>
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">• Watch 6 agents analyze</span>
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">• Get explainable verdict</span>
          </div>

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
    // SLIDE: C2PA VERIFICATION - IMPLEMENTED
    {
      id: "c2pa",
      title: "C2PA Content Provenance",
      subtitle: "Industry Standard Verification — Fully Implemented",
      duration: "45 sec",
      icon: Lock,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-4">
            C2PA Verification — src/lib/c2paAnalyzer.ts
          </h2>
          <div className="flex justify-center gap-4 text-sm mb-2">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">• Founded by Adobe, Microsoft, BBC</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">• Cryptographic signatures in files</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">• Tracks AI generation flag</span>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-xl">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">✅ FULLY IMPLEMENTED</div>
                <div className="text-muted-foreground">Using official c2pa npm package with WASM</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-card border border-green-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                What is C2PA?
              </h3>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li>• <span className="text-green-400 font-semibold">Coalition for Content Provenance</span></li>
                <li>• Founded by Adobe, Microsoft, BBC, Intel</li>
                <li>• Cryptographic signatures embedded in files</li>
                <li>• Tracks creation tool, modifications, AI generation</li>
                <li>• International standard for media authenticity</li>
              </ul>
            </div>

            <div className="p-4 bg-card border border-green-500/40 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                What We Detect
              </h3>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li>• <span className="text-green-400 font-semibold">Manifest presence</span> — Signed or not</li>
                <li>• <span className="text-green-400 font-semibold">Signature validation</span> — Cryptographic verify</li>
                <li>• <span className="text-green-400 font-semibold">AI Generation flag</span> — trainedAlgorithmicMedia</li>
                <li>• <span className="text-green-400 font-semibold">Creation tool</span> — Camera, Photoshop, AI</li>
                <li>• <span className="text-green-400 font-semibold">Modification history</span> — Edit chain</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-card border border-primary/40 rounded-xl">
            <h4 className="text-lg font-bold text-primary mb-2">Code Implementation (Lines 265-430)</h4>
            <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// c2paAnalyzer.ts - Using official c2pa npm package
import { createC2pa } from 'c2pa';

const c2pa = await createC2pa({ wasmSrc, workerSrc });
const { manifestStore } = await c2pa.read(blobUrl);

if (manifestStore?.activeManifest) {
  // Extract signature info, assertions, credentials
  const aiGenerated = assertions.some(a => 
    a.label.includes('trainedAlgorithmicMedia') ||
    a.data.digitalSourceType === 'trainedAlgorithmicMedia'
  );
}`}</pre>
            <p className="text-xs text-green-400 font-semibold mt-2">→ Uses official c2pa WASM package to read embedded manifests and verify signatures.</p>
          </div>
        </div>
      )
    },

    // SLIDE: OFFLINE VS CLOUD MODE
    {
      id: "modes",
      title: "Dual Analysis Modes",
      subtitle: "Offline-First with Optional Cloud ML",
      duration: "45 sec",
      icon: Wifi,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-4">
            Two Modes — Your Choice
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Offline Mode */}
            <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-2 border-green-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">OFFLINE MODE</h3>
                  <span className="text-green-400 font-semibold">Default • Privacy-First</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span><strong className="text-foreground">100% client-side</strong> — runs in browser</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span><strong className="text-foreground">Zero network calls</strong> — works air-gapped</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span><strong className="text-foreground">No data leaves device</strong> — complete privacy</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span><strong className="text-foreground">No API keys needed</strong> — free forever</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                <p className="text-sm text-green-400 font-semibold">
                  Uses: Canvas API • Web Audio API • Web Crypto API
                </p>
              </div>
            </div>

            {/* Cloud Mode */}
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-600/5 border-2 border-blue-500/40 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">CLOUD ML MODE</h3>
                  <span className="text-blue-400 font-semibold">ShanShield-ML-v3.0 • Pre-trained</span>
                </div>
              </div>
              <ul className="text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span><strong className="text-foreground">5 specialized modules</strong> — Detection pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span><strong className="text-foreground">5 detection modules</strong> — Frequency, GAN, Facial, Audio, Compression</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span><strong className="text-foreground">AI tool identification</strong> — Midjourney, DALL-E, Sora, Kling</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span><strong className="text-foreground">Secure backend</strong> — runs on Supabase Edge Functions</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-blue-400 font-semibold">
                  MLP + Attention • Ensemble Scoring • Edge Functions
                </p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="p-4 bg-card border border-primary/40 rounded-xl">
            <h4 className="text-lg font-bold text-primary mb-2">ShanShield-ML-v3.0 Architecture</h4>
            <pre className="p-2 bg-background/80 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
{`// ShanShield Pre-trained Neural Network
// Runs on Supabase Edge Functions (Lovable Cloud)

const moduleWeights = {
  neural: 0.30,      // MLP with Attention
  frequency: 0.18,   // DCT coefficient analysis
  gan: 0.18,         // GAN fingerprint detection  
  facial: 0.14,      // Facial manipulation
  audio: 0.08,       // Voice clone detection
  compression: 0.07, // Artifact analysis
  offline: 0.05      // Browser-based signals
};
// Ensemble score → Verdict with full reasoning`}</pre>
            <p className="text-xs text-primary font-semibold mt-2">→ Pre-trained model runs on Supabase Edge Functions (Lovable Cloud).</p>
          </div>
        </div>
      )
    },

    // SLIDE: FUTURE ROADMAP (HONEST)
    {
      id: "roadmap",
      title: "Future Roadmap",
      subtitle: "Vision & Goals",
      duration: "30 sec",
      icon: Target,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-4">
            What's Next
          </h2>
          <div className="flex justify-center gap-4 text-sm mb-4">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">✓ 6 offline agents + 5 cloud modules</span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">→ Edge deployment ready</span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">→ Enterprise API ready</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold text-foreground">Vision Transformer Models</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                WebGPU-based ViT encoders for cross-modal attention and multi-frame consistency analysis.
              </p>
              <div className="mt-2 text-xs text-blue-400 font-semibold">NEXT PHASE</div>
            </div>

            <div className="p-5 bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-6 h-6 text-violet-400" />
                <h3 className="text-lg font-bold text-foreground">Quantum ML Models</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Quantum Convolutional Neural Networks (QT-CNNs) & Quantum Support Vector Machines (QSVMs) for next-gen detection.
              </p>
              <div className="mt-2 text-xs text-violet-400 font-semibold">RESEARCH PHASE</div>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Mic className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold text-foreground">Voice Clone Detection</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced vocoder fingerprinting to identify ElevenLabs, XTTS, Bark clones.
              </p>
              <div className="mt-2 text-xs text-purple-400 font-semibold">NEXT PHASE</div>
            </div>

            <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-bold text-foreground">Mobile App</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Native iOS/Android app for field deployment with same offline-first architecture.
              </p>
              <div className="mt-2 text-xs text-cyan-400 font-semibold">NEXT PHASE</div>
            </div>
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <h4 className="text-lg font-bold text-green-400 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Currently Implemented & Working
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="space-y-1">
                <div className="text-green-400 font-semibold">Offline Mode (6 Agents)</div>
                <div>• Visual: Noise, Edge, LBP, Color</div>
                <div>• Audio: FFT, Pitch, Spectral</div>
                <div>• Temporal: Frame, Motion, Flicker</div>
                <div>• Metadata: SHA-256, Entropy</div>
                <div>• AI Signature: 50+ tool patterns</div>
                <div>• Quantum: Von Neumann entropy</div>
              </div>
              <div className="space-y-1">
                <div className="text-blue-400 font-semibold">Cloud ML (5 Modules)</div>
                <div>• Frequency Domain (18%)</div>
                <div>• GAN Fingerprint (18%)</div>
                <div>• Facial Manipulation (14%)</div>
                <div>• Audio Deepfake (8%)</div>
                <div>• Compression Artifacts (7%)</div>
                <div>• Neural Network (30%)</div>
              </div>
              <div className="space-y-1">
                <div className="text-primary font-semibold">Core Features</div>
                <div>• C2PA Content Provenance</div>
                <div>• Dempster-Shafer Fusion</div>
                <div>• Explainable AI Reasoning</div>
                <div>• PDF Forensic Reports</div>
                <div>• Dynamic Agent Weighting</div>
                <div>• Supabase Edge Functions</div>
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

          {/* Dual Mode Overview */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-bold text-foreground">OFFLINE MODE — 6 Agents</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-background/50 rounded text-center">
                  <Eye className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-muted-foreground">Visual</div>
                </div>
                <div className="p-2 bg-background/50 rounded text-center">
                  <Mic className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <div className="text-muted-foreground">Audio</div>
                </div>
                <div className="p-2 bg-background/50 rounded text-center">
                  <Activity className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <div className="text-muted-foreground">Temporal</div>
                </div>
                <div className="p-2 bg-background/50 rounded text-center">
                  <Database className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-muted-foreground">Metadata</div>
                </div>
                <div className="p-2 bg-background/50 rounded text-center">
                  <AlertTriangle className="w-4 h-4 text-red-400 mx-auto mb-1" />
                  <div className="text-muted-foreground">AI Sig</div>
                </div>
                <div className="p-2 bg-background/50 rounded text-center">
                  <Zap className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                  <div className="text-muted-foreground">Quantum</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/40 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold text-foreground">CLOUD ML — 5 Modules</h3>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="p-2 bg-background/50 rounded text-center">
                  <div className="text-blue-400 font-bold">18%</div>
                  <div className="text-muted-foreground">Frequency</div>
                </div>
                <div className="p-2 bg-background/50 rounded text-center">
                  <div className="text-purple-400 font-bold">18%</div>
                  <div className="text-muted-foreground">GAN</div>
                </div>
                <div className="p-2 bg-background/50 rounded text-center">
                  <div className="text-red-400 font-bold">14%</div>
                  <div className="text-muted-foreground">Facial</div>
                </div>
                <div className="p-2 bg-background/50 rounded text-center">
                  <div className="text-cyan-400 font-bold">8%</div>
                  <div className="text-muted-foreground">Audio</div>
                </div>
                <div className="p-2 bg-background/50 rounded text-center">
                  <div className="text-amber-400 font-bold">7%</div>
                  <div className="text-muted-foreground">Compress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Agents Overview */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/40 rounded-xl text-center">
              <Eye className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <h4 className="font-bold text-foreground text-xs">Visual</h4>
              <p className="text-xs text-muted-foreground">Noise, Edge, LBP</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500/15 to-purple-600/5 border border-purple-500/40 rounded-xl text-center">
              <Mic className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <h4 className="font-bold text-foreground text-xs">Audio</h4>
              <p className="text-xs text-muted-foreground">FFT, Pitch</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/40 rounded-xl text-center">
              <Activity className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
              <h4 className="font-bold text-foreground text-xs">Temporal</h4>
              <p className="text-xs text-muted-foreground">Frame, Motion</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/40 rounded-xl text-center">
              <Database className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <h4 className="font-bold text-foreground text-xs">Metadata</h4>
              <p className="text-xs text-muted-foreground">SHA-256</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500/15 to-red-600/5 border border-red-500/40 rounded-xl text-center">
              <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-1" />
              <h4 className="font-bold text-foreground text-xs">AI Sig</h4>
              <p className="text-xs text-muted-foreground">50+ tools</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/40 rounded-xl text-center">
              <Brain className="w-6 h-6 text-primary mx-auto mb-1" />
              <h4 className="font-bold text-foreground text-xs">Arbiter</h4>
              <p className="text-xs text-muted-foreground">DS Fusion</p>
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


          {/* Technical Note */}
          <div className="p-4 bg-card border border-green-500/30 rounded-xl">
            <h4 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Complete System Capabilities
            </h4>
            <p className="text-sm text-muted-foreground">
              <span className="text-green-400 font-semibold">Two-mode forensic detection system:</span> Offline mode runs 
              <span className="text-primary font-semibold"> 100% in-browser</span> using 6 AI agents with real algorithms (CV, FFT, Von Neumann entropy, Dempster-Shafer). 
              Cloud ML mode adds <span className="text-blue-400 font-semibold">ShanShield-ML-v3.0</span> running on <span className="text-blue-400 font-semibold">Supabase Edge Functions (Lovable Cloud)</span> with 5 specialized modules 
              for GAN fingerprinting, diffusion detection, facial manipulation, audio deepfakes, and compression artifact analysis.
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

          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="text-center p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">6+1</div>
              <div className="text-sm text-muted-foreground">AI Agents</div>
            </div>
            <div className="text-center p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Offline Capable</div>
            </div>
            <div className="text-center p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">2 Modes</div>
              <div className="text-sm text-muted-foreground">Offline + Cloud</div>
            </div>
            <div className="text-center p-4 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">C2PA</div>
              <div className="text-sm text-muted-foreground">Verified</div>
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

      {/* Speaker Notes Overlay */}
      {showNotes && currentSlideData.speakerNotes && (
        <div className="absolute bottom-24 left-6 right-6 p-4 bg-card/95 backdrop-blur-xl border border-primary/40 rounded-xl z-20">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">Speaker Notes (N to toggle)</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {currentSlideData.speakerNotes.map((note, idx) => (
              <li key={idx}>• {note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PresentationMode;
