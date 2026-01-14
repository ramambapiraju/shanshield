import { useState, useCallback, useRef } from "react";
import type { VerdictType } from "@/components/analysis/AnalysisResults";

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

// Demo scenarios with preset results
const demoScenarios: Record<DemoScenario, {
  name: string;
  verdict: VerdictType;
  confidence: number;
  indicators: AnalysisIndicator[];
  notDetected: string[];
  reasoning: string[];
}> = {
  deepfake: {
    name: "Deepfake_Sample_Face.jpg",
    verdict: 'deepfake',
    confidence: 94,
    indicators: [
      { name: "GAN Artifacts", detected: true, confidence: 96, description: "Detected characteristic GAN fingerprints in frequency domain" },
      { name: "Facial Inconsistency", detected: true, confidence: 92, description: "Unnatural facial geometry and asymmetry patterns" },
      { name: "Edge Anomalies", detected: true, confidence: 88, description: "Irregular edge patterns around face boundary regions" },
      { name: "Texture Irregularity", detected: true, confidence: 85, description: "LBP analysis shows unnatural texture patterns" },
      { name: "Compression Artifacts", detected: true, confidence: 78, description: "Double JPEG compression detected with mismatched quantization" },
    ],
    notDetected: ["Metadata Tampering"],
    reasoning: [
      "Multi-agent forensic analysis initiated on Deepfake_Sample_Face.jpg",
      "Visual Agent: GAN fingerprints detected via DCT frequency analysis",
      "Temporal Agent: Static image - frame consistency N/A",
      "Audio Agent: No audio track present",
      "Metadata Agent: EXIF data shows signs of editing software",
      "Arbiter Agent: Cross-validation confirms manipulation",
      "HIGH CONFIDENCE DEEPFAKE - Multiple forensic indicators triggered",
      "FINAL VERDICT: DEEPFAKE (94% confidence)"
    ]
  },
  authentic: {
    name: "Authentic_Photo.jpg",
    verdict: 'authentic',
    confidence: 97,
    indicators: [
      { name: "Natural Noise Pattern", detected: true, confidence: 95, description: "Sensor noise consistent with genuine camera capture" },
      { name: "Original Metadata", detected: true, confidence: 98, description: "Complete EXIF data chain with valid camera signature" },
    ],
    notDetected: ["GAN Artifacts", "Facial Inconsistency", "Edge Anomalies", "Texture Irregularity", "Compression Artifacts"],
    reasoning: [
      "Multi-agent forensic analysis initiated on Authentic_Photo.jpg",
      "Visual Agent: No GAN fingerprints detected in frequency domain",
      "Temporal Agent: Static image - frame consistency N/A",
      "Audio Agent: No audio track present",
      "Metadata Agent: Complete EXIF chain verified - Canon EOS R5",
      "Arbiter Agent: All agents report authentic signatures",
      "HIGH CONFIDENCE AUTHENTIC - No manipulation indicators",
      "FINAL VERDICT: AUTHENTIC (97% confidence)"
    ]
  }
};

