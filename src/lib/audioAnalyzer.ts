// Real Audio Analysis - Frequency and spectral analysis for deepfake detection

export interface AudioAnalysisFindings {
  score: number;
  signals: string[];
  details: {
    spectralAnalysis: { score: number; description: string };
    pitchConsistency: { score: number; description: string };
    noiseFloor: { score: number; description: string };
    compressionArtifacts: { score: number; description: string };
    voiceNaturalness: { score: number; description: string };
    frequencyDistribution: { score: number; description: string };
  };
  duration: number;
  sampleRate: number;
}

// Load audio file and decode
const loadAudioBuffer = (file: File): Promise<AudioBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const audioContext = new AudioContext();
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioContext.close();
        resolve(audioBuffer);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsArrayBuffer(file);
  });
};

// Perform FFT on audio samples
const computeFFT = (samples: Float32Array, fftSize: number = 2048): Float32Array => {
  const real = new Float32Array(fftSize);
  const imag = new Float32Array(fftSize);
  
  // Copy samples to real array
  for (let i = 0; i < Math.min(samples.length, fftSize); i++) {
    real[i] = samples[i];
  }
  
  // Simple DFT (for demonstration - in production use a proper FFT library)
  const magnitudes = new Float32Array(fftSize / 2);
  
  for (let k = 0; k < fftSize / 2; k++) {
    let realSum = 0;
    let imagSum = 0;
    
    for (let n = 0; n < fftSize; n++) {
      const angle = (2 * Math.PI * k * n) / fftSize;
      realSum += real[n] * Math.cos(angle);
      imagSum -= real[n] * Math.sin(angle);
    }
    
    magnitudes[k] = Math.sqrt(realSum * realSum + imagSum * imagSum) / fftSize;
  }
  
  return magnitudes;
};

