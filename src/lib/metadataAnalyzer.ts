// Metadata & AI Signature Detection
// Analyzes filenames, watermarks, and metadata patterns to detect AI-generated content

export interface MetadataAnalysisResult {
  score: number;
  signals: string[];
  details: {
    filenameAnalysis: { score: number; description: string };
    watermarkDetection: { score: number; description: string };
    metadataPatterns: { score: number; description: string };
    aiSignatures: { score: number; description: string };
  };
  detectedAITool?: string;
  confidence: number;
}

// Known AI generation tool filename patterns
const AI_FILENAME_PATTERNS: { pattern: RegExp; tool: string; weight: number }[] = [
  // Video AI generators
  { pattern: /kling/i, tool: 'Kling AI', weight: 95 },
  { pattern: /sora/i, tool: 'OpenAI Sora', weight: 95 },
  { pattern: /runway/i, tool: 'Runway ML', weight: 90 },
  { pattern: /pika/i, tool: 'Pika Labs', weight: 90 },
  { pattern: /luma/i, tool: 'Luma AI', weight: 90 },
  { pattern: /synthesia/i, tool: 'Synthesia', weight: 95 },
  { pattern: /heygen/i, tool: 'HeyGen', weight: 95 },
  { pattern: /d-id/i, tool: 'D-ID', weight: 95 },
  { pattern: /colossyan/i, tool: 'Colossyan', weight: 90 },
  { pattern: /invideo/i, tool: 'InVideo AI', weight: 85 },
  { pattern: /veo/i, tool: 'Google Veo', weight: 90 },
  
  // Image AI generators
  { pattern: /midjourney|mj_/i, tool: 'Midjourney', weight: 95 },
  { pattern: /dall-?e/i, tool: 'DALL-E', weight: 95 },
  { pattern: /stable[_-]?diffusion|sd_|sdxl/i, tool: 'Stable Diffusion', weight: 90 },
  { pattern: /firefly/i, tool: 'Adobe Firefly', weight: 90 },
  { pattern: /imagen/i, tool: 'Google Imagen', weight: 90 },
  { pattern: /ideogram/i, tool: 'Ideogram', weight: 90 },
  { pattern: /leonardo/i, tool: 'Leonardo AI', weight: 85 },
  { pattern: /playground/i, tool: 'Playground AI', weight: 80 },
  { pattern: /nightcafe/i, tool: 'NightCafe', weight: 85 },
  { pattern: /artbreeder/i, tool: 'Artbreeder', weight: 85 },
  { pattern: /craiyon|dalle-?mini/i, tool: 'Craiyon', weight: 85 },
  { pattern: /flux/i, tool: 'Flux AI', weight: 90 },
  
  // Audio AI generators
  { pattern: /elevenlabs|11labs/i, tool: 'ElevenLabs', weight: 95 },
  { pattern: /murf/i, tool: 'Murf AI', weight: 90 },
  { pattern: /resemble/i, tool: 'Resemble AI', weight: 90 },
  { pattern: /play\.ht|playht/i, tool: 'Play.ht', weight: 90 },
  { pattern: /speechify/i, tool: 'Speechify', weight: 85 },
  { pattern: /descript/i, tool: 'Descript', weight: 85 },
  { pattern: /wellsaid/i, tool: 'WellSaid Labs', weight: 90 },
  { pattern: /suno/i, tool: 'Suno AI', weight: 90 },
  { pattern: /udio/i, tool: 'Udio', weight: 90 },
  { pattern: /musicfy/i, tool: 'Musicfy', weight: 85 },
  
  // Deepfake specific
  { pattern: /deepfake/i, tool: 'Deepfake Tool', weight: 100 },
  { pattern: /faceswap/i, tool: 'FaceSwap', weight: 95 },
  { pattern: /reface/i, tool: 'Reface', weight: 90 },
  { pattern: /faceapp/i, tool: 'FaceApp', weight: 85 },
  { pattern: /wombo/i, tool: 'Wombo', weight: 80 },
  
  // Generic AI indicators
  { pattern: /ai[_-]?gen/i, tool: 'AI Generated', weight: 90 },
  { pattern: /generated/i, tool: 'Generated Content', weight: 70 },
  { pattern: /synthetic/i, tool: 'Synthetic Media', weight: 80 },
  { pattern: /fake/i, tool: 'Fake Content', weight: 75 },
  { pattern: /created[_-]?by[_-]?ai/i, tool: 'AI Created', weight: 90 },
];

