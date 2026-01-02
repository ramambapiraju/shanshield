import { Shield, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ErakshaBadge from "@/components/ErakshaBadge";
import MediaUploader from "@/components/analysis/MediaUploader";
import AnalysisPipeline from "@/components/analysis/AnalysisPipeline";
import AnalysisResults from "@/components/analysis/AnalysisResults";
import ExplainableAI from "@/components/analysis/ExplainableAI";
import ForensicReport from "@/components/analysis/ForensicReport";
import FieldModeToggle from "@/components/analysis/FieldModeToggle";
import SecurityIndicators from "@/components/analysis/SecurityIndicators";
import { useAnalysis } from "@/hooks/useAnalysis";

const Index = () => {
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

  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border/50 bg-card/30 backdrop-blur-xl">
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
            <MediaUploader onFilesSelected={handleFilesSelected} isAnalyzing={isAnalyzing} />
            
            <FieldModeToggle onModeChange={handleFieldModeChange} />
            
            {/* Analyze Button */}
            {files.length > 0 && !isAnalyzing && !analysisComplete && (
              <Button 
                onClick={startAnalysis}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider"
              >
                <Play className="w-5 h-5 mr-2" />
                START ANALYSIS
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
            
            <SecurityIndicators />
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
                
                <AnalysisResults
                  verdict={result.verdict}
                  confidence={result.confidence}
                  indicators={result.indicators}
                  notDetected={result.notDetected}
                  processingTime={result.processingTime}
                />
                
                <ExplainableAI
                  mediaType={files[0].type}
                  heatmapRegions={result.heatmapRegions}
                  timelineMarkers={result.timelineMarkers}
                  audioSegments={result.audioSegments}
                  reasoning={result.reasoning}
                />
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