// Analyze spectral characteristics
const analyzeSpectrum = (audioBuffer: AudioBuffer): { score: number; description: string } => {
  const samples = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const chunkSize = 2048;
  const numChunks = Math.min(20, Math.floor(samples.length / chunkSize));
  
  const spectralCentroids: number[] = [];
  const spectralFlatness: number[] = [];
  
  for (let i = 0; i < numChunks; i++) {
    const start = Math.floor((samples.length / numChunks) * i);
    const chunk = samples.slice(start, start + chunkSize);
    const magnitudes = computeFFT(new Float32Array(chunk), chunkSize);
    
    // Calculate spectral centroid
    let weightedSum = 0;
    let totalMagnitude = 0;
    for (let j = 0; j < magnitudes.length; j++) {
      const freq = (j * sampleRate) / chunkSize;
      weightedSum += freq * magnitudes[j];
      totalMagnitude += magnitudes[j];
    }
    spectralCentroids.push(totalMagnitude > 0 ? weightedSum / totalMagnitude : 0);
    
    // Calculate spectral flatness (ratio of geometric to arithmetic mean)
    let logSum = 0;
    let linearSum = 0;
    let validBins = 0;
    for (let j = 1; j < magnitudes.length; j++) {
      if (magnitudes[j] > 0.0001) {
        logSum += Math.log(magnitudes[j]);
        linearSum += magnitudes[j];
        validBins++;
      }
    }
    if (validBins > 0) {
      const geometricMean = Math.exp(logSum / validBins);
      const arithmeticMean = linearSum / validBins;
      spectralFlatness.push(arithmeticMean > 0 ? geometricMean / arithmeticMean : 0);
    }
  }
  
  // Analyze centroid consistency
  const avgCentroid = spectralCentroids.reduce((a, b) => a + b, 0) / spectralCentroids.length;
  const centroidVariance = spectralCentroids.reduce((sum, val) => sum + Math.pow(val - avgCentroid, 2), 0) / spectralCentroids.length;
  const centroidCV = (Math.sqrt(centroidVariance) / avgCentroid) * 100;
  
  // Synthesized audio often has unnatural spectral flatness
  const avgFlatness = spectralFlatness.reduce((a, b) => a + b, 0) / spectralFlatness.length;
  
  let score = 0;
  let description = '';
  
  if (centroidCV < 15 && avgFlatness > 0.3) {
    score = 65 + (0.3 - avgFlatness) * 50 + (15 - centroidCV);
    description = `Unnaturally consistent spectrum (CV: ${centroidCV.toFixed(1)}%, flatness: ${(avgFlatness * 100).toFixed(1)}%)`;
  } else if (centroidCV < 25 || avgFlatness > 0.25) {
    score = 35 + (25 - centroidCV) + (avgFlatness - 0.25) * 100;
    description = `Moderate spectral regularity (CV: ${centroidCV.toFixed(1)}%)`;
  } else {
    score = Math.max(0, 30 - centroidCV / 3);
    description = `Natural spectral variation (CV: ${centroidCV.toFixed(1)}%)`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze pitch consistency
const analyzePitch = (audioBuffer: AudioBuffer): { score: number; description: string } => {
  const samples = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const frameSize = 2048;
  const hopSize = 512;
  
  const pitchEstimates: number[] = [];
  
  for (let start = 0; start + frameSize < samples.length; start += hopSize * 4) {
    const frame = samples.slice(start, start + frameSize);
    
    // Autocorrelation-based pitch detection
    const autocorr = new Float32Array(frameSize);
    for (let lag = 20; lag < frameSize / 2; lag++) {
      let sum = 0;
      for (let i = 0; i < frameSize - lag; i++) {
        sum += frame[i] * frame[i + lag];
      }
      autocorr[lag] = sum;
    }
    
    // Find peak
    let maxVal = 0;
    let maxLag = 0;
    for (let lag = 50; lag < Math.min(400, frameSize / 2); lag++) {
      if (autocorr[lag] > maxVal) {
        maxVal = autocorr[lag];
        maxLag = lag;
      }
    }
    
    if (maxLag > 0 && maxVal > 0.1) {
      const freq = sampleRate / maxLag;
      if (freq > 50 && freq < 500) {
        pitchEstimates.push(freq);
      }
    }
  }
  
  if (pitchEstimates.length < 5) {
    return { score: 25, description: 'Insufficient voiced segments for pitch analysis' };
  }
  
  // Analyze pitch variation
  const avgPitch = pitchEstimates.reduce((a, b) => a + b, 0) / pitchEstimates.length;
  const pitchVariance = pitchEstimates.reduce((sum, val) => sum + Math.pow(val - avgPitch, 2), 0) / pitchEstimates.length;
  const pitchCV = (Math.sqrt(pitchVariance) / avgPitch) * 100;
  
  // Check for unnatural pitch jumps
  let largeJumps = 0;
  for (let i = 1; i < pitchEstimates.length; i++) {
    const jump = Math.abs(pitchEstimates[i] - pitchEstimates[i - 1]) / pitchEstimates[i - 1];
    if (jump > 0.3) largeJumps++;
  }
  const jumpRate = (largeJumps / pitchEstimates.length) * 100;
  
  let score = 0;
  let description = '';
  
  if (pitchCV < 5) {
    score = 70 + (5 - pitchCV) * 6;
    description = `Unnaturally stable pitch (CV: ${pitchCV.toFixed(1)}%) - possible synthesis`;
  } else if (jumpRate > 30) {
    score = 55 + jumpRate / 2;
    description = `Excessive pitch discontinuities (${jumpRate.toFixed(1)}% large jumps)`;
  } else if (pitchCV < 10 || jumpRate > 20) {
    score = 30 + (10 - pitchCV) * 2 + jumpRate;
    description = `Some pitch irregularities detected`;
  } else {
    score = Math.max(0, 25 - pitchCV / 2);
    description = `Natural pitch variation (CV: ${pitchCV.toFixed(1)}%)`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze noise floor
const analyzeNoiseFloor = (audioBuffer: AudioBuffer): { score: number; description: string } => {
  const samples = audioBuffer.getChannelData(0);
  
  // Find quiet sections
  const windowSize = 1024;
  const rmsValues: number[] = [];
  
  for (let i = 0; i + windowSize < samples.length; i += windowSize) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += samples[i + j] * samples[i + j];
    }
    rmsValues.push(Math.sqrt(sum / windowSize));
  }
  
  rmsValues.sort((a, b) => a - b);
  
  // Get lowest 10% as noise floor estimate
  const noiseFloorSamples = rmsValues.slice(0, Math.floor(rmsValues.length * 0.1));
  const avgNoiseFloor = noiseFloorSamples.reduce((a, b) => a + b, 0) / noiseFloorSamples.length;
  
  // Check noise floor consistency
  const noiseVariance = noiseFloorSamples.reduce((sum, val) => sum + Math.pow(val - avgNoiseFloor, 2), 0) / noiseFloorSamples.length;
  const noiseCV = (Math.sqrt(noiseVariance) / (avgNoiseFloor + 0.0001)) * 100;
  
  let score = 0;
  let description = '';
  
  // Synthesized audio often has unnaturally clean or uniform noise floor
  if (avgNoiseFloor < 0.001 || noiseCV < 10) {
    score = 60 + (10 - noiseCV) * 2 + (0.001 - avgNoiseFloor) * 10000;
    description = `Unnaturally clean noise floor (level: ${(avgNoiseFloor * 1000).toFixed(2)}, CV: ${noiseCV.toFixed(1)}%)`;
  } else if (avgNoiseFloor < 0.005 || noiseCV < 20) {
    score = 30 + (20 - noiseCV);
    description = `Very low noise floor (level: ${(avgNoiseFloor * 1000).toFixed(2)})`;
  } else {
    score = Math.max(0, 25 - noiseCV / 4);
    description = `Natural ambient noise present (level: ${(avgNoiseFloor * 1000).toFixed(2)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze compression artifacts
const analyzeAudioCompression = (audioBuffer: AudioBuffer): { score: number; description: string } => {
  const samples = audioBuffer.getChannelData(0);
  
  // Check for quantization artifacts
  const uniqueValues = new Set<number>();
  const quantizationErrors: number[] = [];
  
  for (let i = 0; i < Math.min(samples.length, 50000); i += 10) {
    const val = Math.round(samples[i] * 32768) / 32768;
    uniqueValues.add(val);
    quantizationErrors.push(Math.abs(samples[i] - val));
  }
  
  const avgQuantError = quantizationErrors.reduce((a, b) => a + b, 0) / quantizationErrors.length;
  const uniqueRatio = uniqueValues.size / (samples.length / 10);
  
  let score = 0;
  let description = '';
  
  if (uniqueRatio < 0.1 || avgQuantError < 0.00001) {
    score = 55 + (0.1 - uniqueRatio) * 200;
    description = `Heavy quantization detected (${uniqueValues.size} unique levels)`;
  } else if (uniqueRatio < 0.3) {
    score = 30 + (0.3 - uniqueRatio) * 80;
    description = `Moderate compression artifacts`;
  } else {
    score = Math.max(0, 25 - uniqueRatio * 20);
    description = `Normal audio quality (${uniqueValues.size} levels)`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze voice naturalness
const analyzeVoiceNaturalness = (audioBuffer: AudioBuffer): { score: number; description: string } => {
  const samples = audioBuffer.getChannelData(0);
  
  // Analyze attack/decay patterns
  const envelopeChanges: number[] = [];
  const windowSize = 256;
  
  let prevEnvelope = 0;
  for (let i = 0; i + windowSize < samples.length; i += windowSize) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += Math.abs(samples[i + j]);
    }
    const envelope = sum / windowSize;
    envelopeChanges.push(envelope - prevEnvelope);
    prevEnvelope = envelope;
  }
  
  // Natural speech has varied attack/decay patterns
  const positiveChanges = envelopeChanges.filter(c => c > 0.01).length;
  const negativeChanges = envelopeChanges.filter(c => c < -0.01).length;
  const ratio = Math.min(positiveChanges, negativeChanges) / (Math.max(positiveChanges, negativeChanges) + 1);
  
  // Check for unnatural symmetry in envelope
  const avgChange = envelopeChanges.reduce((a, b) => a + b, 0) / envelopeChanges.length;
  const changeVariance = envelopeChanges.reduce((sum, val) => sum + Math.pow(val - avgChange, 2), 0) / envelopeChanges.length;
  
  let score = 0;
  let description = '';
  
  if (ratio > 0.9 || changeVariance < 0.0001) {
    score = 60 + (ratio - 0.9) * 100;
    description = `Unnatural voice envelope symmetry (ratio: ${ratio.toFixed(2)})`;
  } else if (ratio > 0.7) {
    score = 30 + (ratio - 0.7) * 100;
    description = `Moderately regular voice pattern`;
  } else {
    score = ratio * 30;
    description = `Natural voice dynamics (ratio: ${ratio.toFixed(2)})`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Analyze frequency distribution
const analyzeFrequencyDistribution = (audioBuffer: AudioBuffer): { score: number; description: string } => {
  const samples = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const fftSize = 4096;
  
  // Analyze multiple segments
  const numSegments = Math.min(10, Math.floor(samples.length / fftSize));
  const bandEnergies: number[][] = [];
  
  const bands = [
    { name: 'Low', min: 20, max: 300 },
    { name: 'Mid-Low', min: 300, max: 1000 },
    { name: 'Mid', min: 1000, max: 3000 },
    { name: 'Mid-High', min: 3000, max: 8000 },
    { name: 'High', min: 8000, max: 20000 }
  ];
  
  for (let seg = 0; seg < numSegments; seg++) {
    const start = Math.floor((samples.length / numSegments) * seg);
    const chunk = samples.slice(start, start + fftSize);
    const magnitudes = computeFFT(new Float32Array(chunk), fftSize);
    
    const segmentEnergies: number[] = [];
    for (const band of bands) {
      const minBin = Math.floor((band.min * fftSize) / sampleRate);
      const maxBin = Math.floor((band.max * fftSize) / sampleRate);
      let energy = 0;
      for (let b = minBin; b < Math.min(maxBin, magnitudes.length); b++) {
        energy += magnitudes[b] * magnitudes[b];
      }
      segmentEnergies.push(energy);
    }
    bandEnergies.push(segmentEnergies);
  }
  
  // Check for unnatural frequency balance
  const avgEnergies = bands.map((_, i) => 
    bandEnergies.reduce((sum, seg) => sum + seg[i], 0) / bandEnergies.length
  );
  
  const totalEnergy = avgEnergies.reduce((a, b) => a + b, 0);
  const normalizedEnergies = avgEnergies.map(e => e / (totalEnergy + 0.0001));
  
  // Check high frequency content (TTS often lacks natural high freq)
  const highFreqRatio = normalizedEnergies[4] + normalizedEnergies[3];
  
  let score = 0;
  let description = '';
  
  if (highFreqRatio < 0.05) {
    score = 55 + (0.05 - highFreqRatio) * 500;
    description = `Limited high-frequency content (${(highFreqRatio * 100).toFixed(1)}%) - possible TTS`;
  } else if (highFreqRatio < 0.15) {
    score = 30 + (0.15 - highFreqRatio) * 150;
    description = `Reduced high-frequency presence`;
  } else {
    score = Math.max(0, 25 - highFreqRatio * 50);
    description = `Natural frequency distribution`;
  }
  
  return { score: Math.min(100, Math.max(0, score)), description };
};

// Main audio analysis function
export const analyzeAudio = async (file: File): Promise<AudioAnalysisFindings> => {
  try {
    const audioBuffer = await loadAudioBuffer(file);
    
    const spectralAnalysis = analyzeSpectrum(audioBuffer);
    const pitchConsistency = analyzePitch(audioBuffer);
    const noiseFloor = analyzeNoiseFloor(audioBuffer);
    const compressionArtifacts = analyzeAudioCompression(audioBuffer);
    const voiceNaturalness = analyzeVoiceNaturalness(audioBuffer);
    const frequencyDistribution = analyzeFrequencyDistribution(audioBuffer);
    
    const signals: string[] = [];
    const threshold = 50;
    
    if (spectralAnalysis.score > threshold) signals.push(spectralAnalysis.description);
    if (pitchConsistency.score > threshold) signals.push(pitchConsistency.description);
    if (noiseFloor.score > threshold) signals.push(noiseFloor.description);
    if (compressionArtifacts.score > threshold) signals.push(compressionArtifacts.description);
    if (voiceNaturalness.score > threshold) signals.push(voiceNaturalness.description);
    if (frequencyDistribution.score > threshold) signals.push(frequencyDistribution.description);
    
    const overallScore = (
      spectralAnalysis.score * 0.20 +
      pitchConsistency.score * 0.20 +
      noiseFloor.score * 0.15 +
      compressionArtifacts.score * 0.15 +
      voiceNaturalness.score * 0.15 +
      frequencyDistribution.score * 0.15
    );
    
    return {
      score: Math.round(overallScore),
      signals,
      details: {
        spectralAnalysis,
        pitchConsistency,
        noiseFloor,
        compressionArtifacts,
        voiceNaturalness,
        frequencyDistribution
      },
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate
    };
  } catch (err) {
    console.error('Audio analysis error:', err);
    return {
      score: 30,
      signals: ['Audio analysis encountered an error'],
      details: {
        spectralAnalysis: { score: 30, description: 'Analysis failed' },
        pitchConsistency: { score: 30, description: 'Analysis failed' },
        noiseFloor: { score: 30, description: 'Analysis failed' },
        compressionArtifacts: { score: 30, description: 'Analysis failed' },
        voiceNaturalness: { score: 30, description: 'Analysis failed' },
        frequencyDistribution: { score: 30, description: 'Analysis failed' }
      },
      duration: 0,
      sampleRate: 0
    };
  }
};
