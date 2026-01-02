import { useState, useCallback } from "react";
import type { VerdictType } from "@/components/analysis/AnalysisResults";

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
}

// Simulate realistic analysis results based on random factors
const generateAnalysisResult = (file: UploadedFile, isFieldMode: boolean): AnalysisResult => {
  // Randomize verdict distribution for realistic behavior
  const random = Math.random();
  let verdict: VerdictType;
  let confidence: number;
  
  if (random < 0.55) {
    verdict = 'authentic';
    confidence = Math.floor(Math.random() * 15) + 85; // 85-99%
  } else if (random < 0.75) {
    verdict = 'likely_authentic';
    confidence = Math.floor(Math.random() * 15) + 70; // 70-84%
  } else if (random < 0.90) {
    verdict = 'suspicious';
    confidence = Math.floor(Math.random() * 20) + 50; // 50-69%
  } else {
    verdict = 'deepfake';
    confidence = Math.floor(Math.random() * 25) + 75; // 75-99%
  }

  // Generate indicators based on verdict
  const indicators: AnalysisIndicator[] = [];
  const notDetected: string[] = [];

  if (verdict === 'deepfake') {
    indicators.push(
      {
        name: "Face Mesh Inconsistency",
        detected: true,
        confidence: Math.floor(Math.random() * 15) + 80,
        description: "Detected irregular facial landmark movements"
      },
      {
        name: "Temporal Artifacts",
        detected: true,
        confidence: Math.floor(Math.random() * 15) + 75,
        description: "Frame-to-frame inconsistencies detected"
      },
      {
        name: "Lip-Sync Mismatch",
        detected: true,
        confidence: Math.floor(Math.random() * 20) + 70,
        description: "Audio-visual synchronization anomalies"
      }
    );
    notDetected.push("Natural blink patterns", "Consistent lighting");
  } else if (verdict === 'suspicious') {
    indicators.push(
      {
        name: "Compression Artifacts",
        detected: true,
        confidence: Math.floor(Math.random() * 20) + 50,
        description: "Unusual compression signatures"
      },
      {
        name: "Metadata Inconsistency",
        detected: true,
        confidence: Math.floor(Math.random() * 20) + 40,
        description: "EXIF data shows potential modification"
      }
    );
    notDetected.push(
      "Face mesh manipulation",
      "GAN artifacts",
      "Temporal inconsistencies",
      "Audio synthesis markers"
    );
  } else {
    indicators.push(
      {
        name: "Face Mesh Analysis",
        detected: false,
        confidence: Math.floor(Math.random() * 10) + 5,
        description: "No manipulation detected in facial landmarks"
      },
      {
        name: "Temporal Consistency",
        detected: false,
        confidence: Math.floor(Math.random() * 10) + 5,
        description: "Natural frame-to-frame transitions"
      },
      {
        name: "Audio Analysis",
        detected: false,
        confidence: Math.floor(Math.random() * 10) + 5,
        description: "No synthetic voice markers detected"
      }
    );
    notDetected.push(
      "Face swapping artifacts",
      "GAN fingerprints",
      "Lip-sync mismatches",
      "Voice cloning signatures",
      "Temporal discontinuities",
      "Compression-based manipulation"
    );
  }

  // Generate heatmap regions
  const heatmapRegions: HeatmapRegion[] = verdict === 'deepfake' || verdict === 'suspicious' 
    ? [
        { x: 30, y: 20, width: 25, height: 30, intensity: verdict === 'deepfake' ? 85 : 45, label: "Face Region" },
        { x: 35, y: 45, width: 15, height: 10, intensity: verdict === 'deepfake' ? 75 : 35, label: "Mouth" },
        { x: 33, y: 25, width: 8, height: 8, intensity: verdict === 'deepfake' ? 65 : 25, label: "Eye L" },
        { x: 45, y: 25, width: 8, height: 8, intensity: verdict === 'deepfake' ? 65 : 25, label: "Eye R" }
      ]
    : [
        { x: 30, y: 20, width: 25, height: 30, intensity: 10, label: "Face Region" }
      ];

  // Generate timeline markers
  const timelineMarkers: TimelineMarker[] = [];
  if (verdict === 'deepfake') {
    timelineMarkers.push(
      { timestamp: 2.3, type: 'anomaly', label: "Face Swap Detected", description: "Boundary artifacts visible" },
      { timestamp: 5.7, type: 'anomaly', label: "Temporal Glitch", description: "Frame interpolation error" },
      { timestamp: 12.1, type: 'warning', label: "Audio Sync Issue", description: "50ms delay detected" },
      { timestamp: 18.5, type: 'anomaly', label: "Blink Pattern Anomaly", description: "Unnatural blink timing" }
    );
  } else if (verdict === 'suspicious') {
    timelineMarkers.push(
      { timestamp: 8.2, type: 'warning', label: "Compression Artifact", description: "Unusual block pattern" },
      { timestamp: 15.6, type: 'info', label: "Quality Drop", description: "Resolution change detected" }
    );
  } else {
    timelineMarkers.push(
      { timestamp: 10.0, type: 'info', label: "Scene Change", description: "Natural transition" }
    );
  }

  // Generate audio segments
  const audioSegments: AudioSegment[] = [];
  if (file.type === 'video' || file.type === 'audio') {
    if (verdict === 'deepfake') {
      audioSegments.push(
        { start: 0, end: 2, type: 'normal', label: "Normal" },
        { start: 2, end: 4.5, type: 'suspicious', label: "Voice Clone Detected" },
        { start: 4.5, end: 7, type: 'normal', label: "Normal" },
        { start: 7, end: 8.5, type: 'irregular', label: "Spectral Anomaly" },
        { start: 8.5, end: 10, type: 'normal', label: "Normal" }
      );
    } else if (verdict === 'suspicious') {
      audioSegments.push(
        { start: 0, end: 6, type: 'normal', label: "Normal" },
        { start: 6, end: 7.5, type: 'irregular', label: "Minor Irregularity" },
        { start: 7.5, end: 10, type: 'normal', label: "Normal" }
      );
    } else {
      audioSegments.push(
        { start: 0, end: 10, type: 'normal', label: "Normal" }
      );
    }
  }

  // Generate reasoning chain
  const reasoning: string[] = [];
  if (verdict === 'deepfake') {
    reasoning.push(
      "Initial frame analysis detected face region with irregular boundaries",
      "Facial landmark tracking revealed unnatural movement patterns (deviation: 12.3%)",
      "Temporal consistency check failed at frames 68-71 and 171-175",
      "Audio spectrogram analysis detected synthetic voice markers",
      "Cross-modal verification confirmed audio-visual desynchronization",
      "Final verdict: High confidence AI-generated manipulation"
    );
  } else if (verdict === 'suspicious') {
    reasoning.push(
      "Initial frame analysis completed without major anomalies",
      "Minor compression artifacts detected in face region",
      "Metadata analysis shows potential post-processing",
      "Temporal consistency check passed with minor deviations",
      "Recommending human review due to ambiguous signals"
    );
  } else {
    reasoning.push(
      "Initial frame analysis completed — no manipulation markers detected",
      "Facial landmark tracking shows natural movement patterns",
      "Temporal consistency verified across all frames",
      "Audio analysis shows natural voice characteristics",
      "Metadata integrity confirmed — no signs of tampering",
      "Final verdict: Content verified as authentic"
    );
  }

  // Generate hash
  const chars = '0123456789abcdef';
  let mediaHash = '';
  for (let i = 0; i < 64; i++) {
    mediaHash += chars[Math.floor(Math.random() * chars.length)];
  }

  const detectionMethods = [
    "CNN Face Detector",
    "Vision Transformer",
    "Temporal Analysis",
    "Audio Spectrogram",
    "Compression Analysis",
    ...(isFieldMode ? ["Edge Inference", "Low-Power Mode"] : ["Cloud Model", "Full Resolution"])
  ];

  const processingTime = isFieldMode 
    ? (Math.random() * 2) + 1.5 
    : (Math.random() * 4) + 3;

  return {
    verdict,
    confidence,
    indicators,
    notDetected,
    processingTime,
    heatmapRegions,
    timelineMarkers,
    audioSegments,
    reasoning,
    mediaHash,
    detectionMethods
  };
};

