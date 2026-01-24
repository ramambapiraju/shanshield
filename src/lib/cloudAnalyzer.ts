import { supabase } from "@/integrations/supabase/client";
import { extractMultipleFramesBase64 } from "./videoAnalyzer";

export interface CloudAnalysisResult {
  verdict: 'deepfake' | 'suspicious' | 'likely_authentic' | 'authentic';
  confidence: number;
  mlSignals: string[];
  reasoning: string;
  aiToolDetected: string | null;
  manipulationTypes: string[];
  combinedConfidence: number;
  offlineScore: number;
  mlScore: number;
  analysisMode: 'cloud_ml';
  modelUsed: string;
}

export interface OfflineAnalysisData {
  score: number;
  signals: string[];
  details: Record<string, { score: number; description: string }>;
  spectrogramBase64?: string; // Full-duration audio spectrogram
  totalFramesAnalyzed?: number; // Video frames analyzed offline
  totalSamplesAnalyzed?: number; // Audio samples analyzed offline
}

// Maximum image dimension for cloud analysis
const MAX_IMAGE_DIMENSION = 1024;
const MAX_BASE64_SIZE = 1024 * 1024; // 1MB max for base64

/**
 * Compress and resize image to reduce payload size
 */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG with 0.7 quality
      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(img.src);
      
      console.log(`Image compressed: ${file.size} bytes -> ~${Math.round(base64.length * 0.75)} bytes (${width}x${height})`);
      resolve(base64);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Extract MANY frames from video for thorough Gemini analysis
 * Extracts 15 frames evenly distributed throughout the video for comprehensive temporal analysis
 */
async function extractMultipleVideoFrames(file: File): Promise<string[]> {
  try {
    // Extract 15 frames for comprehensive cloud ML analysis
    // This provides better temporal coverage for deepfake detection
    const frames = await extractMultipleFramesBase64(file, 15);
    console.log(`✅ Extracted ${frames.length} high-quality frames for Cloud ML analysis`);
    return frames;
  } catch (e) {
    console.warn('Could not extract multiple video frames:', e);
    return [];
  }
}

/**
 * Extract first frame from video as base64 (compressed)
 */
async function extractVideoFrame(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set a timeout for video loading
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Video frame extraction timed out'));
    }, 10000);
    
    video.onloadeddata = () => {
      clearTimeout(timeout);
      
      // Limit video frame size
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(video, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(video.src);
      resolve(base64);
    };
    
    video.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
    
    video.src = URL.createObjectURL(file);
    video.load();
  });
}

/**
 * Perform cloud-based ML analysis using the edge function with your Gemini API
 */
export async function analyzeWithCloud(
  file: File,
  mediaType: 'image' | 'video' | 'audio' | 'document',
  offlineAnalysis: OfflineAnalysisData
): Promise<CloudAnalysisResult> {
  let imageBase64: string | null = null;
  
  console.log(`☁️ Cloud ML analysis starting for ${mediaType}: ${file.name} (${file.size} bytes)`);
  
  // Convert media to base64 for vision analysis (with compression)
  if (mediaType === 'image') {
    try {
      imageBase64 = await compressImage(file);
    } catch (e) {
      console.warn('Image compression failed, trying raw:', e);
      imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  }
  
  // For VIDEO: Extract frames for Gemini temporal analysis
  let videoFrames: string[] = [];
  if (mediaType === 'video') {
    try {
      videoFrames = await extractMultipleVideoFrames(file);
      if (videoFrames.length > 0) {
        imageBase64 = videoFrames[0];
      }
      console.log(`📹 Extracted ${videoFrames.length} frames for Cloud ML (offline analyzed ${offlineAnalysis.totalFramesAnalyzed || 0} frames)`);
    } catch (e) {
      console.warn('Could not extract video frames:', e);
    }
  }
  
  // For AUDIO: Use the spectrogram from offline analysis
  let spectrogramBase64: string | undefined;
  if (mediaType === 'audio' && offlineAnalysis.spectrogramBase64) {
    spectrogramBase64 = offlineAnalysis.spectrogramBase64;
    console.log(`🎵 Using full-duration spectrogram for Cloud ML (${offlineAnalysis.totalSamplesAnalyzed || 0} samples analyzed offline)`);
  }
  
  // Warn if base64 is still too large
  if (imageBase64 && imageBase64.length > MAX_BASE64_SIZE) {
    console.warn(`Image base64 is large: ${Math.round(imageBase64.length / 1024)}KB`);
  }
  
  const frameCountLog = videoFrames.length > 0 ? ` + ${videoFrames.length} video frames` : '';
  const spectrogramLog = spectrogramBase64 ? ' + spectrogram' : '';
  console.log(`📡 Calling Gemini API with ${imageBase64 ? Math.round(imageBase64.length / 1024) + 'KB image' : 'no image'}${frameCountLog}${spectrogramLog}`);
  
  // Call the edge function with timeout
  const controller = new AbortController();
  const timeoutMs = mediaType === 'video' ? 120000 : mediaType === 'audio' ? 90000 : 60000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const { data, error } = await supabase.functions.invoke('analyze-media', {
      body: {
        imageBase64,
        videoFrames: videoFrames.length > 0 ? videoFrames : undefined,
        spectrogramBase64,
        mediaType,
        fileName: file.name,
        offlineAnalysis: {
          score: offlineAnalysis.score,
          signals: offlineAnalysis.signals,
          details: offlineAnalysis.details,
          totalFramesAnalyzed: offlineAnalysis.totalFramesAnalyzed,
          totalSamplesAnalyzed: offlineAnalysis.totalSamplesAnalyzed
        }
      }
    });
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.error('Cloud analysis error:', error);
      throw new Error(error.message || 'Cloud analysis failed');
    }
    
    // Handle rate limit or payment errors
    if (data?.code === 'RATE_LIMIT') {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    
    if (data?.code === 'PAYMENT_REQUIRED') {
      throw new Error('API credits exhausted. Please add credits to continue.');
    }
    
    if (data?.error) {
      throw new Error(data.error);
    }
    
    console.log('Cloud analysis complete:', data.verdict, data.confidence + '%');
    
    return data as CloudAnalysisResult;
  } catch (err) {
    clearTimeout(timeoutId);
    
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Cloud analysis timed out. Please try a smaller image or use offline mode.');
    }
    
    throw err;
  }
}
