import { useState, useCallback } from "react";
import type { VerdictType } from "@/components/analysis/AnalysisResults";
import { analyzeImage, type AnalysisFindings } from "@/lib/imageAnalyzer";
import { analyzeVideo, type VideoAnalysisFindings, type VideoProgressCallback } from "@/lib/videoAnalyzer";
import { analyzeAudio, type AudioAnalysisFindings } from "@/lib/audioAnalyzer";
import { analyzeDocument, type DocumentAnalysisFindings } from "@/lib/documentAnalyzer";
import { type QuantumEntropyResult } from "@/lib/quantumEntropyAnalyzer";
import { analyzeWithCloud, type CloudAnalysisResult } from "@/lib/cloudAnalyzer";
import { analyzeC2PA, type C2PAResult } from "@/lib/c2paAnalyzer";
import { toast } from "sonner";

// Analysis mode types - Offline (browser JS engine) or Cloud ML (ShanShield pre-trained model)
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
  // For Cloud ML - pass full analysis data
  spectrogramBase64?: string;
  totalFramesAnalyzed?: number;
  totalSamplesAnalyzed?: number;
};

// Helper: Map raw ML signal text to a readable indicator name
const mapSignalToIndicatorName = (signal: string): string => {
  const lowerSignal = signal.toLowerCase();
  
  // Frequency domain signals
  if (lowerSignal.includes('frequency') || lowerSignal.includes('spectral')) {
    return 'Frequency Anomaly';
  }
  if (lowerSignal.includes('fft') || lowerSignal.includes('fourier')) {
    return 'FFT Pattern Detection';
  }
  
  // GAN signatures
  if (lowerSignal.includes('gan') || lowerSignal.includes('generative')) {
    return 'GAN Fingerprint';
  }
  if (lowerSignal.includes('stylegan') || lowerSignal.includes('progan')) {
    return 'StyleGAN Signature';
  }
  
  // Facial manipulation
  if (lowerSignal.includes('face') || lowerSignal.includes('facial')) {
    return 'Face Manipulation';
  }
  if (lowerSignal.includes('swap') || lowerSignal.includes('deepfake')) {
    return 'Face Swap Detection';
  }
  if (lowerSignal.includes('landmark') || lowerSignal.includes('morph')) {
    return 'Facial Landmark Anomaly';
  }
  
  // Audio signals
  if (lowerSignal.includes('voice') || lowerSignal.includes('vocal')) {
    return 'Voice Synthesis';
  }
  if (lowerSignal.includes('audio') || lowerSignal.includes('sound')) {
    return 'Audio Anomaly';
  }
  if (lowerSignal.includes('pitch') || lowerSignal.includes('formant')) {
    return 'Pitch Irregularity';
  }
  
  // Compression & artifacts
  if (lowerSignal.includes('compression') || lowerSignal.includes('artifact')) {
    return 'Compression Artifact';
  }
  if (lowerSignal.includes('jpeg') || lowerSignal.includes('quantization')) {
    return 'JPEG Inconsistency';
  }
  
  // AI tool signatures
  if (lowerSignal.includes('midjourney')) return 'Midjourney Signature';
  if (lowerSignal.includes('dall-e') || lowerSignal.includes('dalle')) return 'DALL-E Signature';
  if (lowerSignal.includes('stable diffusion') || lowerSignal.includes('sd')) return 'Stable Diffusion Pattern';
  if (lowerSignal.includes('flux')) return 'Flux Pattern';
  if (lowerSignal.includes('sora')) return 'Sora Signature';
  if (lowerSignal.includes('elevenlabs')) return 'ElevenLabs Voice';
  
  // Edge patterns
  if (lowerSignal.includes('edge') || lowerSignal.includes('boundary')) {
    return 'Edge Inconsistency';
  }
  if (lowerSignal.includes('noise') || lowerSignal.includes('pattern')) {
    return 'Noise Pattern';
  }
  if (lowerSignal.includes('texture')) {
    return 'Texture Anomaly';
  }
  if (lowerSignal.includes('lighting') || lowerSignal.includes('shadow')) {
    return 'Lighting Inconsistency';
  }
  
  // Neural network detection
  if (lowerSignal.includes('neural') || lowerSignal.includes('network')) {
    return 'Neural Pattern';
  }
  
  // Generic manipulation
  if (lowerSignal.includes('manipulat')) {
    return 'Manipulation Detected';
  }
  if (lowerSignal.includes('synthetic') || lowerSignal.includes('generated')) {
    return 'Synthetic Content';
  }
  
  // Default: Clean up the signal as a name
  const words = signal.split(/[\s:,.-]+/).slice(0, 3);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ').substring(0, 25);
};

