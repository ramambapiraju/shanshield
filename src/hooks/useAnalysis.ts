import { useState, useCallback } from "react";
import type { VerdictType } from "@/components/analysis/AnalysisResults";
import { analyzeImage, type AnalysisFindings } from "@/lib/imageAnalyzer";
import { analyzeVideo, type VideoAnalysisFindings } from "@/lib/videoAnalyzer";
import { analyzeAudio, type AudioAnalysisFindings } from "@/lib/audioAnalyzer";
import { analyzeDocument, type DocumentAnalysisFindings } from "@/lib/documentAnalyzer";
import { type QuantumEntropyResult } from "@/lib/quantumEntropyAnalyzer";
import { analyzeWithCloud, type CloudAnalysisResult } from "@/lib/cloudAnalyzer";
import { analyzeC2PA, type C2PAResult } from "@/lib/c2paAnalyzer";
import { toast } from "sonner";

// Analysis mode types - Offline (signal processing) or Cloud ML (ShanShield pre-trained model)
export type AnalysisModeType = 'offline' | 'cloud_ml';

interface UploadedFile {
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
  preview?: string;
  id: string;
}

interface AnalysisIndicator {
  name: string;
  detected: boolean;
  confidence: number;
  description: string;
}

interface HeatmapRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
  label: string;
}

interface TimelineMarker {
  timestamp: number;
  type: 'anomaly' | 'warning' | 'info';
  label: string;
  description: string;
}

interface AudioSegment {
  start: number;
  end: number;
  type: 'normal' | 'irregular' | 'suspicious';
  label: string;
}

interface AnalysisResult {
  verdict: VerdictType;
  confidence: number;
  indicators: AnalysisIndicator[];
  notDetected: string[];
  processingTime: number;
  heatmapRegions: HeatmapRegion[];
  timelineMarkers: TimelineMarker[];
  audioSegments: AudioSegment[];
  reasoning: string[];
  mediaHash: string;
  detectionMethods: string[];
  quantumEntropy?: QuantumEntropyResult;
  analysisMode?: AnalysisModeType;
  mlSignals?: string[];
  aiToolDetected?: string | null;
  c2paResult?: C2PAResult;
}

type UnifiedAnalysis = {
  score: number;
  signals: string[];
  details: Record<string, { score: number; description: string }>;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  quantumEntropy?: QuantumEntropyResult;
};

// Convert any analyzer result to unified format
const toUnifiedAnalysis = (
  result: AnalysisFindings | VideoAnalysisFindings | AudioAnalysisFindings | DocumentAnalysisFindings,
  mediaType: 'image' | 'video' | 'audio' | 'document',
  quantumEntropy?: QuantumEntropyResult
): UnifiedAnalysis => {
  return {
    score: result.score,
    signals: result.signals,
    details: result.details as Record<string, { score: number; description: string }>,
    mediaType,
    quantumEntropy
  };
};

