// Real Document Analysis - PDF metadata and structure analysis

export interface DocumentAnalysisFindings {
  score: number;
  signals: string[];
  details: {
    metadataAnalysis: { score: number; description: string };
    structureAnalysis: { score: number; description: string };
    contentConsistency: { score: number; description: string };
    creationPatterns: { score: number; description: string };
    embeddedMediaAnalysis: { score: number; description: string };
    modificationHistory: { score: number; description: string };
  };
  fileSize: number;
  pageEstimate: number;
}

// Parse PDF header and metadata
const parsePDFMetadata = async (file: File): Promise<{
  version: string;
  producer: string;
  creator: string;
  creationDate: string;
  modificationDate: string;
  hasEncryption: boolean;
  streamCount: number;
}> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const text = new TextDecoder('latin1').decode(bytes.slice(0, Math.min(100000, bytes.length)));
  
  // Parse PDF version
  const versionMatch = text.match(/%PDF-(\d+\.\d+)/);
  const version = versionMatch ? versionMatch[1] : 'unknown';
  
  // Parse metadata
  const producerMatch = text.match(/\/Producer\s*\(([^)]*)\)/);
  const creatorMatch = text.match(/\/Creator\s*\(([^)]*)\)/);
  const creationMatch = text.match(/\/CreationDate\s*\(D:([^)]*)\)/);
  const modMatch = text.match(/\/ModDate\s*\(D:([^)]*)\)/);
  
  // Count object streams
  const streamMatches = text.match(/stream\r?\n/g);
  const streamCount = streamMatches ? streamMatches.length : 0;
  
  // Check for encryption
  const hasEncryption = text.includes('/Encrypt');
  
  return {
    version,
    producer: producerMatch ? producerMatch[1] : '',
    creator: creatorMatch ? creatorMatch[1] : '',
    creationDate: creationMatch ? creationMatch[1] : '',
    modificationDate: modMatch ? modMatch[1] : '',
    hasEncryption,
    streamCount
  };
};

// Analyze byte patterns for anomalies
const analyzeBytePatterns = async (file: File): Promise<{
  entropyScore: number;
  nullByteRatio: number;
  binaryRatio: number;
  asciiRatio: number;
}> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const sampleSize = Math.min(50000, bytes.length);
  
  let nullCount = 0;
  let binaryCount = 0;
  let asciiCount = 0;
  const byteCounts = new Array(256).fill(0);
  
  for (let i = 0; i < sampleSize; i++) {
    const byte = bytes[i];
    byteCounts[byte]++;
    
    if (byte === 0) nullCount++;
    else if (byte < 32 || byte > 126) binaryCount++;
    else asciiCount++;
  }
  
  // Calculate entropy
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (byteCounts[i] > 0) {
      const p = byteCounts[i] / sampleSize;
      entropy -= p * Math.log2(p);
    }
  }
  
  return {
    entropyScore: entropy / 8 * 100, // Normalize to 0-100
    nullByteRatio: (nullCount / sampleSize) * 100,
    binaryRatio: (binaryCount / sampleSize) * 100,
    asciiRatio: (asciiCount / sampleSize) * 100
  };
};

// Analyze metadata for manipulation indicators
const analyzeMetadata = (metadata: {
  version: string;
  producer: string;
  creator: string;
  creationDate: string;
  modificationDate: string;
  hasEncryption: boolean;
}): { score: number; description: string } => {
  let score = 20;
  const issues: string[] = [];
  
  // Check for suspicious producers/creators
  const suspiciousTools = ['fakepdf', 'pdfforge', 'online', 'converter', 'fake'];
  const producerLower = metadata.producer.toLowerCase();
  const creatorLower = metadata.creator.toLowerCase();
  
  for (const tool of suspiciousTools) {
    if (producerLower.includes(tool) || creatorLower.includes(tool)) {
      score += 25;
      issues.push(`Suspicious tool: ${tool}`);
    }
  }
  
  // Check date consistency
  if (metadata.creationDate && metadata.modificationDate) {
    const createTime = metadata.creationDate.substring(0, 8);
    const modTime = metadata.modificationDate.substring(0, 8);
    
    if (modTime < createTime) {
      score += 30;
      issues.push('Modification date before creation date');
    }
  }
  
  // Missing metadata is slightly suspicious
  if (!metadata.creator && !metadata.producer) {
    score += 15;
    issues.push('Missing producer/creator metadata');
  }
  
  // Very old PDF version with modern features
  if (metadata.version && parseFloat(metadata.version) < 1.4 && metadata.hasEncryption) {
    score += 20;
    issues.push('Old PDF version with modern encryption');
  }
  
  const description = issues.length > 0 
    ? `Metadata issues: ${issues.join('; ')}`
    : `Standard metadata (v${metadata.version}, ${metadata.producer || 'unknown producer'})`;
  
  return { score: Math.min(100, score), description };
};