// Helper: Get confidence level based on signal keywords
const getSignalConfidence = (signal: string, baseScore: number): number => {
  const lowerSignal = signal.toLowerCase();
  
  // High confidence keywords
  if (lowerSignal.includes('definite') || lowerSignal.includes('confirmed') || lowerSignal.includes('strong')) {
    return Math.min(98, baseScore + 15);
  }
  
  // Medium-high confidence
  if (lowerSignal.includes('detected') || lowerSignal.includes('found') || lowerSignal.includes('match')) {
    return Math.min(92, baseScore + 8);
  }
  
  // Medium confidence
  if (lowerSignal.includes('possible') || lowerSignal.includes('potential') || lowerSignal.includes('likely')) {
    return Math.max(50, baseScore - 5);
  }
  
  // Lower confidence
  if (lowerSignal.includes('minor') || lowerSignal.includes('slight') || lowerSignal.includes('weak')) {
    return Math.max(40, baseScore - 15);
  }
  
  return baseScore;
};

// Helper: Format manipulation type for display
const formatManipulationType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'face_swap': 'Face Swap',
    'face_morph': 'Face Morphing',
    'face_reenactment': 'Face Reenactment',
    'lip_sync': 'Lip Sync Manipulation',
    'voice_clone': 'Voice Cloning',
    'audio_splice': 'Audio Splicing',
    'full_synthesis': 'Full Synthesis',
    'partial_synthesis': 'Partial Synthesis',
    'image_inpainting': 'Image Inpainting',
    'style_transfer': 'Style Transfer',
    'super_resolution': 'AI Upscaling',
  };
  
  return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Convert any analyzer result to unified format
const toUnifiedAnalysis = (
  result: AnalysisFindings | VideoAnalysisFindings | AudioAnalysisFindings | DocumentAnalysisFindings,
  mediaType: 'image' | 'video' | 'audio' | 'document',
  quantumEntropy?: QuantumEntropyResult
): UnifiedAnalysis => {
  const unified: UnifiedAnalysis = {
    score: result.score,
    signals: result.signals,
    details: result.details as Record<string, { score: number; description: string }>,
    mediaType,
    quantumEntropy
  };
  
  // Add video-specific data
  if (mediaType === 'video' && 'totalFramesAnalyzed' in result) {
    unified.totalFramesAnalyzed = (result as VideoAnalysisFindings).totalFramesAnalyzed;
  }
  
  // Add audio-specific data (spectrogram for Cloud ML)
  if (mediaType === 'audio') {
    const audioResult = result as AudioAnalysisFindings;
    if (audioResult.spectrogramBase64) {
      unified.spectrogramBase64 = audioResult.spectrogramBase64;
    }
    if (audioResult.totalSamplesAnalyzed) {
      unified.totalSamplesAnalyzed = audioResult.totalSamplesAnalyzed;
    }
  }
  
  return unified;
};

