import { 
  Cpu, 
  Zap, 
  Shield,
  CheckCircle,
  Globe,
  Lock
} from "lucide-react";

const OfflineReadyIndicator = () => {
  return (
    <div className="rounded-lg border p-4 bg-accent/10 border-accent/50 glow-border">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-accent" />
        <span className="font-display text-sm font-bold text-foreground tracking-widest uppercase">
          100% Client-Side Processing
        </span>
      </div>

      <div className="space-y-3">
        {/* Active Indicators */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
            <Cpu className="w-4 h-4 text-accent" />
            <span className="text-xs text-accent">On-Device Inference</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
            <Lock className="w-4 h-4 text-accent" />
            <span className="text-xs text-accent">No Data Uploaded</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs text-accent">Instant Analysis</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-xs text-accent">Air-Gap Ready</span>
          </div>
        </div>

        {/* Status indicators */}
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
              <span className="text-xs text-success">GDPR Compliant</span>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="flex items-start gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg">
          <Globe className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-primary/90">
            <strong>Note:</strong> Internet required only to load this web app initially. 
            Once loaded, all analysis runs 100% offline in your browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflineReadyIndicator;
