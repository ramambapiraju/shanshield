// Real Image Analysis - Examines actual pixel data for deepfake/AI-generated indicators

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
  };
}

// Load image and get pixel data
const loadImageData = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Use reasonable size for analysis
      const maxDim = 512;
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
        resolve(imageData);
      } else {
        reject(new Error('Failed to get image data'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
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
  
  // Only flag if BOTH global AND local noise are suspiciously uniform (AI signature)
  // Real photos have varied noise even if some areas are smooth
  if (coefficientOfVariation < 25 && localCV < 30) {
    score = 75 + (25 - coefficientOfVariation) * 1.5;
    description = `AI-characteristic uniform noise (CV: ${coefficientOfVariation.toFixed(1)}%, local: ${localCV.toFixed(1)}%)`;
  } else if (coefficientOfVariation < 35 && localCV < 40) {
    score = 45 + (35 - coefficientOfVariation);
    description = `Synthetic noise pattern detected (CV: ${coefficientOfVariation.toFixed(1)}%)`;
  } else {
    score = Math.max(0, 20 - coefficientOfVariation / 5);
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
  
  // Only high ratios indicate artificial sharpening
  if (edgeRatio > 4) {
    score = 60 + Math.min(35, (edgeRatio - 4) * 8);
    description = `Artificial edge enhancement detected (ratio: ${edgeRatio.toFixed(2)})`;
  } else if (edgeRatio > 3) {
    score = 35 + (edgeRatio - 3) * 25;
    description = `Edge irregularity detected (ratio: ${edgeRatio.toFixed(2)})`;
  } else {
    score = Math.min(25, edgeRatio * 8);
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

// Main analysis function with smart multi-signal detection
export const analyzeImage = async (file: File): Promise<AnalysisFindings> => {
  const imageData = await loadImageData(file);
  const { data, width, height } = imageData;
  
  // Run all analyses
  const noiseAnalysis = analyzeNoise(data, width, height);
  const edgeAnalysis = analyzeEdges(data, width, height);
  const colorAnalysis = analyzeColors(data);
  const compressionAnalysis = analyzeCompression(data, width, height);
  const symmetryAnalysis = analyzeSymmetry(data, width, height);
  const textureAnalysis = analyzeTexture(data, width, height);
  
  // Collect signals - use higher threshold to reduce false positives
  const signals: string[] = [];
  const threshold = 55;
  
  if (noiseAnalysis.score > threshold) signals.push(noiseAnalysis.description);
  if (edgeAnalysis.score > threshold) signals.push(edgeAnalysis.description);
  if (colorAnalysis.score > threshold) signals.push(colorAnalysis.description);
  if (compressionAnalysis.score > threshold) signals.push(compressionAnalysis.description);
  if (symmetryAnalysis.score > threshold) signals.push(symmetryAnalysis.description);
  if (textureAnalysis.score > threshold) signals.push(textureAnalysis.description);
  
  // Count how many indicators are elevated (> 40)
  const elevatedCount = [
    noiseAnalysis.score, edgeAnalysis.score, colorAnalysis.score,
    compressionAnalysis.score, symmetryAnalysis.score, textureAnalysis.score
  ].filter(s => s > 40).length;
  
  // Calculate weighted score
  let overallScore = (
    noiseAnalysis.score * 0.25 +
    edgeAnalysis.score * 0.15 +
    colorAnalysis.score * 0.12 +
    compressionAnalysis.score * 0.12 +
    symmetryAnalysis.score * 0.18 +
    textureAnalysis.score * 0.18
  );
  
  // Apply multi-signal boost: AI images trigger MULTIPLE detectors
  // Real photos typically only trigger 0-1 detectors
  if (elevatedCount >= 4) {
    overallScore = overallScore * 1.3; // Strong AI signal
  } else if (elevatedCount >= 3) {
    overallScore = overallScore * 1.15;
  } else if (elevatedCount <= 1) {
    overallScore = overallScore * 0.7; // Likely authentic - dampen score
  }
  
  return {
    score: Math.round(Math.min(100, Math.max(0, overallScore))),
    signals,
    details: {
      noiseAnalysis,
      edgeAnalysis,
      colorAnalysis,
      compressionAnalysis,
      symmetryAnalysis,
      textureAnalysis
    }
  };
};