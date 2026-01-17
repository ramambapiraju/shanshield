// Real Video Analysis - Frame-by-frame analysis for deepfake detection
import { analyzeQuantumEntropy, type QuantumEntropyResult } from './quantumEntropyAnalyzer';
import { analyzeMetadata, extractFirstFrame, type MetadataAnalysisResult } from './metadataAnalyzer';

export interface VideoAnalysisFindings {
  score: number;
  signals: string[];
  details: {
    frameConsistency: { score: number; description: string };
    temporalCoherence: { score: number; description: string };
    faceTracking: { score: number; description: string };
    compressionAnalysis: { score: number; description: string };
    motionAnalysis: { score: number; description: string };
    audioVideoSync: { score: number; description: string };
    metadataAnalysis: { score: number; description: string };
  };
  frameCount: number;
  duration: number;
  quantumEntropy?: QuantumEntropyResult;
  metadata?: MetadataAnalysisResult;
}

// Extract frames from video
const extractFrames = (video: HTMLVideoElement, numFrames: number = 10): Promise<ImageData[]> => {
  return new Promise((resolve) => {
    const frames: ImageData[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const duration = video.duration;
    const interval = duration / (numFrames + 1);
    
    canvas.width = Math.min(256, video.videoWidth);
    canvas.height = Math.min(256, video.videoHeight);
    
    let currentFrame = 0;
    
    const captureFrame = () => {
      if (currentFrame >= numFrames) {
        resolve(frames);
        return;
      }
      
      const time = interval * (currentFrame + 1);
      video.currentTime = time;
    };
    
    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      frames.push(imageData);
      currentFrame++;
      captureFrame();
    };
    
    captureFrame();
  });
};

