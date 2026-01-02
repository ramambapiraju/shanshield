import { 
  Shield, 
  Lock, 
  Key, 
  Fingerprint, 
  CheckCircle,
  Cpu,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityIndicatorsProps {
  className?: string;
}

const indicators = [
  {
    icon: Shield,
    label: "Secure Firmware",
    status: "verified",
    detail: "v2.4.1"
  },
  {
    icon: Key,
    label: "RBAC",
    status: "enabled",
    detail: "Active"
  },
  {
    icon: Fingerprint,
    label: "MFA",
    status: "enabled",
    detail: "Enforced"
  },
  {
    icon: Lock,
    label: "Tamper-Proof",
    status: "verified",
    detail: "Sealed"
  },
  {
    icon: Cpu,
    label: "Secure Enclave",
    status: "active",
    detail: "Isolated"
  },
  {
    icon: FileCheck,
    label: "Audit Log",
    status: "recording",
    detail: "Active"
  }
];

const SecurityIndicators = ({ className }: SecurityIndicatorsProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-success" />
        <span className="font-display text-xs tracking-widest uppercase text-muted-foreground">
          System Security Status
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {indicators.map((indicator, index) => {
          const Icon = indicator.icon;
          return (
            <div 
              key={index}
              className="flex items-center gap-2 p-2 bg-success/5 border border-success/20 rounded-lg"
            >
              <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                <Icon className="w-3 h-3 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-foreground truncate">{indicator.label}</span>
                  <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                </div>
                <span className="text-[10px] text-success/70">{indicator.detail}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        <span className="text-xs text-success font-display tracking-wider">
          ENVIRONMENT SECURE
        </span>
      </div>
    </div>
  );
};

export default SecurityIndicators;
