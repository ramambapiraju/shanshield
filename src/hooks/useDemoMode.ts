import { useState, useCallback, useRef } from "react";
import type { VerdictType } from "@/components/analysis/AnalysisResults";
import { analyzeImage, AnalysisFindings } from "@/lib/imageAnalyzer";

// Import real demo images
import deepfakeImage from "@/assets/demo-deepfake.jpg";
import authenticImage from "@/assets/demo-authentic.jpg";

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

interface UploadedFile {
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
  preview?: string;
  id: string;
}

type DemoScenario = 'deepfake' | 'authentic';

// Convert analysis findings to full result
const convertFindingsToResult = (
  findings: AnalysisFindings, 
  fileName: string,
  processingTime: number
): AnalysisResult => {
  const isDeepfake = findings.score >= 50;
  const verdict: VerdictType = isDeepfake ? 'deepfake' : 'authentic';
  
  // Generate indicators from findings
  const indicators: AnalysisIndicator[] = [
    {
      name: "Noise Pattern Analysis",
      detected: findings.details.noiseAnalysis.score > 50,
      confidence: Math.round(findings.details.noiseAnalysis.score),
      description: findings.details.noiseAnalysis.description
    },
    {
      name: "Edge Consistency",
      detected: findings.details.edgeAnalysis.score > 50,
      confidence: Math.round(findings.details.edgeAnalysis.score),
      description: findings.details.edgeAnalysis.description
    },
    {
      name: "Color Distribution",
      detected: findings.details.colorAnalysis.score > 50,
      confidence: Math.round(findings.details.colorAnalysis.score),
      description: findings.details.colorAnalysis.description
    },
    {
      name: "Compression Artifacts",
      detected: findings.details.compressionAnalysis.score > 50,
      confidence: Math.round(findings.details.compressionAnalysis.score),
      description: findings.details.compressionAnalysis.description
    },
    {
      name: "Facial Symmetry",
      detected: findings.details.symmetryAnalysis.score > 50,
      confidence: Math.round(findings.details.symmetryAnalysis.score),
      description: findings.details.symmetryAnalysis.description
    },
    {
      name: "Texture Consistency",
      detected: findings.details.textureAnalysis.score > 50,
      confidence: Math.round(findings.details.textureAnalysis.score),
      description: findings.details.textureAnalysis.description
    }
  ];

  const notDetected = indicators.filter(i => !i.detected).map(i => i.name);
  
  // Generate hash
  const hashBase = `analysis-${fileName}-${Date.now()}`;
  let mediaHash = '';
  for (let i = 0; i < 64; i++) {
    mediaHash += ((hashBase.charCodeAt(i % hashBase.length) * (i + 1)) % 16).toString(16);
  }

  // Generate reasoning based on real analysis
  const reasoning: string[] = [
    `Multi-agent forensic analysis initiated on ${fileName}`,
    `Visual Agent: ${findings.details.noiseAnalysis.description}`,
    `Edge Agent: ${findings.details.edgeAnalysis.description}`,
    `Color Agent: ${findings.details.colorAnalysis.description}`,
    `Compression Agent: ${findings.details.compressionAnalysis.description}`,
    `Symmetry Agent: ${findings.details.symmetryAnalysis.description}`,
    `Texture Agent: ${findings.details.textureAnalysis.description}`,
    isDeepfake 
      ? `⚠️ MANIPULATION DETECTED - Overall score: ${findings.score}%`
      : `✓ AUTHENTIC - Overall score: ${findings.score}%`,
    `FINAL VERDICT: ${verdict.toUpperCase()} (${Math.abs(isDeepfake ? findings.score : 100 - findings.score)}% confidence)`
  ];

  // Generate heatmap based on actual findings
  const heatmapRegions: HeatmapRegion[] = [
    { 
      x: 25, y: 20, width: 25, height: 30, 
      intensity: findings.details.noiseAnalysis.score, 
      label: findings.details.noiseAnalysis.score > 50 ? "Noise Anomaly" : "Normal Noise" 
    },
    { 
      x: 55, y: 25, width: 20, height: 25, 
      intensity: findings.details.symmetryAnalysis.score, 
      label: findings.details.symmetryAnalysis.score > 50 ? "Symmetry Issue" : "Normal Symmetry" 
    },
    { 
      x: 35, y: 55, width: 30, height: 20, 
      intensity: findings.details.textureAnalysis.score, 
      label: findings.details.textureAnalysis.score > 50 ? "Texture Anomaly" : "Normal Texture" 
    },
  ];

  const timelineMarkers: TimelineMarker[] = [
    { 
      timestamp: 1, 
      type: findings.details.noiseAnalysis.score > 50 ? 'anomaly' : 'info', 
      label: "Noise Analysis", 
      description: findings.details.noiseAnalysis.description 
    },
    { 
      timestamp: 2, 
      type: findings.details.edgeAnalysis.score > 50 ? 'warning' : 'info', 
      label: "Edge Detection", 
      description: findings.details.edgeAnalysis.description 
    },
    { 
      timestamp: 3, 
      type: findings.details.textureAnalysis.score > 50 ? 'anomaly' : 'info', 
      label: "Texture Analysis", 
      description: findings.details.textureAnalysis.description 
    },
  ];

  return {
    verdict,
    confidence: Math.round(isDeepfake ? findings.score : 100 - findings.score),
    indicators: indicators.filter(i => i.detected),
    notDetected,
    processingTime,
    heatmapRegions,
    timelineMarkers,
    audioSegments: [],
    reasoning,
    mediaHash,
    detectionMethods: ["Pixel Noise Analysis", "Sobel Edge Detection", "Color Histogram", "JPEG Artifact Detection", "Symmetry Check", "LBP Texture"]
  };
};

