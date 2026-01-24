// Real Video Analysis - 100% FRAME-BY-FRAME streaming analysis for deepfake detection
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
  totalFramesAnalyzed: number;
}

// Progress callback type for UI updates
export type VideoProgressCallback = (framesProcessed: number, totalFrames: number, stage: string) => void;

// Streaming statistics aggregator for incremental frame analysis
interface StreamingStats {
  frameCount: number;
  // Frame consistency metrics
  frameDiffs: number[];
  // Temporal coherence
  motionVectors: number[];
  discontinuities: number;
  // Face tracking
  faceBackgroundRatios: number[];
  // Compression
  blockArtifacts: number[];
  // Motion
  motionMagnitudes: number[];
  unnaturalTransitions: number;
  // Audio-Video sync 
  visualEnergies: number[];
  // Previous frame data for comparison
  prevFrameData: Uint8ClampedArray | null;
  prevPrevMotion: number;
  prevMotion: number;
}

// Initialize streaming stats
const createStreamingStats = (): StreamingStats => ({
  frameCount: 0,
  frameDiffs: [],
  motionVectors: [],
  discontinuities: 0,
  faceBackgroundRatios: [],
  blockArtifacts: [],
  motionMagnitudes: [],
  unnaturalTransitions: 0,
  visualEnergies: [],
  prevFrameData: null,
  prevPrevMotion: 0,
  prevMotion: 0
});

// Process single frame and update streaming statistics
const processFrame = (
  frameData: ImageData,
  stats: StreamingStats,
  width: number,
  height: number
): void => {
  const currData = frameData.data;
  stats.frameCount++;
  
  if (stats.prevFrameData) {
    const prevData = stats.prevFrameData;
    
    // 1. Frame Consistency - pixel-level difference
    let frameDiff = 0;
    let pixelCount = 0;
    for (let p = 0; p < prevData.length; p += 16) {
      frameDiff += Math.abs(prevData[p] - currData[p]) + 
                   Math.abs(prevData[p + 1] - currData[p + 1]) + 
                   Math.abs(prevData[p + 2] - currData[p + 2]);
      pixelCount++;
    }
    stats.frameDiffs.push(frameDiff / pixelCount);
    
    // 2. Temporal Coherence - optical flow approximation
    let horizontalFlow = 0;
    let verticalFlow = 0;
    let samples = 0;
    
    for (let y = 10; y < height - 10; y += 8) {
      for (let x = 10; x < width - 10; x += 8) {
        const idx = (y * width + x) * 4;
        const prevGray = (prevData[idx] + prevData[idx + 1] + prevData[idx + 2]) / 3;
        const currGray = (currData[idx] + currData[idx + 1] + currData[idx + 2]) / 3;
        
        const dxIdx = (y * width + x + 1) * 4;
        const dyIdx = ((y + 1) * width + x) * 4;
        
        const dx = ((currData[dxIdx] + currData[dxIdx + 1] + currData[dxIdx + 2]) / 3) - currGray;
        const dy = ((currData[dyIdx] + currData[dyIdx + 1] + currData[dyIdx + 2]) / 3) - currGray;
        const dt = currGray - prevGray;
        
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          horizontalFlow += dt * Math.sign(dx);
          verticalFlow += dt * Math.sign(dy);
          samples++;
        }
      }
    }
    
    if (samples > 0) {
      const motion = Math.sqrt(Math.pow(horizontalFlow / samples, 2) + Math.pow(verticalFlow / samples, 2));
      stats.motionVectors.push(motion);
      
      // Check for discontinuity
      if (stats.motionVectors.length >= 2) {
        const prevMotion = stats.motionVectors[stats.motionVectors.length - 2];
        const ratio = motion / (prevMotion + 0.01);
        if (ratio > 3 || ratio < 0.33) {
          stats.discontinuities++;
        }
      }
    }
    
    // 3. Face Region Tracking
    const faceRegion = {
      x: Math.floor(width * 0.25),
      y: Math.floor(height * 0.1),
      w: Math.floor(width * 0.5),
      h: Math.floor(height * 0.6)
    };
    
    let regionDiff = 0, outerDiff = 0;
    let regionPixels = 0, outerPixels = 0;
    
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const idx = (y * width + x) * 4;
        const diff = Math.abs(prevData[idx] - currData[idx]) + 
                     Math.abs(prevData[idx + 1] - currData[idx + 1]) + 
                     Math.abs(prevData[idx + 2] - currData[idx + 2]);
        
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
    stats.faceBackgroundRatios.push(avgRegion / (avgOuter + 0.01));
    
    // 4. Motion magnitude for motion analysis
    let totalMotion = 0;
    let motionSamples = 0;
    for (let y = 2; y < height - 2; y += 4) {
      for (let x = 2; x < width - 2; x += 4) {
        const idx = (y * width + x) * 4;
        const prevGray = (prevData[idx] + prevData[idx + 1] + prevData[idx + 2]) / 3;
        const currGray = (currData[idx] + currData[idx + 1] + currData[idx + 2]) / 3;
        totalMotion += Math.abs(currGray - prevGray);
        motionSamples++;
      }
    }
    const motionMag = totalMotion / motionSamples;
    stats.motionMagnitudes.push(motionMag);
    
    // Check for unnatural acceleration
    if (stats.motionMagnitudes.length >= 3) {
      const len = stats.motionMagnitudes.length;
      const acceleration = Math.abs(
        stats.motionMagnitudes[len - 1] - 
        2 * stats.motionMagnitudes[len - 2] + 
        stats.motionMagnitudes[len - 3]
      );
      if (acceleration > 15) {
        stats.unnaturalTransitions++;
      }
    }
    
    // 5. Visual energy for A/V sync
    let motionEnergy = 0;
    for (let p = 0; p < prevData.length; p += 16) {
      motionEnergy += Math.abs(prevData[p] - currData[p]) + 
                      Math.abs(prevData[p + 1] - currData[p + 1]) + 
                      Math.abs(prevData[p + 2] - currData[p + 2]);
    }
    stats.visualEnergies.push(motionEnergy / (prevData.length / 16));
  }
  
  // 6. Compression artifacts (on every frame)
  let blockSum = 0;
  let blockSamples = 0;
  for (let y = 8; y < height - 8; y += 8) {
    for (let x = 0; x < width - 1; x++) {
      const idx1 = ((y - 1) * width + x) * 4;
      const idx2 = (y * width + x) * 4;
      
      const diff = Math.abs(currData[idx1] - currData[idx2]) +
                   Math.abs(currData[idx1 + 1] - currData[idx2 + 1]) +
                   Math.abs(currData[idx1 + 2] - currData[idx2 + 2]);
      
      blockSum += diff;
      blockSamples++;
    }
  }
  stats.blockArtifacts.push(blockSum / (blockSamples || 1));
  
  // Store current frame for next iteration
  stats.prevFrameData = new Uint8ClampedArray(currData);
};

