// Real Image Analysis - Examines actual pixel data for deepfake/AI-generated indicators
import { analyzeQuantumEntropy, type QuantumEntropyResult } from './quantumEntropyAnalyzer';
import { analyzeMetadata, type MetadataAnalysisResult } from './metadataAnalyzer';

export interface AnalysisFindings {
  score: number; // 0-100 manipulation likelihood
  signals: string[];
  details: {
    noiseAnalysis: { score: number; description: string };
    edgeAnalysis: { score: number; description: string };
    colorAnalysis: { score: number; description: string };
    compressionAnalysis: { score: number; description: string };
    symmetryAnalysis: { score: number; description: string };
    textureAnalysis: { score: number; description: string };
    repetitionAnalysis: { score: number; description: string };
    gradientAnalysis: { score: number; description: string };
    quantumEntropyAnalysis?: { score: number; description: string };
    metadataAnalysis?: { score: number; description: string };
  };
  quantumEntropy?: QuantumEntropyResult;
  metadata?: MetadataAnalysisResult;
}

// Load image and get pixel data - higher resolution for watermark detection
const loadImageData = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Use larger size for better watermark detection in corners
      const maxDim = 1024;
      let width = img.width;
      let height = img.height;
      
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      const imageData = ctx?.getImageData(0, 0, width, height);
      if (imageData) {
        URL.revokeObjectURL(img.src);
        resolve(imageData);
      } else {
        reject(new Error('Failed to get image data'));
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
};

