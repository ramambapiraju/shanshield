# SHANSHIELD — FINAL PRESENTATION SCRIPT (10 MINUTES)
## Complete Code Reference + Highlight Points

---

# 📋 QUICK REFERENCE: HIGHLIGHT POINTS PER SLIDE

| Slide | Title | Key Points to Say |
|-------|-------|-------------------|
| 1 | Title | **6+1 agents**, **100% offline**, **no API keys** |
| 2 | Problem | **$25B fraud**, **73% fail**, **3 flaws** |
| 3 | Architecture | **Dynamic weighting**, **Dempster-Shafer**, **Browser APIs** |
| 4 | Visual Agent | **CV formula**, **Sobel**, **LBP texture** |
| 5 | Audio/Temporal | **FFT**, **Autocorrelation**, **Frame diff** |
| 6 | Explainability | **SHA-256**, **Glass box**, **Court-ready** |
| 7 | Field Mode | **Zero API calls**, **GDPR compliant** |
| 8 | Metadata Agent | **Shannon entropy**, **PDF parsing** |
| 9 | AI Signature | **50+ patterns**, **10%→80% dynamic weight** |
| 10 | Quantum Entropy | **Von Neumann**, **Density matrix** |
| 11 | Arbiter | **Dempster-Shafer**, **Belief fusion** |
| 12 | Demo | **Live upload** |
| 13 | Thank You | **Summary + Q&A** |

---

# 🎤 PART 1: 10-MINUTE PRESENTATION SCRIPT

---

## SLIDE 1: TITLE (30 seconds)

### 📍 SAY THIS:
> "Good [morning/afternoon], I'm Shanmuka Sai Varma, presenting **SHANSHIELD** — a Multi-Agent Forensic Intelligence system for deepfake detection.
>
> SHANSHIELD runs **6+1 AI Agents** — Visual, Audio, Temporal, AI Signature, Metadata, Quantum Entropy, plus an Arbiter.
>
> It's **100% client-side** — works completely offline with **zero API keys** required.
>
> Let me show you how we're solving the deepfake crisis."

### 🎯 HIGHLIGHT:
- 6 specialized agents + 1 Arbiter (not 4+1)
- 100% offline, no cloud, no subscriptions
- Free to use

---

## SLIDE 2: THE PROBLEM (1 minute)

### 📍 SAY THIS:
> "Deepfakes are a **$25 billion problem**. Over **500,000 deepfakes** are shared daily, and studies show **73% of humans fail** to detect them.
>
> Current solutions have **three fatal flaws**:
>
> 1. **Single-Modal Blindness** — They analyze video OR audio, never both.
>
> 2. **Black Box Crisis** — '85% fake' is useless in court. WHERE is the manipulation? WHY do you say fake?
>
> 3. **Cloud Dependency** — Border agents need offline detection. None exists.
>
> SHANSHIELD solves **all three**."

### 🎯 HIGHLIGHT:
- $25B annual fraud losses
- 73% of humans can't detect deepfakes
- Three fatal flaws → our solution

---

## SLIDE 3: MULTI-AGENT ARCHITECTURE (1 min 30 sec)

### 📍 SAY THIS:
> "Our architecture uses **6 specialized agents** plus an **Arbiter**:
>
> - **Visual Agent** analyzes noise patterns, edges, textures
> - **Audio Agent** uses FFT spectral analysis
> - **Temporal Agent** checks frame consistency
> - **AI Signature Agent** has **DYNAMIC weighting** — jumps from 10% to **80%** when an AI tool is detected!
> - **Metadata Agent** uses SHA-256 hashing
> - **Quantum Entropy Agent** uses Von Neumann entropy from quantum physics
>
> All agents report to the **Arbiter** using **Dempster-Shafer belief fusion**.
>
> See the green banner? **100% Browser-Native APIs** — Canvas, Web Audio, Web Crypto, FileReader. **Zero external API calls**."

### 🔴 CODE REFERENCE (imageAnalyzer.ts Lines 667-685):
```typescript
// STEP 8: DYNAMIC WEIGHTING BASED ON METADATA EVIDENCE
if (metadataResult.score >= 85) {
  // DEFINITIVE AI TOOL DETECTED (filename like "kling_xxx")
  metadataWeight = 0.80;  // Metadata DOMINATES
  pixelWeight = 0.20;
} else if (metadataResult.score >= 70) {
  metadataWeight = 0.60;  // Strong indicator
  pixelWeight = 0.40;
} else {
  // No AI indicator — pixel analysis primary
  metadataWeight = 0.15;
  pixelWeight = 0.85;
}
```

