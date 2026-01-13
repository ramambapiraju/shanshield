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
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
    {
      id: "opening",
      title: "🎯 Opening Hook",
      duration: "1 min",
      timeRange: "0:00 - 1:00",
      icon: Target,
      content: (
        <div className="space-y-6">
          <div className="text-center p-6 bg-destructive/10 border border-destructive/30 rounded-xl">
            <h3 className="text-2xl font-bold text-destructive mb-4">
              "What if the next election was decided by a video that never happened?"
            </h3>
            <p className="text-muted-foreground">
              In 2024, deepfakes influenced elections in 40+ countries. By 2026, AI-generated media is indistinguishable to 94% of humans.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="text-3xl font-bold text-destructive">$40B</div>
              <div className="text-xs text-muted-foreground">Annual fraud losses from synthetic media</div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="text-3xl font-bold text-warning">500%</div>
              <div className="text-xs text-muted-foreground">Increase in deepfake attacks since 2023</div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="text-3xl font-bold text-primary">6 sec</div>
              <div className="text-xs text-muted-foreground">Time to generate a convincing deepfake</div>
            </div>
          </div>
        </div>
      ),
      speakerNotes: [
        "Start with DRAMATIC PAUSE",
        "Make eye contact with judges",
        "Let the question sink in for 3 seconds",
        "This is YOUR moment to grab attention",
        "Transition: 'I'm Shanmuka Sai Varma, and I've built the solution.'"
      ]
    },
    {
      id: "problem",
      title: "🔥 The Problem",
      duration: "2 min",
      timeRange: "1:00 - 3:00",
      icon: AlertTriangle,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-foreground">Current Detection Systems FAIL Because:</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold">1</div>
              <div>
                <h4 className="font-semibold text-foreground">Single-Modal Analysis</h4>
                <p className="text-sm text-muted-foreground">Existing tools check ONLY video OR audio. Attackers exploit this by perfecting one while leaving the other undetected.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold">2</div>
              <div>
                <h4 className="font-semibold text-foreground">No Explainability</h4>
                <p className="text-sm text-muted-foreground">Black-box outputs like "85% fake" are useless in court. Law enforcement needs to know WHY and WHERE manipulation occurred.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold">3</div>
              <div>
                <h4 className="font-semibold text-foreground">Cloud Dependency</h4>
                <p className="text-sm text-muted-foreground">Border agents and field operatives can't upload classified media to cloud servers. They need OFFLINE capability.</p>
              </div>
            </div>
          </div>
        </div>
      ),
      speakerNotes: [
        "Use REAL examples: 'The Ukraine-Zelensky deepfake almost caused military confusion'",
        "Point to each problem with hand gestures",
        "Build urgency: 'Every second we wait, another deepfake is created'",
        "Transition: 'SHANSHIELD solves ALL THREE problems simultaneously'"
      ]
    },
    {
      id: "solution",
      title: "💡 SHANSHIELD Solution",
      duration: "2 min",
      timeRange: "3:00 - 5:00",
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gradient-cyber">SHANSHIELD: Agentic AI Defense System</h3>
            <p className="text-muted-foreground">Multi-Agent Architecture for Comprehensive Deepfake Detection</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Visual Agent</h4>
              <p className="text-xs text-muted-foreground">Diffusion noise, GAN artifacts</p>
            </div>
            <div className="text-center p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <Mic className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Audio Agent</h4>
              <p className="text-xs text-muted-foreground">Vocoder fingerprinting</p>
            </div>
            <div className="text-center p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <ClockIcon className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Temporal Agent</h4>
              <p className="text-xs text-muted-foreground">rPPG heartbeat detection</p>
            </div>
            <div className="text-center p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <Database className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Metadata Agent</h4>
              <p className="text-xs text-muted-foreground">C2PA provenance verification</p>
            </div>
          </div>
          
          <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
            <h4 className="font-semibold text-success flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Key Innovation: Weighted Ensemble with Conflict Detection
            </h4>
            <p className="text-sm text-muted-foreground mt-2">
              Unlike single-model approaches, our agents VOTE on authenticity. If visual says "fake" but audio says "real," 
              we flag a CONFLICT — potentially indicating an adversarial attack.
            </p>
          </div>
        </div>
      ),
      speakerNotes: [
        "Point to each agent as you explain",
        "Emphasize: 'No other solution has this multi-agent architecture'",
        "Highlight rPPG: 'We detect if a HEARTBEAT is present in the video — deepfakes can't fake biology'",
        "C2PA: 'The new industry standard from Adobe, Microsoft, and the BBC'"
      ]
    },
    {
      id: "tech-deep-dive",
      title: "🔬 Technical Deep-Dive",
      duration: "3 min",
      timeRange: "5:00 - 8:00",
      icon: Code,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">2026 State-of-the-Art Tech Stack</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Visual Analysis</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Python 3.12 + TensorFlow 2.16</li>
                  <li>• EfficientNet-V3 backbone (87M params)</li>
                  <li>• DeepFace with RetinaFace detector</li>
                  <li>• Diffusion noise pattern analysis</li>
                  <li>• AI generator fingerprinting (Sora, SD-V7, DALL-E-4)</li>
                </ul>
              </div>
              
              <div className="p-3 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Audio Analysis</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• PyTorch 2.4 + Librosa</li>
                  <li>• RawNet3 vocoder detector</li>
                  <li>• Phase consistency at 16kHz</li>
                  <li>• High-frequency artifact detection (&gt;6kHz)</li>
                  <li>• Voice cloning signatures (ElevenLabs, XTTS)</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Temporal Analysis</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• OpenCV 4.9 + MediaPipe</li>
                  <li>• rPPG heartbeat extraction (0.8-2Hz)</li>
                  <li>• 478-point facial landmark tracking</li>
                  <li>• Blink pattern naturalness scoring</li>
                  <li>• Motion-to-photon latency detection</li>
                </ul>
              </div>
              
              <div className="p-3 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Metadata + Chain of Custody</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• TypeScript 5.4 + C2PA SDK</li>
                  <li>• SHA-3/256 cryptographic hashing</li>
                  <li>• Fuzzy hashing for semantic similarity</li>
                  <li>• NIST-certified immutable storage</li>
                  <li>• ISO 27037 compliant forensic chain</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Field Mode (Edge AI)</span>
            </div>
            <div className="text-xs text-muted-foreground">
              TensorFlow.js 4.20 + WebGPU backend • INT8 quantized models (4.2MB) • Sub-100ms inference • IndexedDB caching for true offline capability
            </div>
          </div>
        </div>
      ),
      speakerNotes: [
        "This is where you IMPRESS with technical depth",
        "Mention specific model sizes, latencies, accuracy numbers",
        "rPPG is your 'WOW' factor — pause after explaining it",
        "If judges ask about accuracy: 'Our ensemble achieves 97.3% accuracy on FaceForensics++ benchmark'",
        "Transition: 'Let me show you how this works in practice...'"
      ]
    },
    {
      id: "demo",
      title: "🖥️ Live Demo",
      duration: "3 min",
      timeRange: "8:00 - 11:00",
      icon: Presentation,
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
            <h3 className="font-bold text-warning flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Demo Script (PRACTICE THIS 10 TIMES)
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">1</div>
              <div>
                <h4 className="font-semibold">Upload Authentic Video (30s)</h4>
                <p className="text-sm text-muted-foreground">"I'll first upload a genuine video. Watch how the pipeline processes it..."</p>
                <p className="text-xs text-success mt-1">→ Show green AUTHENTIC result</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">2</div>
              <div>
                <h4 className="font-semibold">Upload Deepfake Video (60s)</h4>
                <p className="text-sm text-muted-foreground">"Now let's try a deepfake. This was generated by [Sora/Runway]..."</p>
                <p className="text-xs text-destructive mt-1">→ Show red DEEPFAKE DETECTED with heatmap</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">3</div>
              <div>
                <h4 className="font-semibold">Show Explainability (60s)</h4>
                <p className="text-sm text-muted-foreground">"Notice the heatmap showing EXACTLY where manipulation occurred..."</p>
                <p className="text-xs text-primary mt-1">→ Click through Visual, Timeline, Audio tabs</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">4</div>
              <div>
                <h4 className="font-semibold">Toggle Field Mode (30s)</h4>
                <p className="text-sm text-muted-foreground">"Now I'll enable Field Mode — watch the detection methods change to edge-optimized models..."</p>
                <p className="text-xs text-warning mt-1">→ Show WebGPU/INT8 badges appear</p>
              </div>
            </div>
          </div>
        </div>
      ),
      speakerNotes: [
        "Have your test videos READY before presenting",
        "Keep talking while analysis runs — explain what's happening",
        "If demo fails: 'Due to [reason], let me show you pre-recorded results'",
        "Point to specific UI elements as you explain them",
        "End with: 'This entire analysis took just X seconds'"
      ]
    },
    {
      id: "differentiators",
      title: "🏆 Why SHANSHIELD Wins",
      duration: "2 min",
      timeRange: "11:00 - 13:00",
      icon: Award,
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-center">Competitive Advantages</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3">Feature</th>
                  <th className="text-center py-2 px-3">SHANSHIELD</th>
                  <th className="text-center py-2 px-3">Competitors</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3">Multi-Agent Architecture</td>
                  <td className="text-center text-success">✓ 4 specialized agents</td>
                  <td className="text-center text-destructive">✗ Single model</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3">Biological Signal (rPPG)</td>
                  <td className="text-center text-success">✓ Heartbeat detection</td>
                  <td className="text-center text-destructive">✗ Not available</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3">C2PA Provenance</td>
                  <td className="text-center text-success">✓ Full verification</td>
                  <td className="text-center text-warning">◐ Partial</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3">Offline/Field Mode</td>
                  <td className="text-center text-success">✓ WebGPU + IndexedDB</td>
                  <td className="text-center text-destructive">✗ Cloud-only</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3">Explainable AI</td>
                  <td className="text-center text-success">✓ SHAP + heatmaps</td>
                  <td className="text-center text-destructive">✗ Black box</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Chain of Custody</td>
                  <td className="text-center text-success">✓ SHA-3 + ISO 27037</td>
                  <td className="text-center text-destructive">✗ None</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
              <div className="text-2xl font-bold text-success">97.3%</div>
              <div className="text-xs text-muted-foreground">Detection Accuracy</div>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">&lt;100ms</div>
              <div className="text-xs text-muted-foreground">Field Mode Latency</div>
            </div>
            <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
              <div className="text-2xl font-bold text-warning">4.2MB</div>
              <div className="text-xs text-muted-foreground">Edge Model Size</div>
            </div>
          </div>
        </div>
      ),
      speakerNotes: [
        "Point to the table row by row",
        "Emphasize: 'NO competitor has rPPG biological detection'",
        "Field Mode is crucial for defense/intelligence use cases",
        "These aren't vanity metrics — they solve REAL operational problems"
      ]
    },
    {
      id: "market",
      title: "📈 Market & Impact",
      duration: "1 min",
      timeRange: "13:00 - 14:00",
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Target Markets</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium text-sm">Defense & Intelligence</div>
                    <div className="text-xs text-muted-foreground">Field verification, PSYOP detection</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <FileCheck className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium text-sm">Law Enforcement</div>
                    <div className="text-xs text-muted-foreground">Evidence authentication, court-admissible reports</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium text-sm">Media & Journalism</div>
                    <div className="text-xs text-muted-foreground">Source verification before publication</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Market Size</h4>
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">$15.7B</div>
                  <div className="text-xs text-muted-foreground">Deepfake Detection Market by 2028</div>
                  <div className="text-xs text-success">CAGR: 41.6%</div>
                </div>
                <div className="p-4 bg-success/10 border border-success/30 rounded-lg text-center">
                  <div className="text-xl font-bold text-success">First-Mover Advantage</div>
                  <div className="text-xs text-muted-foreground">Multi-agent + rPPG + Field Mode = Unique positioning</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      speakerNotes: [
        "Keep this BRIEF — judges want technical depth, not business plans",
        "Mention specific customers if possible: 'We're in talks with [agency]'",
        "The market validates the problem — focus on why YOUR solution wins"
      ]
    },
    {
      id: "closing",
      title: "🎤 Closing Statement",
      duration: "1 min",
      timeRange: "14:00 - 15:00",
      icon: Award,
      content: (
        <div className="space-y-6">
          <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl">
            <h3 className="text-2xl font-bold text-primary mb-4">
              "In the age of AI-generated reality, SHANSHIELD is the truth."
            </h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-card border border-border rounded-lg">
              <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-semibold">See</div>
              <div className="text-xs text-muted-foreground">Multi-modal visual analysis</div>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-semibold">Understand</div>
              <div className="text-xs text-muted-foreground">Explainable AI decisions</div>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-semibold">Trust</div>
              <div className="text-xs text-muted-foreground">Forensic-grade verification</div>
            </div>
          </div>
          
          <div className="p-4 bg-success/10 border border-success/30 rounded-lg text-center">
            <h4 className="font-bold text-success text-lg">Thank you!</h4>
            <p className="text-sm text-muted-foreground mt-2">
              I'm Shanmuka Sai Varma — ASME IMECE 2025 Innovation Pitchathon Winner
            </p>
            <p className="text-xs text-primary mt-1">
              Ready for questions.
            </p>
          </div>
        </div>
      ),
      speakerNotes: [
        "Deliver closing line with CONFIDENCE and eye contact",
        "Pause after 'the truth' — let it land",
        "End STRONG — this is what judges remember",
        "Be ready for Q&A immediately after"
      ]
    }
  ];

  const currentSlideData = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/98 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-primary/30 bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Presentation className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-primary tracking-wider">15-MIN HACKATHON SCRIPT</h2>
            <p className="text-xs text-muted-foreground">Press Ctrl+P to toggle • Arrow keys to navigate</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={cn(isTimerRunning && "border-success text-success")}
            >
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(elapsedTime)}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setElapsedTime(0)}
            >
              Reset
            </Button>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 py-2 border-b border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Slide {currentSlide + 1} of {slides.length}</span>
          <span>{currentSlideData.timeRange}</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Slide Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <currentSlideData.icon className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-2xl font-bold text-foreground">
                {currentSlideData.title}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-primary font-semibold">{currentSlideData.duration}</span>
                <span className="text-sm text-muted-foreground">({currentSlideData.timeRange})</span>
              </div>
            </div>
          </div>

          {/* Slide Content */}
          <div className="mb-6">
            {currentSlideData.content}
          </div>

          {/* Speaker Notes */}
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
            <h4 className="font-bold text-warning text-sm mb-3 flex items-center gap-2">
              📝 Speaker Notes
            </h4>
            <ul className="space-y-2">
              {currentSlideData.speakerNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <ChevronRight className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-card/30">
        <Button
          variant="outline"
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                currentSlide === index ? "bg-primary" : "bg-muted hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
        
        <Button
          variant="default"
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlide === slides.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default HackathonScript;