// Analyze filename for AI tool signatures
const analyzeFilename = (filename: string): { score: number; description: string; tool?: string } => {
  const lowerFilename = filename.toLowerCase();
  
  let highestScore = 0;
  let detectedTool = '';
  let matchedPatterns: string[] = [];
  
  for (const { pattern, tool, weight } of AI_FILENAME_PATTERNS) {
    if (pattern.test(filename)) {
      matchedPatterns.push(tool);
      if (weight > highestScore) {
        highestScore = weight;
        detectedTool = tool;
      }
    }
  }
  
  // Check for suspicious number patterns (AI tools often use UUIDs or timestamps)
  const hasUUID = /[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}/i.test(filename);
  const hasLongNumber = /\d{10,}/i.test(filename);
  const hasGeneratedPattern = /_\d{4,}_|img_\d+|output_\d+|result_\d+/i.test(filename);
  
  if (hasUUID || hasLongNumber) {
    highestScore = Math.max(highestScore, 40);
    if (!detectedTool) detectedTool = 'Auto-generated filename';
  }
  
  if (hasGeneratedPattern) {
    highestScore = Math.max(highestScore, 35);
    if (!detectedTool) detectedTool = 'Batch-generated file';
  }
  
  let description = '';
  if (highestScore >= 90) {
    description = `AI tool detected in filename: ${detectedTool}`;
  } else if (highestScore >= 70) {
    description = `Possible AI origin: ${detectedTool}`;
  } else if (highestScore >= 40) {
    description = `Suspicious filename pattern: ${detectedTool}`;
  } else {
    description = 'No AI tool signatures in filename';
    highestScore = 0;
  }
  
  return { 
    score: Math.min(100, highestScore), 
    description,
    tool: detectedTool || undefined
  };
};

// Detect watermarks in video/image frames
// This analyzes corner regions for consistent overlays
const analyzeWatermarkRegions = (
  imageData: ImageData
): { score: number; description: string } => {
  const { data, width, height } = imageData;
  
  // Adaptive corner region sizes based on image dimensions
  const cornerWidth = Math.max(80, Math.min(200, Math.floor(width * 0.15)));
  const cornerHeight = Math.max(50, Math.min(120, Math.floor(height * 0.12)));
  
  // Check all corners for watermark patterns
  const corners = [
    { name: 'top-left', x: 0, y: 0 },
    { name: 'top-right', x: width - cornerWidth, y: 0 },
    { name: 'bottom-left', x: 0, y: height - cornerHeight },
    { name: 'bottom-right', x: width - cornerWidth, y: height - cornerHeight }
  ];
  
  let watermarkScore = 0;
  const detectedCorners: string[] = [];
  
  for (const corner of corners) {
    let highContrastPixels = 0;
    let whitePixels = 0;
    let darkPixels = 0;
    let semiTransparentPixels = 0;
    let textLikeEdges = 0;
    let totalPixels = 0;
    
    const startX = Math.max(0, corner.x);
    const startY = Math.max(0, corner.y);
    const endX = Math.min(width, startX + cornerWidth);
    const endY = Math.min(height, startY + cornerHeight);
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        
        totalPixels++;
        
        const brightness = (r + g + b) / 3;
        
        // High contrast detection (watermark text/logos)
        if (brightness > 235 || brightness < 20) {
          highContrastPixels++;
        }
        
        // White pixels (common in watermarks)
        if (r > 200 && g > 200 && b > 200) {
          whitePixels++;
        }
        
        // Dark pixels (dark watermarks)
        if (r < 60 && g < 60 && b < 60) {
          darkPixels++;
        }
        
        // Semi-transparent overlay
        if (a < 250 && a > 30) {
          semiTransparentPixels++;
        }
        
        // Edge detection for text-like patterns
        if (x > startX && y > startY) {
          const prevIdx = (y * width + x - 1) * 4;
          const prevBrightness = (data[prevIdx] + data[prevIdx + 1] + data[prevIdx + 2]) / 3;
          if (Math.abs(brightness - prevBrightness) > 80) {
            textLikeEdges++;
          }
        }
      }
    }
    
    if (totalPixels === 0) continue;
    
    const contrastRatio = highContrastPixels / totalPixels;
    const whiteRatio = whitePixels / totalPixels;
    const darkRatio = darkPixels / totalPixels;
    const transparentRatio = semiTransparentPixels / totalPixels;
    const edgeRatio = textLikeEdges / totalPixels;
    
    // More sensitive watermark detection with multiple criteria
    // Kling, Midjourney, etc. have corner watermarks
    if ((contrastRatio > 0.10 && (whiteRatio > 0.03 || darkRatio > 0.03)) ||
        (edgeRatio > 0.05 && (whiteRatio > 0.02 || darkRatio > 0.02))) {
      watermarkScore = Math.max(watermarkScore, 75);
      detectedCorners.push(corner.name);
    } else if (transparentRatio > 0.08 || 
               (contrastRatio > 0.06 && (whiteRatio > 0.01 || darkRatio > 0.01)) ||
               edgeRatio > 0.03) {
      watermarkScore = Math.max(watermarkScore, 50);
      if (!detectedCorners.includes(corner.name)) {
        detectedCorners.push(corner.name);
      }
    }
  }
  
  let description = '';
  if (watermarkScore >= 70) {
    description = `Watermark detected in ${detectedCorners.join(', ')} corner(s)`;
  } else if (watermarkScore >= 50) {
    description = `Possible watermark in ${detectedCorners.join(', ')}`;
  } else {
    description = 'No visible watermarks detected';
  }
  
  return { score: watermarkScore, description };
};

