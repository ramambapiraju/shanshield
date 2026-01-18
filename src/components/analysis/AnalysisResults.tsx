import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Shield,
  ThumbsUp,
  ThumbsDown,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export type VerdictType = 'authentic' | 'likely_authentic' | 'suspicious' | 'deepfake';

interface AnalysisIndicator {
  name: string;
  detected: boolean;
  confidence: number;
  description: string;
}

interface AnalysisResultsProps {
  verdict: VerdictType;
  confidence: number;
  indicators: AnalysisIndicator[];
  notDetected: string[];
  processingTime: number;
  analysisMode?: 'offline' | 'cloud_ml';
}

const verdictConfig: Record<VerdictType, {
  icon: typeof ShieldCheck;
  label: string;
  sublabel?: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  recommendation: string;
}> = {
  authentic: {
    icon: ShieldCheck,
    label: "AUTHENTIC",
    description: "No strong manipulation signals detected",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/50",
    recommendation: "No strong manipulation signals — proceed with verification"
  },
  likely_authentic: {
    icon: Shield,
    label: "LIKELY AUTHENTIC",
    sublabel: "(Low Risk)",
    description: "High confidence in authenticity",
    color: "text-success/80",
    bgColor: "bg-success/5",
    borderColor: "border-success/30",
    recommendation: "Content appears genuine — proceed with standard verification"
  },
  suspicious: {
    icon: AlertTriangle,
    label: "SUSPICIOUS",
    sublabel: "Requires Review",
    description: "Anomalies detected requiring human review",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/50",
    recommendation: "Potential anomalies detected — escalate to forensic team"
  },
  deepfake: {
    icon: ShieldAlert,
    label: "CONFIRMED DEEPFAKE",
    description: "AI-generated manipulation detected",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/50",
    recommendation: "Deepfake confirmed — do not act on this media"
  }
};

const AnalysisResults = ({ 
  verdict, 
  confidence, 
  indicators, 
  notDetected,
  processingTime,
  analysisMode,
}: AnalysisResultsProps) => {
  const config = verdictConfig[verdict];
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Main Verdict */}
      <div className={cn(
        "relative rounded-xl border-2 p-6",
        config.bgColor,
        config.borderColor
      )}>
        <div className="absolute -inset-1 rounded-xl blur-xl opacity-30" 
          style={{ 
            background: verdict === 'deepfake' 
              ? 'radial-gradient(circle, hsl(var(--destructive)) 0%, transparent 70%)'
              : verdict === 'suspicious'
              ? 'radial-gradient(circle, hsl(var(--warning)) 0%, transparent 70%)'
              : 'radial-gradient(circle, hsl(var(--success)) 0%, transparent 70%)'
          }} 
        />
        
        <div className="relative flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            config.bgColor
          )}>
            <Icon className={cn("w-10 h-10", config.color)} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className={cn("font-display text-2xl font-bold tracking-wide", config.color)}>
                {config.label}
              </h3>
              {config.sublabel && (
                <span className={cn("text-sm", config.color)}>{config.sublabel}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{config.description}</p>

            {analysisMode && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border/50 bg-background/30 text-foreground">
                  {analysisMode === 'cloud_ml' ? 'Cloud ML' : 'Offline'}
                </span>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className={cn("text-3xl font-display font-bold", config.color)}>
              {confidence}%
            </div>
            <span className="text-xs text-muted-foreground">Confidence</span>
          </div>
        </div>

        <div className="relative mt-4">
          <Progress 
            value={confidence} 
            className={cn(
              "h-2",
              verdict === 'deepfake' && "[&>div]:bg-destructive",
              verdict === 'suspicious' && "[&>div]:bg-warning",
              (verdict === 'authentic' || verdict === 'likely_authentic') && "[&>div]:bg-success"
            )} 
          />
        </div>
      </div>

      {/* Cognitive Assistance */}
      <div className="bg-card/70 border border-primary/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="font-display text-xs tracking-widest uppercase text-primary">
            Agentic Cognitive Assistance
          </span>
        </div>
        <p className={cn("text-sm font-medium", config.color)}>
          {config.recommendation}
        </p>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Detected Indicators */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-muted-foreground" />
            <span className="font-display text-xs tracking-widest uppercase text-muted-foreground">
              Key Indicators Detected
            </span>
          </div>
          
          {indicators.map((indicator, index) => (
            <div 
              key={index}
              className={cn(
                "bg-card/50 border rounded-lg p-3",
                indicator.detected 
                  ? (indicator.confidence > 70 ? "border-destructive/30" : "border-warning/30")
                  : "border-success/30"
              )}
            >
              <div className="flex items-start gap-2">
                {indicator.detected ? (
                  indicator.confidence > 70 ? (
                    <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                  )
                ) : (
                  <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{indicator.name}</span>
                    <span className={cn(
                      "text-xs font-mono",
                      indicator.detected ? "text-destructive" : "text-success"
                    )}>
                      {indicator.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{indicator.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Not Detected (False Positive Protection) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ThumbsDown className="w-4 h-4 text-muted-foreground" />
            <span className="font-display text-xs tracking-widest uppercase text-muted-foreground">
              Not Detected (False-Positive Protection)
            </span>
          </div>
          
          <div className="bg-card/30 border border-success/20 rounded-lg p-4">
            <ul className="space-y-2">
              {notDetected.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-success/80">
                  <CheckCircle className="w-4 h-4" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="text-xs text-muted-foreground text-center pt-2">
            Analysis completed in {processingTime.toFixed(2)}s
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
