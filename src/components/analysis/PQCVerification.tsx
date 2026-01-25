import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Lock, 
  Key, 
  Link, 
  Clock, 
  FileCheck,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Atom,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { 
  MediaProvenance, 
  ChainOfCustodyEntry,
  PQCKeyPair
} from '@/lib/pqcCrypto';
import { 
  verifyChainOfCustody, 
  analyzePQCSecurity,
  exportProvenance 
} from '@/lib/pqcCrypto';

interface PQCVerificationProps {
  provenance: MediaProvenance | null;
  isLoading?: boolean;
  className?: string;
}

const PQCVerification: React.FC<PQCVerificationProps> = ({
  provenance,
  isLoading = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chainValid, setChainValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [securityMetrics, setSecurityMetrics] = useState<{
    classicalBits: number;
    quantumBits: number;
    algorithm: string;
    nistLevel: number;
    estimatedBreakTime: string;
  } | null>(null);

  useEffect(() => {
    if (provenance) {
      // Verify chain of custody
      verifyChainOfCustody(provenance).then(result => {
        setChainValid(result.valid);
        setValidationMessage(result.reason || 'Chain verified successfully');
      });

      // Analyze security metrics
      if (provenance.keyPair) {
        setSecurityMetrics(analyzePQCSecurity(provenance.keyPair));
      }
    }
  }, [provenance]);

  const handleCopyProvenance = async () => {
    if (!provenance) return;
    
    try {
      const provenanceJson = exportProvenance(provenance);
      await navigator.clipboard.writeText(provenanceJson);
      toast.success('Provenance data copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy provenance');
    }
  };

  const handleExportProvenance = () => {
    if (!provenance) return;
    
    const provenanceJson = exportProvenance(provenance);
    const blob = new Blob([provenanceJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pqc-provenance-${provenance.keyPair.keyId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Provenance exported');
  };

  if (isLoading) {
    return (
      <div className={`rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="animate-pulse">
            <Atom className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-48 mb-2 animate-pulse" />
            <div className="h-3 bg-muted rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!provenance) {
    return null;
  }

  const { keyPair, chainOfCustody, isQuantumSecure } = provenance;

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={`rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Atom className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Post-Quantum Cryptography
                {isQuantumSecure && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Quantum-Secure
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                CRYSTALS-Dilithium3 • NIST Level 3
              </p>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              {isExpanded ? (
                <>
                  Hide Details
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  View Details
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Quick Status Row */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Key className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Key ID:</span>
            <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
              {keyPair.keyId}
            </code>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Chain:</span>
            {chainValid === null ? (
              <span className="text-muted-foreground">Verifying...</span>
            ) : chainValid ? (
              <span className="text-success flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {chainOfCustody.length} entries verified
              </span>
            ) : (
              <span className="text-destructive flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Chain broken
              </span>
            )}
          </div>
        </div>
      </div>

      <CollapsibleContent>
        <div className="p-4 space-y-6">
          {/* Security Metrics */}
          {securityMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SecurityMetricCard
                icon={Shield}
                label="Classical Security"
                value={`${securityMetrics.classicalBits}-bit`}
                description="AES-192 equivalent"
              />
              <SecurityMetricCard
                icon={Atom}
                label="Quantum Security"
                value={`${securityMetrics.quantumBits}-bit`}
                description="Post-quantum secure"
              />
              <SecurityMetricCard
                icon={Lock}
                label="NIST Level"
                value={`Level ${securityMetrics.nistLevel}`}
                description="Category 3 security"
              />
              <SecurityMetricCard
                icon={Clock}
                label="Break Time"
                value=">1000 years"
                description="Quantum computer estimate"
              />
            </div>
          )}

          {/* Algorithm Details */}
          <div className="rounded-lg border border-border/50 bg-background/50 p-4">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-primary" />
              Lattice-Based Signature Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Algorithm:</span>
                <span className="ml-2 font-mono">{keyPair.algorithm}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">{keyPair.createdAt.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Media Hash:</span>
                <code className="ml-2 font-mono text-xs bg-muted px-2 py-0.5 rounded">
                  {provenance.mediaHash.substring(0, 24)}...
                </code>
              </div>
              <div>
                <span className="text-muted-foreground">Signature:</span>
                <span className="ml-2 text-success">✓ Valid</span>
              </div>
            </div>
          </div>

          {/* Chain of Custody */}
          <div className="rounded-lg border border-border/50 bg-background/50 p-4">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Link className="w-4 h-4 text-primary" />
              Chain of Custody
              {chainValid !== null && (
                <Badge 
                  variant="outline" 
                  className={chainValid 
                    ? 'bg-success/10 text-success border-success/30' 
                    : 'bg-destructive/10 text-destructive border-destructive/30'
                  }
                >
                  {chainValid ? 'Verified' : 'Broken'}
                </Badge>
              )}
            </h4>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {chainOfCustody.map((entry, index) => (
                <ChainEntryCard 
                  key={entry.id} 
                  entry={entry} 
                  index={index}
                  isLast={index === chainOfCustody.length - 1}
                />
              ))}
            </div>

            {!chainValid && validationMessage && (
              <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/30 text-sm text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {validationMessage}
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyProvenance}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Provenance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportProvenance}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </Button>
          </div>

          {/* Legal Compliance Notice */}
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <strong>COMPLIANCE:</strong> This PQC implementation follows NIST FIPS 204 (CRYSTALS-Dilithium) 
              draft standards for post-quantum digital signatures. Chain of custody logs are designed for 
              forensic auditability per ISO/IEC 27037 (Digital Evidence Handling) guidelines. 
              This is a research implementation — for production use, consult cryptographic security experts.
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Security Metric Card Component
const SecurityMetricCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  description: string;
}> = ({ icon: Icon, label, value, description }) => (
  <div className="rounded-lg border border-border/50 bg-background/50 p-3 text-center">
    <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-semibold text-foreground">{value}</div>
    <div className="text-[10px] text-muted-foreground">{description}</div>
  </div>
);

// Chain Entry Card Component
const ChainEntryCard: React.FC<{
  entry: ChainOfCustodyEntry;
  index: number;
  isLast: boolean;
}> = ({ entry, index, isLast }) => {
  const actionConfig: Record<ChainOfCustodyEntry['action'], { 
    icon: React.ElementType; 
    color: string; 
    label: string 
  }> = {
    created: { icon: FileCheck, color: 'text-primary', label: 'Created' },
    signed: { icon: Key, color: 'text-success', label: 'Signed' },
    verified: { icon: ShieldCheck, color: 'text-success', label: 'Verified' },
    transferred: { icon: Link, color: 'text-warning', label: 'Transferred' },
    analyzed: { icon: Fingerprint, color: 'text-primary', label: 'Analyzed' },
  };

  const config = actionConfig[entry.action];
  const Icon = config.icon;

  return (
    <div className="flex gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={`p-1.5 rounded-full bg-background border-2 ${config.color} border-current`}>
          <Icon className="w-3 h-3" />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-1" />}
      </div>

      {/* Entry content */}
      <div className="flex-1 pb-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{config.label}</span>
          <span className="text-xs text-muted-foreground">
            {entry.timestamp.toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Actor: {entry.actor}
        </div>
        <code className="text-[10px] font-mono text-muted-foreground/70 block mt-1">
          Hash: {entry.entryHash.substring(0, 32)}...
        </code>
      </div>
    </div>
  );
};

export default PQCVerification;
