import { Sparkles, Cpu, Zap, Eye } from "lucide-react";

const Gemini3Badge = () => {
  return (
    <div className="relative group">
      {/* Animated glow background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
      
      <div className="relative bg-card/90 border border-blue-500/40 rounded-xl p-4 glow-border overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,138,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-pulse" />
        </div>
        
        <div className="relative flex items-center gap-3 mb-3">
          {/* Google Colors Icon Container */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 via-red-500/10 to-yellow-500/20 flex items-center justify-center border border-blue-500/40 relative">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <div>
            <span className="font-display text-xs font-bold text-blue-400 tracking-widest flex items-center gap-1">
              <span className="text-blue-400">G</span>
              <span className="text-red-400">o</span>
              <span className="text-yellow-400">o</span>
              <span className="text-blue-400">g</span>
              <span className="text-green-400">l</span>
              <span className="text-red-400">e</span>
            </span>
            <span className="block font-display text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 tracking-wider">
              GEMINI 3
            </span>
          </div>
        </div>

        <div className="relative space-y-2">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[11px] text-blue-300 font-medium tracking-wide">
              gemini-3-flash-preview
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: Eye, label: "Vision API", color: "text-purple-400" },
              { icon: Cpu, label: "Multimodal", color: "text-cyan-400" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 text-[10px] text-muted-foreground px-2 py-1 bg-card/50 rounded border border-border/30">
                <item.icon className={`w-3 h-3 ${item.color}`} />
                <span className="uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-1">
            <span className="text-[9px] text-muted-foreground/70 uppercase tracking-widest">
              Hackathon 2025 Entry
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gemini3Badge;