### 🎯 HIGHLIGHT:
- Dynamic weighting is KEY innovation
- Dempster-Shafer for belief fusion
- Zero external dependencies

---

## SLIDE 4: VISUAL AGENT (1 min 30 sec)

### 📍 SAY THIS:
> "The Visual Agent is in `src/lib/imageAnalyzer.ts`. Let me show you **real code**:
>
> **Noise Pattern Analysis** — GANs produce unnaturally uniform noise:
> ```typescript
> const cv = (stdDev / mean) * 100;  // Coefficient of Variation
> // CV < 30% = synthetic origin (GAN)
> ```
>
> **Sobel Edge Detection** — Detects artificial sharpening:
> ```typescript
> const Gx = [[-1,0,1],[-2,0,2],[-1,0,1]];
> const magnitude = Math.sqrt(gradX² + gradY²);
> ```
>
> **LBP Texture** — Local Binary Patterns detect texture inconsistencies:
> ```typescript
> for (let i = 0; i < 8; i++) {
>   if (neighbors[i] >= centerPixel) lbpCode |= (1 << i);
> }
> ```
>
> Each analysis returns a score AND an explanation — that's explainable AI."

### 🔴 CODE REFERENCE:

| Lines | Function | Formula |
|-------|----------|---------|
| 64-134 | `analyzeNoise()` | CV = (σ/μ) × 100 |
| 136-182 | `analyzeEdges()` | G = √(Gx² + Gy²) |
| 328-391 | `analyzeTexture()` | LBP = Σ s(pᵢ-c)·2ⁱ |

### 🎯 HIGHLIGHT:
- Coefficient of Variation formula
- Sobel gradient magnitude
- All pixel-based, no ML models needed

---

## SLIDE 5: AUDIO & TEMPORAL AGENTS (1 min)

### 📍 SAY THIS:
> "**Audio Agent** uses Web Audio API for real signal processing.
>
> **FFT Spectral Analysis** — Discrete Fourier Transform:
> ```typescript
> for (let k = 0; k < fftSize/2; k++) {
>   const angle = (2 * Math.PI * k * n) / fftSize;
>   realSum += real[n] * Math.cos(angle);
>   magnitudes[k] = Math.sqrt(realSum² + imagSum²);
> }
> ```
>
> **Pitch Autocorrelation** — TTS voices have unnaturally stable pitch:
> ```typescript
> // R(τ) = Σ x(n) × x(n + τ)
> for (let lag = minLag; lag < maxLag; lag++) {
>   sum += buffer[i] * buffer[i + lag];
> }
> ```
>
> **Temporal Agent** extracts video frames and calculates inter-frame differences:
> ```typescript
> const avgDiff = diff / (width * height);
> // High variance = frame inconsistency = deepfake
> ```"

### 🔴 CODE REFERENCE (audioAnalyzer.ts):

| Lines | Function | Formula |
|-------|----------|---------|
| 70-97 | `computeFFT()` | X(k) = Σ x(n)·e^(-2πikn/N) |
| 168-242 | `analyzePitch()` | R(τ) = Σ x(n)·x(n+τ) |

### 🎯 HIGHLIGHT:
- Real DFT implementation
- Autocorrelation for pitch
- Frame difference analysis

---

## SLIDE 6: EXPLAINABILITY (45 sec)

### 📍 SAY THIS:
> "Every verdict comes with **explainable evidence**.
>
> **SHA-256 Chain of Custody** using Web Crypto API:
> ```typescript
> const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
> const hashHex = Array.from(new Uint8Array(hashBuffer))
>   .map(b => b.toString(16).padStart(2, '0')).join('');
> ```
>
> This is a **glass box**, not a black box.
>
> When we say 'synthetic noise with CV 18.2%,' analysts can **verify that independently**.
>
> For courtroom use, every piece of evidence is **traceable and reproducible**."

### 🎯 HIGHLIGHT:
- SHA-256 for file integrity
- Glass box, not black box
- Court-admissible evidence

---

## SLIDE 7: FIELD MODE (30 sec)

### 📍 SAY THIS:
> "Field Mode is designed for first responders:
>
> - **100% offline** — works air-gapped
> - **Zero external API calls** — privacy by design
> - **GDPR compliant** — no data leaves the device
> - Scales to unlimited users at zero cost"

### 🎯 HIGHLIGHT:
- Zero API calls
- Works offline
- GDPR compliant by design

