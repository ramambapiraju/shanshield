import { useEffect, useState } from "react";
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Film,
  AudioLines,
  Scan,
  Fingerprint,
  ShieldCheck,
  Clock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PipelineStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number; // in ms
}

interface AnalysisPipelineProps {
  isActive: boolean;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  onComplete: () => void;
  onProgress: (step: string, progress: number) => void;
}

const basePipelineSteps: PipelineStep[] = [
  {
    id: 'ingest',
    label: 'Media Ingestion',
    description: 'Validating file integrity and format...',
    icon: Clock,
    duration: 800
  },
  {
    id: 'frames',
    label: 'Frame Extraction',
    description: 'Extracting key frames for analysis...',
    icon: Film,
    duration: 1200
  },
  {
    id: 'audio',
    label: 'Audio Processing',
    description: 'Generating spectrogram and waveform...',
    icon: AudioLines,
    duration: 1000
  },
  {
    id: 'landmarks',
    label: 'Facial Landmark Detection',
    description: 'Mapping 468 facial landmarks and mesh overlay...',
    icon: Scan,
    duration: 1500
  },
  {
    id: 'temporal',
    label: 'Temporal Consistency',
    description: 'Analyzing frame-to-frame continuity...',
    icon: Fingerprint,
    duration: 1300
  },
  {
    id: 'artifacts',
    label: 'Compression Artifacts',
    description: 'Inspecting compression signatures...',
    icon: AlertCircle,
    duration: 900
  },
  {
    id: 'verification',
    label: 'Authenticity Verification',
    description: 'Running final verification protocols...',
    icon: ShieldCheck,
    duration: 1100
  }
];

const getPipelineForMedia = (type: 'image' | 'video' | 'audio' | 'document'): PipelineStep[] => {
  switch (type) {
    case 'image':
      return basePipelineSteps.filter(s => 
        ['ingest', 'landmarks', 'artifacts', 'verification'].includes(s.id)
      );
    case 'video':
      return basePipelineSteps;
    case 'audio':
      return basePipelineSteps.filter(s => 
        ['ingest', 'audio', 'verification'].includes(s.id)
      );
    case 'document':
      return basePipelineSteps.filter(s => 
        ['ingest', 'frames', 'landmarks', 'verification'].includes(s.id)
      );
    default:
      return basePipelineSteps;
  }
};

const AnalysisPipeline = ({ isActive, mediaType, onComplete, onProgress }: AnalysisPipelineProps) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepProgress, setStepProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  const pipelineSteps = getPipelineForMedia(mediaType);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(-1);
      setStepProgress(0);
      setCompletedSteps([]);
      return;
    }

    let stepIndex = 0;
    
    const runStep = () => {
      if (stepIndex >= pipelineSteps.length) {
        onComplete();
        return;
      }

      setCurrentStep(stepIndex);
      const step = pipelineSteps[stepIndex];
      const progressInterval = step.duration / 100;
      let progress = 0;

      const progressTimer = setInterval(() => {
        progress += 1;
        setStepProgress(progress);
        onProgress(step.id, progress);

        if (progress >= 100) {
          clearInterval(progressTimer);
          setCompletedSteps(prev => [...prev, step.id]);
          stepIndex++;
          setTimeout(runStep, 200);
        }
      }, progressInterval);
    };

    const timeout = setTimeout(runStep, 500);
    return () => clearTimeout(timeout);
  }, [isActive, pipelineSteps, onComplete, onProgress]);

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
      </div>

      <div className="space-y-3">
        {pipelineSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === index;
          const isPending = !isCompleted && !isCurrent;

          return (
            <div
              key={step.id}
              className={cn(
                "relative bg-card/50 border rounded-lg p-3 transition-all duration-300",
                isCompleted && "border-success/50 bg-success/5",
                isCurrent && "border-primary/50 bg-primary/5 glow-border",
                isPending && "border-border/30 opacity-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isCompleted && "bg-success/20",
                  isCurrent && "bg-primary/20",
                  isPending && "bg-muted/20"
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
                      isPending && "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-xs text-primary font-mono">
                        {stepProgress}%
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-xs text-success font-mono">
                        COMPLETE
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
                  <Progress value={stepProgress} className="h-1" />
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