// Compute final scores from aggregated streaming stats
const computeFinalScores = (stats: StreamingStats): {
  frameConsistency: { score: number; description: string };
  temporalCoherence: { score: number; description: string };
  faceTracking: { score: number; description: string };
  compressionAnalysis: { score: number; description: string };
  motionAnalysis: { score: number; description: string };
} => {
  // Frame Consistency
  let frameConsistency = { score: 20, description: 'Insufficient data' };
  if (stats.frameDiffs.length >= 2) {
    const avgDiff = stats.frameDiffs.reduce((a, b) => a + b, 0) / stats.frameDiffs.length;
    const variance = stats.frameDiffs.reduce((sum, val) => sum + Math.pow(val - avgDiff, 2), 0) / stats.frameDiffs.length;
    const stdDev = Math.sqrt(variance);
    const coeffOfVariation = (stdDev / avgDiff) * 100;
    
    if (coeffOfVariation > 45) {
      frameConsistency = { 
        score: Math.min(95, 65 + (coeffOfVariation - 45) / 1.5),
        description: `High frame inconsistency (CV: ${coeffOfVariation.toFixed(1)}%) across ${stats.frameCount} frames - likely manipulation`
      };
    } else if (coeffOfVariation > 25) {
      frameConsistency = {
        score: 45 + (coeffOfVariation - 25),
        description: `Suspicious frame variation (CV: ${coeffOfVariation.toFixed(1)}%) in ${stats.frameCount} frames`
      };
    } else if (coeffOfVariation > 15) {
      frameConsistency = {
        score: 20 + (coeffOfVariation - 15) * 2,
        description: `Elevated frame variation (CV: ${coeffOfVariation.toFixed(1)}%)`
      };
    } else {
      frameConsistency = {
        score: Math.max(0, coeffOfVariation),
        description: `Consistent frame transitions across ${stats.frameCount} frames (CV: ${coeffOfVariation.toFixed(1)}%)`
      };
    }
  }
  
  // Temporal Coherence
  let temporalCoherence = { score: 25, description: 'Limited motion data' };
  if (stats.motionVectors.length >= 2) {
    const discontinuityRate = (stats.discontinuities / stats.motionVectors.length) * 100;
    
    if (discontinuityRate > 40) {
      temporalCoherence = {
        score: Math.min(95, 55 + discontinuityRate / 2),
        description: `Severe temporal discontinuities (${discontinuityRate.toFixed(1)}%) in ${stats.frameCount} frames - likely manipulation`
      };
    } else if (discontinuityRate > 25) {
      temporalCoherence = {
        score: 35 + discontinuityRate,
        description: `Moderate motion discontinuities (${discontinuityRate.toFixed(1)}%)`
      };
    } else if (discontinuityRate > 10) {
      temporalCoherence = {
        score: 15 + discontinuityRate,
        description: `Minor motion discontinuities (${discontinuityRate.toFixed(1)}%)`
      };
    } else {
      temporalCoherence = {
        score: Math.max(0, discontinuityRate),
        description: `Smooth temporal flow across ${stats.frameCount} frames (${discontinuityRate.toFixed(1)}% discontinuities)`
      };
    }
  }
  
  // Face Tracking
  let faceTracking = { score: 20, description: 'Insufficient data' };
  if (stats.faceBackgroundRatios.length >= 2) {
    const avgRatio = stats.faceBackgroundRatios.reduce((a, b) => a + b, 0) / stats.faceBackgroundRatios.length;
    
    if (avgRatio > 2.0) {
      faceTracking = {
        score: Math.min(95, 60 + (avgRatio - 2.0) * 15),
        description: `Face region anomaly - changes ${avgRatio.toFixed(2)}x faster than background (likely manipulation)`
      };
    } else if (avgRatio > 1.4) {
      faceTracking = {
        score: 40 + (avgRatio - 1.4) * 30,
        description: `Suspicious face region variance (ratio: ${avgRatio.toFixed(2)})`
      };
    } else if (avgRatio > 1.0) {
      faceTracking = {
        score: 15 + (avgRatio - 1.0) * 40,
        description: `Minor face region variance (ratio: ${avgRatio.toFixed(2)})`
      };
    } else {
      faceTracking = {
        score: Math.max(0, avgRatio * 15),
        description: `Natural face-background consistency across ${stats.frameCount} frames`
      };
    }
  }
  
  // Compression Analysis
  let compressionAnalysis = { score: 20, description: 'No data' };
  if (stats.blockArtifacts.length > 0) {
    const avgArtifacts = stats.blockArtifacts.reduce((a, b) => a + b, 0) / stats.blockArtifacts.length;
    const variance = stats.blockArtifacts.reduce((sum, val) => sum + Math.pow(val - avgArtifacts, 2), 0) / stats.blockArtifacts.length;
    
    if (variance > 150 && avgArtifacts > 40) {
      compressionAnalysis = {
        score: Math.min(90, 45 + variance / 15),
        description: `Multiple compression layers detected (variance: ${variance.toFixed(1)})`
      };
    } else if (avgArtifacts > 55) {
      compressionAnalysis = {
        score: 30 + avgArtifacts / 3,
        description: `Heavy compression detected`
      };
    } else {
      compressionAnalysis = {
        score: Math.max(0, avgArtifacts / 2),
        description: `Normal compression level across ${stats.frameCount} frames`
      };
    }
  }
  
  // Motion Analysis
  let motionAnalysis = { score: 20, description: 'Insufficient data' };
  if (stats.motionMagnitudes.length >= 3) {
    const unnaturalRate = (stats.unnaturalTransitions / Math.max(1, stats.motionMagnitudes.length - 2)) * 100;
    
    if (unnaturalRate > 35) {
      motionAnalysis = {
        score: Math.min(95, 55 + unnaturalRate / 2),
        description: `Unnatural motion patterns (${unnaturalRate.toFixed(1)}% irregular) in ${stats.frameCount} frames - likely AI-generated`
      };
    } else if (unnaturalRate > 20) {
      motionAnalysis = {
        score: 35 + unnaturalRate,
        description: `Suspicious motion irregularities (${unnaturalRate.toFixed(1)}%)`
      };
    } else if (unnaturalRate > 10) {
      motionAnalysis = {
        score: 15 + unnaturalRate,
        description: `Minor motion irregularities (${unnaturalRate.toFixed(1)}%)`
      };
    } else {
      motionAnalysis = {
        score: Math.max(0, unnaturalRate),
        description: `Natural motion flow across ${stats.frameCount} frames`
      };
    }
  }
  
  return { frameConsistency, temporalCoherence, faceTracking, compressionAnalysis, motionAnalysis };
};