---

## SLIDE 8: METADATA AGENT (45 sec)

### 📍 SAY THIS:
> "The Metadata Agent analyzes file structure using information theory.
>
> **Shannon Entropy** — measures information content:
> ```typescript
> // H = -Σ pᵢ log₂(pᵢ)
> const entropy = -frequencies.reduce((sum, p) => 
>   p > 0 ? sum + p * Math.log2(p) : sum, 0);
> ```
>
> High entropy = encrypted or compressed.
> Low entropy = repeated patterns.
>
> **Magic Byte Verification** — checks file headers:
> ```typescript
> const jpegMagic = [0xFF, 0xD8, 0xFF];
> const pngMagic = [0x89, 0x50, 0x4E, 0x47];
> // If extension says .jpg but bytes say PNG = tampering!
> ```
>
> We also parse PDF metadata (/Producer, /Creator fields) and detect AI tool strings."

### 🔴 CODE REFERENCE (documentAnalyzer.ts):

| Function | Formula | Purpose |
|----------|---------|---------|
| `calculateEntropy()` | H = -Σ pᵢ log₂(pᵢ) | Information content |
| `detectFileSignature()` | Magic bytes | File type verification |
| `parsePDFMetadata()` | Regex parsing | PDF producer/creator |

### 🎯 HIGHLIGHT:
- Shannon Entropy formula
- Magic byte verification (file tampering)
- PDF metadata parsing

---

## SLIDE 9: AI SIGNATURE AGENT — KEY DIFFERENTIATOR (1.5 min)

### 📍 SAY THIS:
> "This is our **SECRET WEAPON** — the AI Signature Agent.
>
> Humans don't name files 'kling_12345.mp4' — AI tools do!
>
> **50+ AI Tool Patterns** in `metadataAnalyzer.ts`:
> ```typescript
> const AI_FILENAME_PATTERNS = [
>   { pattern: /kling/i, tool: 'Kling AI', weight: 95 },
>   { pattern: /midjourney|mj_/i, tool: 'Midjourney', weight: 95 },
>   { pattern: /dall-?e/i, tool: 'DALL-E', weight: 95 },
>   { pattern: /elevenlabs/i, tool: 'ElevenLabs', weight: 95 },
>   // ... 45+ more patterns
> ];
> ```
>
> **CRITICAL — Dynamic Weighting**:
> ```typescript
> if (metadataResult.score >= 85) {
>   metadataWeight = 0.80;  // Metadata DOMINATES at 80%
>   pixelWeight = 0.20;
> }
> ```
>
> **Hard Overrides** ensure AI-named files are ALWAYS flagged:
> ```typescript
> if (metadataResult.detectedAITool && metadataResult.score >= 85) {
>   overallScore = Math.max(overallScore, 88);  // FORCE high score
> }
> ```
>
> A file named 'kling_video.mp4' will **ALWAYS** be flagged as AI-generated."

### 🔴 CODE REFERENCE (metadataAnalyzer.ts):

| Lines | Section | Purpose |
|-------|---------|---------|
| 18-71 | `AI_FILENAME_PATTERNS` | 50+ regex patterns |
| 419-428 | `analyzeMetadata()` | Critical overrides |
| 438-440 | Combined override | Filename + watermark = 95% |

### 🎯 HIGHLIGHT:
- 50+ AI tool patterns
- Dynamic weight 10% → 80%
- Hard overrides for certainty

---

## SLIDE 10: QUANTUM ENTROPY AGENT (1.5 min)

### 📍 SAY THIS:
> "Our **MOST UNIQUE** feature: **Quantum Entropy Analysis**.
>
> Real mathematics from quantum information theory:
>
> **Von Neumann Entropy (1932)**:
> ```
> S(ρ) = -Tr(ρ log₂ ρ) = -Σᵢ λᵢ log₂(λᵢ)
> ```
>
> **Density Matrix Construction**:
> ```typescript
> // ρ = |ψ⟩⟨ψ| (outer product)
> for (let i = 0; i < n; i++) {
>   for (let j = 0; j < n; j++) {
>     rho[i][j] = psi[i] * psi[j];
>   }
> }
> ```
>
> **Min-Entropy** (used in Quantum Key Distribution):
> ```
> H_min = -log₂(max λᵢ)
> ```
>
> **Rényi Entropy** (1961):
> ```
> H₂ = -log₂(Σᵢ λᵢ²)
> ```
>
> **Honest Disclosure:** We run quantum information theory algorithms on **classical hardware**. The MATHEMATICS is from quantum physics textbooks.
>
> This is the **FIRST deepfake tool with quantum entropy analysis**."