// Analyze for AI-specific visual signatures
const analyzeAISignatures = (
  imageData: ImageData
): { score: number; description: string } => {
  const { data, width, height } = imageData;
  
  let signatures: string[] = [];
  let signatureScore = 0;
  
  // 1. Check for AI-characteristic smooth gradients
  let smoothGradientRegions = 0;
  const blockSize = 16;
  const blocks = (width / blockSize) * (height / blockSize);
  
  for (let by = 0; by < height - blockSize; by += blockSize) {
    for (let bx = 0; bx < width - blockSize; bx += blockSize) {
      let totalVariation = 0;
      let samples = 0;
      
      for (let y = by; y < by + blockSize - 1; y++) {
        for (let x = bx; x < bx + blockSize - 1; x++) {
          const idx = (y * width + x) * 4;
          const idxRight = (y * width + x + 1) * 4;
          const idxDown = ((y + 1) * width + x) * 4;
          
          const variation = 
            Math.abs(data[idx] - data[idxRight]) +
            Math.abs(data[idx + 1] - data[idxRight + 1]) +
            Math.abs(data[idx + 2] - data[idxRight + 2]) +
            Math.abs(data[idx] - data[idxDown]) +
            Math.abs(data[idx + 1] - data[idxDown + 1]) +
            Math.abs(data[idx + 2] - data[idxDown + 2]);
          
          totalVariation += variation;
          samples++;
        }
      }
      
      const avgVariation = totalVariation / samples;
      if (avgVariation < 8) {
        smoothGradientRegions++;
      }
    }
  }
  
  const smoothRatio = smoothGradientRegions / blocks;
  
  if (smoothRatio > 0.6) {
    signatureScore = Math.max(signatureScore, 65);
    signatures.push(`AI-smooth regions: ${(smoothRatio * 100).toFixed(1)}%`);
  } else if (smoothRatio > 0.4) {
    signatureScore = Math.max(signatureScore, 40);
    signatures.push(`Synthetic smoothness detected`);
  }
  
  // 2. Check for unnatural color banding (AI artifact)
  let bandingPixels = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const idxPrev = (y * width + x - 1) * 4;
      const idxNext = (y * width + x + 1) * 4;
      
      // Check for exact color matches in a row (banding)
      if (
        data[idx] === data[idxPrev] && data[idx] === data[idxNext] &&
        data[idx + 1] === data[idxPrev + 1] && data[idx + 1] === data[idxNext + 1] &&
        data[idx + 2] === data[idxPrev + 2] && data[idx + 2] === data[idxNext + 2]
      ) {
        bandingPixels++;
      }
    }
  }
  
  const bandingRatio = bandingPixels / (width * height);
  if (bandingRatio > 0.15) {
    signatureScore = Math.max(signatureScore, 60);
    signatures.push(`Color banding: ${(bandingRatio * 100).toFixed(1)}%`);
  } else if (bandingRatio > 0.08) {
    signatureScore = Math.max(signatureScore, 35);
    signatures.push(`Minor color banding detected`);
  }
  
  let description = '';
  if (signatures.length > 0) {
    description = signatures.join('; ');
  } else {
    description = 'No AI visual signatures detected';
  }
  
  return { score: signatureScore, description };
};