// Analyze document structure
const analyzeStructure = (metadata: { streamCount: number }, bytePatterns: { entropyScore: number; binaryRatio: number }): { score: number; description: string } => {
  let score = 20;
  const observations: string[] = [];
  
  // Very high entropy can indicate obfuscation
  if (bytePatterns.entropyScore > 90) {
    score += 30;
    observations.push('Very high entropy - possible obfuscation');
  } else if (bytePatterns.entropyScore > 80) {
    score += 15;
    observations.push('High entropy content');
  }
  
  // Too many streams relative to size might indicate manipulation
  const expectedStreams = metadata.streamCount;
  if (expectedStreams > 100) {
    score += 20;
    observations.push(`Unusual stream count (${expectedStreams})`);
  }
  
  // Very low binary ratio for a PDF is unusual
  if (bytePatterns.binaryRatio < 10) {
    score += 15;
    observations.push('Unusually text-heavy for PDF');
  }
  
  const description = observations.length > 0
    ? observations.join('; ')
    : `Normal structure (${metadata.streamCount} streams, entropy: ${bytePatterns.entropyScore.toFixed(1)}%)`;
  
  return { score: Math.min(100, score), description };
};

// Analyze content consistency
const analyzeContentConsistency = (bytePatterns: { nullByteRatio: number; asciiRatio: number }): { score: number; description: string } => {
  let score = 20;
  
  // Excessive null bytes can indicate padding or manipulation
  if (bytePatterns.nullByteRatio > 20) {
    score += 35;
    return { 
      score: Math.min(100, score), 
      description: `Excessive null byte padding (${bytePatterns.nullByteRatio.toFixed(1)}%)` 
    };
  } else if (bytePatterns.nullByteRatio > 10) {
    score += 20;
    return { 
      score: Math.min(100, score), 
      description: `High null byte ratio (${bytePatterns.nullByteRatio.toFixed(1)}%)` 
    };
  }
  
  return { 
    score, 
    description: `Normal content distribution (${bytePatterns.asciiRatio.toFixed(1)}% ASCII)` 
  };
};

// Analyze creation patterns
const analyzeCreationPatterns = (metadata: { producer: string; creator: string; creationDate: string }): { score: number; description: string } => {
  let score = 20;
  const patterns: string[] = [];
  
  // Check for known legitimate producers
  const legitimateProducers = ['adobe', 'microsoft', 'libreoffice', 'apple', 'google'];
  const producerLower = metadata.producer.toLowerCase();
  
  let foundLegitimate = false;
  for (const prod of legitimateProducers) {
    if (producerLower.includes(prod)) {
      foundLegitimate = true;
      break;
    }
  }
  
  if (!foundLegitimate && metadata.producer) {
    score += 15;
    patterns.push(`Uncommon producer: ${metadata.producer}`);
  }
  
  // Check creation date format
  if (metadata.creationDate) {
    // Valid dates should start with year
    if (!/^\d{4}/.test(metadata.creationDate)) {
      score += 20;
      patterns.push('Invalid date format');
    }
  }
  
  const description = patterns.length > 0
    ? patterns.join('; ')
    : `Standard creation pattern`;
  
  return { score: Math.min(100, score), description };
};

// Analyze embedded media
const analyzeEmbeddedMedia = async (file: File): Promise<{ score: number; description: string }> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const text = new TextDecoder('latin1').decode(bytes);
  
  let score = 20;
  const findings: string[] = [];
  
  // Check for embedded images
  const jpegCount = (text.match(/\/DCTDecode/g) || []).length;
  const jpxCount = (text.match(/\/JPXDecode/g) || []).length;
  const pngCount = (text.match(/\/FlateDecode/g) || []).length;
  
  const totalImages = jpegCount + jpxCount + pngCount;
  
  if (totalImages > 50) {
    score += 25;
    findings.push(`Many embedded images (${totalImages})`);
  } else if (totalImages > 0) {
    findings.push(`Contains ${totalImages} embedded image(s)`);
  }
  
  // Check for embedded JavaScript (often suspicious)
  if (text.includes('/JavaScript') || text.includes('/JS')) {
    score += 30;
    findings.push('Contains embedded JavaScript');
  }
  
  // Check for embedded files
  if (text.includes('/EmbeddedFile')) {
    score += 15;
    findings.push('Contains embedded files');
  }
  
  // Check for forms
  if (text.includes('/AcroForm')) {
    findings.push('Contains interactive forms');
  }
  
  const description = findings.length > 0
    ? findings.join('; ')
    : 'No significant embedded media detected';
  
  return { score: Math.min(100, score), description };
};

