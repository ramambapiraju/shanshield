// C2PA (Coalition for Content Provenance and Authenticity) Protocol Analyzer
// Verifies content provenance using cryptographic manifests

import { createC2pa, C2pa, ManifestStore } from 'c2pa';

export interface C2PAManifestInfo {
  title?: string;
  format?: string;
  instanceId?: string;
  claimGenerator?: string;
  claimGeneratorInfo?: {
    name?: string;
    version?: string;
  }[];
}

export interface C2PASignatureInfo {
  issuer?: string;
  certSerialNumber?: string;
  time?: string;
  algorithm?: string;
}

export interface C2PAAssertion {
  label: string;
  data: Record<string, unknown>;
  kind?: string;
}

export interface C2PAValidationStatus {
  code: string;
  url?: string;
  explanation?: string;
}

export interface C2PACredential {
  '@context'?: string[];
  type?: string[];
  issuer?: string;
  credentialSubject?: Record<string, unknown>;
}

export interface C2PAResult {
  hasManifest: boolean;
  isValid: boolean;
  validationScore: number;
  manifest?: C2PAManifestInfo;
  signatureInfo?: C2PASignatureInfo;
  assertions: C2PAAssertion[];
  validationStatus: C2PAValidationStatus[];
  credentials: C2PACredential[];
  provenance: {
    creator?: string;
    creationTool?: string;
    creationDate?: string;
    modifications: string[];
    aiGenerated: boolean;
    aiToolName?: string;
  };
  rawData?: unknown;
  error?: string;
}

// Singleton C2PA instance
let c2paInstance: C2pa | null = null;
let initializationPromise: Promise<C2pa> | null = null;

/**
 * Initialize the C2PA SDK (lazy initialization)
 */
