import { 
  Cpu, 
  Shield,
  WifiOff,
  Cloud,
  Lock,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisModeType } from "@/hooks/useAnalysis";

interface AnalysisModeToggleProps {
  analysisMode: AnalysisModeType;
  onModeChange: (mode: AnalysisModeType) => void;
}

const AnalysisModeToggle = ({ 
  analysisMode, 
  onModeChange
}: AnalysisModeToggleProps) => {
  return (
    <div className="rounded-lg border p-4 bg-card/50 border-border/50 glow-border">
      {/* Mode Toggle Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-display text-sm font-bold text-foreground tracking-widest uppercase">
            Analysis Mode
          </span>
        </div>
      </div>

      {/* 2-Mode Selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => onModeChange('offline')}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
            analysisMode === 'offline'
              ? "bg-accent/20 border-accent text-accent"
              : "bg-background/30 border-border/50 text-muted-foreground hover:border-accent/50"
          )}
        >
          <WifiOff className="w-5 h-5" />
          <span className="text-xs font-medium">Offline</span>
          <span className="text-[10px] opacity-70">Signal Processing</span>
        </button>
        <button
          onClick={() => onModeChange('cloud_ml')}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
            analysisMode === 'cloud_ml'
              ? "bg-primary/20 border-primary text-primary"
              : "bg-background/30 border-border/50 text-muted-foreground hover:border-primary/50"
          )}
        >
          <Cloud className="w-5 h-5" />
          <span className="text-xs font-medium">Cloud ML</span>
          <span className="text-[10px] opacity-70">ShanShield AI</span>
        </button>
      </div>

      {/* Mode Details */}
      {analysisMode === 'cloud_ml' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/30">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">Pre-trained ML</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/30">
              <Cloud className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">Cloud Powered</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">GAN Detection</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/30">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">No API Keys</span>
            </div>
          </div>
          <div className="bg-background/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ML Model</span>
              <span className="text-xs text-primary">ShanShield-ML-v3.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Detection</span>
              <span className="text-xs text-primary">GAN, Diffusion, Face Swap</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Backend</span>
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Edge Functions
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg">
            <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-primary/90">
              <strong>ShanShield Exclusive:</strong> Pre-trained ML model (v3.0) running on Supabase Edge Functions.
              No external APIs required.
            </p>
          </div>
        </div>
      )}

      {analysisMode === 'offline' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg border border-accent/30">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">Signal Analysis</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg border border-accent/30">
              <Lock className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">No Data Upload</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg border border-accent/30">
              <WifiOff className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">Works Offline</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg border border-accent/30">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">Air-Gap Ready</span>
            </div>
          </div>
          <div className="bg-background/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Processing</span>
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Browser-Native
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">External APIs</span>
              <span className="text-xs text-success">None Required</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Privacy</span>
              <span className="text-xs text-success flex items-center gap-1">
                <Lock className="w-3 h-3" /> Maximum Privacy
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 bg-accent/10 border border-accent/30 rounded-lg">
            <WifiOff className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-xs text-accent/90">
              <strong>Offline:</strong> Classical signal processing with quantum entropy analysis.
              No network - fastest option.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisModeToggle;
