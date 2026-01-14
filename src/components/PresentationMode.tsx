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
  RefreshCw,
  Activity,
  Layers,
  Wifi,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Atom,
  GraduationCap,
  Calendar,
  TrendingUp,
  ShieldAlert
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync with prop
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
      // F5 or Cmd+Shift+P (Mac-friendly) to toggle presentation mode
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
              <div className="text-4xl font-bold text-primary">6.5s</div>
              <div className="text-sm text-muted-foreground">Avg Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">4+1</div>
              <div className="text-sm text-muted-foreground">AI Agents + Arbiter</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Explainable AI</div>
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
              <p className="text-muted-foreground">Border agents, military analysts need offline detection. None exists.</p>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 3: MULTI-AGENT ARCHITECTURE
    {
      id: "architecture",
      title: "Multi-Agent Architecture",
      subtitle: "Four Specialized AI Agents That Debate",
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
                <li>• <span className="text-blue-400 font-semibold">EfficientNetV2-L</span> — 118M parameters</li>
                <li>• Frequency-aware attention (FFT analysis)</li>
                <li>• GAN/Diffusion fingerprint detection</li>
                <li>• Generator ID: Sora, Runway, DALL-E 4</li>
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
                <li>• <span className="text-purple-400 font-semibold">RawNet3</span> vocoder detection</li>
                <li>• Wav2Vec2 semantic analysis</li>
                <li>• Breathing pattern verification</li>
                <li>• Clone ID: ElevenLabs, XTTS, Bark</li>
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
                <li>• <span className="text-cyan-400 font-semibold">rPPG heartbeat detection</span> (0.8-2Hz)</li>
                <li>• RAFT optical flow analysis</li>
                <li>• 478-point facial landmark tracking</li>
                <li>• Blink pattern validation (PERCLOS)</li>
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
                <li>• <span className="text-amber-400 font-semibold">C2PA provenance</span> verification</li>
                <li>• SHA-3/256 cryptographic hashing</li>
                <li>• EXIF/XMP AI generation markers</li>
                <li>• Fuzzy hashing for similarity</li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-primary/50 rounded-2xl">
            <div className="flex items-center gap-4">
              <Brain className="w-12 h-12 text-primary" />
              <div>
                <h3 className="text-2xl font-bold text-foreground">Arbiter Agent — The Judge</h3>
                <p className="text-muted-foreground">Dempster-Shafer belief fusion • Conflict detection • Consensus building</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 4: VISUAL AGENT DEEP-DIVE
    {
      id: "visual-deep",
      title: "Visual Agent Deep-Dive",
      subtitle: "Seeing What Humans Can't",
      duration: "1 min",
      icon: Eye,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-6">
            Visual Forensics Technology
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-card border border-border rounded-xl space-y-4">
              <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Layers className="w-6 h-6" />
                EfficientNetV2-L Architecture
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="text-lg">Compound scaling: width × depth × resolution</p>
                <div className="p-4 bg-background/50 rounded-lg font-mono text-sm">
                  <div>• Backbone: 118M parameters (EfficientNetV2-L)</div>
                  <div>• Input: 380×380 RGB + FFT channels</div>
                  <div>• Feature Pyramid: P3-P7 scales</div>
                  <div>• Attention: SE blocks + CBAM</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card border border-border rounded-xl space-y-4">
              <h3 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Frequency Domain Analysis
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="text-lg">Diffusion models leave high-frequency fingerprints</p>
                <div className="p-4 bg-background/50 rounded-lg font-mono text-sm">
                  <div>• FFT on 64×64 patches</div>
                  <div>• Azimuthal power spectrum</div>
                  <div>• Stable Diffusion grid detection</div>
                  <div>• Sora temporal signatures</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 border-2 border-red-500/40 rounded-xl">
            <h3 className="text-2xl font-bold text-red-400 flex items-center gap-2 mb-4">
              <Activity className="w-6 h-6" />
              rPPG: Remote Photoplethysmography — Detecting Heartbeat Through Video
            </h3>
            <div className="grid grid-cols-2 gap-6 text-muted-foreground">
              <div>
                <p className="text-lg mb-3">Real humans have visible blood flow as micro-color changes:</p>
                <div className="p-4 bg-background/50 rounded-lg font-mono text-sm space-y-1">
                  <div>1. Extract ROI (forehead, cheeks)</div>
                  <div>2. Apply CHROM algorithm</div>
                  <div>3. Bandpass filter 0.8-2Hz</div>
                  <div>4. Validate pulse consistency</div>
                </div>
              </div>
              <div>
                <p className="text-lg mb-3 text-primary font-semibold">Deepfakes CANNOT fake this biological signal!</p>
                <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>Validates living human presence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>Works on compressed video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>Unfakeable by current AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 5: AUDIO & TEMPORAL AGENTS
    {
      id: "audio-temporal",
      title: "Audio & Temporal Analysis",
      subtitle: "Hearing and Timing What's Wrong",
      duration: "1 min",
      icon: Mic,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Audio Agent */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
                <Mic className="w-8 h-8 text-purple-400" />
                Audio Agent
              </h2>
              
              <div className="p-6 bg-card border border-purple-500/30 rounded-xl space-y-4">
                <h4 className="text-xl font-bold text-purple-400">RawNet3 Architecture</h4>
                <div className="p-4 bg-background/50 rounded-lg font-mono text-sm text-muted-foreground">
                  <div>• Sinc convolutions on raw waveform</div>
                  <div>• GRU temporal modeling</div>
                  <div>• Attentive statistics pooling</div>
                  <div>• 1.2M parameters, real-time</div>
                </div>
              </div>

              <div className="p-6 bg-card border border-purple-500/30 rounded-xl space-y-4">
                <h4 className="text-xl font-bold text-purple-400">What It Detects</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    Vocoder artifacts (buzzy quality)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    Missing breathing patterns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    Unnatural prosody/rhythm
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    Clone signatures: ElevenLabs, XTTS
                  </li>
                </ul>
              </div>
            </div>

            {/* Temporal Agent */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
                <Activity className="w-8 h-8 text-cyan-400" />
                Temporal Agent
              </h2>
              
              <div className="p-6 bg-card border border-cyan-500/30 rounded-xl space-y-4">
                <h4 className="text-xl font-bold text-cyan-400">RAFT Optical Flow</h4>
                <div className="p-4 bg-background/50 rounded-lg font-mono text-sm text-muted-foreground">
                  <div>• Recurrent all-pairs field transforms</div>
                  <div>• Frame-to-frame motion analysis</div>
                  <div>• Splice detection at cut points</div>
                  <div>• Physics consistency validation</div>
                </div>
              </div>

              <div className="p-6 bg-card border border-cyan-500/30 rounded-xl space-y-4">
                <h4 className="text-xl font-bold text-cyan-400">What It Detects</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    Temporal splices/cuts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    Unnatural blink patterns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    Micro-expression timing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    Motion physics violations
                  </li>
                </ul>
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
                    <p className="font-semibold text-foreground">GradCAM++ Heatmaps</p>
                    <p className="text-sm text-muted-foreground">Visual highlighting of suspicious regions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <p className="font-semibold text-foreground">SHAP Feature Attribution</p>
                    <p className="text-sm text-muted-foreground">Quantified contribution of each feature</p>
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
                <div className="text-primary font-bold">SHA-3/256</div>
                <div>File hashing</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="text-primary font-bold">Timestamps</div>
                <div>RFC 3161 TSA</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="text-primary font-bold">C2PA Signing</div>
                <div>Provenance chain</div>
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
      subtitle: "True Offline Edge Detection",
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
              <div className="text-3xl font-bold text-foreground">12MB</div>
              <div className="text-muted-foreground">Compressed model</div>
            </div>
            <div className="text-center p-6 bg-card border border-border rounded-xl">
              <Zap className="w-12 h-12 text-warning mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">&lt;300ms</div>
              <div className="text-muted-foreground">Edge inference</div>
            </div>
            <div className="text-center p-6 bg-card border border-border rounded-xl">
              <Wifi className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">100%</div>
              <div className="text-muted-foreground">Offline capable</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="text-xl font-bold text-foreground mb-4">Progressive Model Compression</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Full Cloud Model</span>
                  <span className="font-mono text-foreground">118M params</span>
                </div>
                <Progress value={100} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">INT8 Quantized</span>
                  <span className="font-mono text-foreground">22M params</span>
                </div>
                <Progress value={25} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">INT4 + Pruned</span>
                  <span className="font-mono text-foreground">5.5M params</span>
                </div>
                <Progress value={6} className="h-2" />
              </div>
            </div>

            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="text-xl font-bold text-foreground mb-4">Deployment Stack</h3>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span><strong className="text-foreground">WebGPU</strong> — GPU acceleration in browser</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span><strong className="text-foreground">ONNX Runtime</strong> — Cross-platform inference</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  <span><strong className="text-foreground">WebAssembly</strong> — CPU fallback</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <span><strong className="text-foreground">Service Workers</strong> — Offline caching</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 8: CONTINUOUS LEARNING
    {
      id: "continuous-learning",
      title: "Continuous Learning",
      subtitle: "Weekly Model Updates & Threat Hunting",
      duration: "45 sec",
      icon: RefreshCw,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-6">
            Staying Ahead of Attackers
          </h2>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-primary/10 border border-primary/30 rounded-xl">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">Weekly</div>
              <div className="text-sm text-muted-foreground">Model retraining</div>
            </div>
            <div className="text-center p-4 bg-warning/10 border border-warning/30 rounded-xl">
              <Target className="w-8 h-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">48-72hr</div>
              <div className="text-sm text-muted-foreground">New threat response</div>
            </div>
            <div className="text-center p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
              <ShieldAlert className="w-8 h-8 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">Red Team</div>
              <div className="text-sm text-muted-foreground">Adversarial testing</div>
            </div>
            <div className="text-center p-4 bg-cyan-400/10 border border-cyan-400/30 rounded-xl">
              <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">+1.5%</div>
              <div className="text-sm text-muted-foreground">Monthly accuracy gain</div>
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl">
            <h3 className="text-xl font-bold text-foreground mb-4">Weekly Update Pipeline</h3>
            <div className="flex items-center justify-between">
              <div className="text-center p-4 bg-background/50 rounded-lg flex-1">
                <Database className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-sm font-semibold">Honeypot Collection</div>
                <div className="text-xs text-muted-foreground">New deepfake samples</div>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
              <div className="text-center p-4 bg-background/50 rounded-lg flex-1">
                <ShieldAlert className="w-6 h-6 text-destructive mx-auto mb-2" />
                <div className="text-sm font-semibold">Red Team Attack</div>
                <div className="text-xs text-muted-foreground">Adversarial testing</div>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
              <div className="text-center p-4 bg-background/50 rounded-lg flex-1">
                <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-sm font-semibold">Model Training</div>
                <div className="text-xs text-muted-foreground">PyTorch 2.4 + MLflow</div>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
              <div className="text-center p-4 bg-background/50 rounded-lg flex-1">
                <RefreshCw className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-sm font-semibold">Gradual Rollout</div>
                <div className="text-xs text-muted-foreground">Canary → Full deploy</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
            <p className="text-lg text-foreground">
              <span className="font-bold text-primary">Key insight:</span> Deepfake technology evolves weekly. 
              Static models become obsolete within months. SHANSHIELD evolves faster than attackers.
            </p>
          </div>
        </div>
      )
    },

    // SLIDE 9: FUTURE & QUANTUM PREPAREDNESS (NEW!)
    {
      id: "quantum-future",
      title: "Future & Quantum Preparedness",
      subtitle: "Post-Quantum Cryptography & Biological Anchors",
      duration: "1 min",
      icon: Atom,
      content: (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-center font-display text-foreground mb-4">
            Preparing for the Quantum Era
          </h2>

          <div className="p-6 bg-gradient-to-r from-destructive/10 to-warning/10 border border-destructive/30 rounded-xl mb-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-10 h-10 text-destructive shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-destructive mb-2">The Quantum Threat to Cryptography</h3>
                <p className="text-muted-foreground text-lg">
                  Quantum computers running <strong className="text-foreground">Shor's algorithm</strong> will break RSA-2048 and ECDSA. 
                  Current C2PA signatures, SSL certificates, and blockchain hashes become <span className="text-destructive font-semibold">worthless</span>.
                </p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-background/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-destructive">2030-2035</div>
                    <div className="text-sm text-muted-foreground">Cryptographic Q-Day</div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-warning">RSA-2048</div>
                    <div className="text-sm text-muted-foreground">Broken by Shor's</div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-destructive">ECDSA</div>
                    <div className="text-sm text-muted-foreground">Compromised</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-primary/10 to-cyan-500/10 border border-primary/30 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-bold text-foreground">NIST Post-Quantum Standards</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                SHANSHIELD implements <strong className="text-primary">FIPS 203, 204, 205</strong> — finalized August 2024:
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">ML-KEM (Kyber)</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">Lattice-based key encapsulation</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">ML-DSA (Dilithium)</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">Digital signatures for C2PA</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">SLH-DSA (SPHINCS+)</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">Hash-based backup signatures</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-8 h-8 text-red-400" />
                <h3 className="text-xl font-bold text-foreground">Biological Anchors — Unfakeable</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Quantum computers can break math, but they <strong className="text-red-400">cannot fake biology</strong>:
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-foreground">rPPG Heartbeat</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">Blood flow visible through skin</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-foreground">Micro-Saccades</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">Involuntary eye movements (50-100ms)</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-foreground">Blink Dynamics</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">Natural patterns impossible to synthesize</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              <div>
                <h4 className="font-bold text-foreground">Weekly Learning Requirement</h4>
                <p className="text-muted-foreground">
                  Post-quantum cryptography evolves rapidly. SHANSHIELD's engineering team maintains 
                  <strong className="text-primary"> weekly PQC briefings</strong> and updates hybrid signature schemes as NIST refines standards.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40 rounded-xl mt-4">
            <div className="flex items-center gap-3">
              <Atom className="w-8 h-8 text-primary" />
              <div>
                <h4 className="font-bold text-foreground">Personal Quantum Commitment</h4>
                <p className="text-muted-foreground">
                  Currently pursuing <strong className="text-primary">Quantum Fundamentals & Advanced Algorithms</strong> course 
                  at <strong className="text-accent">Amaravati Quantum Valley</strong>, offered by 
                  <strong className="text-primary"> WiSER, Andhra Pradesh Government</strong> & <strong className="text-accent">QubiTech</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 10: CLOSING
    {
      id: "closing",
      title: "Why SHANSHIELD Wins",
      subtitle: "The Complete Solution",
      duration: "30 sec",
      icon: Award,
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <h2 className="text-5xl font-bold text-center font-display text-foreground">
            "Truth Shouldn't Be Optional"
          </h2>

          <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
            <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl">
              <div className="text-4xl font-bold text-primary">6.5s</div>
              <div className="text-muted-foreground">Avg Analysis</div>
            </div>
            <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl">
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-muted-foreground">Explainable</div>
            </div>
            <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl">
              <div className="text-4xl font-bold text-primary">Offline</div>
              <div className="text-muted-foreground">Field Ready</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">Multi-agent debate</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">rPPG biological proof</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">Court-ready evidence</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">True Field Mode</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">Continuous learning</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">Quantum-ready</span>
            </div>
          </div>

          <div className="text-center space-y-4 mt-8">
            <p className="text-2xl text-foreground">
              I'm <span className="text-primary font-bold">Shanmuka Sai Varma</span>
            </p>
            <p className="text-xl text-muted-foreground">
              In a world of synthetic lies, SHANSHIELD is the truth detector humanity needs.
            </p>
            <p className="text-lg text-primary font-semibold mt-4">
              Thank you. I'm ready for your questions.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentSlideData = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 bg-card/80 backdrop-blur border-b border-border">
        <div className="flex items-center gap-4">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold font-display">SHANSHIELD PRESENTATION</span>
          <span className="text-muted-foreground text-sm">
            Slide {currentSlide + 1} / {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border">
            <span className={cn(
              "font-mono text-lg font-bold",
              elapsedTime > 600 ? "text-destructive" : elapsedTime > 540 ? "text-warning" : "text-foreground"
            )}>
              {formatTime(elapsedTime)}
            </span>
            <span className="text-muted-foreground text-sm">/ 10:00</span>
            <Button size="sm" variant="ghost" onClick={() => setIsTimerRunning(!isTimerRunning)}>
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setElapsedTime(0)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <Button size="sm" variant="outline" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4 mr-1" />
            {isFullscreen ? "Exit" : "Fullscreen"}
          </Button>

          <Button size="sm" variant="ghost" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <Progress value={progress} className="h-1" />
        <div className="flex gap-1 mt-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all",
                idx === currentSlide ? "bg-primary" : idx < currentSlide ? "bg-primary/50" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto h-full">
          {currentSlideData.content}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between p-4 bg-card/80 backdrop-blur border-t border-border">
        <Button
          variant="outline"
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <currentSlideData.icon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">{currentSlideData.title}</span>
            <span>• {currentSlideData.duration}</span>
          </div>
        </div>

        <Button
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlide === slides.length - 1}
          className="gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 text-xs text-muted-foreground">
        <kbd className="px-2 py-1 bg-muted rounded">←</kbd>
        <kbd className="px-2 py-1 bg-muted rounded">→</kbd>
        <span>Navigate</span>
        <kbd className="px-2 py-1 bg-muted rounded ml-2">F</kbd>
        <span>Fullscreen</span>
        <kbd className="px-2 py-1 bg-muted rounded ml-2">ESC</kbd>
        <span>Exit</span>
      </div>
    </div>
  );
};

export default PresentationMode;
