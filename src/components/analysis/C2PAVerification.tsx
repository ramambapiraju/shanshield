import { useState, useEffect } from "react";
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileCheck,
  User,
  Calendar,
  Wrench,
  Bot,
  Link,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type C2PAResult } from "@/lib/c2paAnalyzer";

interface C2PAVerificationProps {
  result: C2PAResult | null;
  isLoading?: boolean;
  className?: string;
}

const C2PAVerification = ({ result, isLoading, className }: C2PAVerificationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className={cn("rounded-lg border p-4 bg-card/50 border-border/50", className)}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <div>
            <span className="font-display text-sm font-bold text-foreground tracking-wider">
              C2PA VERIFICATION
            </span>
            <p className="text-xs text-muted-foreground">Checking content provenance...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const getStatusColor = () => {
    if (!result.hasManifest) return "border-muted/50 bg-muted/10";
    if (result.isValid) return "border-success/50 bg-success/10";
    if (result.validationScore >= 50) return "border-warning/50 bg-warning/10";
    return "border-destructive/50 bg-destructive/10";
  };

  const getStatusIcon = () => {
    if (!result.hasManifest) return <XCircle className="w-5 h-5 text-muted-foreground" />;
    if (result.isValid) return <CheckCircle2 className="w-5 h-5 text-success" />;
    if (result.validationScore >= 50) return <AlertTriangle className="w-5 h-5 text-warning" />;
    return <XCircle className="w-5 h-5 text-destructive" />;
  };

  const getStatusText = () => {
    if (!result.hasManifest) return "No C2PA Manifest";
    if (result.isValid) return "Verified Provenance";
    if (result.validationScore >= 50) return "Partial Verification";
    return "Verification Failed";
  };

  return (
    <div className={cn("rounded-lg border p-4", getStatusColor(), className)}>
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => result.hasManifest && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background/50">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-foreground tracking-wider uppercase">
                C2PA Provenance
              </span>
              {getStatusIcon()}
            </div>
            <p className="text-xs text-muted-foreground">
              {getStatusText()}
              {result.hasManifest && ` • Score: ${result.validationScore}%`}
            </p>
          </div>
        </div>
        
        {result.hasManifest && (
          <button className="p-1 hover:bg-background/50 rounded transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      {/* No Manifest State */}
      {!result.hasManifest && (
        <div className="mt-3 p-3 bg-background/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            This file does not contain C2PA content credentials. 
            Content provenance cannot be verified.
          </p>
          {result.error && (
            <p className="text-xs text-destructive mt-1">{result.error}</p>
          )}
        </div>
      )}

      {/* Expanded Details */}
      {result.hasManifest && isExpanded && (
        <div className="mt-4 space-y-4">
          {/* AI Generated Warning */}
          {result.provenance.aiGenerated && (
            <div className="flex items-center gap-2 p-3 bg-warning/20 border border-warning/50 rounded-lg">
              <Bot className="w-5 h-5 text-warning flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-warning">AI-Generated Content</p>
                <p className="text-xs text-warning/80">
                  This content is declared as AI-generated
                  {result.provenance.aiToolName && ` using ${result.provenance.aiToolName}`}
                </p>
              </div>
            </div>
          )}

          {/* Signature Info */}
          {result.signatureInfo && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3 h-3" /> Digital Signature
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.signatureInfo.issuer && (
                  <div className="flex items-center gap-2 p-2 bg-background/30 rounded">
                    <Shield className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Signed By</p>
                      <p className="text-xs font-medium text-foreground truncate max-w-[200px]">
                        {result.signatureInfo.issuer}
                      </p>
                    </div>
                  </div>
                )}
                {result.signatureInfo.time && (
                  <div className="flex items-center gap-2 p-2 bg-background/30 rounded">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Signed At</p>
                      <p className="text-xs font-medium text-foreground">
                        {new Date(result.signatureInfo.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Provenance Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Link className="w-3 h-3" /> Content History
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.provenance.creator && (
                <div className="flex items-center gap-2 p-2 bg-background/30 rounded">
                  <User className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Creator</p>
                    <p className="text-xs font-medium text-foreground">
                      {result.provenance.creator}
                    </p>
                  </div>
                </div>
              )}
              {result.provenance.creationTool && (
                <div className="flex items-center gap-2 p-2 bg-background/30 rounded">
                  <Wrench className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Creation Tool</p>
                    <p className="text-xs font-medium text-foreground">
                      {result.provenance.creationTool}
                    </p>
                  </div>
                </div>
              )}
              {result.provenance.creationDate && (
                <div className="flex items-center gap-2 p-2 bg-background/30 rounded">
                  <Calendar className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-xs font-medium text-foreground">
                      {new Date(result.provenance.creationDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {result.provenance.modifications.length > 0 && (
              <div className="p-2 bg-background/30 rounded">
                <p className="text-xs text-muted-foreground mb-1">Modifications</p>
                <div className="flex flex-wrap gap-1">
                  {result.provenance.modifications.map((mod, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Validation Status */}
          {result.validationStatus.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-3 h-3" /> Validation Details
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {result.validationStatus.map((status, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded text-xs",
                      status.code.includes('invalid') || status.code.includes('mismatch')
                        ? "bg-destructive/10 text-destructive"
                        : status.code.includes('warning')
                        ? "bg-warning/10 text-warning"
                        : "bg-muted/10 text-muted-foreground"
                    )}
                  >
                    <span className="font-mono text-[10px]">{status.code}</span>
                    {status.explanation && (
                      <span className="text-[10px]">: {status.explanation}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assertions Preview */}
          {result.assertions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Assertions ({result.assertions.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {result.assertions.slice(0, 6).map((assertion, i) => (
                  <span 
                    key={i}
                    className="px-2 py-0.5 bg-background/50 text-muted-foreground text-[10px] rounded font-mono"
                  >
                    {assertion.label.split('.').pop()}
                  </span>
                ))}
                {result.assertions.length > 6 && (
                  <span className="px-2 py-0.5 text-muted-foreground text-[10px]">
                    +{result.assertions.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default C2PAVerification;