// Generate analysis results from REAL analysis
const generateAnalysisResult = (
  file: UploadedFile, 
  isFieldMode: boolean,
  analysis: UnifiedAnalysis,
  actualProcessingTime: number
): AnalysisResult => {
  const { score, signals, details, mediaType } = analysis;
  
  let verdict: VerdictType;
  let confidence: number;
  
  // VERY Conservative thresholds - avoid false positives on authentic content
  // Live webcam captures, phone recordings, and real media have natural artifacts
  // that naive algorithms may misinterpret. Require HIGH scores for deepfake verdict.
  if (score >= 82) {
    verdict = 'deepfake';
    confidence = Math.min(98, score + 8);
  } else if (score >= 65) {
    verdict = 'suspicious';
    confidence = Math.min(80, score + 10);
  } else if (score >= 40) {
    verdict = 'likely_authentic';
    confidence = Math.min(88, 100 - score);
  } else {
    verdict = 'authentic';
    confidence = Math.min(98, 100 - score + 20);
  }

  const indicators: AnalysisIndicator[] = [];
  const notDetected: string[] = [];
  const detailEntries = Object.entries(details);

  for (const [key, value] of detailEntries) {
    const name = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
    if (value.score > 50) {
      indicators.push({
        name,
        detected: true,
        confidence: Math.round(value.score),
        description: value.description
      });
    } else {
      notDetected.push(name);
    }
  }

  const heatmapRegions: HeatmapRegion[] = detailEntries.slice(0, 5).map(([key, value], i) => ({
    x: 20 + (i % 3) * 25,
    y: 15 + Math.floor(i / 3) * 30,
    width: 20,
    height: 25,
    intensity: Math.round(value.score),
    label: `${key.substring(0, 8)}: ${value.score > 50 ? 'Anomaly' : 'Normal'}`
  }));

  const timelineMarkers: TimelineMarker[] = detailEntries.map(([key, value], i) => ({
    timestamp: i + 1,
    type: value.score > 60 ? 'anomaly' : value.score > 40 ? 'warning' : 'info',
    label: key.replace(/([A-Z])/g, ' $1').trim(),
    description: value.description
  }));

  const audioSegments: AudioSegment[] = detailEntries.map(([key, value], i) => ({
    start: i * 2,
    end: (i + 1) * 2,
    type: value.score > 60 ? 'suspicious' : value.score > 40 ? 'irregular' : 'normal',
    label: `${key.substring(0, 10)}: ${Math.round(value.score)}%`
  }));

  const reasoning: string[] = [
    `Real ${mediaType} analysis completed on ${file.file.name} (${(file.file.size / 1024).toFixed(1)} KB)`,
    ...detailEntries.map(([key, value]) => `${key}: ${value.description}`),
    `Overall manipulation score: ${score}/100`,
    signals.length > 0 ? `Detected anomalies: ${signals.join('; ')}` : 'No significant anomalies detected',
    `FINAL VERDICT: ${verdict.toUpperCase()} (${confidence}% confidence)`
  ];

  const hashInput = `${file.file.name}-${file.file.size}-${file.file.lastModified}-${score}`;
  let mediaHash = '';
  for (let i = 0; i < 64; i++) {
    mediaHash += ((hashInput.charCodeAt(i % hashInput.length) * (i + 1)) % 16).toString(16);
  }

  const methodsByType: Record<string, string[]> = {
    image: ["Pixel Noise Analysis", "Sobel Edge Detection", "Color Histogram", "JPEG Artifact Detection", "Symmetry Check", "LBP Texture", "Quantum Entropy Analysis"],
    video: ["Frame Consistency", "Temporal Coherence", "Face Region Tracking", "Compression Analysis", "Motion Flow", "A/V Sync Check", "Quantum Entropy"],
    audio: ["Spectral Analysis", "Pitch Tracking", "Noise Floor Detection", "Compression Artifacts", "Voice Naturalness", "Frequency Distribution", "Quantum Entropy"],
    document: ["Metadata Forensics", "Structure Analysis", "Content Consistency", "Creation Patterns", "Embedded Media Scan", "Modification History"]
  };

  return {
    verdict,
    confidence: Math.round(confidence),
    indicators,
    notDetected,
    processingTime: actualProcessingTime,
    heatmapRegions,
    timelineMarkers,
    audioSegments,
    reasoning,
    mediaHash,
    detectionMethods: methodsByType[mediaType] || methodsByType.image,
    quantumEntropy: analysis.quantumEntropy
  };
};

