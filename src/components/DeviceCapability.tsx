import { LucideIcon } from "lucide-react";

interface DeviceCapabilityProps {
  icon: LucideIcon;
  title: string;
  features: string[];
  delay?: number;
}

const DeviceCapability = ({ icon: Icon, title, features, delay = 0 }: DeviceCapabilityProps) => {
  return (
    <div 
      className="relative group opacity-0 animate-fade-in-right"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity" />
      
      <div className="relative bg-card/90 border border-accent/30 rounded-lg p-5 hover:border-accent/50 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
            <Icon className="w-6 h-6 text-accent" />
          </div>
          <h4 className="font-display text-sm font-semibold text-foreground tracking-wide">
            {title}
          </h4>
        </div>
        
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DeviceCapability;
