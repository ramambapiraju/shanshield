import { useState } from "react";
import { Shield, Play, RotateCcw, Presentation, Sparkles, Square, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ErakshaBadge from "@/components/ErakshaBadge";
import MediaUploader from "@/components/analysis/MediaUploader";
import AnalysisPipeline from "@/components/analysis/AnalysisPipeline";
import AnalysisResults from "@/components/analysis/AnalysisResults";
import ExplainableAI from "@/components/analysis/ExplainableAI";
import ForensicReport from "@/components/analysis/ForensicReport";
import FieldModeToggle from "@/components/analysis/FieldModeToggle";
import SecurityIndicators from "@/components/analysis/SecurityIndicators";
import JudgeModePanel from "@/components/JudgeModePanel";
import HackathonScript from "@/components/HackathonScript";
import PresentationMode from "@/components/PresentationMode";
import TechShowcase from "@/components/TechShowcase";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useDemoMode } from "@/hooks/useDemoMode";

const Index = () => {
  const [showPresentation, setShowPresentation] = useState(false);
  const {
    files,
    isAnalyzing,
    analysisComplete,
    result,
    isFieldMode,
    handleFilesSelected,
    startAnalysis,
    handleAnalysisComplete,
    handleProgress,
    handleFieldModeChange,
    resetAnalysis
  } = useAnalysis();

  const {
    isDemoMode,
    demoFiles,
    isDemoAnalyzing,
    demoComplete,
    demoResult,
    currentDemoLabel,
    demoScenarioIndex,
    totalScenarios,
    startDemoMode,
    nextDemoScenario,
    stopDemoMode
  } = useDemoMode();

  // Use demo state when in demo mode
  const activeFiles = isDemoMode ? demoFiles : files;
  const activeAnalyzing = isDemoMode ? isDemoAnalyzing : isAnalyzing;
  const activeComplete = isDemoMode ? demoComplete : analysisComplete;
  const activeResult = isDemoMode ? demoResult : result;

  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
      <JudgeModePanel />
      <HackathonScript />
      <PresentationMode isOpen={showPresentation} onClose={() => setShowPresentation(false)} />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border/50 bg-card/30 backdrop-blur-xl">
        {/* Developer Credit Bar */}
        <div className="bg-primary/5 border-b border-primary/20 py-1.5">
          <div className="container mx-auto px-6 flex items-center justify-center gap-3 text-xs">
            <span className="text-muted-foreground">Developed by</span>
            <span className="font-display text-primary font-semibold tracking-wide">Shanmuka Sai Varma</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-primary/80">🏆 ASME IMECE 2025 Innovation Pitchathon Winner</span>
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
          <ErakshaBadge />
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-8">
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
            <MediaUploader onFilesSelected={handleFilesSelected} isAnalyzing={activeAnalyzing} />
            
            <FieldModeToggle onModeChange={handleFieldModeChange} />

            {/* Demo Mode Button */}
            {!isDemoMode && !isAnalyzing && !analysisComplete && (
              <Button 
                onClick={startDemoMode}
                variant="outline"
                size="lg"
                className="w-full border-accent/50 hover:border-accent hover:bg-accent/10 text-accent"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                AUTO DEMO MODE
              </Button>
            )}

            {/* Stop Demo Button */}
            {isDemoMode && (
              <div className="space-y-3">
                <div className="text-center p-3 bg-accent/10 border border-accent/30 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Demo Mode Active ({demoScenarioIndex + 1}/{totalScenarios})
                  </div>
                  <div className="font-display text-lg font-bold text-accent">{currentDemoLabel}</div>
                </div>
                
                {/* Next Demo Button - only show when analysis is complete */}
                {demoComplete && (
                  <Button 
                    onClick={nextDemoScenario}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider"
                  >
                    <ChevronRight className="w-5 h-5 mr-2" />
                    {demoScenarioIndex === 0 ? "NEXT: AUTHENTIC IMAGE" : "NEXT: DEEPFAKE IMAGE"}
                  </Button>
                )}
                
                <Button 
                  onClick={stopDemoMode}
                  variant="outline"
                  size="lg"
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <Square className="w-5 h-5 mr-2" />
                  STOP DEMO
                </Button>
              </div>
            )}
            
            {/* Analyze Button - Always show when files exist */}
            {files.length > 0 && !analysisComplete && !isDemoMode && (
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
            
            {analysisComplete && !isDemoMode && (
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
            
            <SecurityIndicators />
          </div>

          {/* CENTER/RIGHT - Analysis & Results */}
          <div className="lg:col-span-8 space-y-6">
            {/* Pipeline - for demo mode, show a simulated pipeline */}
            {(activeAnalyzing || activeComplete) && activeFiles.length > 0 && (
              <AnalysisPipeline
                isActive={activeAnalyzing}
                mediaType={activeFiles[0].type}
                onComplete={isDemoMode ? () => {} : handleAnalysisComplete}
                onProgress={isDemoMode ? () => {} : handleProgress}
              />
            )}

            {/* Results */}
            {activeComplete && activeResult && (
              <>
                {/* Forensic Report at Top */}
                <ForensicReport
                  mediaHash={activeResult.mediaHash}
                  verdict={activeResult.verdict}
                  confidence={activeResult.confidence}
                  detectionMethods={activeResult.detectionMethods}
                  timestamp={new Date()}
                  deviceId="SHAN-001-FIELD"
                  fileName={activeFiles[0].file.name}
                  fileSize={activeFiles[0].file.size}
                  processingTime={activeResult.processingTime}
                />
                
                <AnalysisResults
                  verdict={activeResult.verdict}
                  confidence={activeResult.confidence}
                  indicators={activeResult.indicators}
                  notDetected={activeResult.notDetected}
                  processingTime={activeResult.processingTime}
                />
                
                <ExplainableAI
                  mediaType={activeFiles[0].type}
                  heatmapRegions={activeResult.heatmapRegions}
                  timelineMarkers={activeResult.timelineMarkers}
                  audioSegments={activeResult.audioSegments}
                  reasoning={activeResult.reasoning}
                />
              </>
            )}

            {/* Empty State */}
            {!activeAnalyzing && !activeComplete && (
              <div className="flex items-center justify-center h-96 bg-card/30 border border-dashed border-border/50 rounded-xl">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-display tracking-wider">
                    Upload media to begin analysis
                  </p>
                  <p className="text-muted-foreground/60 text-sm mt-2">
                    or click AUTO DEMO MODE for a demonstration
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
              <span className="text-sm text-primary font-medium">🏆 Winner — ASME IMECE 2025 Innovation Pitchathon</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              American Society of Mechanical Engineers International Mechanical Engineering Congress & Exposition
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-display tracking-wider">SHANSHIELD v4.2.0</span>
            <div className="flex items-center gap-3">
              <span className="uppercase tracking-widest">IIT Delhi ERAKSHA Hackathon 2026</span>
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
            <span className="font-display tracking-wider">CLASSIFIED // FOR OFFICIAL USE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
