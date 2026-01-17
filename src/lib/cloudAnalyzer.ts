import { supabase } from "@/integrations/supabase/client";

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
}

/**
 * Convert a File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extract first frame from video as base64
 */
async function extractVideoFrame(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.onloadeddata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(video.src);
      resolve(base64);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
    
    video.src = URL.createObjectURL(file);
    video.load();
  });
}

/**
 * Perform cloud-based ML analysis using the edge function
 */
export async function analyzeWithCloud(
  file: File,
  mediaType: 'image' | 'video' | 'audio' | 'document',
  offlineAnalysis: OfflineAnalysisData
): Promise<CloudAnalysisResult> {
  let imageBase64: string | null = null;
  
  // Convert media to base64 for vision analysis
  if (mediaType === 'image') {
    imageBase64 = await fileToBase64(file);
  } else if (mediaType === 'video') {
    try {
      imageBase64 = await extractVideoFrame(file);
    } catch (e) {
      console.warn('Could not extract video frame:', e);
    }
  }
  
  // Call the edge function
  const { data, error } = await supabase.functions.invoke('analyze-media', {
    body: {
      imageBase64,
      mediaType,
      fileName: file.name,
      offlineAnalysis
    }
  });
  
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
  
  return data as CloudAnalysisResult;
}
