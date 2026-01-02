import { useState } from "react";
import { 
  WifiOff, 
  Wifi, 
  Cpu, 
  Zap, 
  Battery, 
  Shield,
  CheckCircle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FieldModeToggleProps {
  onModeChange: (isFieldMode: boolean) => void;
}

const FieldModeToggle = ({ onModeChange }: FieldModeToggleProps) => {
  const [isFieldMode, setIsFieldMode] = useState(false);

  const handleToggle = (checked: boolean) => {
    setIsFieldMode(checked);
    onModeChange(checked);
  };

  return (
    <div className={cn(
      "rounded-lg border p-4 transition-all duration-300",
      isFieldMode 
        ? "bg-accent/10 border-accent/50 glow-border" 
        : "bg-card/50 border-border/30"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isFieldMode ? (
            <WifiOff className="w-5 h-5 text-accent" />
          ) : (
            <Wifi className="w-5 h-5 text-primary" />
          )}
          <span className="font-display text-sm font-bold text-foreground tracking-widest uppercase">
            Field / Offline Mode
          </span>
        </div>
        <Switch 
          checked={isFieldMode} 
          onCheckedChange={handleToggle}
          className={cn(
            isFieldMode && "data-[state=checked]:bg-accent"
          )}
        />
      </div>

      {isFieldMode ? (
        <div className="space-y-3">
          {/* Field Mode Active Indicators */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">On-Device Inference</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
              <WifiOff className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">No Cloud Required</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">Fast Analysis</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
              <Battery className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent">Low-Power Mode</span>
            </div>
          </div>

          {/* Status indicators */}
          <div className="bg-background/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Edge Model</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-success" />
                <span className="text-xs text-success">Loaded</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Secure Enclave</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-success" />
                <span className="text-xs text-success">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Network Status</span>
              <div className="flex items-center gap-1">
                <WifiOff className="w-3 h-3 text-warning" />
                <span className="text-xs text-warning">Disconnected</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-accent/80 text-center italic">
            Mission-ready operation — air-gapped security enabled
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
              <Wifi className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Cloud Connected</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Full Model Access</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Standard mode — full cloud inference capabilities
          </p>
        </div>
      )}
    </div>
  );
};

export default FieldModeToggle;
