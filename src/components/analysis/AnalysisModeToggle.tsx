import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AnalysisModeToggleProps {
  isOnlineMode: boolean;
  onModeChange: (online: boolean) => void;
  isConnected?: boolean;
}

const AnalysisModeToggle = ({ 
  isOnlineMode, 
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
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-medium transition-colors",
            !isOnlineMode ? "text-accent" : "text-muted-foreground"
          )}>
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
          </div>
          <Switch
            checked={isOnlineMode}
            onCheckedChange={onModeChange}
            className="data-[state=checked]:bg-primary"
          />
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-medium transition-colors",
            isOnlineMode ? "text-primary" : "text-muted-foreground"
          )}>
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud ML</span>
          </div>
        </div>
      </div>

      {/* Mode Details */}
      {isOnlineMode ? (
        <div className="space-y-3">
          {/* Cloud ML Mode Active */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/30">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">Neural Network AI</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/30">
              <Cloud className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">Cloud Processing</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/30">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">Advanced Detection</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/30">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">Higher Accuracy</span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-background/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Processing Mode</span>
              <div className="flex items-center gap-1">
                <Cloud className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary">Cloud + Local Hybrid</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ML Model</span>
              <div className="flex items-center gap-1">
                <Brain className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary">Gemini 2.5 Flash</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Connection</span>
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-success" />
                    <span className="text-xs text-success">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-destructive" />
                    <span className="text-xs text-destructive">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg">
            <Globe className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-primary/90">
              <strong>Cloud ML Mode:</strong> Combines local analysis with cloud-based neural networks 
              for highest accuracy. Media is processed securely.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Offline Mode Active */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg border border-accent/30">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">On-Device Inference</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg border border-accent/30">
              <Lock className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">No Data Uploaded</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg border border-accent/30">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">Instant Analysis</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg border border-accent/30">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">Air-Gap Ready</span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-background/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Processing Mode</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-success" />
                <span className="text-xs text-success">Browser-Native</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">External APIs</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-success" />
                <span className="text-xs text-success">None Required</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Privacy Status</span>
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-success" />
                <span className="text-xs text-success">Maximum Privacy</span>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-2 p-2 bg-accent/10 border border-accent/30 rounded-lg">
            <WifiOff className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-xs text-accent/90">
              <strong>Offline Mode:</strong> All analysis runs 100% in your browser using 
              classical signal processing. No internet required after page load.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisModeToggle;
