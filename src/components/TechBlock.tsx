import { LucideIcon } from "lucide-react";

interface TechBlockProps {
  icon: LucideIcon;
  title: string;
  items: string[];
  variant?: "default" | "security";
  delay?: number;
}

const TechBlock = ({ icon: Icon, title, items, variant = "default", delay = 0 }: TechBlockProps) => {
  const isSecure = variant === "security";
  
  return (
    <div 
      className="relative opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className={`bg-card/80 border rounded-lg p-4 ${isSecure ? 'border-success/30' : 'border-border'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSecure ? 'bg-success/10' : 'bg-primary/10'}`}>
            <Icon className={`w-5 h-5 ${isSecure ? 'text-success' : 'text-primary'}`} />
          </div>
          <h4 className="font-display text-xs font-semibold text-foreground tracking-wider uppercase">
            {title}
          </h4>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span 
              key={index}
              className={`text-[10px] px-2 py-1 rounded border ${
                isSecure 
                  ? 'bg-success/5 border-success/20 text-success' 
                  : 'bg-primary/5 border-primary/20 text-primary'
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechBlock;