// Analyze noise patterns - AI images have EXTREMELY uniform noise (not just somewhat uniform)
const analyzeNoise = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  const noiseValues: number[] = [];
  const localVariances: number[] = [];
  
  // Sample noise by looking at differences between adjacent pixels
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const idx = (y * width + x) * 4;
      const idxRight = (y * width + x + 1) * 4;
      const idxDown = ((y + 1) * width + x) * 4;
      
      const diffR = Math.abs(data[idx] - data[idxRight]) + Math.abs(data[idx] - data[idxDown]);
      const diffG = Math.abs(data[idx + 1] - data[idxRight + 1]) + Math.abs(data[idx + 1] - data[idxDown + 1]);
      const diffB = Math.abs(data[idx + 2] - data[idxRight + 2]) + Math.abs(data[idx + 2] - data[idxDown + 2]);
      
      noiseValues.push((diffR + diffG + diffB) / 3);
    }
  }
  
  // Calculate noise variance
  const mean = noiseValues.reduce((a, b) => a + b, 0) / noiseValues.length;
  const variance = noiseValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / noiseValues.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? (stdDev / mean) * 100 : 100;
  
  // Check for suspiciously uniform local regions (AI signature)
  const blockSize = 16;
  for (let by = 0; by < height - blockSize; by += blockSize) {
    for (let bx = 0; bx < width - blockSize; bx += blockSize) {
      let blockSum = 0;
      let blockCount = 0;
      for (let y = by; y < by + blockSize && y < height - 1; y += 2) {
        for (let x = bx; x < bx + blockSize && x < width - 1; x += 2) {
          const idx = (y * width + x) * 4;
          const idxRight = (y * width + x + 1) * 4;
          const diff = Math.abs(data[idx] - data[idxRight]) + 
                       Math.abs(data[idx + 1] - data[idxRight + 1]) + 
                       Math.abs(data[idx + 2] - data[idxRight + 2]);
          blockSum += diff;
          blockCount++;
        }
      }
      if (blockCount > 0) {
        localVariances.push(blockSum / blockCount);
      }
    }
  }
  
  const localMean = localVariances.reduce((a, b) => a + b, 0) / localVariances.length;
  const localVar = localVariances.reduce((sum, val) => sum + Math.pow(val - localMean, 2), 0) / localVariances.length;
  const localCV = localMean > 0 ? (Math.sqrt(localVar) / localMean) * 100 : 100;
  
  let score = 0;
  let description = '';
  
  // EXTREMELY conservative - live webcam/phone captures have compression & lighting uniformity
  // Only flag truly AI-signature patterns (CV < 12 AND local < 15)
  if (coefficientOfVariation < 12 && localCV < 15) {
    score = 55 + (12 - coefficientOfVariation) * 2;
    description = `AI-characteristic uniform noise (CV: ${coefficientOfVariation.toFixed(1)}%, local: ${localCV.toFixed(1)}%)`;
  } else if (coefficientOfVariation < 20 && localCV < 25) {
    score = 20 + (20 - coefficientOfVariation);
    description = `Some noise regularity (CV: ${coefficientOfVariation.toFixed(1)}%)`;
  } else {
    score = Math.max(0, 8 - coefficientOfVariation / 8);
    description = `Natural noise variation (CV: ${coefficientOfVariation.toFixed(1)}%)`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze edges - real photos have natural edge distribution
const analyzeEdges = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  const edgeStrengths: number[] = [];
  
  // Sobel edge detection
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const getGray = (px: number, py: number) => {
        const idx = (py * width + px) * 4;
        return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      };
      
      const gx = 
        -getGray(x-1, y-1) + getGray(x+1, y-1) +
        -2*getGray(x-1, y) + 2*getGray(x+1, y) +
        -getGray(x-1, y+1) + getGray(x+1, y+1);
      
      const gy = 
        -getGray(x-1, y-1) - 2*getGray(x, y-1) - getGray(x+1, y-1) +
        getGray(x-1, y+1) + 2*getGray(x, y+1) + getGray(x+1, y+1);
      
      edgeStrengths.push(Math.sqrt(gx * gx + gy * gy));
    }
  }
  
  const mean = edgeStrengths.reduce((a, b) => a + b, 0) / edgeStrengths.length;
  const sortedEdges = [...edgeStrengths].sort((a, b) => a - b);
  const median = sortedEdges[Math.floor(sortedEdges.length / 2)];
  const edgeRatio = mean / (median + 0.001);
  
  let score = 0;
  let description = '';
  
  // Very conservative - phone/webcam cameras apply heavy sharpening & compression
  // Only flag extreme ratios (> 7)
  if (edgeRatio > 7) {
    score = 45 + Math.min(35, (edgeRatio - 7) * 8);
    description = `Artificial edge enhancement detected (ratio: ${edgeRatio.toFixed(2)})`;
  } else if (edgeRatio > 5) {
    score = 15 + (edgeRatio - 5) * 10;
    description = `Edge irregularity detected (ratio: ${edgeRatio.toFixed(2)})`;
  } else {
    score = Math.min(12, edgeRatio * 3);
    description = `Natural edge distribution (ratio: ${edgeRatio.toFixed(2)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze color distribution - AI often has unusual color patterns
const analyzeColors = (data: Uint8ClampedArray): { score: number; description: string } => {
  const colorHistogram = {
    r: new Array(256).fill(0),
    g: new Array(256).fill(0),
    b: new Array(256).fill(0)
  };
  
  for (let i = 0; i < data.length; i += 4) {
    colorHistogram.r[data[i]]++;
    colorHistogram.g[data[i + 1]]++;
    colorHistogram.b[data[i + 2]]++;
  }
  
  // Check for unnatural color spikes
  const findSpikes = (hist: number[]) => {
    const total = hist.reduce((a, b) => a + b, 0);
    const mean = total / 256;
    let spikes = 0;
    for (const count of hist) {
      if (count > mean * 6) spikes++;
    }
    return spikes;
  };
  
  const rSpikes = findSpikes(colorHistogram.r);
  const gSpikes = findSpikes(colorHistogram.g);
  const bSpikes = findSpikes(colorHistogram.b);
  const totalSpikes = rSpikes + gSpikes + bSpikes;
  
  // Check color channel correlation
  let correlationSum = 0;
  let correlationCount = 0;
  for (let i = 0; i < 256; i++) {
    if (colorHistogram.r[i] > 0 && colorHistogram.g[i] > 0) {
      correlationSum += Math.abs(colorHistogram.r[i] - colorHistogram.g[i]) / 
                        Math.max(colorHistogram.r[i], colorHistogram.g[i]);
      correlationCount++;
    }
  }
  const avgCorrelation = correlationCount > 0 ? correlationSum / correlationCount : 0;
  
  let score = 0;
  let description = '';
  
  // Higher thresholds - real photos can have some color spikes
  if (totalSpikes > 20 && avgCorrelation > 0.75) {
    score = 65 + Math.min(30, totalSpikes - 20 + avgCorrelation * 20);
    description = `Unnatural color distribution (${totalSpikes} spikes, ${(avgCorrelation * 100).toFixed(1)}% uncorrelated)`;
  } else if (totalSpikes > 12 || avgCorrelation > 0.6) {
    score = 25 + totalSpikes + avgCorrelation * 15;
    description = `Moderate color anomaly (${totalSpikes} spikes)`;
  } else {
    score = Math.min(20, totalSpikes * 1.5);
    description = `Natural color distribution`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze JPEG compression artifacts
const analyzeCompression = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  const blockSize = 8;
  const blockBoundaryDiffs: number[] = [];
  
  for (let y = blockSize; y < height - blockSize; y += blockSize) {
    for (let x = 0; x < width - 1; x++) {
      const idx1 = ((y - 1) * width + x) * 4;
      const idx2 = (y * width + x) * 4;
      
      const diff = Math.abs(data[idx1] - data[idx2]) + 
                   Math.abs(data[idx1 + 1] - data[idx2 + 1]) + 
                   Math.abs(data[idx1 + 2] - data[idx2 + 2]);
      blockBoundaryDiffs.push(diff);
    }
  }
  
  const avgBlockDiff = blockBoundaryDiffs.reduce((a, b) => a + b, 0) / blockBoundaryDiffs.length;
  
  let score = 0;
  let description = '';
  
  // Real photos often have compression - only flag extreme cases
  if (avgBlockDiff > 40) {
    score = 50 + Math.min(45, (avgBlockDiff - 40) * 1.5);
    description = `Strong compression artifacts (strength: ${avgBlockDiff.toFixed(1)})`;
  } else if (avgBlockDiff > 25) {
    score = 20 + (avgBlockDiff - 25);
    description = `Moderate compression (strength: ${avgBlockDiff.toFixed(1)})`;
  } else {
    score = Math.min(15, avgBlockDiff / 2);
    description = `Normal compression (strength: ${avgBlockDiff.toFixed(1)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze symmetry - only flag EXTREMELY perfect symmetry (AI signature)
const analyzeSymmetry = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  const centerX = Math.floor(width / 2);
  let asymmetrySum = 0;
  let sampleCount = 0;
  let veryLowDiffCount = 0; // Count pixels with < 3 difference
  
  for (let y = Math.floor(height * 0.2); y < height * 0.8; y += 2) {
    for (let offset = 1; offset < centerX * 0.7; offset += 2) {
      const leftIdx = (y * width + (centerX - offset)) * 4;
      const rightIdx = (y * width + (centerX + offset)) * 4;
      
      const diff = Math.abs(data[leftIdx] - data[rightIdx]) +
                   Math.abs(data[leftIdx + 1] - data[rightIdx + 1]) +
                   Math.abs(data[leftIdx + 2] - data[rightIdx + 2]);
      
      asymmetrySum += diff;
      sampleCount++;
      if (diff < 3) veryLowDiffCount++;
    }
  }
  
  const avgAsymmetry = asymmetrySum / sampleCount;
  const perfectRatio = veryLowDiffCount / sampleCount;
  
  let score = 0;
  let description = '';
  
  // Only flag if EXTREMELY symmetric (< 8 avg) AND high perfect ratio (> 0.5)
  // Real photos are naturally asymmetric
  if (avgAsymmetry < 8 && perfectRatio > 0.5) {
    score = 80 + (8 - avgAsymmetry) * 3;
    description = `AI-perfect symmetry (asym: ${avgAsymmetry.toFixed(1)}, perfect: ${(perfectRatio * 100).toFixed(1)}%)`;
  } else if (avgAsymmetry < 12 && perfectRatio > 0.35) {
    score = 50 + (12 - avgAsymmetry) * 2;
    description = `Unusually symmetric - possible AI (asym: ${avgAsymmetry.toFixed(1)})`;
  } else if (avgAsymmetry > 80) {
    score = 30 + Math.min(30, (avgAsymmetry - 80));
    description = `High asymmetry (score: ${avgAsymmetry.toFixed(1)}) - possible splicing`;
  } else {
    score = Math.max(0, 15 - avgAsymmetry / 4);
    description = `Natural symmetry (score: ${avgAsymmetry.toFixed(1)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze texture - AI has characteristic over-smooth textures
const analyzeTexture = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  const textureScores: number[] = [];
  let verySmooth = 0;
  let totalSamples = 0;
  
  for (let y = 1; y < height - 1; y += 3) {
    for (let x = 1; x < width - 1; x += 3) {
      const getGray = (px: number, py: number) => {
        const idx = (py * width + px) * 4;
        return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      };
      
      const center = getGray(x, y);
      let pattern = 0;
      
      const neighbors = [
        getGray(x-1, y-1), getGray(x, y-1), getGray(x+1, y-1),
        getGray(x-1, y), getGray(x+1, y),
        getGray(x-1, y+1), getGray(x, y+1), getGray(x+1, y+1)
      ];
      
      // Check for AI-characteristic smooth gradients
      const maxDiff = Math.max(...neighbors.map(n => Math.abs(n - center)));
      if (maxDiff < 4) verySmooth++; // Very strict threshold
      totalSamples++;
      
      for (let i = 0; i < 8; i++) {
        if (neighbors[i] > center) pattern |= (1 << i);
      }
      
      let transitions = 0;
      for (let i = 0; i < 8; i++) {
        if (((pattern >> i) & 1) !== ((pattern >> ((i + 1) % 8)) & 1)) {
          transitions++;
        }
      }
      textureScores.push(transitions);
    }
  }
  
  const avgTransitions = textureScores.reduce((a, b) => a + b, 0) / textureScores.length;
  const smoothRatio = verySmooth / totalSamples;
  
  let score = 0;
  let description = '';
  
  // Only flag if BOTH low transitions AND high smooth ratio (AI combo)
  if (avgTransitions < 2.0 && smoothRatio > 0.5) {
    score = 75 + (2.0 - avgTransitions) * 15 + smoothRatio * 15;
    description = `AI-smooth texture (trans: ${avgTransitions.toFixed(2)}, smooth: ${(smoothRatio * 100).toFixed(1)}%)`;
  } else if (avgTransitions < 2.5 && smoothRatio > 0.35) {
    score = 45 + (2.5 - avgTransitions) * 10;
    description = `Synthetic texture pattern (transitions: ${avgTransitions.toFixed(2)})`;
  } else if (avgTransitions > 6) {
    score = 25 + (avgTransitions - 6) * 5;
    description = `Noisy texture (transitions: ${avgTransitions.toFixed(2)})`;
  } else {
    score = Math.max(0, 15 - avgTransitions * 2);
    description = `Natural texture (transitions: ${avgTransitions.toFixed(2)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze repeating micro-patterns / tiling artifacts (can appear in AI-generated images)
const analyzeRepetition = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  // Downsample to keep it fast
  const step = 4;
  const sw = Math.max(1, Math.floor(width / step));
  const sh = Math.max(1, Math.floor(height / step));

  // If the image is extremely small after resizing, this detector is not reliable
  if (sw < 24 || sh < 24) {
    return { score: 0, description: "Repetition check skipped (image too small)" };
  }

  const gray = new Uint8Array(sw * sh);

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const px = Math.min(width - 1, x * step);
      const py = Math.min(height - 1, y * step);
      const idx = (py * width + px) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      gray[y * sw + x] = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
    }
  }

  const meanAbsDiffShift = (dx: number, dy: number) => {
    let sum = 0;
    let count = 0;

    const xMax = sw - dx;
    const yMax = sh - dy;

    for (let y = 0; y < yMax; y++) {
      const row = y * sw;
      const rowShift = (y + dy) * sw;
      for (let x = 0; x < xMax; x++) {
        const a = gray[row + x];
        const b = gray[rowShift + (x + dx)];
        sum += Math.abs(a - b);
        count++;
      }
    }

    return count > 0 ? sum / count : 255;
  };

  const offsets = [8, 12, 16].filter((o) => o < sw / 2 && o < sh / 2);
  const minDiffs: number[] = [];
  let strongRepeats = 0;

  for (const o of offsets) {
    const diffX = meanAbsDiffShift(o, 0);
    const diffY = meanAbsDiffShift(0, o);
    const best = Math.min(diffX, diffY);
    minDiffs.push(best);

    // Very low difference at a non-trivial offset can indicate subtle tiling/repetition
    if (best < 6) strongRepeats++;
  }

  const avgMinDiff = minDiffs.reduce((a, b) => a + b, 0) / Math.max(1, minDiffs.length);

  let score = 0;
  let description = "";

  if (strongRepeats >= 2 && avgMinDiff < 8) {
    score = 75 + (8 - avgMinDiff) * 4;
    description = `Repetitive micro-patterns detected (avg diff: ${avgMinDiff.toFixed(1)})`;
  } else if (strongRepeats >= 1 && avgMinDiff < 10) {
    score = 50 + (10 - avgMinDiff) * 3;
    description = `Possible tiling artifacts (avg diff: ${avgMinDiff.toFixed(1)})`;
  } else {
    score = Math.max(0, 18 - avgMinDiff * 1.2);
    description = `No significant repetition detected (avg diff: ${avgMinDiff.toFixed(1)})`;
  }

  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze gradient uniformity - AI/animated images have unnaturally smooth, banded gradients
const analyzeGradient = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  let smoothGradientCount = 0;
  let totalRegions = 0;
  let bandingCount = 0;
  const regionSize = 32;
  
  // Check for unnaturally smooth gradient regions (AI hallmark)
  for (let ry = 0; ry < height - regionSize; ry += regionSize) {
    for (let rx = 0; rx < width - regionSize; rx += regionSize) {
      const gradients: number[] = [];
      let prevGray = -1;
      let sameSteps = 0;
      
      // Sample diagonal line through region
      for (let i = 0; i < regionSize; i++) {
        const x = Math.min(rx + i, width - 1);
        const y = Math.min(ry + i, height - 1);
        const idx = (y * width + x) * 4;
        const gray = Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
        
        if (prevGray >= 0) {
          const diff = gray - prevGray;
          gradients.push(diff);
          // Banding: exact same step multiple times
          if (Math.abs(diff) < 2) sameSteps++;
        }
        prevGray = gray;
      }
      
      if (gradients.length > 5) {
        // Check if gradient is suspiciously uniform
        const mean = gradients.reduce((a, b) => a + b, 0) / gradients.length;
        const variance = gradients.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / gradients.length;
        
        totalRegions++;
        
        // AI images have very low variance in gradients (smooth transitions)
        if (variance < 2 && sameSteps > gradients.length * 0.6) {
          smoothGradientCount++;
          bandingCount++;
        } else if (variance < 4) {
          smoothGradientCount++;
        }
      }
    }
  }
  
  const smoothRatio = totalRegions > 0 ? smoothGradientCount / totalRegions : 0;
  const bandingRatio = totalRegions > 0 ? bandingCount / totalRegions : 0;
  
  let score = 0;
  let description = '';
  
  // High smooth ratio + banding = strong AI indicator
  if (smoothRatio > 0.4 && bandingRatio > 0.15) {
    score = 85 + bandingRatio * 50;
    description = `AI-generated gradient banding (smooth: ${(smoothRatio * 100).toFixed(1)}%, banding: ${(bandingRatio * 100).toFixed(1)}%)`;
  } else if (smoothRatio > 0.35) {
    score = 65 + smoothRatio * 40;
    description = `Synthetic smooth gradients (${(smoothRatio * 100).toFixed(1)}% regions)`;
  } else if (smoothRatio > 0.25) {
    score = 40 + smoothRatio * 30;
    description = `Moderate gradient uniformity (${(smoothRatio * 100).toFixed(1)}%)`;
  } else {
    score = Math.max(0, 15 - (0.25 - smoothRatio) * 60);
    description = `Natural gradient variation (${(smoothRatio * 100).toFixed(1)}%)`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// =====================================================================
// MAIN ANALYSIS FUNCTION — BALANCED DETECTION
// Key principle: Only be aggressive when we have CONCRETE AI evidence
// (filename patterns, watermarks). Pixel analysis alone should NOT
// trigger false positives on real photos.
// =====================================================================
export const analyzeImage = async (file: File): Promise<AnalysisFindings> => {
  // STEP 1: Load image data
  const imageData = await loadImageData(file);
  const { data, width, height } = imageData;

  // =====================================================================
  // STEP 2: METADATA ANALYSIS FIRST — Most reliable signal
  // Humans don't name files "kling_xxx" or "midjourney_portrait.png"
  // If we detect AI tool name in filename, that's DEFINITIVE evidence
  // =====================================================================
  const metadataResult = await analyzeMetadata(file, imageData);

  // =====================================================================
  // STEP 3: RUN ALL PIXEL-BASED ANALYSES
  // These detect statistical anomalies but can trigger on real photos too
  // =====================================================================
  const noiseAnalysis = analyzeNoise(data, width, height);
  const edgeAnalysis = analyzeEdges(data, width, height);
  const colorAnalysis = analyzeColors(data);
  const compressionAnalysis = analyzeCompression(data, width, height);
  const symmetryAnalysis = analyzeSymmetry(data, width, height);
  const textureAnalysis = analyzeTexture(data, width, height);
  const repetitionAnalysis = analyzeRepetition(data, width, height);
  const gradientAnalysis = analyzeGradient(data, width, height);

  // STEP 4: Run Quantum Entropy Analysis
  const quantumEntropy = analyzeQuantumEntropy(imageData);
  const quantumEntropyAnalysis = {
    score: Math.round(quantumEntropy.anomalyScore * 100),
    description: quantumEntropy.entropyAnomaly 
      ? `Quantum entropy anomaly (vN: ${quantumEntropy.vonNeumannEntropy.toFixed(3)}, coherence: ${(quantumEntropy.quantumCoherence * 100).toFixed(1)}%)`
      : `Normal quantum entropy (vN: ${quantumEntropy.vonNeumannEntropy.toFixed(3)})`
  };

  const metadataAnalysis = {
    score: metadataResult.score,
    description: metadataResult.detectedAITool 
      ? `🚨 AI Tool Detected: ${metadataResult.detectedAITool}`
      : 'No AI tool signatures found'
  };

  // =====================================================================
  // STEP 5: COLLECT SIGNALS — Only add if above threshold
  // Higher threshold = fewer false positive signals on real photos
  // =====================================================================
  const signals: string[] = [];
  
  // Add metadata signals FIRST (most important)
  if (metadataResult.signals.length > 0) {
    signals.push(...metadataResult.signals);
  }
  
  // Add detected AI tool as explicit signal
  if (metadataResult.detectedAITool) {
    const toolSignal = `AI Generation Tool: ${metadataResult.detectedAITool}`;
    if (!signals.some(s => s.includes(metadataResult.detectedAITool!))) {
      signals.unshift(toolSignal);
    }
  }
  
  // Higher threshold for pixel-based signals to reduce false positives
  const signalThreshold = 55; 

  if (noiseAnalysis.score > signalThreshold) signals.push(noiseAnalysis.description);
  if (edgeAnalysis.score > signalThreshold) signals.push(edgeAnalysis.description);
  if (colorAnalysis.score > signalThreshold) signals.push(colorAnalysis.description);
  if (symmetryAnalysis.score > signalThreshold) signals.push(symmetryAnalysis.description);
  if (textureAnalysis.score > signalThreshold) signals.push(textureAnalysis.description);
  if (repetitionAnalysis.score > signalThreshold) signals.push(repetitionAnalysis.description);
  if (gradientAnalysis.score > signalThreshold) signals.push(gradientAnalysis.description);
  if (quantumEntropyAnalysis.score > signalThreshold) signals.push(quantumEntropyAnalysis.description);
  if (compressionAnalysis.score > 60) signals.push(compressionAnalysis.description);

  // =====================================================================
  // STEP 6: COUNT STRONG INDICATORS (for multi-signal correlation)
  // =====================================================================
  const allPixelScores = [
    noiseAnalysis.score,
    edgeAnalysis.score,
    colorAnalysis.score,
    compressionAnalysis.score,
    symmetryAnalysis.score,
    textureAnalysis.score,
    repetitionAnalysis.score,
    gradientAnalysis.score,
    quantumEntropyAnalysis.score
  ];
  
  // Count how many are elevated (>45) and high (>70)
  const elevatedCount = allPixelScores.filter((s) => s > 45).length;
  const highCount = allPixelScores.filter((s) => s > 70).length;
  const veryHighCount = allPixelScores.filter((s) => s > 85).length;

  // =====================================================================
  // STEP 7: CALCULATE WEIGHTED PIXEL SCORE
  // Balanced weights to avoid any single detector dominating
  // =====================================================================
  const pixelScore = (
    noiseAnalysis.score * 0.14 +      // GAN noise uniformity
    edgeAnalysis.score * 0.08 +       // Edge artifacts
    colorAnalysis.score * 0.10 +      // Color anomalies
    compressionAnalysis.score * 0.04 + // Compression (often triggers on real photos)
    symmetryAnalysis.score * 0.10 +   // Perfect symmetry
    textureAnalysis.score * 0.14 +    // Smooth textures
    repetitionAnalysis.score * 0.06 + // Repeating patterns
    gradientAnalysis.score * 0.12 +   // Smooth gradients
    quantumEntropyAnalysis.score * 0.12 // Quantum entropy
  ) / 0.90; // Normalize

  // =====================================================================
  // STEP 8: DYNAMIC WEIGHTING BASED ON METADATA EVIDENCE
  // KEY PRINCIPLE: Only dominate with metadata when we have REAL evidence
  // =====================================================================
  let metadataWeight: number;
  let pixelWeight: number;
  
  if (metadataResult.score >= 85) {
    // DEFINITIVE AI TOOL DETECTED (filename like "kling_xxx")
    // Metadata is DOMINANT — this is irrefutable evidence
    metadataWeight = 0.80;
    pixelWeight = 0.20;
  } else if (metadataResult.score >= 70) {
    // Strong AI indicator (watermark or partial match)
    metadataWeight = 0.60;
    pixelWeight = 0.40;
  } else if (metadataResult.score >= 50) {
    // Moderate indicator
    metadataWeight = 0.40;
    pixelWeight = 0.60;
  } else {
    // No AI indicator — rely primarily on pixel analysis
    // BUT pixel analysis alone should be conservative
    metadataWeight = 0.15;
    pixelWeight = 0.85;
  }

  // =====================================================================
  // STEP 9: MULTI-SIGNAL BOOST (only when multiple detectors agree)
  // This helps catch AI content that pixel analysis CAN detect
  // =====================================================================
  let boostedPixelScore = pixelScore;
  
  // Only boost if MANY detectors agree (reduces false positives)
  if (elevatedCount >= 7 && highCount >= 3) {
    boostedPixelScore = pixelScore * 1.25;
  } else if (elevatedCount >= 6 && highCount >= 2) {
    boostedPixelScore = pixelScore * 1.15;
  } else if (elevatedCount >= 5 && highCount >= 2) {
    boostedPixelScore = pixelScore * 1.08;
  }
  // If only 1-2 detectors are elevated, NO BOOST (likely false positive)

  // =====================================================================
  // STEP 10: COMBINE SCORES
  // =====================================================================
  let overallScore = metadataResult.score * metadataWeight + boostedPixelScore * pixelWeight;

  // =====================================================================
  // STEP 11: METADATA OVERRIDES — Only when we have CONCRETE evidence
  // These ensure AI-named files are ALWAYS flagged correctly
  // =====================================================================
  
  // If filename clearly indicates AI tool, FORCE high score
  // This is the ONLY situation where we override aggressively
  if (metadataResult.detectedAITool && metadataResult.score >= 85) {
    // File is named "kling_xxx", "midjourney_yyy", etc. — DEFINITELY AI
    overallScore = Math.max(overallScore, 88);
  } else if (metadataResult.detectedAITool && metadataResult.score >= 70) {
    // Strong AI tool indication
    overallScore = Math.max(overallScore, 70);
  } else if (metadataResult.score >= 60) {
    // Moderate metadata evidence (watermark, etc.)
    overallScore = Math.max(overallScore, 55);
  }

  // Watermark detected = AI tool watermark (Kling, Midjourney, etc.)
  if (metadataResult.details.watermarkDetection.score >= 75) {
    overallScore = Math.max(overallScore, 68);
  } else if (metadataResult.details.watermarkDetection.score >= 60) {
    overallScore = Math.max(overallScore, 55);
  }

  // =====================================================================
  // STEP 12: PIXEL-ONLY OVERRIDES — Very conservative
  // Only override when OVERWHELMING pixel evidence (many high scores)
  // This prevents false positives on real photos
  // =====================================================================
  
  // Only if 4+ detectors score very high (>85) — extremely rare for real photos
  if (veryHighCount >= 4) {
    overallScore = Math.max(overallScore, 60);
  } else if (veryHighCount >= 3 && highCount >= 5) {
    overallScore = Math.max(overallScore, 52);
  }
  // Otherwise, NO pixel-only override — let the weighted score stand

  // =====================================================================
  // STEP 13: AUTHENTIC BOOST — Help real photos score low
  // If nothing suspicious found, dampen the score
  // =====================================================================
  if (metadataResult.score < 25 && 
      elevatedCount <= 2 && 
      highCount === 0 && 
      boostedPixelScore < 35) {
    // Genuine authentic-looking content — reduce score
    overallScore = overallScore * 0.80;
  } else if (metadataResult.score < 15 &&
             elevatedCount <= 3 &&
             highCount <= 1 &&
             boostedPixelScore < 40) {
    // Likely authentic
    overallScore = overallScore * 0.90;
  }

  // =====================================================================
  // STEP 14: FINAL RESULT
  // =====================================================================
  return {
    score: Math.round(Math.min(100, Math.max(0, overallScore))),
    signals,
    details: {
      noiseAnalysis,
      edgeAnalysis,
      colorAnalysis,
      compressionAnalysis,
      symmetryAnalysis,
      textureAnalysis,
      repetitionAnalysis,
      gradientAnalysis,
      quantumEntropyAnalysis,
      metadataAnalysis
    },
    quantumEntropy,
    metadata: metadataResult
  };
};