### 🔴 CODE REFERENCE (quantumEntropyAnalyzer.ts):

| Lines | Function | Formula |
|-------|----------|---------|
| 51-78 | `constructDensityMatrix()` | ρ = \|ψ⟩⟨ψ\| |
| 115-123 | `calculateVonNeumannEntropy()` | S(ρ) = -Σ λᵢ log₂(λᵢ) |
| 131-135 | `calculateMinEntropy()` | H_min = -log₂(max λᵢ) |
| 145-157 | `calculateRenyiEntropy()` | H₂ = -log₂(Σ λᵢ²) |

### 🎯 HIGHLIGHT:
- Von Neumann (1932) formula
- Density matrix from quantum mechanics
- Honest disclosure about classical hardware

---

## SLIDE 11: ARBITER AGENT (45 sec)

### 📍 SAY THIS:
> "The Arbiter uses **Dempster-Shafer Theory of Evidence** — Glenn Shafer, 1976.
>
> **The Math**:
> ```
> m(A) = Σ m₁(B) × m₂(C) / (1 - K)
> where K = Σ m₁(B) × m₂(C) for B ∩ C = ∅
> ```
>
> Unlike simple averaging:
> - Handles **conflicting evidence** mathematically
> - Maintains **belief, disbelief, and uncertainty** intervals
> - Uses **dynamic weighting** based on agent confidence
>
> If Visual says 'deepfake' at 80% but Audio says 'authentic' at 90%, Dempster-Shafer calculates the **combined belief state**."

### 🎯 HIGHLIGHT:
- Dempster-Shafer (1976)
- Belief fusion, not averaging
- Handles conflict

---

## SLIDE 12: DEMO (30 sec)

### 📍 SAY THIS:
> "Quick demo:
> 1. Upload any image, video, or audio
> 2. Watch the 6 agents analyze
> 3. See verdict with explanations
> 4. Download forensic report
>
> [Upload 'kling_test.jpg' to show instant AI detection]"

### 🎯 HIGHLIGHT:
- Live demonstration
- Show AI filename detection
- Show forensic report

---

## SLIDE 13: THANK YOU (30 sec)

### 📍 SAY THIS:
> "SHANSHIELD summary:
> - **6+1 AI Agents** with multi-modal forensic analysis
> - **100% Client-Side** — works offline
> - **Real Algorithms** — no black boxes
> - **AI Signature Detection** — 50+ tools, dynamic weighting
> - **Quantum Entropy** — unique differentiator
> - **Free** — no API keys required
>
> Thank you! Happy to answer questions."

### 🎯 HIGHLIGHT:
- 6+1 agents
- 100% offline
- Quantum entropy unique
- Free

---

# 📚 PART 2: LINE-BY-LINE CODE REFERENCE

## `src/lib/imageAnalyzer.ts` — Visual Agent + Orchestration

### Function Reference Table

| Lines | Function | What It Does | Key Formula |
|-------|----------|--------------|-------------|
| 24-62 | `loadImageData()` | Load image onto Canvas, get pixel array | Canvas API |
| 64-134 | `analyzeNoise()` | Detect GAN noise uniformity | CV = (σ/μ) × 100 |
| 136-182 | `analyzeEdges()` | Sobel edge detection | G = √(Gx² + Gy²) |
| 184-242 | `analyzeColors()` | Color histogram analysis | Spike detection |
| 244-279 | `analyzeCompression()` | JPEG artifact detection | Block boundary diff |
| 281-326 | `analyzeSymmetry()` | Perfect symmetry detection | Mirror comparison |
| 328-391 | `analyzeTexture()` | LBP texture analysis | LBP = Σ s(pᵢ-c)·2ⁱ |
| 393-471 | `analyzeRepetition()` | Tiling/pattern detection | Shift correlation |
| 473-543 | `analyzeGradient()` | Smooth gradient detection | Gradient variance |
| 551-786 | `analyzeImage()` | **MAIN ORCHESTRATION** | Dynamic weighting |

### `analyzeImage()` Step-by-Step

