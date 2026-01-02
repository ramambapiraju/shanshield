import { LucideIcon } from "lucide-react";

interface ProtectedEntityProps {
  icon: LucideIcon;
  label: string;
  delay?: number;
}

const ProtectedEntity = ({ icon: Icon, label, delay = 0 }: ProtectedEntityProps) => {
  return (
    <div 
      className="flex flex-col items-center gap-2 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="relative">
        <div className="absolute -inset-2 bg-success/20 rounded-full blur-lg opacity-50" />
        <div className="relative w-14 h-14 rounded-full bg-card border border-success/30 flex items-center justify-center">
          <Icon className="w-6 h-6 text-success" />
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider text-center">
        {label}
      </span>
    </div>
  );
};

export default ProtectedEntity;