// Analyze modification history
const analyzeModificationHistory = (metadata: { creationDate: string; modificationDate: string }): { score: number; description: string } => {
  let score = 20;
  
  if (!metadata.creationDate || !metadata.modificationDate) {
    return { score: 30, description: 'Modification history unavailable' };
  }
  
  // Parse dates
  const parseDate = (dateStr: string): Date | null => {
    try {
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1;
      const day = parseInt(dateStr.substring(6, 8));
      return new Date(year, month, day);
    } catch {
      return null;
    }
  };
  
  const createDate = parseDate(metadata.creationDate);
  const modDate = parseDate(metadata.modificationDate);
  
  if (createDate && modDate) {
    const diffDays = Math.abs(modDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays > 365 * 5) {
      score += 25;
      return { 
        score: Math.min(100, score), 
        description: `Document modified ${Math.floor(diffDays / 365)} years after creation` 
      };
    } else if (diffDays < 0.01) {
      return { score: 15, description: 'Created and modified simultaneously (normal)' };
    } else {
      return { score: 20, description: `Modified ${Math.floor(diffDays)} days after creation` };
    }
  }
  
  return { score: 25, description: 'Could not parse modification dates' };
};

// Main document analysis function
export const analyzeDocument = async (file: File): Promise<DocumentAnalysisFindings> => {
  try {
    const metadata = await parsePDFMetadata(file);
    const bytePatterns = await analyzeBytePatterns(file);
    
    const metadataAnalysis = analyzeMetadata(metadata);
    const structureAnalysis = analyzeStructure(metadata, bytePatterns);
    const contentConsistency = analyzeContentConsistency(bytePatterns);
    const creationPatterns = analyzeCreationPatterns(metadata);
    const embeddedMediaAnalysis = await analyzeEmbeddedMedia(file);
    const modificationHistory = analyzeModificationHistory(metadata);
    
    const signals: string[] = [];
    const threshold = 50;
    
    if (metadataAnalysis.score > threshold) signals.push(metadataAnalysis.description);
    if (structureAnalysis.score > threshold) signals.push(structureAnalysis.description);
    if (contentConsistency.score > threshold) signals.push(contentConsistency.description);
    if (creationPatterns.score > threshold) signals.push(creationPatterns.description);
    if (embeddedMediaAnalysis.score > threshold) signals.push(embeddedMediaAnalysis.description);
    if (modificationHistory.score > threshold) signals.push(modificationHistory.description);
    
    const overallScore = (
      metadataAnalysis.score * 0.20 +
      structureAnalysis.score * 0.20 +
      contentConsistency.score * 0.15 +
      creationPatterns.score * 0.15 +
      embeddedMediaAnalysis.score * 0.15 +
      modificationHistory.score * 0.15
    );
    
    // Estimate page count from file size
    const pageEstimate = Math.max(1, Math.floor(file.size / 50000));
    
    return {
      score: Math.round(overallScore),
      signals,
      details: {
        metadataAnalysis,
        structureAnalysis,
        contentConsistency,
        creationPatterns,
        embeddedMediaAnalysis,
        modificationHistory
      },
      fileSize: file.size,
      pageEstimate
    };
  } catch (err) {
    console.error('Document analysis error:', err);
    return {
      score: 30,
      signals: ['Document analysis encountered an error'],
      details: {
        metadataAnalysis: { score: 30, description: 'Analysis failed' },
        structureAnalysis: { score: 30, description: 'Analysis failed' },
        contentConsistency: { score: 30, description: 'Analysis failed' },
        creationPatterns: { score: 30, description: 'Analysis failed' },
        embeddedMediaAnalysis: { score: 30, description: 'Analysis failed' },
        modificationHistory: { score: 30, description: 'Analysis failed' }
      },
      fileSize: file.size,
      pageEstimate: 1
    };
  }
};