| Lines | Step | Purpose |
|-------|------|---------|
| 553-554 | Step 1 | Load image data via Canvas API |
| 561 | Step 2 | Run metadata analysis FIRST (catches filenames) |
| 567-574 | Step 3 | Run all 8 pixel-based analyses in parallel |
| 576-583 | Step 4 | Run Quantum Entropy Analysis |
| 596-622 | Step 5 | Collect signals (threshold = 55 for pixel, lower for metadata) |
| 627-642 | Step 6 | Count elevated (>45), high (>70), very high (>85) indicators |
| 648-658 | Step 7 | Calculate weighted pixel score (normalized to 0.90) |
| 664-685 | Step 8 | **DYNAMIC WEIGHTING** — metadata 80% if AI detected |
| 691-701 | Step 9 | Multi-signal boost (only if 5+ elevated) |
| 706 | Step 10 | Combine scores with weights |
| 715-731 | Step 11 | Metadata overrides (AI tool = force high score) |
| 740-744 | Step 12 | Pixel-only overrides (only if 4+ very high) |
| 751-763 | Step 13 | Authentic boost (reduce false positives on real photos) |
| 768-785 | Step 14 | Return final result with all details |

### Key Code: Dynamic Weighting (Lines 664-685)

```typescript
// STEP 8: DYNAMIC WEIGHTING BASED ON METADATA EVIDENCE
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
```

### Key Code: Metadata Overrides (Lines 715-731)

```typescript
// STEP 11: METADATA OVERRIDES — Only when CONCRETE evidence
// If filename clearly indicates AI tool, FORCE high score
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
```

### Key Code: Authentic Boost (Lines 751-763)

```typescript
// STEP 13: AUTHENTIC BOOST — Help real photos score low
if (metadataResult.score < 25 && 
    elevatedCount <= 2 && 
    highCount === 0 && 
    boostedPixelScore < 35) {
  // Genuine authentic-looking content — reduce score
  overallScore = overallScore * 0.80;  // 20% reduction
}
```

---

## `src/lib/metadataAnalyzer.ts` — AI Signature Agent

### Function Reference Table

| Lines | Function | Purpose |
|-------|----------|---------|
| 18-71 | `AI_FILENAME_PATTERNS` | 50+ regex patterns for AI tools |
| 74-123 | `analyzeFilename()` | Match filename against patterns |
| 127-237 | `analyzeWatermarkRegions()` | Detect corner watermarks |
| 240-330 | `analyzeAISignatures()` | Detect AI visual artifacts |
| 333-374 | `analyzeMetadataPatterns()` | File size/date patterns |
| 377-463 | `analyzeMetadata()` | **MAIN FUNCTION** with overrides |

### AI Filename Patterns (Lines 18-71)

```typescript
const AI_FILENAME_PATTERNS = [
  // Video AI generators
  { pattern: /kling/i, tool: 'Kling AI', weight: 95 },
  { pattern: /sora/i, tool: 'OpenAI Sora', weight: 95 },
  { pattern: /runway/i, tool: 'Runway ML', weight: 90 },
  
  // Image AI generators
  { pattern: /midjourney|mj_/i, tool: 'Midjourney', weight: 95 },
  { pattern: /dall-?e/i, tool: 'DALL-E', weight: 95 },
  { pattern: /stable[_-]?diffusion|sd_/i, tool: 'Stable Diffusion', weight: 90 },
  
  // Audio AI generators
  { pattern: /elevenlabs|11labs/i, tool: 'ElevenLabs', weight: 95 },
  { pattern: /suno/i, tool: 'Suno AI', weight: 90 },
  
  // Deepfake specific
  { pattern: /deepfake/i, tool: 'Deepfake Tool', weight: 100 },
  { pattern: /faceswap/i, tool: 'FaceSwap', weight: 95 },
  // ... 45+ more patterns
];
```

### Critical Overrides (Lines 419-440)

```typescript
// If filename clearly indicates AI tool (score >= 85), THIS IS AI CONTENT
if (filenameResult.score >= 85) {
  overallScore = Math.max(overallScore, 92); // Near-certain AI
  signals.unshift(`AI TOOL CONFIRMED: ${filenameResult.tool}`);
} else if (filenameResult.score >= 70) {
  overallScore = Math.max(overallScore, 80); // Highly likely AI
}

// If BOTH filename and watermark indicate AI = definitive
if (filenameResult.score >= 70 && watermarkResult.score >= 50) {
  overallScore = Math.max(overallScore, 95);
}
```

---

## `src/lib/quantumEntropyAnalyzer.ts` — Quantum Agent

### Function Reference Table