export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoScenarioIndex, setDemoScenarioIndex] = useState(0);
  const [demoFiles, setDemoFiles] = useState<UploadedFile[]>([]);
  const [isDemoAnalyzing, setIsDemoAnalyzing] = useState(false);
  const [demoComplete, setDemoComplete] = useState(false);
  const [demoResult, setDemoResult] = useState<AnalysisResult | null>(null);
  const [currentDemoLabel, setCurrentDemoLabel] = useState<string>("");
  const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scenarios: DemoScenario[] = ['deepfake', 'authentic'];

  const generateDemoResult = useCallback((scenario: DemoScenario): AnalysisResult => {
    const config = demoScenarios[scenario];
    const hashBase = `demo-${scenario}-${Date.now()}`;
    let mediaHash = '';
    for (let i = 0; i < 64; i++) {
      mediaHash += ((hashBase.charCodeAt(i % hashBase.length) * (i + 1)) % 16).toString(16);
    }

    return {
      verdict: config.verdict,
      confidence: config.confidence,
      indicators: config.indicators,
      notDetected: config.notDetected,
      processingTime: 4.8 + Math.random() * 0.4, // ~5s
      heatmapRegions: [
        { x: 25, y: 20, width: 25, height: 30, intensity: scenario === 'deepfake' ? 85 : 15, label: scenario === 'deepfake' ? "Face: Anomaly" : "Face: Normal" },
        { x: 55, y: 25, width: 20, height: 25, intensity: scenario === 'deepfake' ? 72 : 12, label: scenario === 'deepfake' ? "Eyes: Suspicious" : "Eyes: Normal" },
        { x: 35, y: 55, width: 30, height: 20, intensity: scenario === 'deepfake' ? 68 : 8, label: scenario === 'deepfake' ? "Mouth: Irregular" : "Mouth: Normal" },
      ],
      timelineMarkers: [
        { timestamp: 1, type: scenario === 'deepfake' ? 'anomaly' : 'info', label: "Visual Analysis", description: scenario === 'deepfake' ? "GAN artifacts detected" : "No anomalies" },
        { timestamp: 2, type: scenario === 'deepfake' ? 'warning' : 'info', label: "Edge Detection", description: scenario === 'deepfake' ? "Irregular boundaries" : "Natural edges" },
        { timestamp: 3, type: scenario === 'deepfake' ? 'anomaly' : 'info', label: "Texture Analysis", description: scenario === 'deepfake' ? "Unnatural patterns" : "Consistent texture" },
      ],
      audioSegments: [],
      reasoning: config.reasoning,
      mediaHash,
      detectionMethods: ["Pixel Noise Analysis", "Sobel Edge Detection", "Color Histogram", "JPEG Artifact Detection", "Symmetry Check", "LBP Texture"]
    };
  }, []);

  const startDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setDemoScenarioIndex(0);
    runDemoScenario(0);
  }, []);

  const runDemoScenario = useCallback((index: number) => {
    const scenario = scenarios[index];
    const config = demoScenarios[scenario];
    
    setCurrentDemoLabel(scenario === 'deepfake' ? '🔴 DEEPFAKE SAMPLE' : '🟢 AUTHENTIC SAMPLE');
    
    // Create mock file
    const mockFile: UploadedFile = {
      file: new File(["demo"], config.name, { type: "image/jpeg" }),
      type: 'image',
      preview: scenario === 'deepfake' 
        ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23dc2626' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-size='24' font-family='sans-serif'%3EDEEPFAKE SAMPLE%3C/text%3E%3C/svg%3E"
        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%2222c55e' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-size='24' font-family='sans-serif'%3EAUTHENTIC SAMPLE%3C/text%3E%3C/svg%3E",
      id: `demo-${scenario}-${Date.now()}`
    };
    
    setDemoFiles([mockFile]);
    setIsDemoAnalyzing(true);
    setDemoComplete(false);
    setDemoResult(null);

    // Simulate analysis time (~5 seconds)
    demoTimeoutRef.current = setTimeout(() => {
      const result = generateDemoResult(scenario);
      setDemoResult(result);
      setIsDemoAnalyzing(false);
      setDemoComplete(true);

      // After showing result for 4 seconds, move to next scenario
      demoTimeoutRef.current = setTimeout(() => {
        const nextIndex = (index + 1) % scenarios.length;
        setDemoScenarioIndex(nextIndex);
        runDemoScenario(nextIndex);
      }, 4000);
    }, 5000);
  }, [generateDemoResult]);

  const stopDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setIsDemoAnalyzing(false);
    setDemoComplete(false);
    setDemoResult(null);
    setDemoFiles([]);
    setCurrentDemoLabel("");
    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
      demoTimeoutRef.current = null;
    }
  }, []);

  return {
    isDemoMode,
    demoFiles,
    isDemoAnalyzing,
    demoComplete,
    demoResult,
    currentDemoLabel,
    startDemoMode,
    stopDemoMode
  };
};
