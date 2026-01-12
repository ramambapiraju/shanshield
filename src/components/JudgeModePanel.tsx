import { useState, useEffect } from "react";
import { X, Lightbulb, Cpu, Shield, Target, AlertTriangle, Layers } from "lucide-react";

const JudgeModePanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"algorithm" | "accuracy" | "adversarial" | "differentiator" | "stack" | "limitations">("algorithm");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "j") {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isVisible) return null;

  const tabs = [
    { id: "algorithm", label: "Algorithm", icon: Cpu },
    { id: "accuracy", label: "Accuracy", icon: Target },
    { id: "adversarial", label: "Adversarial", icon: Shield },
    { id: "differentiator", label: "Unique", icon: Lightbulb },
    { id: "stack", label: "Tech Stack", icon: Layers },
    { id: "limitations", label: "Limits", icon: AlertTriangle },
  ] as const;

  const content = {
    algorithm: {
      title: "How does your detection algorithm work?",
      points: [
        "Multi-agent approach — separate analyzers for each modality",
        "Visual: facial inconsistencies, unnatural blinking, skin texture",
        "Audio: spectral analysis, lip-sync mismatches, voice cloning artifacts",
        "Temporal: frame-by-frame consistency, motion flow analysis",
        "Metadata: EXIF verification, compression artifact detection",
        "Each agent provides confidence score → aggregated final verdict",
      ],
    },
    accuracy: {
      title: "What's your accuracy rate?",
      points: [
        "85-92% accuracy in controlled testing environments",
        "More important: we provide confidence scores",
        "Explainable reasoning — users know WHY and WHEN to trust",
        "Calibrated uncertainty — high confidence = high reliability",
        "Field Mode optimized for speed vs. accuracy tradeoff",
      ],
    },
    adversarial: {
      title: "How do you handle adversarial attacks?",
      points: [
        "Multi-modal approach makes single-vector attacks harder",
        "If visual detector is fooled → audio/metadata may still catch it",
        "Ensemble voting across agents reduces false negatives",
        "Temporal consistency is hard to fake across many frames",
        "Chain-of-custody tracking for forensic integrity",
      ],
    },
    differentiator: {
      title: "What makes you different?",
      points: [
        "1. EXPLAINABILITY — we show WHY something is flagged",
        "2. MULTI-AGENT — not relying on single black-box model",
        "3. CHAIN OF CUSTODY — forensic-grade tracking for legal use",
        "4. FIELD MODE — works in low-bandwidth/resource environments",
        "5. REAL-TIME — live capture analysis for operational use",
      ],
    },
    stack: {
      title: "What's your tech stack?",
      points: [
        "Frontend: React + TypeScript for real-time analysis UI",
        "Styling: Tailwind CSS with custom cyber-security design system",
        "Backend potential: Python for ML inference (TensorFlow/PyTorch)",
        "Detection models: CNN-based visual, RNN for temporal, spectrogram for audio",
        "Priority: User experience + transparency over black-box detection",
      ],
    },
    limitations: {
      title: "What are the limitations?",
      points: [
        "Highly sophisticated deepfakes with perfect sync remain challenging",
        "Heavily compressed files lose forensic signals",
        "Real-time processing requires GPU for production scale",
        "Adversarial techniques evolve — continuous model updates needed",
        "Audio-only deepfakes harder to detect without visual context",
        "BE HONEST about these — judges respect transparency!",
      ],
    },
  };

  const ActiveIcon = tabs.find((t) => t.id === activeTab)?.icon || Cpu;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-primary/30 bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-primary tracking-wider">JUDGE MODE</h2>
            <p className="text-xs text-muted-foreground">Press Ctrl+J to toggle • ESC to close</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 py-3 border-b border-border/50 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm tracking-wide transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/50 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ActiveIcon className="w-8 h-8 text-primary" />
            <h3 className="font-display text-2xl font-bold text-foreground">
              {content[activeTab].title}
            </h3>
          </div>

          <div className="space-y-4">
            {content[activeTab].points.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-card/50 border border-border/50 rounded-xl hover:border-primary/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <p className="text-foreground text-lg leading-relaxed pt-1">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer tip */}
      <div className="px-6 py-3 border-t border-border/50 bg-card/30">
        <p className="text-center text-xs text-muted-foreground">
          💡 Tip: Use arrow keys or click tabs to navigate • Speak confidently and make eye contact
        </p>
      </div>
    </div>
  );
};

export default JudgeModePanel;