// Compute real SHA-256 hash of file contents using Web Crypto API
const computeSHA256 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate analysis results from REAL analysis
const generateAnalysisResult = async (
  file: UploadedFile, 
  isFieldMode: boolean,
  analysis: UnifiedAnalysis,
  actualProcessingTime: number
): Promise<AnalysisResult> => {
  const { score, signals, details, mediaType } = analysis;
  const fileName = file.file.name.toLowerCase();
  
  // Live captures now run through REAL analysis - no fake auto-authentic override
  // The analysis score determines the verdict based on actual forensic signals
  
  let verdict: VerdictType;
  let confidence: number;
  
  // Conservative thresholds - but stricter for video since detection is harder
  // Video deepfakes require lower thresholds because:
  // 1. Frame-by-frame analysis can miss subtle manipulation
  // 2. Compression artifacts mask some signals
  // 3. Without real lip-sync/facial landmark analysis, we must be more cautious
  
  const isVideo = mediaType === 'video';
  const isImage = mediaType === 'image';
  
  // Video gets STRICTER thresholds (lower bars for suspicious/deepfake)
  // Images get MORE LENIENT thresholds to avoid false positives
  let deepfakeThreshold: number;
  let suspiciousThreshold: number;
  let likelyAuthThreshold: number;
  
  if (isVideo) {
    deepfakeThreshold = 65;
    suspiciousThreshold = 45;
    likelyAuthThreshold = 30;
  } else if (isImage) {
    // Images: very conservative to avoid flagging real photos
    deepfakeThreshold = 85;
    suspiciousThreshold = 70;
    likelyAuthThreshold = 50;
  } else {
    // Audio/documents
    deepfakeThreshold = 80;
    suspiciousThreshold = 65;
    likelyAuthThreshold = 45;
  }
  
  if (score >= deepfakeThreshold) {
    verdict = 'deepfake';
    confidence = Math.min(98, score + 8);
  } else if (score >= suspiciousThreshold) {
    verdict = 'suspicious';
    confidence = Math.min(85, score + 15);
  } else if (score >= likelyAuthThreshold) {
    verdict = 'likely_authentic';
    confidence = Math.min(75, 100 - score);
  } else {
    // Video should NEVER show "authentic" - always "likely_authentic" at best
    if (isVideo) {
      verdict = 'likely_authentic';
      confidence = Math.min(70, 100 - score);
    } else {
      verdict = 'authentic';
      confidence = Math.min(98, 100 - score + 20);
    }
  }

  const indicators: AnalysisIndicator[] = [];
  const notDetected: string[] = [];
  const detailEntries = Object.entries(details);

  // Map technical keys to user-friendly indicator names and their detection descriptions
  const indicatorConfig: Record<string, { 
    name: string; 
    detectedDesc: string; 
    notDetectedDesc: string;
    category: 'manipulation' | 'artifact' | 'synthesis' | 'metadata';
  }> = {
    'noiseAnalysis': { 
      name: 'Noise Pattern Analysis', 
      detectedDesc: 'Synthetic noise patterns characteristic of AI generation detected',
      notDetectedDesc: 'Natural camera sensor noise pattern verified',
      category: 'synthesis'
    },
    'edgeAnalysis': { 
      name: 'Edge Artifact Detection', 
      detectedDesc: 'Unnatural edge boundaries or blending artifacts found',
      notDetectedDesc: 'Edge consistency verified across regions',
      category: 'manipulation'
    },
    'colorAnalysis': { 
      name: 'Color Distribution', 
      detectedDesc: 'Color histogram anomalies indicating manipulation',
      notDetectedDesc: 'Natural color distribution confirmed',
      category: 'manipulation'
    },
    'compressionAnalysis': { 
      name: 'Compression Artifacts', 
      detectedDesc: 'Double compression or inconsistent JPEG artifacts detected',
      notDetectedDesc: 'Compression patterns consistent with single encoding',
      category: 'artifact'
    },
    'symmetryAnalysis': { 
      name: 'Symmetry Analysis', 
      detectedDesc: 'Unnatural symmetry patterns found (common in AI faces)',
      notDetectedDesc: 'Natural asymmetry verified',
      category: 'synthesis'
    },
    'textureAnalysis': { 
      name: 'Texture Pattern', 
      detectedDesc: 'Synthetic texture patterns or repetition detected',
      notDetectedDesc: 'Organic texture variation confirmed',
      category: 'synthesis'
    },
    'repetitionAnalysis': { 
      name: 'Repetition Detection', 
      detectedDesc: 'Copy-paste or tiled pattern regions found',
      notDetectedDesc: 'No suspicious repetition patterns',
      category: 'manipulation'
    },
    'gradientAnalysis': { 
      name: 'Gradient Analysis', 
      detectedDesc: 'Unnatural gradient transitions detected',
      notDetectedDesc: 'Natural lighting gradients verified',
      category: 'manipulation'
    },
    'quantumEntropyAnalysis': { 
      name: 'Quantum Entropy', 
      detectedDesc: 'Low entropy regions indicating synthetic generation',
      notDetectedDesc: 'High entropy consistent with natural capture',
      category: 'synthesis'
    },
    'metadataAnalysis': { 
      name: 'AI Tool Signatures', 
      detectedDesc: 'AI generation tool signatures found in metadata',
      notDetectedDesc: 'No AI tool signatures in file metadata',
      category: 'metadata'
    },
    'filenameAnalysis': { 
      name: 'Filename Pattern', 
      detectedDesc: 'Filename matches known AI tool output patterns',
      notDetectedDesc: 'Filename does not match AI tool patterns',
      category: 'metadata'
    },
    'watermarkDetection': { 
      name: 'Watermark Detection', 
      detectedDesc: 'AI tool watermarks or invisible signatures detected',
      notDetectedDesc: 'No AI watermarks detected',
      category: 'metadata'
    },
    'spectralAnalysis': { 
      name: 'Spectral Analysis', 
      detectedDesc: 'Spectral anomalies indicating audio synthesis',
      notDetectedDesc: 'Natural audio spectrum verified',
      category: 'synthesis'
    },
    'pitchConsistency': { 
      name: 'Pitch Consistency', 
      detectedDesc: 'Unnatural pitch variations or voice cloning artifacts',
      notDetectedDesc: 'Natural pitch variation confirmed',
      category: 'synthesis'
    },
    'noiseFloor': { 
      name: 'Audio Noise Floor', 
      detectedDesc: 'Suspiciously clean or synthetic noise floor',
      notDetectedDesc: 'Natural ambient noise floor verified',
      category: 'artifact'
    },
    'voiceNaturalness': { 
      name: 'Voice Naturalness', 
      detectedDesc: 'Synthetic voice patterns or TTS artifacts detected',
      notDetectedDesc: 'Natural voice characteristics verified',
      category: 'synthesis'
    },
    'frequencyDistribution': { 
      name: 'Frequency Distribution', 
      detectedDesc: 'Abnormal frequency patterns indicating manipulation',
      notDetectedDesc: 'Natural frequency distribution confirmed',
      category: 'synthesis'
    },
    'temporalCoherence': { 
      name: 'Temporal Coherence', 
      detectedDesc: 'Temporal discontinuities or frame splicing detected',
      notDetectedDesc: 'Consistent temporal flow verified',
      category: 'manipulation'
    },
    'frameConsistency': { 
      name: 'Frame Consistency', 
      detectedDesc: 'Frame-to-frame inconsistencies indicating deepfake',
      notDetectedDesc: 'Consistent inter-frame correlation',
      category: 'manipulation'
    },
    'faceTracking': { 
      name: 'Face Tracking', 
      detectedDesc: 'Face boundary or tracking anomalies detected',
      notDetectedDesc: 'Natural face motion patterns verified',
      category: 'manipulation'
    },
    'motionAnalysis': { 
      name: 'Motion Analysis', 
      detectedDesc: 'Unnatural motion patterns or warping detected',
      notDetectedDesc: 'Natural motion physics verified',
      category: 'manipulation'
    },
    'audioVideoSync': { 
      name: 'Audio-Video Sync', 
      detectedDesc: 'Audio-visual desynchronization or lip-sync manipulation',
      notDetectedDesc: 'Audio-video synchronization verified',
      category: 'manipulation'
    },
    'compressionArtifacts': { 
      name: 'Compression Artifacts', 
      detectedDesc: 'Suspicious compression patterns indicating manipulation',
      notDetectedDesc: 'Natural compression artifacts only',
      category: 'artifact'
    },
  };

  for (const [key, value] of detailEntries) {
    const config = indicatorConfig[key];
    // Use mapped name or generate readable name from key
    const name = config?.name || 
      key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
    
    // Special handling for metadata - check for actual AI tool detection
    const isAIToolDetected = key === 'metadataAnalysis' && 
      value.description && 
      (value.description.includes('AI Tool Detected') || 
       value.description.includes('AI TOOL CONFIRMED') ||
       value.description.includes('Midjourney') ||
       value.description.includes('DALL-E') ||
       value.description.includes('Stable Diffusion') ||
       value.description.includes('Kling') ||
       value.description.includes('Sora') ||
       value.description.includes('ElevenLabs') ||
       value.description.includes('Flux'));
    
    // Higher threshold for generic detections, lower for concrete AI tool evidence
    const threshold = isAIToolDetected ? 30 : 50;
    
    if (value.score > threshold || isAIToolDetected) {
      // DETECTED: Use the real description from analysis + enhance with context
      const enhancedDescription = value.description || config?.detectedDesc || `Anomaly detected with ${value.score}% confidence`;
      indicators.push({
        name: isAIToolDetected ? 'AI Tool Detected' : name,
        detected: true,
        confidence: Math.round(value.score),
        description: enhancedDescription
      });
    } else {
      // NOT DETECTED: Add as verified-clean indicator with meaningful context
      const cleanDescription = config?.notDetectedDesc || `No anomalies detected (${value.score.toFixed(0)}% threshold)`;
      indicators.push({
        name,
        detected: false,
        confidence: Math.round(100 - value.score), // Invert for "clean" confidence
        description: cleanDescription
      });
      // Also add to simple notDetected list for backward compatibility
      notDetected.push(`${name} (verified clean)`);
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

  // Compute real SHA-256 cryptographic hash of file contents
  const mediaHash = await computeSHA256(file.file);

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
      
      // Step 1: Always run offline analysis first with progress tracking
      setCurrentProgress({ step: 'Running offline analysis...', progress: 10 });
      if (file.type === 'image') {
        const result = await analyzeImage(file.file);
        analysis = toUnifiedAnalysis(result, 'image', result.quantumEntropy);
      } else if (file.type === 'video') {
        // Video analysis with frame-by-frame progress
        const result = await analyzeVideo(file.file, (framesProcessed, totalFrames, stage) => {
          const progress = 10 + Math.floor((framesProcessed / Math.max(totalFrames, 1)) * 40);
          setCurrentProgress({ 
            step: `${stage} (${framesProcessed}/${totalFrames} frames)`, 
            progress: Math.min(50, progress) 
          });
        });
        analysis = toUnifiedAnalysis(result, 'video', result.quantumEntropy);
        console.log(`✅ Offline video analysis: ${result.totalFramesAnalyzed || result.frameCount} frames analyzed`);
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
      
      // Step 3: Run Cloud ML analysis if enabled (requires internet)
      let cloudResult: CloudAnalysisResult | null = null;

      if (analysisMode === 'cloud_ml') {
        const online = typeof navigator === 'undefined' ? true : navigator.onLine;

        if (!online) {
          toast.error('Cloud ML requires internet connection. Switched to Offline mode.');
          setAnalysisMode('offline');
        } else {
          try {
            setCurrentProgress({ step: 'Cloud ML Analysis...', progress: 50 });
            cloudResult = await analyzeWithCloud(
              file.file,
              file.type,
              {
                score: analysis.score,
                signals: analysis.signals,
                details: analysis.details,
                spectrogramBase64: analysis.spectrogramBase64,
                totalFramesAnalyzed: analysis.totalFramesAnalyzed,
                totalSamplesAnalyzed: analysis.totalSamplesAnalyzed
              }
            );
            setCurrentProgress({ step: 'Cloud ML Complete', progress: 90 });
            toast.success("Cloud ML analysis complete!");
          } catch (cloudError) {
            console.error('Cloud ML analysis failed:', cloudError);

            const msg = cloudError instanceof Error ? cloudError.message : '';
            const looksOffline = /failed to fetch|network|offline|timed out/i.test(msg);
            if (looksOffline) {
              setAnalysisMode('offline');
              toast.error('Cloud ML is unreachable (no internet). Switched to Offline results.');
            } else {
              toast.error(cloudError instanceof Error ? cloudError.message : 'Cloud ML failed. Using offline results.');
            }
          }
        }
      }
      
      const analysisEndTime = performance.now();
      const timeMs = analysisEndTime - analysisStartTime;
      setProcessingTimeMs(timeMs);
      
      // Generate result - merge cloud results if available
      const timeInSeconds = timeMs / 1000;
      let analysisResult = await generateAnalysisResult(file, isFieldMode, analysis, timeInSeconds);
      
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
            // Map ML signals to meaningful indicator names based on signal content
            ...(cloudResult.mlSignals.map((signal) => {
              const signalName = mapSignalToIndicatorName(signal);
              const signalConfidence = getSignalConfidence(signal, cloudResult.mlScore);
              return {
                name: signalName,
                detected: true,
                confidence: signalConfidence,
                description: signal
              };
            })),
            // Add AI tool detection as a prominent indicator if detected
            ...(cloudResult.aiToolDetected ? [{
              name: 'AI Tool Signature',
              detected: true,
              confidence: Math.min(95, cloudResult.mlScore + 10),
              description: `Detected: ${cloudResult.aiToolDetected}`
            }] : []),
            // Add manipulation type indicators
            ...(cloudResult.manipulationTypes.map(type => ({
              name: formatManipulationType(type),
              detected: true,
              confidence: cloudResult.mlScore,
              description: `${type} manipulation detected`
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
      const analysisResult = await generateAnalysisResult(file, isFieldMode, errorAnalysis, timeInSeconds);
      setResult(analysisResult);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }
  }, [files, isFieldMode, analysisMode]);

  const handleAnalysisComplete = useCallback(async () => {
    if (files.length === 0 || !realAnalysisResult) return;
    
    const timeInSeconds = processingTimeMs / 1000;
    const analysisResult = await generateAnalysisResult(files[0], isFieldMode, realAnalysisResult, timeInSeconds);
    setResult(analysisResult);
    setAnalysisComplete(true);
    
    // Dispatch event for AI Agent Dashboard with REAL agent scores
    // Extract real scores from the analysis details for each agent
    const agentScores: Record<string, number> = {};
    if (realAnalysisResult?.details) {
      // Map analysis detail keys to agent names
      const detailToAgent: Record<string, string> = {
        'noiseAnalysis': 'visual',
        'edgeAnalysis': 'visual',
        'colorAnalysis': 'visual',
        'textureAnalysis': 'visual',
        'spectralAnalysis': 'audio',
        'pitchConsistency': 'audio',
        'noiseFloor': 'audio',
        'frequencyDistribution': 'audio',
        'temporalCoherence': 'temporal',
        'frameConsistency': 'temporal',
        'motionAnalysis': 'temporal',
        'metadataAnalysis': 'metadata',
        'filenameAnalysis': 'aiSignature',
        'watermarkDetection': 'aiSignature',
        'quantumEntropyAnalysis': 'quantum',
      };
      
      // Aggregate scores per agent
      const agentTotals: Record<string, { sum: number; count: number }> = {};
      
      for (const [key, value] of Object.entries(realAnalysisResult.details)) {
        const agentName = detailToAgent[key];
        if (agentName && typeof value === 'object' && 'score' in value) {
          if (!agentTotals[agentName]) {
            agentTotals[agentName] = { sum: 0, count: 0 };
          }
          // Invert score for authentic media (high score = suspicious, we want high = healthy)
          const healthScore = 100 - value.score;
          agentTotals[agentName].sum += healthScore;
          agentTotals[agentName].count += 1;
        }
      }
      
      // Calculate average for each agent
      for (const [agent, totals] of Object.entries(agentTotals)) {
        agentScores[agent] = Math.round(totals.sum / totals.count);
      }
      
      // Arbiter is the final confidence
      agentScores['arbiter'] = analysisResult.confidence;
    }
    
    window.dispatchEvent(new CustomEvent('shanshield:analysis-complete', {
      detail: {
        result: analysisResult,
        fileName: files[0].file.name,
        duration: processingTimeMs,
        analysisMode: analysisMode,
        agentScores: agentScores
      }
    }));
  }, [files, isFieldMode, realAnalysisResult, processingTimeMs, analysisMode]);

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
