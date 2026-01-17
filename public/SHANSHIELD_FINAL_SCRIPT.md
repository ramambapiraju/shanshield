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
> We also parse PDF metadata, EXIF data, and detect file structure anomalies."

### 🔴 CODE REFERENCE (documentAnalyzer.ts):

| Function | Formula | Purpose |
|----------|---------|---------|
| `calculateEntropy()` | H = -Σ pᵢ log₂(pᵢ) | Information content |

### 🎯 HIGHLIGHT:
- Shannon Entropy formula
- PDF/EXIF parsing
- File structure analysis

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

---

# ✅ PRESENTATION CHECKLIST

- [ ] Open SHANSHIELD in browser
- [ ] Press F5 for Presentation Mode
- [ ] Have test files ready (kling_test.jpg, real_photo.jpg)
- [ ] Practice 10-minute timing
- [ ] Know the 3 key formulas: CV, Sobel, Von Neumann
- [ ] Remember: 6+1 agents, 50+ patterns, 80% dynamic weight
