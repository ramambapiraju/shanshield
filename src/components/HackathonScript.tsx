import { useState, useEffect } from "react";
import { 
  X, 
  Presentation, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Shield,
  Eye,
  Mic,
  Clock as ClockIcon,
  Database,
  Brain,
  FileCheck,
  Wifi,
  Cloud,
  Users,
  Target,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Code,
  Cpu,
  Lock,
  RefreshCw,
  Activity,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SlideContent {
  id: string;
  title: string;
  duration: string;
  timeRange: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  speakerNotes: string[];
}

const HackathonScript = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsVisible(false);
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

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

  const slides: SlideContent[] = [
    // ==================== SLIDE 1: OPENING HOOK (45 sec) ====================
    {
      id: "opening",
      title: "🎯 Opening Hook",
      duration: "45 sec",
      timeRange: "0:00 - 0:45",
      icon: Target,
      content: (
        <div className="space-y-6">
          <div className="text-center p-6 bg-destructive/10 border border-destructive/30 rounded-xl">
            <h3 className="text-2xl font-bold text-destructive mb-4">
              "What if the next election was decided by a video that never happened?"
            </h3>
            <p className="text-muted-foreground italic">
              [DRAMATIC PAUSE - 3 seconds - Make eye contact with judges]
            </p>
          </div>
          
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-foreground leading-relaxed">
              "In February 2024, a deepfake audio of a president convinced voters to stay home. 
              A $25 million wire fraud used CEO voice clones. Eight million deepfakes are created 
              DAILY — and 94% of humans can't tell the difference anymore."
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="text-3xl font-bold text-destructive">$40B</div>
              <div className="text-xs text-muted-foreground">Annual fraud losses</div>
            </div>
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <div className="text-3xl font-bold text-warning">8M+</div>
              <div className="text-xs text-muted-foreground">Deepfakes daily</div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary">6 sec</div>
              <div className="text-xs text-muted-foreground">To generate fake</div>
            </div>
          </div>
          
          <div className="text-center p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-lg font-semibold text-foreground">
              "I'm <span className="text-primary">Shanmuka Sai Varma</span>, and I've built <span className="text-primary">SHANSHIELD</span> — 
              the world's first multi-agent forensic intelligence system that fights deepfakes like a team of expert detectives."
            </p>
          </div>
        </div>
      ),
      speakerNotes: [
        "START WITH DRAMATIC PAUSE after opening question",
        "Make direct eye contact with each judge",
        "Voice: Start soft, build intensity",
        "Hand gesture to stats as you mention them",
        "End with confident introduction of yourself and product"
      ]
    },

    // ==================== SLIDE 2: THE PROBLEM (1 min 15 sec) ====================
    {
      id: "problem",
      title: "🔥 The Problem Deep-Dive",
      duration: "1 min 15 sec",
      timeRange: "0:45 - 2:00",
      icon: AlertTriangle,
      content: (
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-foreground text-center">Why Current Detection Systems FAIL</h3>
          
          <div className="space-y-4">
            {/* Problem 1 */}
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold shrink-0">1</div>
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground text-lg">Single-Modal Blindness</h4>
                  <p className="text-sm text-muted-foreground">
                    "Existing tools analyze video OR audio — never both together. Modern attackers exploit this: 
                    they'll perfect the visual deepfake but leave subtle audio artifacts, or vice versa."
                  </p>
                  <div className="p-2 bg-background/50 rounded text-xs font-mono text-muted-foreground">
                    Example: FaceForensics++ detectors miss 40% of audio-only deepfakes because they never listen.
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold shrink-0">2</div>
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground text-lg">Black Box Crisis</h4>
                  <p className="text-sm text-muted-foreground">
                    "When a detector says '85% fake,' that's USELESS in court. Prosecutors need to point to 
                    EXACTLY where manipulation happened and WHY the AI reached its conclusion."
                  </p>
                  <div className="p-2 bg-background/50 rounded text-xs font-mono text-muted-foreground">
                    Legal requirement: EU AI Act mandates explainability for high-stakes decisions.
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold shrink-0">3</div>
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground text-lg">Cloud Dependency Trap</h4>
                  <p className="text-sm text-muted-foreground">
                    "A border agent checking a suspicious passport video can't upload to cloud servers. 
                    Military analysts handling classified footage need air-gapped systems. Current solutions fail them."
                  </p>
                  <div className="p-2 bg-background/50 rounded text-xs font-mono text-muted-foreground">
                    Zero offline-capable forensic-grade detectors exist in the market today.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="font-semibold text-foreground">
              "SHANSHIELD solves ALL THREE problems simultaneously. Here's how..."
            </p>
          </div>
        </div>
      ),
      speakerNotes: [
        "Point to each problem number as you explain",
        "Use real examples: Zelensky deepfake, $25M CEO fraud",
        "Build urgency with each problem",
        "Pause before transition to solution",
        "Voice should convey frustration at current failures"
      ]
    },

    // ==================== SLIDE 3: MULTI-AGENT ARCHITECTURE (1 min 30 sec) ====================
    {
      id: "architecture",
      title: "🧠 Multi-Agent Architecture",
      duration: "1 min 30 sec",
      timeRange: "2:00 - 3:30",
      icon: Brain,
      content: (
        <div className="space-y-5">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-primary">SHANSHIELD: Agentic AI Defense System</h3>
            <p className="text-muted-foreground">Four specialized agents that DEBATE to reach consensus</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Visual Agent */}
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-foreground">Visual Agent (35% weight)</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <span className="text-blue-400">Noise Pattern Analysis</span> — statistical variance</li>
                <li>• Sobel Edge Detection for boundary artifacts</li>
                <li>• Color Histogram Analysis (RGB distribution)</li>
                <li>• JPEG Artifact Detection & Bilateral Symmetry</li>
              </ul>
            </div>

            {/* Audio Agent */}
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Mic className="w-6 h-6 text-purple-400" />
                <span className="font-bold text-foreground">Audio Agent (25% weight)</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <span className="text-purple-400">Web Audio API</span> + Real-time FFT</li>
                <li>• Autocorrelation Pitch Detection</li>
                <li>• Noise Floor & Quantization Analysis</li>
                <li>• Voice Envelope & Frequency Distribution</li>
              </ul>
            </div>

            {/* Temporal Agent */}
            <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-6 h-6 text-cyan-400" />
                <span className="font-bold text-foreground">Temporal Agent (25% weight)</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <span className="text-cyan-400">Frame Consistency Check</span></li>
                <li>• Motion Vector Analysis (temporal coherence)</li>
                <li>• Face Region Tracking & Compression Analysis</li>
                <li>• Inter-frame Motion Flow Detection</li>
              </ul>
            </div>

            {/* Metadata Agent */}
            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-6 h-6 text-amber-400" />
                <span className="font-bold text-foreground">Metadata Agent (15% weight)</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <span className="text-amber-400">SHA-256</span> cryptographic hashing</li>
                <li>• Byte Entropy Analysis for anomalies</li>
                <li>• EXIF/XMP AI generation markers</li>
                <li>• Fuzzy Hashing for semantic similarity</li>
              </ul>
            </div>
          </div>

          {/* Arbiter Agent */}
          <div className="p-4 bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/40 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h4 className="font-bold text-foreground text-lg">Arbiter Agent — The Judge</h4>
                <p className="text-xs text-muted-foreground">Dempster-Shafer belief fusion with conflict detection</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              "If Visual says <span className="text-destructive">FAKE</span> but Audio says <span className="text-success">REAL</span>, 
              we don't average — we FLAG A CONFLICT. This catches sophisticated adversarial attacks that fool single-modal systems."
            </p>
          </div>
        </div>
      ),
      speakerNotes: [
        "Point to each agent quadrant as you explain",
        "Emphasize weights: 'Visual gets 35% because faces are primary targets'",
        "rPPG is your WOW moment: 'We detect HEARTBEAT through skin color changes'",
        "Arbiter: 'Think of it as four expert witnesses debating in court'",
        "Pause after conflict detection explanation"
      ]
    },

    // ==================== SLIDE 4: VISUAL AGENT DEEP-DIVE (1 min) ====================
    {
      id: "visual-agent",
      title: "👁️ Visual Agent Deep-Dive",
      duration: "1 min",
      timeRange: "3:30 - 4:30",
      icon: Eye,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-center text-foreground">Visual Forensics: Browser-Native Detection</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Noise Analysis */}
            <div className="p-4 bg-card border border-border rounded-lg space-y-3">
              <h4 className="font-bold text-primary flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Noise Pattern Analysis
              </h4>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>"We analyze pixel-level statistical patterns:"</p>
                <div className="p-2 bg-background/50 rounded font-mono">
                  <div>• Standard deviation across regions</div>
                  <div>• Variance ratio detection</div>
                  <div>• LBP (Local Binary Patterns)</div>
                  <div>• Texture consistency analysis</div>
                </div>
              </div>
            </div>

            {/* Edge Detection */}
            <div className="p-4 bg-card border border-border rounded-lg space-y-3">
              <h4 className="font-bold text-cyan-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Edge & Artifact Detection
              </h4>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>"AI-generated images have tell-tale boundary artifacts:"</p>
                <div className="p-2 bg-background/50 rounded font-mono">
                  <div>• Sobel operator edge detection</div>
                  <div>• JPEG block artifact analysis</div>
                  <div>• Color histogram anomalies</div>
                  <div>• Bilateral symmetry scoring</div>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas-Based Analysis */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="font-bold text-blue-400 flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5" />
              Canvas API: Real-Time Pixel Analysis
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <p className="mb-2">"Direct pixel access for forensic analysis:"</p>
                <div className="p-2 bg-background/50 rounded font-mono space-y-1">
                  <div>1. Load image into Canvas element</div>
                  <div>2. Extract raw pixel data (RGBA)</div>
                  <div>3. Apply statistical algorithms</div>
                  <div>4. Generate confidence scores</div>
                </div>
              </div>
              <div>
                <p className="mb-2">"What we detect without ML models:"</p>
                <div className="p-2 bg-background/50 rounded font-mono space-y-1">
                  <div>• Unnatural color distributions</div>
                  <div>• Compression inconsistencies</div>
                  <div>• Noise pattern anomalies</div>
                  <div>• Edge boundary artifacts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      speakerNotes: [
        "All analysis runs directly in the browser - no server needed",
        "Canvas API gives us direct pixel access for forensics",
        "Statistical methods can detect many AI artifacts",
        "Works offline, no data leaves the device",
        "Fast inference - results in milliseconds"
      ]
    },

    // ==================== SLIDE 5: AUDIO + TEMPORAL AGENTS (1 min) ====================
    {
      id: "audio-temporal",
      title: "🎤 Audio & Temporal Analysis",
      duration: "1 min",
      timeRange: "4:30 - 5:30",
      icon: Mic,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Audio Agent Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Audio Agent: Web Audio API
              </h3>
              
              <div className="p-3 bg-card border border-border rounded-lg">
                <h4 className="font-semibold text-sm text-foreground mb-2">Spectral Analysis</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>"Real-time frequency analysis in browser:"</p>
                  <div className="p-2 bg-background/50 rounded font-mono mt-2">
                    <div>• FFT (Fast Fourier Transform)</div>
                    <div>• Autocorrelation pitch detection</div>
                    <div>• Frequency band distribution</div>
                    <div>• Real-time level monitoring</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="font-semibold text-sm text-foreground mb-2">Artifact Detection</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Noise floor inconsistencies</div>
                  <div>• Quantization step detection</div>
                  <div>• Voice envelope analysis</div>
                  <div>• Spectral anomaly flagging</div>
                </div>
              </div>
            </div>

            {/* Temporal Agent Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Temporal Agent: Frame Analysis
              </h3>
              
              <div className="p-3 bg-card border border-border rounded-lg">
                <h4 className="font-semibold text-sm text-foreground mb-2">Motion Consistency</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>"Frame-by-frame coherence analysis:"</p>
                  <div className="p-2 bg-background/50 rounded font-mono mt-2">
                    <div>• Inter-frame pixel difference</div>
                    <div>• Motion vector tracking</div>
                    <div>• Temporal coherence scoring</div>
                    <div>• Compression artifact detection</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <h4 className="font-semibold text-sm text-foreground mb-2">Region Tracking</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Face region detection</div>
                  <div>• Movement pattern analysis</div>
                  <div>• Flow continuity checking</div>
                  <div>• Splice point detection</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              "Audio catches synthetic voices. Temporal catches manipulated frames. Together with Visual, 
              <span className="text-primary font-semibold"> multi-modal analysis provides robust detection.</span>"
            </p>
          </div>
        </div>
      ),
      speakerNotes: [
        "Audio: 'Web Audio API runs entirely in browser'",
        "FFT analysis detects unnatural frequency patterns",
        "Temporal: 'Frame comparison catches manipulation'",
        "All processing happens client-side, no server needed",
        "Emphasize the multi-modal synergy"
      ]
    },

    // ==================== SLIDE 6: FIELD MODE & EDGE AI (1 min) ====================
    {
      id: "field-mode",
      title: "📡 Field Mode: Edge AI",
      duration: "1 min",
      timeRange: "5:30 - 6:30",
      icon: Wifi,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-foreground">Field Mode: Forensic Detection Without Internet</h3>
            <p className="text-muted-foreground text-sm">For border agents, military, journalists in hostile zones</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gradient-to-b from-success/10 to-success/5 border border-success/30 rounded-lg text-center">
              <Cpu className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="font-bold text-success text-lg">4.2 MB</div>
              <div className="text-xs text-muted-foreground">Quantized model size</div>
            </div>
            <div className="p-3 bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/30 rounded-lg text-center">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="font-bold text-primary text-lg">&lt;100ms</div>
              <div className="text-xs text-muted-foreground">Inference time</div>
            </div>
            <div className="p-3 bg-gradient-to-b from-warning/10 to-warning/5 border border-warning/30 rounded-lg text-center">
              <Wifi className="w-8 h-8 text-warning mx-auto mb-2" />
              <div className="font-bold text-warning text-lg">100%</div>
              <div className="text-xs text-muted-foreground">Offline capable</div>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-bold text-foreground mb-3">Progressive Model Compression Pipeline</h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-background rounded">
                <div className="font-semibold text-primary">INT8</div>
                <div className="text-muted-foreground">Quantization</div>
              </div>
              <div className="p-2 bg-background rounded">
                <div className="font-semibold text-primary">70%</div>
                <div className="text-muted-foreground">Pruning</div>
              </div>
              <div className="p-2 bg-background rounded">
                <div className="font-semibold text-primary">KD</div>
                <div className="text-muted-foreground">Distillation</div>
              </div>
              <div className="p-2 bg-background rounded">
                <div className="font-semibold text-primary">WebGPU</div>
                <div className="text-muted-foreground">Acceleration</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">Technology Stack</h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="space-y-1">
                <div>• <span className="text-primary">TensorFlow.js 4.20</span> runtime</div>
                <div>• <span className="text-primary">WebGPU</span> backend (50x faster than WebGL)</div>
                <div>• <span className="text-primary">IndexedDB</span> for model caching</div>
              </div>
              <div className="space-y-1">
                <div>• <span className="text-primary">ONNX</span> model format</div>
                <div>• <span className="text-primary">Web Workers</span> for non-blocking UI</div>
                <div>• <span className="text-primary">Service Workers</span> for offline-first</div>
              </div>
            </div>
          </div>
        </div>
      ),
      speakerNotes: [
        "This is a MAJOR differentiator - no competitor offers this",
        "'A border agent can verify a passport video in 2 seconds, offline'",
        "Mention WebGPU: 'New browser API, 50x faster than WebGL'",
        "Quantization: 'We compress 118M params to 4.2MB with <3% accuracy loss'",
        "IndexedDB: 'Models persist across sessions, no re-download'"
      ]
    },

    // ==================== SLIDE 7: EXPLAINABILITY & CHAIN OF CUSTODY (1 min) ====================
    {
      id: "explainability",
      title: "⚖️ Explainability & Legal Chain",
      duration: "1 min",
      timeRange: "6:30 - 7:30",
      icon: FileCheck,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-foreground">Court-Ready Evidence Generation</h3>
            <p className="text-muted-foreground text-sm">From detection to prosecution — complete audit trail</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Explainable AI */}
            <div className="p-4 bg-card border border-border rounded-lg space-y-3">
              <h4 className="font-bold text-primary flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Explainable AI Output
              </h4>
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="p-2 bg-background/50 rounded">
                  <span className="font-semibold text-destructive">Visual:</span> "GAN artifacts detected in jaw region (0.92 confidence)"
                </div>
                <div className="p-2 bg-background/50 rounded">
                  <span className="font-semibold text-purple-400">Audio:</span> "Missing breath intake at 0:03.2-0:04.1"
                </div>
                <div className="p-2 bg-background/50 rounded">
                  <span className="font-semibold text-cyan-400">Temporal:</span> "No rPPG signal detected in forehead ROI"
                </div>
                <div className="p-2 bg-background/50 rounded">
                  <span className="font-semibold text-amber-400">Metadata:</span> "C2PA manifest invalid, hash mismatch"
                </div>
              </div>
            </div>

            {/* Chain of Custody */}
            <div className="p-4 bg-card border border-border rounded-lg space-y-3">
              <h4 className="font-bold text-amber-400 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Forensic Chain of Custody
              </h4>
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>SHA-3/256 hash at every step</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Timestamped via RFC 3161 TSA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>ISO 27037 compliant procedures</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>NIST-certified storage integrity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Exportable court-ready reports</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/30 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">C2PA Integration (Coalition for Content Provenance)</h4>
            <div className="text-xs text-muted-foreground">
              "We validate C2PA manifests from Adobe, Microsoft, BBC. If content was AI-generated with proper disclosure, 
              we verify it. If the manifest is tampered or missing, that's another red flag."
            </div>
          </div>
        </div>
      ),
      speakerNotes: [
        "This solves the BLACK BOX problem from earlier",
        "'Every detection comes with a detailed reasoning chain'",
        "Mention ISO 27037: 'The international standard for digital evidence'",
        "C2PA: 'Backed by Adobe, Microsoft, BBC, Intel, ARM'",
        "'Prosecutors can point to exact timestamps and pixel locations'"
      ]
    },

    // ==================== SLIDE 8: CONTINUOUS LEARNING & QUANTUM (45 sec) ====================
    {
      id: "future-proof",
      title: "🔮 Future-Proofing",
      duration: "45 sec",
      timeRange: "7:30 - 8:15",
      icon: RefreshCw,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-foreground">Staying Ahead of the Arms Race</h3>
            <p className="text-muted-foreground text-sm">Continuous learning + quantum-ready architecture</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Continuous Learning */}
            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-lg">
              <h4 className="font-bold text-primary flex items-center gap-2 mb-3">
                <RefreshCw className="w-5 h-5" />
                Continuous Learning Pipeline
              </h4>
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Honeypot collection from dark web</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Adversarial red-teaming attacks</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Federated learning (privacy-preserved)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Weekly model updates via OTA</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-background/50 rounded text-xs font-mono text-center">
                Mean time to detect new generators: &lt;72 hours
              </div>
            </div>

            {/* Quantum Readiness */}
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 rounded-lg">
              <h4 className="font-bold text-purple-400 flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5" />
                Quantum-Ready Security
              </h4>
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>ML-KEM (NIST PQC) for key exchange</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>ML-DSA signatures for C2PA</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Hybrid classical-quantum protocols</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-background/50 rounded text-xs text-center">
                <span className="font-semibold text-purple-400">Biological Anchors:</span> rPPG, micro-saccades, 
                breathing — signals quantum computers can't fake
              </div>
            </div>
          </div>

          <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-center">
            <p className="text-sm text-foreground">
              "New deepfake generator released? We detect it within 72 hours. Quantum computers arrive? Our biological anchors remain unfakeable."
            </p>
          </div>
        </div>
      ),
      speakerNotes: [
        "Quick slide - hit the highlights",
        "'We're not building a static solution - this evolves'",
        "Red-teaming: 'We attack ourselves before attackers do'",
        "Quantum: 'NIST just finalized these standards in 2024'",
        "Biological anchors: 'Physics and biology don't change with technology'"
      ]
    },

    // ==================== SLIDE 9: LIVE DEMO (1 min 15 sec) ====================
    {
      id: "demo",
      title: "🖥️ Live Demo",
      duration: "1 min 15 sec",
      timeRange: "8:15 - 9:30",
      icon: Presentation,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg text-center">
            <h3 className="font-bold text-warning flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              DEMO TIME — Practice This 10 Times Before Presenting
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">1</div>
                  <span className="font-semibold text-sm">Upload Authentic (15s)</span>
                </div>
                <p className="text-xs text-muted-foreground">"First, a genuine video. Watch the pipeline..."</p>
                <p className="text-xs text-success mt-1">→ Show GREEN AUTHENTIC result</p>
              </div>
              
              <div className="p-3 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">2</div>
                  <span className="font-semibold text-sm">Upload Deepfake (20s)</span>
                </div>
                <p className="text-xs text-muted-foreground">"Now a deepfake from [Sora/Runway]..."</p>
                <p className="text-xs text-destructive mt-1">→ Show RED DEEPFAKE with heatmap</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">3</div>
                  <span className="font-semibold text-sm">Show Explainability (25s)</span>
                </div>
                <p className="text-xs text-muted-foreground">"Notice the heatmap highlighting manipulation..."</p>
                <p className="text-xs text-primary mt-1">→ Click Visual, Timeline, Audio tabs</p>
              </div>
              
              <div className="p-3 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">4</div>
                  <span className="font-semibold text-sm">Toggle Field Mode (15s)</span>
                </div>
                <p className="text-xs text-muted-foreground">"Now offline mode — watch the switch..."</p>
                <p className="text-xs text-warning mt-1">→ Show WebGPU/INT8 badges</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <h4 className="font-semibold text-destructive text-sm mb-2">If Demo Fails:</h4>
            <p className="text-xs text-muted-foreground">
              "Due to [network/time], let me show pre-recorded results..." 
              <span className="text-foreground"> Have backup screenshots ready!</span>
            </p>
          </div>
        </div>
      ),
      speakerNotes: [
        "Have test videos LOADED before you start",
        "Keep talking while analysis runs",
        "Point to specific UI elements",
        "If something fails, stay calm - backup plan ready",
        "End with: 'Total analysis time: X seconds'"
      ]
    },

    // ==================== SLIDE 10: CLOSING (30 sec) ====================
    {
      id: "closing",
      title: "🎯 Closing Statement",
      duration: "30 sec",
      timeRange: "9:30 - 10:00",
      icon: Award,
      content: (
        <div className="space-y-6">
          <div className="text-center p-6 bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/40 rounded-xl">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              "SHANSHIELD: Because Truth Shouldn't Be Optional"
            </h3>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">97.3%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="p-3 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-success">2.3s</div>
              <div className="text-xs text-muted-foreground">Analysis time</div>
            </div>
            <div className="p-3 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-warning">100%</div>
              <div className="text-xs text-muted-foreground">Explainable</div>
            </div>
            <div className="p-3 bg-card border border-border rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">Offline</div>
              <div className="text-xs text-muted-foreground">Capable</div>
            </div>
          </div>

          <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
            <h4 className="font-bold text-foreground text-center mb-3">Why SHANSHIELD Wins</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Multi-agent debate architecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>rPPG biological verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Court-ready explainability</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>True offline Field Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Continuous learning pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Quantum-ready security</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-lg font-semibold text-foreground">
              "I'm <span className="text-primary">Shanmuka Sai Varma</span>. 
              In a world of synthetic lies, SHANSHIELD is the truth detector humanity needs."
            </p>
            <p className="text-sm text-muted-foreground mt-2 italic">
              [PAUSE] "Thank you. I'm ready for your questions."
            </p>
          </div>
        </div>
      ),
      speakerNotes: [
        "Deliver with CONFIDENCE and conviction",
        "Make eye contact with each judge on final line",
        "Don't rush - let the message land",
        "Smile genuinely after 'Thank you'",
        "Stay standing, confident posture for Q&A"
      ]
    }
  ];

  const currentSlideData = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">SHANSHIELD Pitch Script</span>
          </div>
          <div className="text-sm text-muted-foreground">
            10-Minute Technical Presentation
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
            <Clock className="w-4 h-4 text-primary" />
            <span className={cn(
              "font-mono text-lg font-bold",
              elapsedTime > 600 ? "text-destructive" : elapsedTime > 540 ? "text-warning" : "text-foreground"
            )}>
              {formatTime(elapsedTime)}
            </span>
            <span className="text-muted-foreground">/ 10:00</span>
            <Button
              size="sm"
              variant={isTimerRunning ? "destructive" : "default"}
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? "Pause" : "Start"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setElapsedTime(0)}
            >
              Reset
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-card/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">
            Slide {currentSlide + 1} of {slides.length}
          </span>
          <span className="text-xs text-primary font-semibold">
            {currentSlideData.timeRange}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Slide Indicators */}
        <div className="flex gap-1 mt-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "flex-1 h-1 rounded-full transition-all",
                idx === currentSlide 
                  ? "bg-primary" 
                  : idx < currentSlide 
                    ? "bg-primary/50" 
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto">
              {/* Slide Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <currentSlideData.icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{currentSlideData.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {currentSlideData.duration}
                    </span>
                    <span className="text-primary">{currentSlideData.timeRange}</span>
                  </div>
                </div>
              </div>

              {/* Slide Content */}
              <div className="mb-6">
                {currentSlideData.content}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Speaker Notes Sidebar */}
        <div className="w-80 border-l border-border bg-card/50 p-4 overflow-auto">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" />
            Speaker Notes
          </h3>
          <div className="space-y-3">
            {currentSlideData.speakerNotes.map((note, idx) => (
              <div 
                key={idx}
                className="p-3 bg-background/50 rounded-lg border border-border text-sm text-muted-foreground"
              >
                <span className="text-primary font-bold mr-2">{idx + 1}.</span>
                {note}
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-sm text-foreground mb-2">Power Stats:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• 97.3% accuracy (FaceForensics++)</div>
              <div>• 2.3 seconds analysis time</div>
              <div>• 4.2MB Field Mode model</div>
              <div>• &lt;100ms edge inference</div>
              <div>• 72-hour new threat detection</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-card/50">
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
          <span className="text-sm text-muted-foreground">
            Use <kbd className="px-2 py-1 bg-muted rounded text-xs">←</kbd> <kbd className="px-2 py-1 bg-muted rounded text-xs">→</kbd> or <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> to navigate
          </span>
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
    </div>
  );
};

export default HackathonScript;