| Lines | Function | Formula | Purpose |
|-------|----------|---------|---------|
| 41-45 | `getQuantumGradeRandomness()` | Web Crypto API | Hardware entropy |
| 51-78 | `constructDensityMatrix()` | ρ = \|ψ⟩⟨ψ\| | Build density matrix |
| 84-107 | `computeEigenvalues()` | Gershgorin theorem | Eigenvalue calculation |
| 115-123 | `calculateVonNeumannEntropy()` | S(ρ) = -Σ λᵢ log₂(λᵢ) | Quantum entropy |
| 131-135 | `calculateMinEntropy()` | H_min = -log₂(max λᵢ) | Worst-case unpredictability |
| 145-157 | `calculateRenyiEntropy()` | H₂ = -log₂(Σ λᵢ²) | Collision entropy |
| 165-180 | `calculateQuantumCoherence()` | C(ρ) = Σᵢ≠ⱼ \|ρᵢⱼ\| | Off-diagonal measure |
| 188-190 | `calculatePurity()` | Tr(ρ²) = Σ λᵢ² | Pure state measure |
| 196-225 | `detectEntropyAnomaly()` | Ratio analysis | Manipulation detection |
| 231-273 | `analyzeQuantumEntropy()` | **MAIN FUNCTION** | Complete analysis |

### Von Neumann Entropy Implementation (Lines 115-123)

```typescript
/**
 * Von Neumann Entropy: S(ρ) = -Tr(ρ log₂ ρ) = -Σᵢ λᵢ log₂(λᵢ)
 * 
 * Quantum generalization of Shannon entropy.
 * Pure states: S=0, Maximally mixed: S=log₂(d)
 */
function calculateVonNeumannEntropy(eigenvalues: number[]): number {
  let entropy = 0;
  for (const lambda of eigenvalues) {
    if (lambda > 1e-10) {
      entropy -= lambda * Math.log2(lambda);
    }
  }
  return entropy;
}
```

---

## `src/lib/audioAnalyzer.ts` — Audio Agent

### Function Reference Table

| Lines | Function | Purpose | Key Algorithm |
|-------|----------|---------|---------------|
| 49-68 | `loadAudioBuffer()` | Decode audio file | Web Audio API |
| 70-97 | `computeFFT()` | Discrete Fourier Transform | X(k) = Σ x(n)·e^(-2πikn/N) |
| 100-165 | `analyzeSpectrum()` | Spectral centroid & flatness | Geometric/arithmetic mean |
| 168-242 | `analyzePitch()` | Autocorrelation pitch detection | R(τ) = Σ x(n)·x(n+τ) |
| 245-286 | `analyzeNoiseFloor()` | Noise floor uniformity | RMS analysis |
| 289-320 | `analyzeAudioCompression()` | Quantization artifacts | Unique value count |
| 323-365 | `analyzeVoiceNaturalness()` | Attack/decay patterns | Envelope analysis |
| 368-429 | `analyzeFrequencyDistribution()` | Band energy analysis | 5-band spectrum |
| 433-600 | `analyzeAudioQuantumEntropy()` | Quantum entropy on audio | Spectral density matrix |

---

## `src/lib/videoAnalyzer.ts` — Temporal Agent

### Function Reference Table

| Lines | Function | Purpose |
|-------|----------|---------|
| 24-57 | `extractFrames()` | Extract video frames at intervals |
| 60-106 | `analyzeFrameConsistency()` | Detect frame-to-frame variations |
| 109-184 | `analyzeTemporalCoherence()` | Motion vector discontinuities |
| 187-254 | `analyzeFaceTracking()` | Face region vs background changes |
| 257-306 | `analyzeVideoCompression()` | 8x8 block artifact detection |
| 309-363 | `analyzeMotion()` | Unnatural acceleration patterns |
| 376-526 | `analyzeVideo()` | **MAIN FUNCTION** with metadata weighting |

---

# 🎯 PART 3: Q&A PREPARATION

### Q: "How does the dynamic weighting work?"
> "When we detect an AI tool name in the filename like 'kling_video.mp4', the metadata agent gets 80% weight while pixel analysis drops to 20%. This ensures that obvious AI content — what humans can easily identify — is always caught, even if pixel analysis alone wouldn't flag it."

### Q: "Is the quantum analysis real quantum computing?"
> "Honest answer: No. We run quantum information theory algorithms on classical hardware. The MATHEMATICS is real — Von Neumann entropy from 1932, Rényi entropy from 1961. These are the same formulas used in quantum physics and quantum cryptography. What's unique is applying these to deepfake detection."