export const useAnalysis = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isFieldMode, setIsFieldMode] = useState(false);
  const [currentProgress, setCurrentProgress] = useState({ step: '', progress: 0 });

  const handleFilesSelected = useCallback((selectedFiles: UploadedFile[]) => {
    setFiles(selectedFiles);
    setAnalysisComplete(false);
    setResult(null);
  }, []);

  const startAnalysis = useCallback(() => {
    if (files.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setResult(null);
  }, [files]);

  const handleAnalysisComplete = useCallback(() => {
    if (files.length === 0) return;
    
    const analysisResult = generateAnalysisResult(files[0], isFieldMode);
    setResult(analysisResult);
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  }, [files, isFieldMode]);

  const handleProgress = useCallback((step: string, progress: number) => {
    setCurrentProgress({ step, progress });
  }, []);

  const handleFieldModeChange = useCallback((enabled: boolean) => {
    setIsFieldMode(enabled);
  }, []);

  const resetAnalysis = useCallback(() => {
    setFiles([]);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setResult(null);
    setCurrentProgress({ step: '', progress: 0 });
  }, []);

  return {
    files,
    isAnalyzing,
    analysisComplete,
    result,
    isFieldMode,
    currentProgress,
    handleFilesSelected,
    startAnalysis,
    handleAnalysisComplete,
    handleProgress,
    handleFieldModeChange,
    resetAnalysis
  };
};
