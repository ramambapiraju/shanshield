// Real Image Analysis - Examines actual pixel data for deepfake indicators

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

// Analyze noise patterns - GAN images often have uniform noise
const analyzeNoise = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  const noiseValues: number[] = [];
  
  // Sample noise by looking at differences between adjacent pixels
  for (let y = 1; y < height - 1; y += 3) {
    for (let x = 1; x < width - 1; x += 3) {
      const idx = (y * width + x) * 4;
      const idxRight = (y * width + x + 1) * 4;
      const idxDown = ((y + 1) * width + x) * 4;
      
      // Calculate local variance
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
  
  // Very low or very uniform noise is suspicious (GANs produce uniform noise)
  // Natural images have varied noise patterns
  const coefficientOfVariation = (stdDev / mean) * 100;
  
  let score = 0;
  let description = '';
  
  if (coefficientOfVariation < 30) {
    score = 70 + (30 - coefficientOfVariation);
    description = `Unnaturally uniform noise pattern detected (CV: ${coefficientOfVariation.toFixed(1)}%)`;
  } else if (coefficientOfVariation < 50) {
    score = 40 + (50 - coefficientOfVariation);
    description = `Moderately uniform noise (CV: ${coefficientOfVariation.toFixed(1)}%)`;
  } else {
    score = Math.max(0, 40 - (coefficientOfVariation - 50) / 2);
    description = `Natural noise variation detected (CV: ${coefficientOfVariation.toFixed(1)}%)`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze edges - deepfakes often have unnatural edge transitions
const analyzeEdges = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  const edgeStrengths: number[] = [];
  
  // Sobel edge detection
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      // Get 3x3 neighborhood grayscale values
      const getGray = (px: number, py: number) => {
        const idx = (py * width + px) * 4;
        return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      };
      
      // Sobel kernels
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
  
  // Analyze edge distribution
  const mean = edgeStrengths.reduce((a, b) => a + b, 0) / edgeStrengths.length;
  const sortedEdges = [...edgeStrengths].sort((a, b) => a - b);
  const median = sortedEdges[Math.floor(sortedEdges.length / 2)];
  
  // Strong edges with low median suggests artificial sharpening (common in deepfakes)
  const edgeRatio = mean / (median + 0.001);
  
  let score = 0;
  let description = '';
  
  if (edgeRatio > 3) {
    score = 60 + Math.min(40, (edgeRatio - 3) * 10);
    description = `Artificial edge enhancement detected (ratio: ${edgeRatio.toFixed(2)})`;
  } else if (edgeRatio > 2) {
    score = 30 + (edgeRatio - 2) * 30;
    description = `Moderate edge irregularity (ratio: ${edgeRatio.toFixed(2)})`;
  } else {
    score = edgeRatio * 15;
    description = `Natural edge distribution (ratio: ${edgeRatio.toFixed(2)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze color distribution - GANs often have color artifacts
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
  
  // Check for unnatural color spikes (GAN artifacts)
  const findSpikes = (hist: number[]) => {
    const total = hist.reduce((a, b) => a + b, 0);
    const mean = total / 256;
    let spikes = 0;
    for (const count of hist) {
      if (count > mean * 5) spikes++;
    }
    return spikes;
  };
  
  const rSpikes = findSpikes(colorHistogram.r);
  const gSpikes = findSpikes(colorHistogram.g);
  const bSpikes = findSpikes(colorHistogram.b);
  const totalSpikes = rSpikes + gSpikes + bSpikes;
  
  // Check color channel correlation (should be correlated in natural images)
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
  
  if (totalSpikes > 15 || avgCorrelation > 0.7) {
    score = 60 + Math.min(40, totalSpikes * 2 + avgCorrelation * 30);
    description = `Unnatural color distribution (${totalSpikes} spikes, ${(avgCorrelation * 100).toFixed(1)}% uncorrelated)`;
  } else if (totalSpikes > 8 || avgCorrelation > 0.5) {
    score = 30 + totalSpikes * 2 + avgCorrelation * 20;
    description = `Moderate color anomaly (${totalSpikes} spikes)`;
  } else {
    score = totalSpikes * 3 + avgCorrelation * 15;
    description = `Natural color distribution`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze JPEG compression artifacts
const analyzeCompression = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  // Look for 8x8 block artifacts (JPEG compression)
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
  
  // Double compression detection (editing then re-saving)
  let score = 0;
  let description = '';
  
  if (avgBlockDiff > 30) {
    score = 50 + Math.min(50, (avgBlockDiff - 30) * 2);
    description = `Double compression artifacts detected (strength: ${avgBlockDiff.toFixed(1)})`;
  } else if (avgBlockDiff > 15) {
    score = 25 + (avgBlockDiff - 15);
    description = `Moderate compression artifacts (strength: ${avgBlockDiff.toFixed(1)})`;
  } else {
    score = avgBlockDiff;
    description = `Normal compression level (strength: ${avgBlockDiff.toFixed(1)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze facial symmetry (if face region exists, asymmetry can indicate manipulation)
const analyzeSymmetry = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  const centerX = Math.floor(width / 2);
  let asymmetrySum = 0;
  let sampleCount = 0;
  
  // Compare left and right halves
  for (let y = Math.floor(height * 0.2); y < height * 0.8; y += 2) {
    for (let offset = 1; offset < centerX * 0.8; offset += 2) {
      const leftIdx = (y * width + (centerX - offset)) * 4;
      const rightIdx = (y * width + (centerX + offset)) * 4;
      
      const diff = Math.abs(data[leftIdx] - data[rightIdx]) +
                   Math.abs(data[leftIdx + 1] - data[rightIdx + 1]) +
                   Math.abs(data[leftIdx + 2] - data[rightIdx + 2]);
      
      asymmetrySum += diff;
      sampleCount++;
    }
  }
  
  const avgAsymmetry = asymmetrySum / sampleCount;
  
  let score = 0;
  let description = '';
  
  // Very high or very low asymmetry can both be suspicious
  if (avgAsymmetry < 10) {
    // Too symmetric - possibly GAN-generated
    score = 50 + (10 - avgAsymmetry) * 5;
    description = `Unusually symmetric (score: ${avgAsymmetry.toFixed(1)}) - possible GAN generation`;
  } else if (avgAsymmetry > 60) {
    // Very asymmetric - possibly face-swapped
    score = 30 + Math.min(50, (avgAsymmetry - 60) * 2);
    description = `High asymmetry detected (score: ${avgAsymmetry.toFixed(1)}) - possible splicing`;
  } else {
    score = Math.max(0, 30 - Math.abs(35 - avgAsymmetry));
    description = `Natural symmetry level (score: ${avgAsymmetry.toFixed(1)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze texture consistency
const analyzeTexture = (data: Uint8ClampedArray, width: number, height: number): { score: number; description: string } => {
  // Local Binary Pattern-like analysis for texture consistency
  const textureScores: number[] = [];
  
  for (let y = 1; y < height - 1; y += 4) {
    for (let x = 1; x < width - 1; x += 4) {
      const getGray = (px: number, py: number) => {
        const idx = (py * width + px) * 4;
        return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      };
      
      const center = getGray(x, y);
      let pattern = 0;
      
      // 8-neighborhood
      const neighbors = [
        getGray(x-1, y-1), getGray(x, y-1), getGray(x+1, y-1),
        getGray(x-1, y), getGray(x+1, y),
        getGray(x-1, y+1), getGray(x, y+1), getGray(x+1, y+1)
      ];
      
      for (let i = 0; i < 8; i++) {
        if (neighbors[i] > center) pattern |= (1 << i);
      }
      
      // Count transitions (uniform patterns are more natural)
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
  
  let score = 0;
  let description = '';
  
  // Unnatural textures have either too few or too many transitions
  if (avgTransitions < 2) {
    score = 60 + (2 - avgTransitions) * 20;
    description = `Smooth/artificial texture detected (transitions: ${avgTransitions.toFixed(2)})`;
  } else if (avgTransitions > 5) {
    score = 40 + (avgTransitions - 5) * 10;
    description = `Noisy texture detected (transitions: ${avgTransitions.toFixed(2)})`;
  } else {
    score = Math.abs(3.5 - avgTransitions) * 15;
    description = `Natural texture patterns (transitions: ${avgTransitions.toFixed(2)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Main analysis function
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
  
  // Collect signals
  const signals: string[] = [];
  const threshold = 50;
  
  if (noiseAnalysis.score > threshold) signals.push(noiseAnalysis.description);
  if (edgeAnalysis.score > threshold) signals.push(edgeAnalysis.description);
  if (colorAnalysis.score > threshold) signals.push(colorAnalysis.description);
  if (compressionAnalysis.score > threshold) signals.push(compressionAnalysis.description);
  if (symmetryAnalysis.score > threshold) signals.push(symmetryAnalysis.description);
  if (textureAnalysis.score > threshold) signals.push(textureAnalysis.description);
  
  // Calculate weighted overall score
  const overallScore = (
    noiseAnalysis.score * 0.25 +
    edgeAnalysis.score * 0.15 +
    colorAnalysis.score * 0.15 +
    compressionAnalysis.score * 0.15 +
    symmetryAnalysis.score * 0.15 +
    textureAnalysis.score * 0.15
  );
  
  return {
    score: Math.round(overallScore),
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