### Q: "How do you prevent false positives on real photos?"
> "Three mechanisms: (1) Higher thresholds for pixel-based signals — we only flag if score > 55. (2) Multi-signal requirement — we boost scores only when 5+ detectors agree. (3) Authentic boost — if nothing is suspicious, we reduce the score by 20%. The key principle: aggressive only with CONCRETE evidence like AI filenames."

### Q: "Why client-side instead of cloud?"
> "Three reasons: (1) Privacy — sensitive media never leaves the device. (2) Availability — works offline, air-gapped, no internet required. (3) Cost — scales to unlimited users at zero marginal cost. No API keys, no subscriptions."

### Q: "What makes this different from other deepfake detectors?"
> "Three differentiators: (1) Multi-modal — we analyze video AND audio AND metadata, not just one. (2) Explainability — every verdict comes with specific explanations, not just a percentage. (3) Quantum entropy — we're the first to apply quantum information theory to deepfake detection."

### Q: "What about EXIF metadata extraction?"
> "We use text-pattern matching on file bytes to detect AI tool signatures like 'Midjourney', 'DALL-E' in embedded strings. For PDFs, we parse /Producer, /Creator, and date fields. This is simpler than deep binary EXIF parsing but highly effective for detecting AI tools that embed their names in files."

---

# 📚 PART 4: DETAILED CODE EXPLANATIONS (MISSING FEATURES)

## Local Binary Patterns (LBP) — `analyzeTexture()`

**Location:** `src/lib/imageAnalyzer.ts` Lines 328-391

**What it does:** Compares each pixel to its 8 neighbors to build a texture descriptor. AI images have unnaturally smooth textures.

**Line-by-line:**
```typescript
// Lines 334-348: Sample pixels in a grid
for (let y = 1; y < height - 1; y += 3) {
  for (let x = 1; x < width - 1; x += 3) {
    const center = getGray(x, y);  // Get center pixel grayscale
    
    // Get 8 neighbors around center
    const neighbors = [
      getGray(x-1, y-1), getGray(x, y-1), getGray(x+1, y-1),  // Top row
      getGray(x-1, y),                    getGray(x+1, y),    // Middle
      getGray(x-1, y+1), getGray(x, y+1), getGray(x+1, y+1)   // Bottom row
    ];

// Lines 355-365: Build LBP code and count transitions
    let pattern = 0;
    for (let i = 0; i < 8; i++) {
      if (neighbors[i] > center) pattern |= (1 << i);  // Set bit if neighbor > center
    }
    
    // Count transitions (0→1 or 1→0) around the circle
    let transitions = 0;
    for (let i = 0; i < 8; i++) {
      if (((pattern >> i) & 1) !== ((pattern >> ((i + 1) % 8)) & 1)) {
        transitions++;
      }
    }
```

**Formula:** `LBP = Σ s(pᵢ - c) × 2ⁱ` where s(x) = 1 if x ≥ 0, else 0

**Key insight:** AI images have low transitions (< 2.0) and high smooth ratio (> 50%).

---

## Color Histogram Analysis — `analyzeColors()`

**Location:** `src/lib/imageAnalyzer.ts` Lines 184-242

**What it does:** Builds RGB histograms and detects unnatural "spikes" — AI often has narrow color bands.

**Line-by-line:**
```typescript
// Lines 186-196: Build histograms for each channel
const colorHistogram = {
  r: new Array(256).fill(0),  // 256 bins for red
  g: new Array(256).fill(0),  // 256 bins for green
  b: new Array(256).fill(0)   // 256 bins for blue
};

for (let i = 0; i < data.length; i += 4) {
  colorHistogram.r[data[i]]++;      // Red channel
  colorHistogram.g[data[i + 1]]++;  // Green channel
  colorHistogram.b[data[i + 2]]++;  // Blue channel
}

// Lines 199-207: Detect spikes (values > 6× mean)
const findSpikes = (hist: number[]) => {
  const total = hist.reduce((a, b) => a + b, 0);
  const mean = total / 256;
  let spikes = 0;
  for (const count of hist) {
    if (count > mean * 6) spikes++;  // 6× threshold
  }
  return spikes;
};
```

**Key insight:** Natural photos have smooth histograms. AI images have sharp spikes at specific colors.

---

## Frame Extraction — `extractFrames()`

**Location:** `src/lib/videoAnalyzer.ts` Lines 24-57

**What it does:** Extracts frames from video at regular intervals using Canvas API.