// Analyze frame consistency - deepfakes often have flickering or inconsistent regions
const analyzeFrameConsistency = (frames: ImageData[]): { score: number; description: string } => {
  if (frames.length < 2) {
    return { score: 20, description: 'Insufficient frames for consistency analysis' };
  }
  
  const inconsistencies: number[] = [];
  
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1].data;
    const curr = frames[i].data;
    let diff = 0;
    let pixelCount = 0;
    
    // Sample every 4th pixel for performance
    for (let p = 0; p < prev.length; p += 16) {
      diff += Math.abs(prev[p] - curr[p]) + 
              Math.abs(prev[p + 1] - curr[p + 1]) + 
              Math.abs(prev[p + 2] - curr[p + 2]);
      pixelCount++;
    }
    
    inconsistencies.push(diff / pixelCount);
  }
  
  const avgDiff = inconsistencies.reduce((a, b) => a + b, 0) / inconsistencies.length;
  const variance = inconsistencies.reduce((sum, val) => sum + Math.pow(val - avgDiff, 2), 0) / inconsistencies.length;
  const stdDev = Math.sqrt(variance);
  
  // High variance in frame differences indicates potential manipulation
  const coeffOfVariation = (stdDev / avgDiff) * 100;
  
  let score = 0;
  let description = '';
  
  if (coeffOfVariation > 80) {
    score = 70 + Math.min(30, (coeffOfVariation - 80) / 2);
    description = `High frame inconsistency detected (CV: ${coeffOfVariation.toFixed(1)}%) - possible frame interpolation`;
  } else if (coeffOfVariation > 50) {
    score = 40 + (coeffOfVariation - 50);
    description = `Moderate frame variation (CV: ${coeffOfVariation.toFixed(1)}%)`;
  } else {
    score = coeffOfVariation * 0.8;
    description = `Consistent frame transitions (CV: ${coeffOfVariation.toFixed(1)}%)`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze temporal coherence - check for unnatural jumps or discontinuities
const analyzeTemporalCoherence = (frames: ImageData[]): { score: number; description: string } => {
  if (frames.length < 3) {
    return { score: 20, description: 'Insufficient frames for temporal analysis' };
  }
  
  const motionVectors: number[] = [];
  const width = frames[0].width;
  const height = frames[0].height;
  
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1].data;
    const curr = frames[i].data;
    
    // Calculate optical flow approximation
    let horizontalFlow = 0;
    let verticalFlow = 0;
    let samples = 0;
    
    for (let y = 10; y < height - 10; y += 8) {
      for (let x = 10; x < width - 10; x += 8) {
        const idx = (y * width + x) * 4;
        const prevGray = (prev[idx] + prev[idx + 1] + prev[idx + 2]) / 3;
        const currGray = (curr[idx] + curr[idx + 1] + curr[idx + 2]) / 3;
        
        // Gradient calculation
        const dxIdx = (y * width + x + 1) * 4;
        const dyIdx = ((y + 1) * width + x) * 4;
        
        const dx = ((curr[dxIdx] + curr[dxIdx + 1] + curr[dxIdx + 2]) / 3) - currGray;
        const dy = ((curr[dyIdx] + curr[dyIdx + 1] + curr[dyIdx + 2]) / 3) - currGray;
        const dt = currGray - prevGray;
        
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          horizontalFlow += dt * Math.sign(dx);
          verticalFlow += dt * Math.sign(dy);
          samples++;
        }
      }
    }
    
    if (samples > 0) {
      motionVectors.push(Math.sqrt(Math.pow(horizontalFlow / samples, 2) + Math.pow(verticalFlow / samples, 2)));
    }
  }
  
  if (motionVectors.length < 2) {
    return { score: 25, description: 'Limited motion data available' };
  }
  
  // Check for sudden motion discontinuities
  let discontinuities = 0;
  for (let i = 1; i < motionVectors.length; i++) {
    const ratio = motionVectors[i] / (motionVectors[i - 1] + 0.01);
    if (ratio > 3 || ratio < 0.33) {
      discontinuities++;
    }
  }
  
  const discontinuityRate = (discontinuities / motionVectors.length) * 100;
  
  let score = 0;
  let description = '';
  
  if (discontinuityRate > 40) {
    score = 65 + discontinuityRate / 2;
    description = `Severe temporal discontinuities detected (${discontinuityRate.toFixed(1)}% of transitions)`;
  } else if (discontinuityRate > 20) {
    score = 35 + discontinuityRate;
    description = `Moderate motion discontinuities (${discontinuityRate.toFixed(1)}%)`;
  } else {
    score = discontinuityRate * 1.5;
    description = `Smooth temporal flow (${discontinuityRate.toFixed(1)}% discontinuities)`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze face region tracking - look for warping artifacts
const analyzeFaceTracking = (frames: ImageData[]): { score: number; description: string } => {
  if (frames.length < 2) {
    return { score: 20, description: 'Insufficient frames for face tracking' };
  }
  
  const width = frames[0].width;
  const height = frames[0].height;
  
  // Analyze central region (likely face area)
  const faceRegion = {
    x: Math.floor(width * 0.25),
    y: Math.floor(height * 0.1),
    w: Math.floor(width * 0.5),
    h: Math.floor(height * 0.6)
  };
  
  const regionChanges: number[] = [];
  
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1].data;
    const curr = frames[i].data;
    let regionDiff = 0;
    let outerDiff = 0;
    let regionPixels = 0;
    let outerPixels = 0;
    
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const idx = (y * width + x) * 4;
        const diff = Math.abs(prev[idx] - curr[idx]) + 
                     Math.abs(prev[idx + 1] - curr[idx + 1]) + 
                     Math.abs(prev[idx + 2] - curr[idx + 2]);
        
        if (x >= faceRegion.x && x < faceRegion.x + faceRegion.w &&
            y >= faceRegion.y && y < faceRegion.y + faceRegion.h) {
          regionDiff += diff;
          regionPixels++;
        } else {
          outerDiff += diff;
          outerPixels++;
        }
      }
    }
    
    const avgRegion = regionDiff / (regionPixels || 1);
    const avgOuter = outerDiff / (outerPixels || 1);
    regionChanges.push(avgRegion / (avgOuter + 0.01));
  }
  
  // Face region changing differently from background is suspicious
  const avgRatio = regionChanges.reduce((a, b) => a + b, 0) / regionChanges.length;
  
  let score = 0;
  let description = '';
  
  if (avgRatio > 2.5) {
    score = 60 + Math.min(40, (avgRatio - 2.5) * 15);
    description = `Face region anomaly detected - changes ${avgRatio.toFixed(2)}x faster than background`;
  } else if (avgRatio > 1.5) {
    score = 30 + (avgRatio - 1.5) * 30;
    description = `Moderate face region variance (ratio: ${avgRatio.toFixed(2)})`;
  } else {
    score = avgRatio * 20;
    description = `Natural face-background consistency (ratio: ${avgRatio.toFixed(2)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze compression artifacts
const analyzeVideoCompression = (frames: ImageData[]): { score: number; description: string } => {
  if (frames.length === 0) {
    return { score: 20, description: 'No frames to analyze' };
  }
  
  const blockArtifacts: number[] = [];
  
  for (const frame of frames) {
    const { data, width, height } = frame;
    let blockSum = 0;
    let samples = 0;
    
    // Check for 8x8 block boundaries (common in video codecs)
    for (let y = 8; y < height - 8; y += 8) {
      for (let x = 0; x < width - 1; x++) {
        const idx1 = ((y - 1) * width + x) * 4;
        const idx2 = (y * width + x) * 4;
        
        const diff = Math.abs(data[idx1] - data[idx2]) +
                     Math.abs(data[idx1 + 1] - data[idx2 + 1]) +
                     Math.abs(data[idx1 + 2] - data[idx2 + 2]);
        
        blockSum += diff;
        samples++;
      }
    }
    
    blockArtifacts.push(blockSum / (samples || 1));
  }
  
  const avgArtifacts = blockArtifacts.reduce((a, b) => a + b, 0) / blockArtifacts.length;
  const variance = blockArtifacts.reduce((sum, val) => sum + Math.pow(val - avgArtifacts, 2), 0) / blockArtifacts.length;
  
  let score = 0;
  let description = '';
  
  // High variance suggests different compression levels (re-encoding)
  if (variance > 100 && avgArtifacts > 30) {
    score = 60 + Math.min(40, variance / 10);
    description = `Multiple compression artifacts detected (variance: ${variance.toFixed(1)})`;
  } else if (avgArtifacts > 40) {
    score = 40 + avgArtifacts / 2;
    description = `Heavy compression detected (strength: ${avgArtifacts.toFixed(1)})`;
  } else {
    score = avgArtifacts;
    description = `Normal compression level (strength: ${avgArtifacts.toFixed(1)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze motion patterns
const analyzeMotion = (frames: ImageData[]): { score: number; description: string } => {
  if (frames.length < 3) {
    return { score: 20, description: 'Insufficient frames for motion analysis' };
  }
  
  const width = frames[0].width;
  const height = frames[0].height;
  const motionMagnitudes: number[] = [];
  
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1].data;
    const curr = frames[i].data;
    let totalMotion = 0;
    let samples = 0;
    
    for (let y = 2; y < height - 2; y += 4) {
      for (let x = 2; x < width - 2; x += 4) {
        const idx = (y * width + x) * 4;
        const prevGray = (prev[idx] + prev[idx + 1] + prev[idx + 2]) / 3;
        const currGray = (curr[idx] + curr[idx + 1] + curr[idx + 2]) / 3;
        totalMotion += Math.abs(currGray - prevGray);
        samples++;
      }
    }
    
    motionMagnitudes.push(totalMotion / samples);
  }
  
  // Check for unnatural motion patterns
  let unnaturalTransitions = 0;
  for (let i = 2; i < motionMagnitudes.length; i++) {
    const acceleration = Math.abs(motionMagnitudes[i] - 2 * motionMagnitudes[i-1] + motionMagnitudes[i-2]);
    if (acceleration > 15) {
      unnaturalTransitions++;
    }
  }
  
  const unnaturalRate = (unnaturalTransitions / Math.max(1, motionMagnitudes.length - 2)) * 100;
  
  let score = 0;
  let description = '';
  
  if (unnaturalRate > 50) {
    score = 60 + unnaturalRate / 2;
    description = `Unnatural motion patterns detected (${unnaturalRate.toFixed(1)}% irregular)`;
  } else if (unnaturalRate > 25) {
    score = 30 + unnaturalRate;
    description = `Some motion irregularities (${unnaturalRate.toFixed(1)}%)`;
  } else {
    score = unnaturalRate;
    description = `Natural motion flow (${unnaturalRate.toFixed(1)}% irregular)`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Placeholder for audio-video sync (would need actual audio analysis)
const analyzeAudioVideoSync = (): { score: number; description: string } => {
  // In a real implementation, this would analyze lip sync
  // For now, return a neutral score
  return { 
    score: 30, 
    description: 'Audio-video sync analysis requires advanced lip-sync detection' 
  };
};

// Main video analysis function
export const analyzeVideo = async (file: File): Promise<VideoAnalysisFindings> => {
  // First, analyze metadata (filename, watermarks) - this catches obvious AI content
  let metadataResult: MetadataAnalysisResult | undefined;
  let firstFrameData: ImageData | undefined;
  
  try {
    firstFrameData = await extractFirstFrame(file);
    metadataResult = await analyzeMetadata(file, firstFrameData);
  } catch (e) {
    // Fallback to filename-only analysis
    metadataResult = await analyzeMetadata(file);
  }
  
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const numFrames = Math.min(15, Math.max(5, Math.floor(duration * 2)));
      
      try {
        const frames = await extractFrames(video, numFrames);
        
        const frameConsistency = analyzeFrameConsistency(frames);
        const temporalCoherence = analyzeTemporalCoherence(frames);
        const faceTracking = analyzeFaceTracking(frames);
        const compressionAnalysis = analyzeVideoCompression(frames);
        const motionAnalysis = analyzeMotion(frames);
        const audioVideoSync = analyzeAudioVideoSync();
        
        // Quantum Entropy Analysis on first frame
        let quantumEntropy: QuantumEntropyResult | undefined;
        if (frames.length > 0) {
          quantumEntropy = analyzeQuantumEntropy(frames[0]);
        }
        
        const signals: string[] = [];
        const threshold = 45; // Lowered threshold to catch more signals
        
        // Add metadata signals first (strongest indicators)
        if (metadataResult && metadataResult.signals.length > 0) {
          signals.push(...metadataResult.signals);
        }
        
        if (frameConsistency.score > threshold) signals.push(frameConsistency.description);
        if (temporalCoherence.score > threshold) signals.push(temporalCoherence.description);
        if (faceTracking.score > threshold) signals.push(faceTracking.description);
        if (compressionAnalysis.score > threshold) signals.push(compressionAnalysis.description);
        if (motionAnalysis.score > threshold) signals.push(motionAnalysis.description);
        if (audioVideoSync.score > threshold) signals.push(audioVideoSync.description);
        
        // NEW WEIGHTING: Metadata is CRITICAL (catches filenames like "kling_xxx")
        // If metadata score is very high (AI tool detected), it should dominate
        const metadataScore = metadataResult?.score || 0;
        const metadataWeight = metadataScore >= 70 ? 0.50 : metadataScore >= 40 ? 0.30 : 0.15;
        const pixelWeight = 1 - metadataWeight - 0.05; // Reserve 5% for quantum
        
        const pixelScore = (
          frameConsistency.score * 0.20 +
          temporalCoherence.score * 0.20 +
          faceTracking.score * 0.20 +
          compressionAnalysis.score * 0.15 +
          motionAnalysis.score * 0.15 +
          audioVideoSync.score * 0.10
        );
        
        const quantumScore = quantumEntropy ? quantumEntropy.anomalyScore * 100 : 0;
        
        // Combined score with dynamic metadata weighting
        const overallScore = 
          metadataScore * metadataWeight +
          pixelScore * pixelWeight +
          quantumScore * 0.05;
        
        URL.revokeObjectURL(video.src);
        
        const metadataDetail = {
          score: metadataScore,
          description: metadataResult?.detectedAITool 
            ? `AI Tool Detected: ${metadataResult.detectedAITool}`
            : 'No AI tool signatures found'
        };
        
        resolve({
          score: Math.round(Math.max(overallScore, metadataScore * 0.8)), // Ensure metadata can drive verdict
          signals,
          details: {
            frameConsistency,
            temporalCoherence,
            faceTracking,
            compressionAnalysis,
            motionAnalysis,
            audioVideoSync,
            metadataAnalysis: metadataDetail
          },
          frameCount: frames.length,
          duration,
          quantumEntropy,
          metadata: metadataResult
        });
      } catch (err) {
        console.error('Video analysis error:', err);
        URL.revokeObjectURL(video.src);
        // Even on error, metadata score can detect AI
        const fallbackScore = metadataResult?.score || 30;
        resolve({
          score: Math.max(30, fallbackScore),
          signals: metadataResult?.signals || ['Video analysis encountered an error'],
          details: {
            frameConsistency: { score: 30, description: 'Analysis failed' },
            temporalCoherence: { score: 30, description: 'Analysis failed' },
            faceTracking: { score: 30, description: 'Analysis failed' },
            compressionAnalysis: { score: 30, description: 'Analysis failed' },
            motionAnalysis: { score: 30, description: 'Analysis failed' },
            audioVideoSync: { score: 30, description: 'Analysis failed' },
            metadataAnalysis: { score: metadataResult?.score || 0, description: metadataResult?.detectedAITool || 'Unknown' }
          },
          frameCount: 0,
          duration: 0,
          metadata: metadataResult
        });
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      // Even on video load error, we can still use metadata analysis
      const fallbackScore = metadataResult?.score || 30;
      resolve({
        score: Math.max(30, fallbackScore),
        signals: metadataResult?.signals.length ? metadataResult.signals : ['Could not load video file'],
        details: {
          frameConsistency: { score: 30, description: 'Video load failed' },
          temporalCoherence: { score: 30, description: 'Video load failed' },
          faceTracking: { score: 30, description: 'Video load failed' },
          compressionAnalysis: { score: 30, description: 'Video load failed' },
          motionAnalysis: { score: 30, description: 'Video load failed' },
          audioVideoSync: { score: 30, description: 'Video load failed' },
          metadataAnalysis: { score: metadataResult?.score || 0, description: metadataResult?.detectedAITool || 'Video load failed' }
        },
        frameCount: 0,
        duration: 0,
        metadata: metadataResult
      });
    };
    
    video.src = URL.createObjectURL(file);
  });
};
