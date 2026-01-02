import { AlertTriangle } from "lucide-react";

interface ThreatCardProps {
  title: string;
  description: string;
  delay?: number;
}

const ThreatCard = ({ title, description, delay = 0 }: ThreatCardProps) => {
  return (
    <div 
      className="relative group opacity-0 animate-fade-in-left"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Glitch effect overlay */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-destructive/20 to-threat-amber/20 rounded-lg blur opacity-50 group-hover:animate-glitch" />
      
      <div className="relative bg-card/80 border border-destructive/30 rounded-lg p-4 hover:border-destructive/50 transition-all glow-border-red">
        {/* Red scan line */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div className="absolute inset-x-0 h-px bg-destructive/50 animate-scan" />
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-destructive tracking-wide mb-1">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatCard;