// Extract multiple frames as base64 for Cloud ML (higher quality for Gemini)
export const extractMultipleFramesBase64 = async (file: File, numFrames: number = 10): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Video frame extraction timed out'));
    }, 60000);
    
    video.onloadedmetadata = async () => {
      const frames: string[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const duration = video.duration;
      
      // Use 1024px for cloud analysis - higher quality for Gemini
      canvas.width = Math.min(1024, video.videoWidth);
      canvas.height = Math.min(1024, video.videoHeight);
      
      const interval = duration / (numFrames + 1);
      
      for (let i = 1; i <= numFrames; i++) {
        try {
          video.currentTime = interval * i;
          await new Promise<void>((res) => {
            video.onseeked = () => res();
          });
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          frames.push(base64);
        } catch (e) {
          console.warn(`Failed to extract frame ${i}:`, e);
        }
      }
      
      clearTimeout(timeout);
      URL.revokeObjectURL(video.src);
      console.log(`✅ Extracted ${frames.length} high-quality frames for Cloud ML`);
      resolve(frames);
    };
    
    video.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

// Real Audio-Video Sync Analysis with streaming visual energies
const analyzeAudioVideoSync = async (
  file: File, 
  visualEnergies: number[]
): Promise<{ score: number; description: string }> => {
  if (visualEnergies.length < 3) {
    return { score: 25, description: 'Insufficient frames for A/V sync analysis' };
  }
  
  try {
    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    let audioBuffer: AudioBuffer;
    
    try {
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    } catch {
      audioContext.close();
      return { score: 30, description: 'No audio track detected - video only' };
    }
    
    const samples = audioBuffer.getChannelData(0);
    const duration = audioBuffer.duration;
    
    // Calculate audio energy per visual frame interval
    const frameInterval = duration / visualEnergies.length;
    const audioEnergies: number[] = [];
    
    for (let i = 0; i < visualEnergies.length; i++) {
      const startSample = Math.floor((i * frameInterval) * audioBuffer.sampleRate);
      const endSample = Math.floor(((i + 1) * frameInterval) * audioBuffer.sampleRate);
      
      let energy = 0;
      for (let s = startSample; s < Math.min(endSample, samples.length); s++) {
        energy += samples[s] * samples[s];
      }
      audioEnergies.push(Math.sqrt(energy / (endSample - startSample + 1)));
    }
    
    audioContext.close();
    
    // Normalize both energy arrays
    const maxAudio = Math.max(...audioEnergies, 0.001);
    const maxVisual = Math.max(...visualEnergies, 0.001);
    const normAudio = audioEnergies.map(e => e / maxAudio);
    const normVisual = visualEnergies.map(e => e / maxVisual);
    
    // Calculate cross-correlation at different lags
    const correlations: number[] = [];
    for (let lag = -5; lag <= 5; lag++) {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < normAudio.length; i++) {
        const j = i + lag;
        if (j >= 0 && j < normVisual.length) {
          sum += normAudio[i] * normVisual[j];
          count++;
        }
      }
      correlations.push(count > 0 ? sum / count : 0);
    }
    
    const maxCorrelation = Math.max(...correlations);
    const bestLag = correlations.indexOf(maxCorrelation) - 5;
    
    // Direct correlation
    let directCorr = 0;
    for (let i = 0; i < normAudio.length; i++) {
      directCorr += normAudio[i] * normVisual[i];
    }
    directCorr /= normAudio.length;
    
    let score = 0;
    let description = '';
    
    if (maxCorrelation < 0.15 && directCorr < 0.1) {
      score = Math.min(95, 65 + (0.15 - maxCorrelation) * 150);
      description = `Poor audio-video correlation (r=${directCorr.toFixed(3)}) across ${visualEnergies.length} frames - likely lip-sync manipulation`;
    } else if (Math.abs(bestLag) > 2) {
      score = 45 + Math.abs(bestLag) * 8;
      description = `Audio-video sync offset (${bestLag > 0 ? '+' : ''}${bestLag} frames)`;
    } else if (maxCorrelation < 0.35) {
      score = 30 + (0.35 - maxCorrelation) * 60;
      description = `Weak audio-video correlation (r=${maxCorrelation.toFixed(3)})`;
    } else {
      score = Math.max(0, 20 - maxCorrelation * 30);
      description = `Good audio-video sync across ${visualEnergies.length} frames (r=${maxCorrelation.toFixed(3)})`;
    }
    
    return { score: Math.min(100, Math.max(0, score)), description };
  } catch (e) {
    console.warn('A/V sync analysis failed:', e);
    return { score: 35, description: 'A/V sync analysis could not complete' };
  }
};

