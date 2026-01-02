import { useState, useEffect } from "react";

interface TrustMeterProps {
  score: number;
  verdict: "AUTHENTIC" | "DEEPFAKE DETECTED" | "ANALYZING";
}

const TrustMeter = ({ score, verdict }: TrustMeterProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          if (prev >= score) {
            clearInterval(interval);
            return score;
          }
          return prev + 1;
        });
      }, 20);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getVerdictColor = () => {
    if (verdict === "AUTHENTIC") return "text-success";
    if (verdict === "DEEPFAKE DETECTED") return "text-destructive";
    return "text-threat-amber";
  };

  const getMeterColor = () => {
    if (score >= 70) return "from-success to-success";
    if (score >= 40) return "from-threat-amber to-threat-amber";
    return "from-destructive to-destructive";
  };

  return (
    <div className="relative bg-card border border-border rounded-lg p-6 glow-border">
      <h4 className="font-display text-sm font-semibold text-foreground mb-4 tracking-wider">
        TRUST ASSESSMENT
      </h4>

      {/* Circular meter */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={score >= 70 ? "hsl(142 76% 45%)" : score >= 40 ? "hsl(38 100% 50%)" : "hsl(345 100% 60%)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${animatedScore * 2.83} 283`}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 10px ${score >= 70 ? 'hsl(142 76% 45% / 0.5)' : score >= 40 ? 'hsl(38 100% 50% / 0.5)' : 'hsl(345 100% 60% / 0.5)'})`
            }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-foreground">
            {animatedScore}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Score</span>
        </div>
      </div>

      {/* Verdict */}
      <div className={`text-center font-display text-sm font-bold tracking-widest ${getVerdictColor()}`}>
        {verdict}
      </div>

      {/* Status bar */}
      <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getMeterColor()} transition-all duration-1000 ease-out`}
          style={{ width: `${animatedScore}%` }}
        />
      </div>
    </div>
  );
};

export default TrustMeter;
