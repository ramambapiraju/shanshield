import { useState, useEffect } from "react";
import { Shield, Play, RotateCcw, Presentation, FileText, Brain, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Gemini3Badge from "@/components/Gemini3Badge";
import MediaUploader from "@/components/analysis/MediaUploader";
import AnalysisPipeline from "@/components/analysis/AnalysisPipeline";
import AnalysisResults from "@/components/analysis/AnalysisResults";
import ExplainableAI from "@/components/analysis/ExplainableAI";
import ForensicReport from "@/components/analysis/ForensicReport";
import AnalysisModeToggle from "@/components/analysis/AnalysisModeToggle";
import C2PAVerification from "@/components/analysis/C2PAVerification";

import JudgeModePanel from "@/components/JudgeModePanel";
import PresentationMode from "@/components/PresentationMode";
import TechShowcase from "@/components/TechShowcase";
import TechnicalSummaryPDF from "@/components/TechnicalSummaryPDF";
import QuantumEntropyVisualizer from "@/components/QuantumEntropyVisualizer";
import LiveCallAnalyzer from "@/components/LiveCallAnalyzer";
import AgentDashboard from "@/components/AgentDashboard";
import { useAnalysis } from "@/hooks/useAnalysis";

const Index = () => {
  const [showPresentation, setShowPresentation] = useState(false);
  const [showTechSummary, setShowTechSummary] = useState(false);
  const [showAgentDashboard, setShowAgentDashboard] = useState(false);
  const [showLiveCall, setShowLiveCall] = useState(false);
  
  // Ctrl+P keyboard shortcut to toggle presentation, Ctrl+D for dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setShowPresentation((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        setShowAgentDashboard((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  const {
    files,
    isAnalyzing,
    analysisComplete,
    result,
    analysisMode,
    resetKey,
    handleFilesSelected,
    startAnalysis,
    handleAnalysisComplete,
    handleProgress,
    handleAnalysisModeChange,
    resetAnalysis
  } = useAnalysis();

  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
      <JudgeModePanel />
      <PresentationMode isOpen={showPresentation} onClose={() => setShowPresentation(false)} />
      <TechnicalSummaryPDF isOpen={showTechSummary} onClose={() => setShowTechSummary(false)} />
      <AgentDashboard isOpen={showAgentDashboard} onClose={() => setShowAgentDashboard(false)} />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border/50 bg-card/30 backdrop-blur-xl">
        {/* Developer Credit Bar */}
        <div className="bg-primary/5 border-b border-primary/20 py-2">
          <div className="container mx-auto px-6 flex flex-col items-center gap-1.5 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">Developed by</span>
              <span className="font-display text-primary font-semibold tracking-wide">Shanmuka Sai Varma</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 font-medium">
                🏆 WINNER — IIT Delhi E-Raksha Hackathon
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 font-medium">
                🏆 WINNER — ASME IMECE 2025 Innovation Pitchathon
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground/70">
              American Society of Mechanical Engineers — International Mechanical Engineering Congress & Exposition
            </p>
          </div>
        </div>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-12 h-12 text-primary drop-shadow-glow" />
            <div>
              <span className="font-display text-3xl md:text-4xl font-black text-gradient-cyber tracking-widest block">
                SHANSHIELD
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">
                Agentic AI Defense System
              </span>
            </div>
          </div>
          <Gemini3Badge />
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-8">
        {/* Disclaimer Banner */}
        <div className="mb-4 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
          <p className="text-xs text-amber-400 font-medium">
            ⚠️ EXPERIMENTAL PROTOTYPE — Unofficial research project. Results are indicative only, not for critical decisions.
          </p>
        </div>
        
        {/* Title */}
        <section className="text-center mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
            <span className="text-gradient-cyber">Deepfake Analysis Interface</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time authenticity verification for operational media
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT - Input & Controls */}
          <div className="lg:col-span-4 space-y-6">
            <MediaUploader key={resetKey} onFilesSelected={handleFilesSelected} isAnalyzing={isAnalyzing} />
            
            <AnalysisModeToggle 
              analysisMode={analysisMode} 
              onModeChange={handleAnalysisModeChange}
            />
            
            {/* Analyze Button - Always show when files exist */}
            {files.length > 0 && !analysisComplete && (
              <Button 
                onClick={startAnalysis}
                size="lg"
                disabled={isAnalyzing}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider disabled:opacity-50"
              >
                <Play className="w-5 h-5 mr-2" />
                {isAnalyzing ? "ANALYZING..." : "START ANALYSIS"}
              </Button>
            )}
            
            {analysisComplete && (
              <Button 
                onClick={resetAnalysis}
                variant="outline"
                size="lg"
                className="w-full border-primary/50 hover:border-primary"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                NEW ANALYSIS
              </Button>
            )}
            
            {/* Live Call Analyzer */}
            <LiveCallAnalyzer />
            
            {/* Agent Dashboard Button */}
            <Button 
              onClick={() => setShowAgentDashboard(true)}
              variant="outline"
              size="lg"
              className="w-full border-primary/30 hover:border-primary hover:bg-primary/5"
            >
              <Brain className="w-5 h-5 mr-2" />
              AI AGENT DASHBOARD
            </Button>
          </div>

          {/* CENTER/RIGHT - Analysis & Results */}
          <div className="lg:col-span-8 space-y-6">
            {/* Pipeline */}
            {(isAnalyzing || analysisComplete) && files.length > 0 && (
              <AnalysisPipeline
                isActive={isAnalyzing}
                mediaType={files[0].type}
                onComplete={handleAnalysisComplete}
                onProgress={handleProgress}
              />
            )}

            {/* Results */}
            {analysisComplete && result && (
              <>
                {/* Forensic Report at Top */}
                <ForensicReport
                  mediaHash={result.mediaHash}
                  verdict={result.verdict}
                  confidence={result.confidence}
                  detectionMethods={result.detectionMethods}
                  timestamp={new Date()}
                  deviceId="SHAN-001-FIELD"
                  fileName={files[0].file.name}
                  fileSize={files[0].file.size}
                  processingTime={result.processingTime}
                />
                
                {/* C2PA Verification */}
                <C2PAVerification result={result.c2paResult || null} />
                
                <AnalysisResults
                  verdict={result.verdict}
                  confidence={result.confidence}
                  indicators={result.indicators}
                  notDetected={result.notDetected}
                  processingTime={result.processingTime}
                  analysisMode={result.analysisMode}
                />
                
                <ExplainableAI
                  mediaType={files[0].type}
                  heatmapRegions={result.heatmapRegions}
                  timelineMarkers={result.timelineMarkers}
                  audioSegments={result.audioSegments}
                  reasoning={result.reasoning}
                />
                
                {/* Quantum Entropy Visualizer */}
                {result.quantumEntropy && (
                  <QuantumEntropyVisualizer result={result.quantumEntropy} />
                )}
              </>
            )}

            {/* Empty State */}
            {!isAnalyzing && !analysisComplete && (
              <div className="flex items-center justify-center h-96 bg-card/30 border border-dashed border-border/50 rounded-xl">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-display tracking-wider">
                    Upload media to begin analysis
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Tech Showcase Section */}
      <TechShowcase />

      {/* About Section */}
      <section className="relative border-t border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <h2 className="font-display text-xl font-bold text-gradient-cyber tracking-wider">ABOUT THE DEVELOPER</h2>
            <p className="text-lg font-display text-foreground tracking-wide">
              Shanmuka Sai Varma
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                <span className="text-sm text-yellow-400 font-medium">🏆 Winner — IIT Delhi E-Raksha Hackathon</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <span className="text-sm text-emerald-400 font-medium">🏆 Winner — ASME IMECE 2025 Innovation Pitchathon</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              American Society of Mechanical Engineers — International Mechanical Engineering Congress & Exposition
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-display tracking-wider">SHANSHIELD v4.2.0 (Experimental)</span>
              <div className="flex items-center gap-3">
                <span className="uppercase tracking-widest">Google Gemini 3 Hackathon 2025</span>
                <Button 
                  onClick={() => setShowTechSummary(true)}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
                >
                  <FileText className="w-3 h-3" />
                  Tech PDF
                </Button>
                <Button
                  onClick={() => setShowPresentation(true)}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
                >
                  <Presentation className="w-3 h-3" />
                  Present
                </Button>
              </div>
              <span className="font-display tracking-wider">PROTOTYPE // UNOFFICIAL</span>
            </div>
            <p className="text-center text-[10px] text-muted-foreground/60">
              Built with Lovable AI • This is an experimental research prototype, not an official product
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
