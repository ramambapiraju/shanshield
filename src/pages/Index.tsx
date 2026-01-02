import { 
  Shield, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  Smartphone, 
  Camera, 
  Radio,
  Fingerprint,
  FileSearch,
  CheckCircle2,
  MessageSquare,
  Brain,
  Eye,
  AudioLines,
  Lock,
  Key,
  ShieldCheck,
  Users,
  Newspaper,
  UserCheck,
  Building2,
  Scan,
  Layers,
  Cpu
} from "lucide-react";
import HexagonShield from "@/components/HexagonShield";
import AgentNode from "@/components/AgentNode";
import ThreatCard from "@/components/ThreatCard";
import TrustMeter from "@/components/TrustMeter";
import DeviceCapability from "@/components/DeviceCapability";
import TechBlock from "@/components/TechBlock";
import ErakshaBadge from "@/components/ErakshaBadge";
import ProtectedEntity from "@/components/ProtectedEntity";
import DataFlowLine from "@/components/DataFlowLine";

const Index = () => {
  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <span className="font-display text-lg font-bold text-gradient-cyber tracking-wider block">
                SHANSHIELD
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Agentic AI Defense System
              </span>
            </div>
          </div>
          <ErakshaBadge />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            <span className="text-gradient-cyber">SHANSHIELD</span>
          </h1>
          <p className="font-display text-lg md:text-xl text-muted-foreground tracking-wide mb-2">
            Agentic AI for Deepfake Detection & Authenticity Verification
          </p>
          <p className="text-sm text-primary font-body italic">
            "Autonomous AI Defending Truth in the Field"
          </p>
        </section>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT SECTION - Threat Landscape */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h2 className="font-display text-sm font-bold text-destructive tracking-widest uppercase">
                Threat Landscape
              </h2>
            </div>
            
            <ThreatCard 
              title="AI-Generated Faces"
              description="Synthetic identities created for impersonation and fraud"
              delay={100}
            />
            <ThreatCard 
              title="Fake Political Videos"
              description="Manipulated footage targeting public opinion and elections"
              delay={200}
            />
            <ThreatCard 
              title="Cloned Audio"
              description="Voice synthesis for social engineering attacks"
              delay={300}
            />
            <ThreatCard 
              title="Battlefield Manipulation"
              description="Tactical misinformation in operational environments"
              delay={400}
            />

            <div className="mt-6 p-4 bg-threat-gradient rounded-lg border border-destructive/20">
              <p className="text-xs text-center text-destructive/90 font-body leading-relaxed italic">
                "Deepfakes: A Real-Time Cyber-Psychological Threat to National Security"
              </p>
            </div>
          </div>

          {/* CENTER SECTION - Agentic AI Core */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Agent Nodes - Top */}
            <div className="w-full grid grid-cols-2 gap-4 mb-8">
              <AgentNode 
                icon={Radio}
                title="Ingestion Agent"
                description="Body-cam video, smartphone capture, open-source media, field recordings"
                position="left"
                delay={200}
              />
              <AgentNode 
                icon={Fingerprint}
                title="Forensic Analysis"
                description="Face mesh analysis, temporal artifacts, spectral fingerprints"
                position="right"
                delay={300}
              />
            </div>

            {/* Central Shield */}
            <div className="relative my-4">
              <HexagonShield />
              
              {/* Data flow lines */}
              <div className="absolute -left-16 top-1/2 -translate-y-1/2">
                <DataFlowLine direction="horizontal" className="w-16" />
              </div>
              <div className="absolute -right-16 top-1/2 -translate-y-1/2">
                <DataFlowLine direction="horizontal" className="w-16" />
              </div>
            </div>

            {/* Agent Nodes - Bottom */}
            <div className="w-full grid grid-cols-2 gap-4 mt-8">
              <AgentNode 
                icon={FileSearch}
                title="Authenticity Verification"
                description="Metadata integrity, cryptographic hash validation, provenance seals"
                position="left"
                delay={400}
              />
              <AgentNode 
                icon={MessageSquare}
                title="Response & Assistance"
                description="Trust score, alerts, cognitive recommendations for operatives"
                position="right"
                delay={500}
              />
            </div>

            {/* Technical Detection Layer */}
            <div className="w-full mt-10 space-y-4">
              <div className="flex items-center gap-2 justify-center mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground tracking-widest uppercase">
                  Deepfake Detection Layer
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <TechBlock 
                  icon={Layers}
                  title="Neural Architecture"
                  items={["CNN", "Vision Transformer", "Multi-Modal Fusion"]}
                  delay={600}
                />
                <TechBlock 
                  icon={AudioLines}
                  title="Audio Analysis"
                  items={["Spectrograms", "Voice Fingerprint", "Anomaly Detection"]}
                  delay={700}
                />
                <TechBlock 
                  icon={Eye}
                  title="Visual Forensics"
                  items={["Lip-Sync Analysis", "Blink Detection", "Artifact Mapping"]}
                  delay={800}
                />
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-primary font-body italic">
                  "Compression-Resilient, Multimodal Deepfake Detection"
                </p>
              </div>
            </div>

            {/* Authenticity & Security Layer */}
            <div className="w-full mt-8 space-y-4">
              <div className="flex items-center gap-2 justify-center mb-4">
                <Lock className="w-5 h-5 text-success" />
                <h3 className="font-display text-sm font-bold text-foreground tracking-widest uppercase">
                  Authenticity & Security
                </h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <TechBlock 
                  icon={Key}
                  title="Cryptographic"
                  items={["Hash Chains", "Digital Signatures", "PKI"]}
                  variant="security"
                  delay={900}
                />
                <TechBlock 
                  icon={ShieldCheck}
                  title="Access Control"
                  items={["RBAC", "MFA", "Secure Firmware"]}
                  variant="security"
                  delay={1000}
                />
                <TechBlock 
                  icon={CheckCircle2}
                  title="Verification"
                  items={["Tamper-Proof Seals", "Provenance Tracking"]}
                  variant="security"
                  delay={1100}
                />
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-success font-body italic">
                  "From Detection to Verifiable Digital Truth"
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION - Device Capabilities & Output */}
          <div className="lg:col-span-3 space-y-6">
            {/* On-Device Capability */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-accent" />
                <h2 className="font-display text-sm font-bold text-accent tracking-widest uppercase">
                  Field-Ready Deployment
                </h2>
              </div>

              <DeviceCapability 
                icon={Smartphone}
                title="Mobile Devices"
                features={["On-Device Edge Inference", "Real-Time Processing", "Secure Enclave"]}
                delay={200}
              />
              <div className="mt-3">
                <DeviceCapability 
                  icon={Camera}
                  title="Body-Cam Systems"
                  features={["Offline Detection", "No Cloud Dependency", "Low-Power Operation"]}
                  delay={300}
                />
              </div>
              <div className="mt-3">
                <DeviceCapability 
                  icon={WifiOff}
                  title="Tactical Devices"
                  features={["Mission-Ready", "Air-Gapped Security", "Immediate Results"]}
                  delay={400}
                />
              </div>
            </div>

            {/* Trust Assessment */}
            <div className="mt-8">
              <TrustMeter score={94} verdict="AUTHENTIC" />
            </div>

            {/* Protected Entities */}
            <div className="mt-8">
              <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4 text-center">
                Protected Entities
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <ProtectedEntity icon={Building2} label="Agencies" delay={600} />
                <ProtectedEntity icon={UserCheck} label="Operatives" delay={700} />
                <ProtectedEntity icon={Newspaper} label="Journalists" delay={800} />
                <ProtectedEntity icon={Users} label="Civilians" delay={900} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section - Impact Statement */}
        <section className="mt-16 text-center">
          <div className="inline-block relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-success/10 to-primary/10 rounded-2xl blur-xl" />
            <div className="relative bg-card/80 border border-primary/30 rounded-xl px-8 py-6 glow-border">
              <p className="font-display text-lg md:text-xl font-bold text-foreground tracking-wide mb-2">
                Strengthening National Security and Trust in Digital Media
              </p>
              <p className="text-sm text-muted-foreground">
                SHANSHIELD — An autonomous agentic AI standing between truth and deception.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-card/30 backdrop-blur-xl mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-display tracking-wider">SHANSHIELD v1.0</span>
            <span className="uppercase tracking-widest">IIT Delhi ERAKSHA Hackathon 2024</span>
            <span className="font-display tracking-wider">CLASSIFIED // FOR OFFICIAL USE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