export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoScenarioIndex, setDemoScenarioIndex] = useState(0);
  const [demoFiles, setDemoFiles] = useState<UploadedFile[]>([]);
  const [isDemoAnalyzing, setIsDemoAnalyzing] = useState(false);
  const [demoComplete, setDemoComplete] = useState(false);
  const [demoResult, setDemoResult] = useState<AnalysisResult | null>(null);
  const [currentDemoLabel, setCurrentDemoLabel] = useState<string>("");
  const analysisStartTime = useRef<number>(0);

  const scenarios: { type: DemoScenario; imageUrl: string; fileName: string }[] = [
    { type: 'deepfake', imageUrl: deepfakeImage, fileName: "AI_Generated_Face.jpg" },
    { type: 'authentic', imageUrl: authenticImage, fileName: "Authentic_Photo.jpg" }
  ];

  // Fetch image as File object from imported URL
  const fetchImageAsFile = useCallback(async (url: string, fileName: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: 'image/jpeg' });
  }, []);

  const runDemoScenario = useCallback(async (index: number) => {
    const scenario = scenarios[index];
    
    setCurrentDemoLabel(scenario.type === 'deepfake' ? '🔴 DEEPFAKE SAMPLE' : '🟢 AUTHENTIC SAMPLE');
    setIsDemoAnalyzing(true);
    setDemoComplete(false);
    setDemoResult(null);
    analysisStartTime.current = performance.now();
    
    try {
      // Fetch the real image file
      const file = await fetchImageAsFile(scenario.imageUrl, scenario.fileName);
      
      // Create file entry with real preview
      const mockFile: UploadedFile = {
        file,
        type: 'image',
        preview: scenario.imageUrl,
        id: `demo-${scenario.type}-${Date.now()}`
      };
      
      setDemoFiles([mockFile]);
      
      // Run REAL analysis on the image
      const findings = await analyzeImage(file);
      
      // Calculate processing time
      const processingTime = (performance.now() - analysisStartTime.current) / 1000;
      
      // Convert findings to full result
      const result = convertFindingsToResult(findings, scenario.fileName, processingTime);
      
      setDemoResult(result);
      setIsDemoAnalyzing(false);
      setDemoComplete(true);
    } catch (error) {
      console.error("Demo analysis failed:", error);
      setIsDemoAnalyzing(false);
    }
  }, [fetchImageAsFile]);

  const startDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setDemoScenarioIndex(0);
    runDemoScenario(0);
  }, [runDemoScenario]);

  const nextDemoScenario = useCallback(() => {
    const nextIndex = (demoScenarioIndex + 1) % scenarios.length;
    setDemoScenarioIndex(nextIndex);
    runDemoScenario(nextIndex);
  }, [demoScenarioIndex, runDemoScenario]);

  const stopDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setIsDemoAnalyzing(false);
    setDemoComplete(false);
    setDemoResult(null);
    setDemoFiles([]);
    setCurrentDemoLabel("");
    setDemoScenarioIndex(0);
  }, []);

  return {
    isDemoMode,
    demoFiles,
    isDemoAnalyzing,
    demoComplete,
    demoResult,
    currentDemoLabel,
    demoScenarioIndex,
    totalScenarios: scenarios.length,
    startDemoMode,
    nextDemoScenario,
    stopDemoMode
  };
};
