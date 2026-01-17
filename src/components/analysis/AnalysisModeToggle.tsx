import { 
  Cpu, 
  Cloud, 
  Shield,
  Wifi,
  WifiOff,
  Zap,
  Brain,
  Lock,
  Globe,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisModeType } from "@/hooks/useAnalysis";

interface AnalysisModeToggleProps {
  analysisMode: AnalysisModeType;
  onModeChange: (mode: AnalysisModeType) => void;
  isConnected?: boolean;
}

const AnalysisModeToggle = ({ 
  analysisMode, 
  onModeChange,
  isConnected = true 
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

      {/* 3-Mode Selector */}
      <div className="grid grid-cols-3 gap-2 mb-4">
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
        </button>
        <button
          onClick={() => onModeChange('local_ml')}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
            analysisMode === 'local_ml'
              ? "bg-warning/20 border-warning text-warning"
              : "bg-background/30 border-border/50 text-muted-foreground hover:border-warning/50"
          )}
        >
          <Brain className="w-5 h-5" />
          <span className="text-xs font-medium">Local ML</span>
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
        </button>
      </div>

      {/* Mode Details */}
      {analysisMode === 'cloud_ml' && (
        <div className="space-y-3">
          <div className="bg-background/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Processing</span>
              <span className="text-xs text-primary">Cloud + Local Hybrid</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ML Model</span>
              <span className="text-xs text-primary">Gemini 2.5 Flash</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Connection</span>
              {isConnected ? (
                <span className="text-xs text-success flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Disconnected
                </span>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg">
            <Globe className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-primary/90">
              <strong>Cloud ML:</strong> Highest accuracy using cloud neural networks.
            </p>
          </div>
        </div>
      )}

      {analysisMode === 'local_ml' && (
        <div className="space-y-3">
          <div className="bg-background/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Processing</span>
              <span className="text-xs text-warning">Browser ML (WebGPU)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ML Model</span>
              <span className="text-xs text-warning">MobileNetV4 (Local)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Privacy</span>
              <span className="text-xs text-success flex items-center gap-1">
                <Lock className="w-3 h-3" /> 100% Local
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 bg-warning/10 border border-warning/30 rounded-lg">
            <Brain className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-xs text-warning/90">
              <strong>Local ML:</strong> Real ML in your browser. No API needed - hackathon ready!
            </p>
          </div>
        </div>
      )}

      {analysisMode === 'offline' && (
        <div className="space-y-3">
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
              <strong>Offline:</strong> Classical signal processing. Air-gap ready.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisModeToggle;
