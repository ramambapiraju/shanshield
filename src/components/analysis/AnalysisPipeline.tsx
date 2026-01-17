import { useEffect, useState, useRef } from "react";
import { 
  Loader2, 
  CheckCircle, 
  Eye,
  AudioLines,
  Brain,
  Fingerprint,
  ShieldCheck,
  FileSearch,
  Atom
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PipelineStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AnalysisPipelineProps {
  isActive: boolean;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  onComplete: () => void;
  onProgress: (step: string, progress: number) => void;
}

// Real analysis steps that match actual code execution
const getActualPipelineSteps = (type: 'image' | 'video' | 'audio' | 'document'): PipelineStep[] => {
  switch (type) {
    case 'image':
      return [
        { id: 'visual', label: 'Visual Agent', description: 'Analyzing noise, edges, textures, colors...', icon: Eye },
        { id: 'metadata', label: 'AI Signature Agent', description: 'Scanning filename patterns & watermarks...', icon: FileSearch },
        { id: 'quantum', label: 'Quantum Entropy Agent', description: 'Computing von Neumann entropy...', icon: Atom },
        { id: 'arbiter', label: 'Arbiter Agent', description: 'Fusing all signals with Dempster-Shafer...', icon: Brain }
      ];
    case 'video':
      return [
        { id: 'visual', label: 'Visual Agent', description: 'Extracting frames for analysis...', icon: Eye },
        { id: 'temporal', label: 'Temporal Agent', description: 'Checking frame-to-frame consistency...', icon: Fingerprint },
        { id: 'metadata', label: 'AI Signature Agent', description: 'Scanning filename patterns & watermarks...', icon: FileSearch },
        { id: 'quantum', label: 'Quantum Entropy Agent', description: 'Computing entropy across frames...', icon: Atom },
        { id: 'arbiter', label: 'Arbiter Agent', description: 'Fusing all signals...', icon: Brain }
      ];
    case 'audio':
      return [
        { id: 'audio', label: 'Audio Agent', description: 'FFT spectral analysis...', icon: AudioLines },
        { id: 'metadata', label: 'AI Signature Agent', description: 'Scanning for AI tool signatures...', icon: FileSearch },
        { id: 'quantum', label: 'Quantum Entropy Agent', description: 'Frequency entropy analysis...', icon: Atom },
        { id: 'arbiter', label: 'Arbiter Agent', description: 'Fusing all signals...', icon: Brain }
      ];
    case 'document':
      return [
        { id: 'visual', label: 'Visual Agent', description: 'Analyzing embedded images...', icon: Eye },
        { id: 'metadata', label: 'Metadata Agent', description: 'Checking document structure...', icon: FileSearch },
        { id: 'arbiter', label: 'Arbiter Agent', description: 'Final verification...', icon: Brain }
      ];
    default:
      return [
        { id: 'analysis', label: 'Analysis', description: 'Processing...', icon: Brain },
        { id: 'verification', label: 'Verification', description: 'Verifying...', icon: ShieldCheck }
      ];
  }
};

const AnalysisPipeline = ({ isActive, mediaType, onComplete, onProgress }: AnalysisPipelineProps) => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [allComplete, setAllComplete] = useState(false);
  const completedRef = useRef(false);
  
  const pipelineSteps = getActualPipelineSteps(mediaType);

  // When analysis becomes active, mark all steps as in-progress
  // When isActive becomes false (analysis done), mark all complete
  useEffect(() => {
    if (isActive) {
      setCompletedSteps([]);
      setAllComplete(false);
      completedRef.current = false;
      onProgress('analyzing', 50);
    }
  }, [isActive, onProgress]);

  // When real analysis completes (isActive goes false after being true)
  useEffect(() => {
    if (!isActive && !completedRef.current && pipelineSteps.length > 0) {
      // Mark all steps complete
      setCompletedSteps(pipelineSteps.map(s => s.id));
      setAllComplete(true);
      completedRef.current = true;
      onComplete();
    }
  }, [isActive, pipelineSteps, onComplete]);

  if (!isActive && completedSteps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Loader2 className={cn(
          "w-5 h-5 text-primary",
          isActive && "animate-spin"
        )} />
        <h3 className="font-display text-sm font-bold text-foreground tracking-widest uppercase">
          Analysis Pipeline
        </h3>
        {isActive && (
          <span className="text-xs text-primary animate-pulse">PROCESSING</span>
        )}
        {allComplete && (
          <span className="text-xs text-success">COMPLETE</span>
        )}
      </div>

      <div className="space-y-3">
        {pipelineSteps.map((step) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = isActive && !isCompleted;

          return (
            <div
              key={step.id}
              className={cn(
                "relative bg-card/50 border rounded-lg p-3 transition-all duration-300",
                isCompleted && "border-success/50 bg-success/5",
                isCurrent && "border-primary/50 bg-primary/5 glow-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isCompleted && "bg-success/20",
                  isCurrent && "bg-primary/20",
                  !isCompleted && !isCurrent && "bg-muted/20"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "font-display text-sm tracking-wide",
                      isCompleted && "text-success",
                      isCurrent && "text-primary",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                    {isCompleted && (
                      <span className="text-xs text-success font-mono">
                        COMPLETE
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-xs text-primary font-mono animate-pulse">
                        RUNNING
                      </span>
                    )}
                  </div>
                  
                  {isCurrent && (
                    <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {isCurrent && (
                <div className="mt-3">
                  <Progress value={50} className="h-1 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisPipeline;