async function initializeC2PA(): Promise<C2pa> {
  if (c2paInstance) {
    return c2paInstance;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Dynamic imports for WASM and worker
      const wasmSrc = new URL('c2pa/dist/assets/wasm/toolkit_bg.wasm', import.meta.url).href;
      const workerSrc = new URL('c2pa/dist/c2pa.worker.js', import.meta.url).href;

      c2paInstance = await createC2pa({
        wasmSrc,
        workerSrc,
      });

      console.log('[C2PA] SDK initialized successfully');
      return c2paInstance;
    } catch (error) {
      console.error('[C2PA] Failed to initialize SDK:', error);
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Parse C2PA assertions to extract provenance info
 */
function parseAssertions(assertions: C2PAAssertion[]): {
  creator?: string;
  creationTool?: string;
  creationDate?: string;
  modifications: string[];
  aiGenerated: boolean;
  aiToolName?: string;
} {
  let creator: string | undefined;
  let creationTool: string | undefined;
  let creationDate: string | undefined;
  const modifications: string[] = [];
  let aiGenerated = false;
  let aiToolName: string | undefined;

  for (const assertion of assertions) {
    const label = assertion.label.toLowerCase();
    const data = assertion.data as Record<string, unknown>;

    // Check for creation action
    if (label.includes('c2pa.actions') || label.includes('actions')) {
      const actions = (data.actions || data) as Array<{
        action?: string;
        softwareAgent?: string | { name?: string };
        when?: string;
        parameters?: Record<string, unknown>;
      }>;

      if (Array.isArray(actions)) {
        for (const action of actions) {
          if (action.action === 'c2pa.created' || action.action === 'created') {
            if (action.softwareAgent) {
              creationTool = typeof action.softwareAgent === 'string' 
                ? action.softwareAgent 
                : action.softwareAgent.name;
            }
            if (action.when) {
              creationDate = action.when;
            }
          }
          
          // Track modifications
          if (action.action && action.action !== 'c2pa.created') {
            modifications.push(action.action);
          }

          // Check for AI generation parameters
          if (action.parameters) {
            const params = action.parameters as Record<string, unknown>;
            const ingredient = params.ingredient as Record<string, unknown> | undefined;
            if (ingredient?.generative_type === 'AI' || 
                params.generative_type === 'AI' ||
                params.digitalSourceType === 'trainedAlgorithmicMedia') {
              aiGenerated = true;
            }
          }
        }
      }
    }

    // Check for creative work metadata
    if (label.includes('stds.schema-org.creativework') || label.includes('creativework')) {
      if (data.author && Array.isArray(data.author)) {
        const authors = data.author as Array<{ name?: string; '@type'?: string }>;
        creator = authors.map(a => a.name).filter(Boolean).join(', ');
      }
    }

    // Check for AI training/generation assertions
    if (label.includes('c2pa.training-mining') || 
        label.includes('trainedAlgorithmicMedia') ||
        label.includes('generativeai')) {
      aiGenerated = true;
    }

    // Check digital source type
    if (label.includes('stds.exif') || label.includes('exif')) {
      const digitalSourceType = data.digitalSourceType as string;
      if (digitalSourceType?.includes('trainedAlgorithmicMedia') ||
          digitalSourceType?.includes('compositeWithTrainedAlgorithmicMedia')) {
        aiGenerated = true;
      }
    }

    // Check for AI tool assertions
    if (label.includes('c2pa.ai') || label.includes('ai_generated')) {
      aiGenerated = true;
      if (data.model_name) {
        aiToolName = data.model_name as string;
      }
    }
  }

  return {
    creator,
    creationTool,
    creationDate,
    modifications,
    aiGenerated,
    aiToolName
  };
}

/**
 * Calculate validation score based on C2PA validation status
 */
function calculateValidationScore(
  validationStatus: C2PAValidationStatus[],
  hasManifest: boolean
): number {
  if (!hasManifest) {
    return 0;
  }

  if (validationStatus.length === 0) {
    return 100; // No validation issues means valid
  }

  let score = 100;
  
  for (const status of validationStatus) {
    const code = status.code.toLowerCase();
    
    // Critical failures
    if (code.includes('signature.invalid') || 
        code.includes('signingcredential.invalid') ||
        code.includes('claim.signature.mismatch')) {
      score -= 50;
    }
    // Hash mismatches (content modified after signing)
    else if (code.includes('assertion.datahash.mismatch') ||
             code.includes('assertion.bmff.hashmismatch')) {
      score -= 40;
    }
    // Certificate issues
    else if (code.includes('signingcredential.expired') ||
             code.includes('signingcredential.revoked')) {
      score -= 30;
    }
    // Trust issues
    else if (code.includes('signingcredential.untrusted')) {
      score -= 20;
    }
    // Warnings
    else if (code.includes('warning') || code.includes('info')) {
      score -= 5;
    }
    // Unknown issues
    else {
      score -= 10;
    }
  }

  return Math.max(0, score);
}

/**
 * Analyze a file for C2PA content provenance
 */
export async function analyzeC2PA(file: File): Promise<C2PAResult> {
  const result: C2PAResult = {
    hasManifest: false,
    isValid: false,
    validationScore: 0,
    assertions: [],
    validationStatus: [],
    credentials: [],
    provenance: {
      modifications: [],
      aiGenerated: false
    }
  };

  try {
    // Check supported file types
    const supportedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
      'image/avif', 'image/gif', 'image/tiff',
      'video/mp4', 'video/quicktime', 'video/webm',
      'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav',
      'application/pdf'
    ];

    const fileType = file.type.toLowerCase();
    if (!supportedTypes.some(t => fileType.includes(t.split('/')[1]))) {
      result.error = `File type ${file.type} may not support C2PA manifests`;
      console.log(`[C2PA] Unsupported file type: ${file.type}`);
    }

    // Initialize C2PA SDK
    const c2pa = await initializeC2PA();

    // Create a blob URL for the file
    const blobUrl = URL.createObjectURL(file);

    try {
      console.log(`[C2PA] Reading manifest from: ${file.name}`);
      
      // Read the manifest
      const { manifestStore } = await c2pa.read(blobUrl);

      if (!manifestStore) {
        console.log('[C2PA] No manifest found in file');
        result.hasManifest = false;
        return result;
      }

      result.hasManifest = true;

      // Get the active manifest
      const activeManifest = manifestStore.activeManifest;

      if (activeManifest) {
        // Extract manifest info
        result.manifest = {
          title: activeManifest.title,
          format: activeManifest.format,
          instanceId: activeManifest.instanceId,
          claimGenerator: activeManifest.claimGenerator,
          claimGeneratorInfo: activeManifest.claimGeneratorInfo
        };

        // Extract signature info
        if (activeManifest.signatureInfo) {
          const sigInfo = activeManifest.signatureInfo as Record<string, unknown>;
          result.signatureInfo = {
            issuer: sigInfo.issuer as string | undefined,
            certSerialNumber: (sigInfo.cert_serial_number || sigInfo.certSerialNumber) as string | undefined,
            time: sigInfo.time as string | undefined,
            algorithm: (sigInfo.alg || sigInfo.algorithm) as string | undefined
          };
        }

        // Extract assertions
        if (activeManifest.assertions) {
          const assertions = activeManifest.assertions as unknown;
          if (Array.isArray(assertions)) {
            result.assertions = assertions.map((a: Record<string, unknown>) => ({
              label: a.label as string,
              data: a.data as Record<string, unknown>,
              kind: a.kind as string | undefined
            }));
          } else if (typeof assertions === 'object' && assertions !== null) {
            // Handle AssertionAccessor object
            const assertionObj = assertions as { get?: (label: string) => unknown };
            // Try to get common assertion labels
            const commonLabels = [
              'c2pa.actions',
              'stds.schema-org.CreativeWork',
              'c2pa.hash.data',
              'stds.exif'
            ];
            for (const label of commonLabels) {
              try {
                const data = assertionObj.get?.(label);
                if (data) {
                  result.assertions.push({
                    label,
                    data: data as Record<string, unknown>
                  });
                }
              } catch {
                // Label not found, continue
              }
            }
          }
        }

        // Extract credentials
        if (activeManifest.credentials) {
          result.credentials = activeManifest.credentials.map((c: any) => ({
            '@context': c['@context'],
            type: c.type,
            issuer: c.issuer,
            credentialSubject: c.credentialSubject
          }));
        }
      }

      // Get validation status
      if (manifestStore.validationStatus) {
        result.validationStatus = manifestStore.validationStatus.map((s: any) => ({
          code: s.code,
          url: s.url,
          explanation: s.explanation
        }));
      }

      // Parse provenance from assertions
      result.provenance = parseAssertions(result.assertions);

      // Calculate validation score
      result.validationScore = calculateValidationScore(
        result.validationStatus,
        result.hasManifest
      );

      // Determine if valid
      result.isValid = result.validationScore >= 80;

      // Store raw data for debugging
      result.rawData = {
        activeManifest,
        manifests: manifestStore.manifests
      };

      console.log('[C2PA] Analysis complete:', {
        hasManifest: result.hasManifest,
        isValid: result.isValid,
        validationScore: result.validationScore,
        aiGenerated: result.provenance.aiGenerated
      });

    } finally {
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
    }

  } catch (error) {
    console.error('[C2PA] Analysis error:', error);
    result.error = error instanceof Error ? error.message : 'Unknown C2PA analysis error';
  }

  return result;
}

/**
 * Quick check if a file might have C2PA data (checks magic bytes)
 * This is a fast pre-check before full analysis
 */
export async function hasC2PAIndicators(file: File): Promise<boolean> {
  try {
    // Read first 64KB to check for JUMBF box markers
    const buffer = await file.slice(0, 65536).arrayBuffer();
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // Look for 'jumb' or 'jumd' box type (JUMBF markers)
    const jumbPattern = [0x6A, 0x75, 0x6D, 0x62]; // 'jumb'
    const jumdPattern = [0x6A, 0x75, 0x6D, 0x64]; // 'jumd'
    const c2paPattern = [0x63, 0x32, 0x70, 0x61]; // 'c2pa'
    const manifestPattern = [0x63, 0x32, 0x6D, 0x61]; // 'c2ma' (C2PA manifest)

    for (let i = 0; i < bytes.length - 4; i++) {
      // Check for JUMBF markers
      if ((bytes[i] === jumbPattern[0] && bytes[i+1] === jumbPattern[1] && 
           bytes[i+2] === jumbPattern[2] && bytes[i+3] === jumbPattern[3]) ||
          (bytes[i] === jumdPattern[0] && bytes[i+1] === jumdPattern[1] && 
           bytes[i+2] === jumdPattern[2] && bytes[i+3] === jumdPattern[3]) ||
          (bytes[i] === c2paPattern[0] && bytes[i+1] === c2paPattern[1] && 
           bytes[i+2] === c2paPattern[2] && bytes[i+3] === c2paPattern[3]) ||
          (bytes[i] === manifestPattern[0] && bytes[i+1] === manifestPattern[1] && 
           bytes[i+2] === manifestPattern[2] && bytes[i+3] === manifestPattern[3])) {
        console.log('[C2PA] Found JUMBF/C2PA indicator at offset', i);
        return true;
      }
    }

    // For JPEG files, look for APP11 marker with C2PA data
    if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg')) {
      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0xFF && bytes[i+1] === 0xEB) { // APP11 marker
          console.log('[C2PA] Found JPEG APP11 marker (potential C2PA)');
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('[C2PA] Error checking for indicators:', error);
    return false;
  }
}

/**
 * Format C2PA result for display
 */
export function formatC2PAResult(result: C2PAResult): string[] {
  const lines: string[] = [];

  if (!result.hasManifest) {
    lines.push('❌ No C2PA manifest found');
    lines.push('This file does not contain content provenance data.');
    return lines;
  }

  lines.push('✅ C2PA Manifest Found');
  
  if (result.isValid) {
    lines.push(`✅ Signature Valid (Score: ${result.validationScore}%)`);
  } else {
    lines.push(`⚠️ Validation Issues (Score: ${result.validationScore}%)`);
  }

  if (result.signatureInfo?.issuer) {
    lines.push(`📜 Signed by: ${result.signatureInfo.issuer}`);
  }

  if (result.signatureInfo?.time) {
    lines.push(`📅 Signed: ${new Date(result.signatureInfo.time).toLocaleString()}`);
  }

  if (result.provenance.creationTool) {
    lines.push(`🔧 Created with: ${result.provenance.creationTool}`);
  }

  if (result.provenance.creator) {
    lines.push(`👤 Creator: ${result.provenance.creator}`);
  }

  if (result.provenance.aiGenerated) {
    lines.push(`🤖 AI-GENERATED CONTENT DECLARED`);
    if (result.provenance.aiToolName) {
      lines.push(`   Tool: ${result.provenance.aiToolName}`);
    }
  }

  if (result.provenance.modifications.length > 0) {
    lines.push(`📝 Modifications: ${result.provenance.modifications.join(', ')}`);
  }

  if (result.validationStatus.length > 0) {
    lines.push('');
    lines.push('Validation Details:');
    for (const status of result.validationStatus) {
      lines.push(`  • ${status.code}: ${status.explanation || 'No details'}`);
    }
  }

  return lines;
}
