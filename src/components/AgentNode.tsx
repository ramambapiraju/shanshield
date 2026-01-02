import { LucideIcon } from "lucide-react";

interface AgentNodeProps {
  icon: LucideIcon;
  title: string;
  description: string;
  position: "left" | "right";
  delay?: number;
}

const AgentNode = ({ icon: Icon, title, description, position, delay = 0 }: AgentNodeProps) => {
  return (
    <div 
      className={`relative flex items-center gap-4 ${position === 'right' ? 'flex-row-reverse' : ''} opacity-0 animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Connection line */}
      <div className={`absolute top-1/2 ${position === 'left' ? 'left-full' : 'right-full'} w-12 h-px`}>
        <div className="w-full h-full bg-gradient-to-r from-transparent via-primary/50 to-primary animate-shimmer bg-[length:200%_100%]" />
      </div>

      {/* Agent card */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative bg-card border border-border/50 rounded-lg p-4 w-64 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-display text-sm font-semibold text-foreground tracking-wide">
              {title}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Node indicator */}
      <div className="relative">
        <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_hsl(185_100%_50%/0.5)]" />
        <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-pulse-ring" />
      </div>
    </div>
  );
};

export default AgentNode;
