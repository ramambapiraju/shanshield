import { GraduationCap, Shield, Globe, FileCheck } from "lucide-react";

const ErakshaBadge = () => {
  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-xl blur-lg opacity-50" />
      
      <div className="relative bg-card/90 border border-primary/30 rounded-xl p-4 glow-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-display text-xs font-bold text-primary tracking-widest">
              IIT DELHI
            </span>
            <span className="block font-display text-sm font-semibold text-foreground tracking-wider">
              ERAKSHA HACKATHON
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Shield, label: "Agentic AI" },
            { icon: Globe, label: "Cyber Security" },
            { icon: FileCheck, label: "Deepfake Defense" },
            { icon: Shield, label: "Digital Integrity" },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <item.icon className="w-3 h-3 text-primary" />
              <span className="uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ErakshaBadge;