// Analyze file metadata patterns
const analyzeMetadataPatterns = (
  file: File
): { score: number; description: string } => {
  const { name, type, size, lastModified } = file;
  
  let score = 0;
  const patterns: string[] = [];
  
  // Check file size patterns
  // AI-generated videos tend to have specific size patterns
  const sizeInMB = size / (1024 * 1024);
  
  // Many AI tools output at specific resolutions/bitrates
  // resulting in predictable file sizes
  if (type.includes('video')) {
    // Short AI-generated clips are often 2-10MB
    if (sizeInMB >= 2 && sizeInMB <= 15) {
      score = Math.max(score, 20);
      patterns.push('Size consistent with AI-generated video clip');
    }
  }
  
  // Check for very recent modification (just downloaded)
  const ageInHours = (Date.now() - lastModified) / (1000 * 60 * 60);
  if (ageInHours < 1) {
    score = Math.max(score, 15);
    patterns.push('Recently created/downloaded');
  }
  
  // Check MIME type for unusual combinations
  const extension = name.split('.').pop()?.toLowerCase();
  if (type === 'video/mp4' && extension !== 'mp4') {
    score = Math.max(score, 25);
    patterns.push('MIME type mismatch');
  }
  
  let description = patterns.length > 0 
    ? patterns.join('; ')
    : 'Standard file metadata';
  
  return { score, description };
};

// Main metadata analysis function
export const analyzeMetadata = async (
  file: File,
  imageData?: ImageData
): Promise<MetadataAnalysisResult> => {
  const filenameResult = analyzeFilename(file.name);
  const metadataResult = analyzeMetadataPatterns(file);
  
  let watermarkResult = { score: 0, description: 'No visual data for watermark analysis' };
  let signatureResult = { score: 0, description: 'No visual data for signature analysis' };
  
  if (imageData) {
    watermarkResult = analyzeWatermarkRegions(imageData);
    signatureResult = analyzeAISignatures(imageData);
  }
  
  const signals: string[] = [];
  
  // CRITICAL: Add signals based on detection (lower thresholds for sensitivity)
  if (filenameResult.score >= 35) signals.push(filenameResult.description);
  if (watermarkResult.score >= 40) signals.push(watermarkResult.description);
  if (signatureResult.score >= 35) signals.push(signatureResult.description);
  if (metadataResult.score >= 15) signals.push(metadataResult.description);
  
  // =====================================================================
  // WEIGHTED SCORING WITH STRONG OVERRIDES
  // =====================================================================
  // Filename is STRONGEST signal - "kling_xxx", "midjourney_xxx" = definitely AI
  // Watermark is STRONG signal - visible AI tool watermark
  // Humans don't name files with AI tool names!
  
  let overallScore = Math.round(
    filenameResult.score * 0.50 +  // Filename is DOMINANT signal
    watermarkResult.score * 0.25 + // Visible watermark is strong
    signatureResult.score * 0.15 + // AI visual signatures
    metadataResult.score * 0.10    // Metadata patterns
  );
  
  // =====================================================================
  // CRITICAL OVERRIDES - If AI tool detected, FORCE HIGH SCORE
  // =====================================================================
  
  // If filename clearly indicates AI tool (score >= 85), THIS IS AI CONTENT
  if (filenameResult.score >= 85) {
    overallScore = Math.max(overallScore, 92); // Near-certain AI
    if (!signals.includes(`AI TOOL CONFIRMED: ${filenameResult.tool}`)) {
      signals.unshift(`AI TOOL CONFIRMED: ${filenameResult.tool}`);
    }
  } else if (filenameResult.score >= 70) {
    overallScore = Math.max(overallScore, 80); // Highly likely AI
  } else if (filenameResult.score >= 50) {
    overallScore = Math.max(overallScore, 65); // Probable AI
  }
  
  // If watermark detected (AI tools like Kling, Midjourney add watermarks)
  if (watermarkResult.score >= 70) {
    overallScore = Math.max(overallScore, 78);
  } else if (watermarkResult.score >= 50) {
    overallScore = Math.max(overallScore, 60);
  }
  
  // If BOTH filename and watermark indicate AI = definitive
  if (filenameResult.score >= 70 && watermarkResult.score >= 50) {
    overallScore = Math.max(overallScore, 95);
  }
  
  // If strong AI visual signatures detected
  if (signatureResult.score >= 60) {
    overallScore = Math.max(overallScore, 55);
  }
  
  return {
    score: Math.min(100, overallScore),
    signals,
    details: {
      filenameAnalysis: { score: filenameResult.score, description: filenameResult.description },
      watermarkDetection: { score: watermarkResult.score, description: watermarkResult.description },
      metadataPatterns: { score: metadataResult.score, description: metadataResult.description },
      aiSignatures: { score: signatureResult.score, description: signatureResult.description }
    },
    detectedAITool: filenameResult.tool,
    // Confidence based on what was detected
    confidence: filenameResult.score >= 85 ? 98 : 
                filenameResult.score >= 70 ? 92 : 
                watermarkResult.score >= 70 ? 85 :
                filenameResult.score >= 50 ? 75 : 60
  };
};

// Extract first frame from video for watermark analysis
export const extractFirstFrame = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(video.src);
      resolve(imageData);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};
