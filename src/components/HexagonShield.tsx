import { Shield } from "lucide-react";

const HexagonShield = () => {
  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* Outer rotating ring */}
      <div className="absolute inset-0 animate-rotate-slow">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(185 100% 50%)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="hsl(210 100% 55%)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(185 100% 50%)" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="1"
            strokeDasharray="20 10"
          />
        </svg>
      </div>

      {/* Pulse rings */}
      <div className="absolute inset-4 rounded-full border border-primary/30 animate-pulse-ring" />
      <div className="absolute inset-8 rounded-full border border-primary/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
      <div className="absolute inset-12 rounded-full border border-primary/10 animate-pulse-ring" style={{ animationDelay: '1s' }} />

      {/* Hexagon container */}
      <div className="relative hexagon w-56 h-56 bg-gradient-to-br from-secondary via-card to-secondary flex items-center justify-center glow-border">
        {/* Inner hexagon */}
        <div className="hexagon w-48 h-48 bg-gradient-to-br from-card to-background flex items-center justify-center border border-primary/20">
          {/* Core content */}
          <div className="flex flex-col items-center justify-center text-center p-4">
            <Shield className="w-16 h-16 text-primary mb-2 drop-shadow-[0_0_15px_hsl(185_100%_50%/0.5)]" />
            <span className="font-display text-xl font-bold text-gradient-cyber tracking-wider">
              SHANSHIELD
            </span>
            <span className="font-body text-[10px] text-muted-foreground mt-1 tracking-widest uppercase">
              Agentic AI Orchestrator
            </span>
          </div>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-primary to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-t from-primary to-transparent" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-8 bg-gradient-to-r from-primary to-transparent" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1 w-8 bg-gradient-to-l from-primary to-transparent" />
    </div>
  );
};

export default HexagonShield;