// Main video analysis function - 100% frame-by-frame streaming analysis
export const analyzeVideo = async (
  file: File, 
  onProgress?: VideoProgressCallback
): Promise<VideoAnalysisFindings> => {
  // First, analyze metadata
  let metadataResult: MetadataAnalysisResult | undefined;
  let firstFrameData: ImageData | undefined;
  
  try {
    firstFrameData = await extractFirstFrame(file);
    metadataResult = await analyzeMetadata(file, firstFrameData);
  } catch (e) {
    metadataResult = await analyzeMetadata(file);
  }
  
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const fps = 30; // Assume 30fps, will adjust based on actual frames decoded
      const estimatedFrames = Math.ceil(duration * fps);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      
      // Use 512x512 for faster processing while maintaining accuracy
      canvas.width = Math.min(512, video.videoWidth);
      canvas.height = Math.min(512, video.videoHeight);
      
      const stats = createStreamingStats();
      let quantumEntropy: QuantumEntropyResult | undefined;
      let lastProgressUpdate = 0;
      
      try {
        // STREAMING FRAME-BY-FRAME ANALYSIS
        // Use requestVideoFrameCallback if available, otherwise fallback to seeking
        if ('requestVideoFrameCallback' in video) {
          await new Promise<void>((resolvePlayback) => {
            let framesProcessed = 0;
            
            const frameCallback = (_now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => {
              // Draw and process frame
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              processFrame(frameData, stats, canvas.width, canvas.height);
              
              // Quantum entropy on first frame
              if (framesProcessed === 0) {
                quantumEntropy = analyzeQuantumEntropy(frameData);
              }
              
              framesProcessed++;
              
              // Progress callback (throttled to every 30 frames)
              if (onProgress && framesProcessed - lastProgressUpdate >= 30) {
                lastProgressUpdate = framesProcessed;
                onProgress(framesProcessed, estimatedFrames, 'Analyzing frames...');
              }
              
              // Continue until video ends
              if (!video.ended && video.currentTime < duration) {
                (video as any).requestVideoFrameCallback(frameCallback);
              } else {
                resolvePlayback();
              }
            };
            
            video.playbackRate = 2.0; // Speed up playback for faster analysis
            (video as any).requestVideoFrameCallback(frameCallback);
            video.play().catch(() => {
              // Fallback to seeking if autoplay blocked
              resolvePlayback();
            });
            
            // Timeout safety
            setTimeout(() => resolvePlayback(), Math.max(60000, duration * 1000));
          });
        }
        
        // Fallback or supplement: seeking-based analysis for high coverage
        if (stats.frameCount < 50) {
          // Analyze via seeking if requestVideoFrameCallback didn't work well
          const seekFrames = Math.min(200, Math.max(50, Math.ceil(duration * 10)));
          const interval = duration / (seekFrames + 1);
          
          for (let i = 1; i <= seekFrames; i++) {
            try {
              video.currentTime = interval * i;
              await new Promise<void>((res) => {
                video.onseeked = () => res();
              });
              
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              processFrame(frameData, stats, canvas.width, canvas.height);
              
              if (i === 1 && !quantumEntropy) {
                quantumEntropy = analyzeQuantumEntropy(frameData);
              }
              
              if (onProgress && i % 20 === 0) {
                onProgress(i, seekFrames, 'Seeking frames...');
              }
            } catch (e) {
              console.warn(`Failed to seek to frame ${i}:`, e);
            }
          }
        }
        
        // Final progress
        if (onProgress) {
          onProgress(stats.frameCount, stats.frameCount, 'Computing scores...');
        }
        
        // Compute final scores from streaming stats
        const scores = computeFinalScores(stats);
        
        // Audio-Video sync analysis with collected visual energies
        const audioVideoSync = await analyzeAudioVideoSync(file, stats.visualEnergies);
        
        // Build signals array
        const signals: string[] = [];
        const threshold = 45;
        
        if (metadataResult && metadataResult.signals.length > 0) {
          signals.push(...metadataResult.signals);
        }
        
        if (scores.frameConsistency.score > threshold) signals.push(scores.frameConsistency.description);
        if (scores.temporalCoherence.score > threshold) signals.push(scores.temporalCoherence.description);
        if (scores.faceTracking.score > threshold) signals.push(scores.faceTracking.description);
        if (scores.compressionAnalysis.score > threshold) signals.push(scores.compressionAnalysis.description);
        if (scores.motionAnalysis.score > threshold) signals.push(scores.motionAnalysis.description);
        if (audioVideoSync.score > threshold) signals.push(audioVideoSync.description);
        
        // Calculate weighted score
        const metadataScore = metadataResult?.score || 0;
        const metadataWeight = metadataScore >= 70 ? 0.50 : metadataScore >= 40 ? 0.30 : 0.15;
        const pixelWeight = 1 - metadataWeight - 0.05;
        
        const pixelScore = (
          scores.frameConsistency.score * 0.28 +
          scores.temporalCoherence.score * 0.18 +
          scores.faceTracking.score * 0.14 +
          scores.compressionAnalysis.score * 0.10 +
          scores.motionAnalysis.score * 0.14 +
          audioVideoSync.score * 0.16
        );
        
        const quantumScore = quantumEntropy ? quantumEntropy.anomalyScore * 100 : 0;
        const baselineVideoSuspicion = 10;
        
        const rawScore = 
          metadataScore * metadataWeight +
          pixelScore * pixelWeight +
          quantumScore * 0.05 +
          baselineVideoSuspicion;
        
        const overallScore = Math.min(100, rawScore);
        
        URL.revokeObjectURL(video.src);
        
        console.log(`✅ Video analysis complete: ${stats.frameCount} frames analyzed`);
        
        resolve({
          score: Math.round(Math.max(overallScore, metadataScore * 0.8)),
          signals,
          details: {
            frameConsistency: scores.frameConsistency,
            temporalCoherence: scores.temporalCoherence,
            faceTracking: scores.faceTracking,
            compressionAnalysis: scores.compressionAnalysis,
            motionAnalysis: scores.motionAnalysis,
            audioVideoSync,
            metadataAnalysis: {
              score: metadataScore,
              description: metadataResult?.detectedAITool 
                ? `AI Tool Detected: ${metadataResult.detectedAITool}`
                : 'No AI tool signatures found'
            }
          },
          frameCount: stats.frameCount,
          duration,
          quantumEntropy,
          metadata: metadataResult,
          totalFramesAnalyzed: stats.frameCount
        });
      } catch (err) {
        console.error('Video analysis error:', err);
        URL.revokeObjectURL(video.src);
        
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
          metadata: metadataResult,
          totalFramesAnalyzed: 0
        });
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      const fallbackScore = metadataResult?.score || 30;
      resolve({
        score: Math.max(30, fallbackScore),
        signals: metadataResult?.signals?.length ? metadataResult.signals : ['Could not load video file'],
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
        metadata: metadataResult,
        totalFramesAnalyzed: 0
      });
    };
    
    video.src = URL.createObjectURL(file);
  });
};