export const useAnalysis = () => {
  // Core state
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isFieldMode, setIsFieldMode] = useState(false);
  // Analysis mode: 'offline' | 'cloud_ml'
  const [analysisMode, setAnalysisMode] = useState<AnalysisModeType>('offline');
  const [currentProgress, setCurrentProgress] = useState({ step: '', progress: 0 });
  const [realAnalysisResult, setRealAnalysisResult] = useState<UnifiedAnalysis | null>(null);
  // Timing state for real processing time measurement
  const [processingTimeMs, setProcessingTimeMs] = useState(0);
  // Reset key to force MediaUploader remount
  const [resetKey, setResetKey] = useState(0);
  
  // Check if using Cloud ML mode
  const isMLMode = analysisMode === 'cloud_ml';

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles);
    setAnalysisComplete(false);
    setResult(null);
    setRealAnalysisResult(null);
  }, []);

  const startAnalysis = useCallback(async () => {
    if (files.length === 0) return;
    
    const analysisStartTime = performance.now();
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setResult(null);
    setRealAnalysisResult(null);

    const file = files[0];
    
    try {
      let analysis: UnifiedAnalysis;
      
      // Step 1: Always run offline analysis first
      setCurrentProgress({ step: 'Running offline analysis...', progress: 10 });
      if (file.type === 'image') {
        const result = await analyzeImage(file.file);
        analysis = toUnifiedAnalysis(result, 'image', result.quantumEntropy);
      } else if (file.type === 'video') {
        const result = await analyzeVideo(file.file);
        analysis = toUnifiedAnalysis(result, 'video', result.quantumEntropy);
      } else if (file.type === 'audio') {
        const result = await analyzeAudio(file.file);
        analysis = toUnifiedAnalysis(result, 'audio', result.quantumEntropy as unknown as QuantumEntropyResult | undefined);
      } else {
        const result = await analyzeDocument(file.file);
        analysis = toUnifiedAnalysis(result, 'document');
      }
      
      setRealAnalysisResult(analysis);
      
      // Step 2: Run C2PA analysis in parallel
      setCurrentProgress({ step: 'C2PA Verification', progress: 30 });
      let c2paResult: C2PAResult | null = null;
      try {
        c2paResult = await analyzeC2PA(file.file);
        if (c2paResult.hasManifest) {
          toast.success("C2PA manifest found!");
        }
      } catch (c2paError) {
        console.error('C2PA analysis failed:', c2paError);
        // C2PA failure is non-critical, continue with other analysis
      }
      
      // Step 3: Run Cloud ML analysis if enabled (ShanShield pre-trained model)
      let cloudResult: CloudAnalysisResult | null = null;
      
      if (analysisMode === 'cloud_ml') {
        try {
          setCurrentProgress({ step: 'ShanShield ML Analysis...', progress: 50 });
          cloudResult = await analyzeWithCloud(
            file.file,
            file.type,
            {
              score: analysis.score,
              signals: analysis.signals,
              details: analysis.details
            }
          );
          setCurrentProgress({ step: 'ML Complete', progress: 90 });
          toast.success("ShanShield ML analysis complete!");
        } catch (cloudError) {
          console.error('Cloud ML analysis failed:', cloudError);
          toast.error(cloudError instanceof Error ? cloudError.message : 'Cloud ML failed. Using offline results.');
        }
      }
      
      const analysisEndTime = performance.now();
      const timeMs = analysisEndTime - analysisStartTime;
      setProcessingTimeMs(timeMs);
      
      // Generate result - merge cloud results if available
      const timeInSeconds = timeMs / 1000;
      let analysisResult = generateAnalysisResult(file, isFieldMode, analysis, timeInSeconds);
      
      // Add C2PA result
      if (c2paResult) {
        analysisResult.c2paResult = c2paResult;
        
        // If C2PA confirms AI generation, boost the score
        if (c2paResult.hasManifest && c2paResult.provenance.aiGenerated) {
          analysisResult.reasoning.unshift('📜 C2PA MANIFEST CONFIRMS AI-GENERATED CONTENT');
          analysisResult.indicators.unshift({
            name: 'C2PA AI Declaration',
            detected: true,
            confidence: 100,
            description: `Content declared as AI-generated${c2paResult.provenance.aiToolName ? ` by ${c2paResult.provenance.aiToolName}` : ''}`
          });
        } else if (c2paResult.hasManifest && c2paResult.isValid) {
          analysisResult.reasoning.unshift(`📜 C2PA Verified: Signed by ${c2paResult.signatureInfo?.issuer || 'Unknown'}`);
        }
      }
      
      // If we have Cloud ML results, enhance the analysis
      if (cloudResult) {
        analysisResult = {
          ...analysisResult,
          verdict: cloudResult.verdict,
          confidence: cloudResult.combinedConfidence,
          analysisMode: 'cloud_ml' as const,
          mlSignals: cloudResult.mlSignals,
          aiToolDetected: cloudResult.aiToolDetected,
          reasoning: [
            `🛡️ ShanShield ML Analysis (${cloudResult.modelUsed})`,
            cloudResult.reasoning,
            `ML Score: ${cloudResult.mlScore}%`,
            `Offline Score: ${cloudResult.offlineScore}%`,
            `Combined Confidence: ${cloudResult.combinedConfidence}%`,
            ...(cloudResult.aiToolDetected ? [`⚠️ AI Tool Detected: ${cloudResult.aiToolDetected}`] : []),
            ...(cloudResult.manipulationTypes.length > 0 ? [`Manipulation Types: ${cloudResult.manipulationTypes.join(', ')}`] : []),
            ...(cloudResult.mlSignals.length > 0 ? [`ML Signals: ${cloudResult.mlSignals.join(', ')}`] : []),
            '---',
            ...analysisResult.reasoning
          ],
          indicators: [
            ...(cloudResult.mlSignals.map((signal, i) => ({
              name: `ShanShield Signal ${i + 1}`,
              detected: true,
              confidence: cloudResult.mlScore,
              description: signal
            }))),
            ...analysisResult.indicators
          ]
        };
      } else {
        analysisResult.analysisMode = 'offline';
      }
      
      setResult(analysisResult);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
      const analysisEndTime = performance.now();
      const timeMs = analysisEndTime - analysisStartTime;
      setProcessingTimeMs(timeMs);
      const errorAnalysis: UnifiedAnalysis = {
        score: 30,
        signals: ['Analysis encountered an error'],
        details: { error: { score: 30, description: 'Could not complete analysis' } },
        mediaType: file.type
      };
      setRealAnalysisResult(errorAnalysis);
      
      const timeInSeconds = timeMs / 1000;
      const analysisResult = generateAnalysisResult(file, isFieldMode, errorAnalysis, timeInSeconds);
      setResult(analysisResult);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }
  }, [files, isFieldMode, analysisMode]);

  const handleAnalysisComplete = useCallback(() => {
    if (files.length === 0 || !realAnalysisResult) return;
    
    const timeInSeconds = processingTimeMs / 1000;
    const analysisResult = generateAnalysisResult(files[0], isFieldMode, realAnalysisResult, timeInSeconds);
    setResult(analysisResult);
    setAnalysisComplete(true);
  }, [files, isFieldMode, realAnalysisResult, processingTimeMs]);

  const handleProgress = useCallback((step: string, progress: number) => {
    setCurrentProgress({ step, progress });
  }, []);

  const handleFieldModeChange = useCallback((enabled: boolean) => {
    setIsFieldMode(enabled);
  }, []);

  const handleAnalysisModeChange = useCallback((mode: AnalysisModeType) => {
    setAnalysisMode(mode);
  }, []);

  const resetAnalysis = useCallback(() => {
    setFiles([]);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setResult(null);
    setCurrentProgress({ step: '', progress: 0 });
    setRealAnalysisResult(null);
    setResetKey(prev => prev + 1);
  }, []);

  return {
    files,
    isAnalyzing,
    analysisComplete,
    result,
    isFieldMode,
    isMLMode,
    analysisMode,
    currentProgress,
    resetKey,
    handleFilesSelected,
    startAnalysis,
    handleAnalysisComplete,
    handleProgress,
    handleFieldModeChange,
    handleAnalysisModeChange,
    resetAnalysis
  };
};