**Line-by-line:**
```typescript
// Lines 24-33: Setup
const extractFrames = (video: HTMLVideoElement, numFrames: number = 10) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const duration = video.duration;
  const interval = duration / (numFrames + 1);  // Space frames evenly
  
  canvas.width = Math.min(256, video.videoWidth);   // Resize for speed
  canvas.height = Math.min(256, video.videoHeight);

// Lines 37-56: Capture loop
  const captureFrame = () => {
    const time = interval * (currentFrame + 1);
    video.currentTime = time;  // Seek to position
  };
  
  video.onseeked = () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);  // Draw frame
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    frames.push(imageData);  // Store pixel data
    currentFrame++;
    captureFrame();  // Next frame
  };
```

**Key insight:** Uses browser's video decoder + Canvas API. No external libraries needed.

---

## Flicker Detection — `analyzeFrameConsistency()`

**Location:** `src/lib/videoAnalyzer.ts` Lines 60-106

**What it does:** Detects high-variance frame differences (flickering) common in deepfakes.

**Line-by-line:**
```typescript
// Lines 67-86: Compare consecutive frames
for (let i = 1; i < frames.length; i++) {
  const prev = frames[i - 1].data;
  const curr = frames[i].data;
  let diff = 0;
  
  // Sample every 4th pixel for speed
  for (let p = 0; p < prev.length; p += 16) {
    diff += Math.abs(prev[p] - curr[p]) +          // Red diff
            Math.abs(prev[p + 1] - curr[p + 1]) +  // Green diff
            Math.abs(prev[p + 2] - curr[p + 2]);   // Blue diff
  }
  inconsistencies.push(diff / pixelCount);
}

// Lines 84-89: Calculate coefficient of variation
const avgDiff = inconsistencies.reduce((a, b) => a + b, 0) / inconsistencies.length;
const variance = inconsistencies.reduce((sum, val) => 
  sum + Math.pow(val - avgDiff, 2), 0) / inconsistencies.length;
const stdDev = Math.sqrt(variance);
const coeffOfVariation = (stdDev / avgDiff) * 100;  // CV formula
```

**Formula:** `CV = (σ / μ) × 100` — Same as noise analysis!

**Key insight:** CV > 80% = high flicker = likely deepfake with frame interpolation issues.

---

## SHA-256 Hashing — Chain of Custody

**Location:** `src/components/JudgeModePanel.tsx` Lines 331-335

**What it does:** Creates unique cryptographic fingerprint of file using Web Crypto API.

**Line-by-line:**
```typescript
// Using browser's built-in crypto
const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
// Result: 64-character hex string like "a7b3c4d5..."
```

**Key insight:** Same file = same hash. Any modification = completely different hash.

---

## Magic Byte Verification — `detectFileSignature()`

**Location:** `src/components/JudgeModePanel.tsx` Lines 392-408

**What it does:** Checks file header bytes against known signatures to verify true file type.

**Line-by-line:**
```typescript
function detectFileSignature(bytes: Uint8Array): string {
  const signatures: Record<string, number[]> = {
    'JPEG': [0xFF, 0xD8, 0xFF],              // JPEG always starts with FFD8FF
    'PNG':  [0x89, 0x50, 0x4E, 0x47],         // PNG: 89 50 4E 47 (‰PNG)
    'PDF':  [0x25, 0x50, 0x44, 0x46],         // PDF: %PDF
    'MP4':  [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
    'WebM': [0x1A, 0x45, 0xDF, 0xA3]          // WebM/MKV
  };
  
  for (const [type, sig] of Object.entries(signatures)) {
    if (sig.every((byte, i) => bytes[i] === byte)) {
      return type;  // Matches!
    }
  }
  return 'Unknown';
}
```

**Key insight:** If file extension says ".jpg" but magic bytes say "PNG" = possible tampering.

---

# ✅ PRESENTATION CHECKLIST

- [ ] Open SHANSHIELD in browser
- [ ] Press F5 for Presentation Mode
- [ ] Have test files ready (kling_test.jpg, real_photo.jpg)
- [ ] Practice 10-minute timing
- [ ] Know the 3 key formulas: CV, Sobel, Von Neumann
- [ ] Remember: 6+1 agents, 50+ patterns, 80% dynamic weight
- [ ] LBP: "Compare center pixel to 8 neighbors, count transitions"
- [ ] Color Histogram: "Detect spikes > 6× mean"
- [ ] Frame Extraction: "Canvas API + video.currentTime"
- [ ] Flicker: "CV > 80% = high inconsistency"
- [ ] SHA-256: "64-char hex fingerprint"
- [ ] Magic Bytes: "Verify true file type"
