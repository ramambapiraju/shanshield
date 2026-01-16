import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, X } from "lucide-react";
import { jsPDF } from "jspdf";

interface PresentationScriptPDFProps {
  isOpen: boolean;
  onClose: () => void;
}

const PresentationScriptPDF = ({ isOpen, onClose }: PresentationScriptPDFProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      const contentWidth = pageWidth - (margin * 2);
      let y = 15;
      let pageNum = 1;

      const addNewPage = () => {
        doc.addPage();
        pageNum++;
        y = 15;
        // Add page number
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${pageNum}`, pageWidth - 20, pageHeight - 8);
      };

      const checkPageBreak = (neededSpace: number) => {
        if (y + neededSpace > pageHeight - 15) {
          addNewPage();
        }
      };

      const addTitle = (text: string, size: number, color: [number, number, number]) => {
        checkPageBreak(12);
        doc.setFontSize(size);
        doc.setTextColor(...color);
        doc.setFont("helvetica", "bold");
        doc.text(text, margin, y);
        y += size * 0.5;
      };

      const addSubtitle = (text: string) => {
        checkPageBreak(8);
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "italic");
        doc.text(text, margin, y);
        y += 5;
      };

      const addParagraph = (text: string, indent: number = 0) => {
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text, contentWidth - indent);
        checkPageBreak(lines.length * 4 + 2);
        lines.forEach((line: string) => {
          doc.text(line, margin + indent, y);
          y += 4;
        });
        y += 1;
      };

      const addBullet = (text: string, bulletChar: string = "•") => {
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text, contentWidth - 8);
        checkPageBreak(lines.length * 4 + 1);
        doc.text(bulletChar, margin + 2, y);
        lines.forEach((line: string, i: number) => {
          doc.text(line, margin + 8, y);
          y += 4;
        });
      };

      const addCode = (text: string) => {
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.setFont("courier", "normal");
        const lines = doc.splitTextToSize(text, contentWidth - 4);
        checkPageBreak(lines.length * 3.5 + 4);
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y - 3, contentWidth, lines.length * 3.5 + 4, "F");
        lines.forEach((line: string) => {
          doc.text(line, margin + 2, y);
          y += 3.5;
        });
        y += 3;
      };

      const addSectionHeader = (text: string, emoji: string = "") => {
        checkPageBreak(10);
        doc.setFontSize(11);
        doc.setTextColor(2, 132, 199);
        doc.setFont("helvetica", "bold");
        doc.text(`${emoji} ${text}`, margin, y);
        doc.setDrawColor(186, 230, 253);
        doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
        y += 7;
      };

      const addTimingBox = (section: string, time: string) => {
        checkPageBreak(6);
        doc.setFillColor(240, 249, 255);
        doc.rect(margin, y - 3, contentWidth, 6, "F");
        doc.setFontSize(9);
        doc.setTextColor(14, 116, 144);
        doc.setFont("helvetica", "bold");
        doc.text(section, margin + 2, y);
        doc.text(time, pageWidth - margin - 15, y);
        y += 5;
      };

      // ===== PAGE 1: COVER =====
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      
      doc.setFontSize(32);
      doc.setTextColor(14, 165, 233);
      doc.setFont("helvetica", "bold");
      doc.text("SHANSHIELD", pageWidth / 2, 60, { align: "center" });
      
      doc.setFontSize(14);
      doc.setTextColor(148, 163, 184);
      doc.text("Multi-Agent Forensic Intelligence", pageWidth / 2, 72, { align: "center" });
      doc.text("for Deepfake Detection", pageWidth / 2, 80, { align: "center" });
      
      doc.setFontSize(18);
      doc.setTextColor(34, 197, 94);
      doc.text("FINAL PRESENTATION SCRIPT", pageWidth / 2, 110, { align: "center" });
      
      doc.setFontSize(11);
      doc.setTextColor(148, 163, 184);
      doc.text("10-Minute Pitch + Q&A Preparation", pageWidth / 2, 125, { align: "center" });
      doc.text("All Agents • All Algorithms • All Frameworks", pageWidth / 2, 133, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("Presenter: Shanmuka Sai Varma", pageWidth / 2, 160, { align: "center" });
      doc.text("Amravati Quantum Valley Hackathon", pageWidth / 2, 168, { align: "center" });
      
      // Page 1 number
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("Page 1", pageWidth - 20, pageHeight - 8);

      // ===== PAGE 2: TIMING BREAKDOWN =====
      addNewPage();
      addTitle("TIMING BREAKDOWN", 16, [14, 165, 233]);
      y += 3;
      
      addSubtitle("Exactly 10 Minutes - Slide by Slide");
      y += 3;

      const timings = [
        ["Opening Hook", "30 sec", "0:30"],
        ["Problem Statement", "45 sec", "1:15"],
        ["Architecture Overview", "30 sec", "1:45"],
        ["VISUAL AGENT (Deep Dive)", "1 min 15 sec", "3:00"],
        ["AUDIO AGENT (Deep Dive)", "1 min 15 sec", "4:15"],
        ["TEMPORAL AGENT (Deep Dive)", "1 min", "5:15"],
        ["METADATA AGENT (Deep Dive)", "45 sec", "6:00"],
        ["ARBITER AGENT (Deep Dive)", "1 min", "7:00"],
        ["QUANTUM ENTROPY (Unique)", "1 min 15 sec", "8:15"],
        ["TECHNOLOGY STACK", "1 min", "9:15"],
        ["CLOSING", "45 sec", "10:00"]
      ];

      doc.setFontSize(9);
      timings.forEach(([section, duration, cumulative], i) => {
        checkPageBreak(5);
        const bgColor = i % 2 === 0 ? [240, 249, 255] : [255, 255, 255];
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(margin, y - 3, contentWidth, 5, "F");
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", i >= 3 && i <= 8 ? "bold" : "normal");
        doc.text(section, margin + 2, y);
        doc.text(duration, margin + 80, y);
        doc.setTextColor(14, 165, 233);
        doc.text(cumulative, margin + 110, y);
        y += 5;
      });

      // ===== PAGE 3: OPENING + PROBLEM =====
      addNewPage();
      addTitle("PART 1: OPENING", 14, [14, 165, 233]);
      y += 2;

      addTimingBox("OPENING HOOK", "30 seconds");
      addParagraph("\"I'm Shanmuka Sai Varma. In the next 10 minutes, I'll show you SHANSHIELD — a multi-agent forensic system that detects deepfakes using real algorithms, not black boxes.");
      addParagraph("Three numbers: 5 agents, 100% offline, zero external APIs.");
      addParagraph("Let's dive into every agent.\"");
      y += 3;

      addTimingBox("PROBLEM STATEMENT", "45 seconds");
      addParagraph("\"Deepfakes: 500,000 shared daily. 73% of humans can't detect them.");
      addParagraph("Current tools fail because:");
      addBullet("Single-modal — analyze video OR audio, not both");
      addBullet("Black boxes — no explanation WHY something is fake");
      addBullet("Cloud-dependent — useless for field investigators");
      addParagraph("SHANSHIELD uses 5 specialized agents working together.\"");
      y += 3;

      addTimingBox("ARCHITECTURE OVERVIEW", "30 seconds");
      addParagraph("\"The system flow:");
      addCode("Media Input → [Visual | Audio | Temporal | Metadata] → Arbiter → Verdict");
      addParagraph("Each agent runs independent analysis with real algorithms. The Arbiter fuses results using Dempster-Shafer theory. Everything runs in YOUR browser.\"");

      // ===== PAGE 4: VISUAL AGENT =====
      addNewPage();
      addTitle("VISUAL AGENT — Deep Dive", 14, [59, 130, 246]);
      addSubtitle("File: src/lib/imageAnalyzer.ts (600+ lines)");
      y += 2;

      addTimingBox("VISUAL AGENT", "1 min 15 sec");

      addSectionHeader("Algorithm 1: Noise Analysis", "🔍");
      addParagraph("\"AI-generated images have unnaturally uniform noise. We calculate coefficient of variation across 8x8 pixel blocks:\"");
      addCode("const cv = standardDeviation / mean;\n// AI images have CV < 0.15 (unnaturally uniform)");
      addParagraph("GAN-generated images have too-uniform noise — real cameras have natural sensor noise variation.");
      y += 2;

      addSectionHeader("Algorithm 2: Sobel Edge Detection", "📐");
      addParagraph("\"Real gradient magnitude calculation using the Sobel operator from 1968:\"");
      addCode("const Gx = [[-1,0,1], [-2,0,2], [-1,0,1]];\nconst Gy = [[-1,-2,-1], [0,0,0], [1,2,1]];\nconst magnitude = Math.sqrt(Gx² + Gy²);");
      addParagraph("AI images show artificial edge enhancement patterns.");
      y += 2;

      addSectionHeader("Algorithm 3: Local Binary Patterns (LBP)", "🔲");
      addParagraph("\"Published by Ojala et al. in IEEE PAMI 2002:\"");
      addCode("// Compare center pixel to 8 neighbors\nconst lbp = neighbors.map(n => n >= center ? 1 : 0);\n// Generate 8-bit pattern: 00101110 = 46");
      addParagraph("Detects AI's characteristic over-smooth textures.");
      y += 2;

      addSectionHeader("Algorithm 4: Color Histogram Analysis", "🎨");
      addParagraph("We detect unnatural RGB channel correlations and histogram spikes.");
      addParagraph("Output: Score + explainable signals like 'Noise CV: 0.12 — suspiciously uniform.'");

      // ===== PAGE 5: AUDIO AGENT =====
      addNewPage();
      addTitle("AUDIO AGENT — Deep Dive", 14, [34, 197, 94]);
      addSubtitle("File: src/lib/audioAnalyzer.ts | Uses Web Audio API");
      y += 2;

      addTimingBox("AUDIO AGENT", "1 min 15 sec");

      addSectionHeader("Algorithm 1: FFT Spectral Analysis", "📊");
      addParagraph("\"Discrete Fourier Transform via Web Audio API:\"");
      addCode("const analyser = audioContext.createAnalyser();\nanalyser.fftSize = 2048;\nanalyser.getFloatFrequencyData(frequencyData);");
      addParagraph("We compute spectral centroid (brightness) and spectral flatness (noise vs. tonal). AI voices have unnatural spectral signatures.");
      y += 2;

      addSectionHeader("Algorithm 2: Pitch Tracking via Autocorrelation", "🎵");
      addParagraph("\"Autocorrelation formula: R(τ) = Σ x(t) × x(t+τ)\"");
      addCode("for (let lag = minLag; lag < maxLag; lag++) {\n  correlation += signal[i] * signal[i + lag];\n}");
      addParagraph("Detects fundamental frequency. AI voices show unnatural pitch stability or sudden discontinuities.");
      y += 2;

      addSectionHeader("Algorithm 3: Noise Floor Analysis", "🔇");
      addCode("const noiseFloor = sortedBins.slice(0, bins.length * 0.1);");
      addParagraph("Synthesized audio has unnaturally clean noise floors — real recordings have ambient noise.");
      y += 2;

      addSectionHeader("Algorithm 4: Quantum Entropy", "⚛️");
      addParagraph("We treat spectral data as quantum probability distributions and compute Von Neumann entropy. (Detailed in Quantum section)");

      // ===== PAGE 6: TEMPORAL AGENT =====
      addNewPage();
      addTitle("TEMPORAL AGENT — Deep Dive", 14, [234, 179, 8]);
      addSubtitle("File: src/lib/videoAnalyzer.ts | Frame-by-Frame Analysis");
      y += 2;

      addTimingBox("TEMPORAL AGENT", "1 min");

      addSectionHeader("Frame Extraction", "🎬");
      addCode("const video = document.createElement('video');\nconst canvas = document.createElement('canvas');\nctx.drawImage(video, 0, 0);\nconst frameData = ctx.getImageData(0, 0, width, height);");
      y += 2;

      addSectionHeader("Algorithm 1: Inter-Frame Consistency", "🔄");
      addCode("const diff = Math.abs(frame1[i] - frame2[i]);\nconst consistency = 1 - (totalDiff / maxDiff);");
      addParagraph("Deepfakes often have temporal inconsistencies — flickering, unnatural transitions.");
      y += 2;

      addSectionHeader("Algorithm 2: Motion Flow Analysis", "➡️");
      addParagraph("We track pixel movement patterns between frames. Real video has coherent motion; deepfakes may have jittery or impossible movements.");
      y += 2;

      addSectionHeader("Algorithm 3: Flicker Detection", "💡");
      addCode("const flicker = Math.abs(brightness[i] - brightness[i-1]);");
      addParagraph("Each frame also gets Visual Agent analysis + Quantum Entropy.");
      addParagraph("Output: 'Frame 47-52: Temporal discontinuity — possible splice point.'");

      // ===== PAGE 7: METADATA AGENT =====
      addNewPage();
      addTitle("METADATA AGENT — Deep Dive", 14, [168, 85, 247]);
      addSubtitle("File: src/lib/documentAnalyzer.ts | Forensic File Analysis");
      y += 2;

      addTimingBox("METADATA AGENT", "45 sec");

      addSectionHeader("Algorithm 1: EXIF Extraction", "📋");
      addCode("const exif = parseExifData(arrayBuffer);\n// Check camera make, software, GPS, timestamps");
      addParagraph("AI-generated images often have missing or inconsistent EXIF data.");
      y += 2;

      addSectionHeader("Algorithm 2: Shannon Entropy", "📈");
      addParagraph("\"Published by Claude Shannon in 1948:\"");
      addCode("// H = -Σ p(x) × log₂(p(x))\nconst entropy = -probabilities.reduce((sum, p) => \n  sum + (p > 0 ? p * Math.log2(p) : 0), 0);");
      addParagraph("Measures byte pattern randomness. Encrypted or tampered files show entropy anomalies.");
      y += 2;

      addSectionHeader("Algorithm 3: Magic Byte Verification", "🔐");
      addCode("const pngMagic = [0x89, 0x50, 0x4E, 0x47];\nconst jpegMagic = [0xFF, 0xD8, 0xFF];");
      addParagraph("Output: 'No EXIF camera data — possible AI generation or metadata stripping.'");

      // ===== PAGE 8: ARBITER AGENT =====
      addNewPage();
      addTitle("ARBITER AGENT — Deep Dive", 14, [239, 68, 68]);
      addSubtitle("The Brain: Dempster-Shafer Belief Fusion");
      y += 2;

      addTimingBox("ARBITER AGENT", "1 min");

      addSectionHeader("Why Not Simple Averaging?", "❓");
      addParagraph("If Visual says 'fake' at 80% and Audio says 'real' at 90%, averaging gives 45% — meaningless.");
      y += 2;

      addSectionHeader("Dempster-Shafer Theory of Evidence", "📚");
      addParagraph("Published by Arthur Dempster (1967) and Glenn Shafer (1976). Used in:");
      addBullet("Medical diagnosis systems");
      addBullet("Military threat assessment");
      addBullet("Multi-sensor fusion");
      y += 2;

      addSectionHeader("Combination Rule", "🧮");
      addCode("// m₁₂(A) = Σ m₁(B)×m₂(C) / (1 - K)\n// where K = conflict between sources\nconst belief = (m1 * m2) / (1 - conflict);");
      y += 2;

      addSectionHeader("Three Outputs", "📤");
      addBullet("Belief — evidence FOR manipulation", "1.");
      addBullet("Disbelief — evidence AGAINST manipulation", "2.");
      addBullet("Uncertainty — when evidence is insufficient", "3.");
      y += 2;

      addSectionHeader("Weighted Combination", "⚖️");
      addCode("agents.forEach(agent => {\n  const weight = agent.confidence * agent.reliability;\n  combinedBelief = dempsterCombine(combinedBelief, agent.belief, weight);\n});");
      addParagraph("Output: 'Consensus: LIKELY MANIPULATED — Belief 78%, Uncertainty 15%'");

      // ===== PAGE 9: QUANTUM ENTROPY =====
      addNewPage();
      addTitle("QUANTUM ENTROPY — Unique Feature", 14, [139, 92, 246]);
      addSubtitle("File: src/lib/quantumEntropyAnalyzer.ts | Real Quantum Math");
      y += 2;

      addTimingBox("QUANTUM ENTROPY", "1 min 15 sec");

      doc.setFillColor(245, 240, 255);
      doc.rect(margin, y - 2, contentWidth, 8, "F");
      doc.setFontSize(10);
      doc.setTextColor(109, 40, 217);
      doc.setFont("helvetica", "bold");
      doc.text("DIFFERENTIATOR: First deepfake tool with quantum entropy across all media", margin + 2, y + 3);
      y += 12;

      addSectionHeader("Step 1: Construct Density Matrix", "1️⃣");
      addCode("// Treat pixel/audio data as quantum state amplitudes\n// ρ = |ψ⟩⟨ψ| (outer product)\nconst psi = normalizedAmplitudes;\nconst rho = outerProduct(psi, psi);");
      y += 2;

      addSectionHeader("Step 2: Compute Eigenvalues", "2️⃣");
      addCode("const eigenvalues = gershgorinBounds(rho);");
      y += 2;

      addSectionHeader("Step 3: Von Neumann Entropy (1932)", "3️⃣");
      addCode("// S(ρ) = -Tr(ρ log₂ ρ) = -Σᵢ λᵢ log₂(λᵢ)\nconst vonNeumann = -eigenvalues.reduce((sum, λ) => \n  sum + (λ > 0 ? λ * Math.log2(λ) : 0), 0);");
      y += 2;

      addSectionHeader("Step 4: Min-Entropy & Rényi Entropy", "4️⃣");
      addCode("// H_min = -log₂(max λᵢ) — worst-case unpredictability\n// H₂ = -log₂(Σᵢ λᵢ²) — collision entropy (Rényi 1961)");
      y += 2;

      addSectionHeader("Honest Disclosure", "✅");
      addParagraph("We run quantum information theory algorithms on classical hardware. The MATH is from quantum physics textbooks — Von Neumann, Rényi, Tomamichel.");
      addParagraph("Applied to: Images (pixel data), Video (frame data), Audio (spectral data).");

      // ===== PAGE 10: TECH STACK =====
      addNewPage();
      addTitle("TECHNOLOGY STACK — Complete", 14, [14, 165, 233]);
      y += 2;

      addTimingBox("TECH STACK", "1 min");

      addSectionHeader("Frontend Framework", "⚛️");
      addBullet("React 18 — Component-based UI with hooks");
      addBullet("TypeScript — Type safety for 2000+ lines of analysis code");
      addBullet("Vite — Build tool with hot module replacement");
      y += 2;

      addSectionHeader("UI Framework", "🎨");
      addBullet("Tailwind CSS — Utility-first styling");
      addBullet("shadcn/ui — Radix-based accessible components");
      addBullet("Lucide React — Icon library");
      y += 2;

      addSectionHeader("Browser-Native Analysis APIs", "🔧");
      addBullet("Canvas API — Pixel manipulation for image/video");
      addBullet("Web Audio API — FFT, spectral analysis for audio");
      addBullet("Web Crypto API — SHA-256 for chain of custody");
      addBullet("FileReader API — Binary file parsing");
      y += 2;

      addSectionHeader("Report Generation", "📄");
      addBullet("jsPDF — Client-side PDF generation");
      y += 2;

      addSectionHeader("What We DON'T Use", "❌");
      addBullet("No external AI APIs (OpenAI, Google, etc.)");
      addBullet("No pre-trained neural networks (roadmap item)");
      addBullet("No server-side processing");
      addBullet("No fake/simulated data");
      y += 3;

      doc.setFillColor(220, 252, 231);
      doc.rect(margin, y - 2, contentWidth, 8, "F");
      doc.setFontSize(10);
      doc.setTextColor(22, 101, 52);
      doc.setFont("helvetica", "bold");
      doc.text("Everything runs in YOUR browser. Zero data leaves your device.", margin + 2, y + 3);

      // ===== PAGE 11: CLOSING =====
      addNewPage();
      addTitle("CLOSING", 14, [14, 165, 233]);
      y += 2;

      addTimingBox("CLOSING", "45 seconds");

      addParagraph("\"To summarize SHANSHIELD:\"");
      y += 2;

      const summaryTable = [
        ["Agent", "Algorithm", "Reference"],
        ["Visual", "Sobel, LBP, Noise CV", "Ojala 2002, Sobel 1968"],
        ["Audio", "FFT, Autocorrelation", "Web Audio API"],
        ["Temporal", "Frame diff, Motion", "Canvas API"],
        ["Metadata", "Shannon Entropy, EXIF", "Shannon 1948"],
        ["Arbiter", "Dempster-Shafer", "Shafer 1976"],
        ["Quantum", "Von Neumann, Rényi", "Von Neumann 1932"]
      ];

      doc.setFontSize(8);
      summaryTable.forEach((row, i) => {
        const bgColor = i === 0 ? [14, 165, 233] : (i % 2 === 0 ? [240, 249, 255] : [255, 255, 255]);
        const textColor = i === 0 ? [255, 255, 255] : [40, 40, 40];
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(margin, y - 3, contentWidth, 5, "F");
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont("helvetica", i === 0 ? "bold" : "normal");
        doc.text(row[0], margin + 2, y);
        doc.text(row[1], margin + 35, y);
        doc.text(row[2], margin + 95, y);
        y += 5;
      });

      y += 5;
      addParagraph("\"5 agents. Real algorithms. 100% explainable. 100% offline.\"");
      addParagraph("\"Thank you! Ready for questions or live demo.\"");

      // ===== PAGE 12: Q&A =====
      addNewPage();
      addTitle("Q&A PREPARATION", 14, [239, 68, 68]);
      y += 2;

      const qaItems = [
        ["Is it real quantum?", "Quantum math on classical hardware — we're honest about it. Von Neumann (1932), Rényi (1961) are real algorithms from quantum physics textbooks."],
        ["What's the accuracy?", "Prototype — no benchmarks yet. Algorithms are peer-reviewed (Sobel, FFT, LBP, Dempster-Shafer). Need FaceForensics++ testing for production."],
        ["Why no neural networks?", "1) Model files are 50-500MB = slow loading. 2) Black boxes vs explainability. TensorFlow.js is on roadmap."],
        ["Dempster-Shafer vs averaging?", "Averaging: 80% fake + 90% real = 45% (meaningless). D-S: Handles conflict mathematically, maintains belief/disbelief/uncertainty intervals."],
        ["Who uses this?", "Journalists, law enforcement, border security (offline critical), social media platforms, legal professionals."],
        ["Show the code?", "Absolutely! Open any file live — imageAnalyzer.ts, audioAnalyzer.ts, quantumEntropyAnalyzer.ts. All 2000+ lines available."],
        ["Math.random() = fake data?", "No — used for power iteration starting vector (numerical method for eigenvalues). Standard technique, not fake results."],
        ["Adversarial attacks?", "Multi-agent helps — attack on visual may not fool audio. No system is immune; we're a forensic TOOL, not oracle."]
      ];

      qaItems.forEach(([q, a]) => {
        checkPageBreak(18);
        doc.setFillColor(254, 242, 242);
        doc.rect(margin, y - 3, contentWidth, 5, "F");
        doc.setFontSize(9);
        doc.setTextColor(185, 28, 28);
        doc.setFont("helvetica", "bold");
        doc.text("Q: " + q, margin + 2, y);
        y += 5;
        
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize("A: " + a, contentWidth - 4);
        lines.forEach((line: string) => {
          doc.text(line, margin + 2, y);
          y += 3.5;
        });
        y += 3;
      });

      // ===== PAGE 13: ACADEMIC REFERENCES =====
      addNewPage();
      addTitle("ACADEMIC REFERENCES", 14, [14, 165, 233]);
      y += 2;

      const refs = [
        "Von Neumann, J. (1932). Mathematical Foundations of Quantum Mechanics. Princeton University Press.",
        "Rényi, A. (1961). On Measures of Entropy and Information. Proceedings of 4th Berkeley Symposium.",
        "Shafer, G. (1976). A Mathematical Theory of Evidence. Princeton University Press.",
        "Ojala, T., Pietikäinen, M., Mäenpää, T. (2002). Multiresolution Gray-Scale and Rotation Invariant Texture Classification with Local Binary Patterns. IEEE PAMI.",
        "Sobel, I., Feldman, G. (1968). A 3x3 Isotropic Gradient Operator for Image Processing. Stanford AI Project.",
        "Shannon, C. E. (1948). A Mathematical Theory of Communication. Bell System Technical Journal.",
        "Tomamichel, M. (2015). Quantum Information Processing with Finite Resources. Springer."
      ];

      refs.forEach((ref, i) => {
        checkPageBreak(10);
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        doc.text(`[${i + 1}]`, margin, y);
        const lines = doc.splitTextToSize(ref, contentWidth - 10);
        lines.forEach((line: string) => {
          doc.text(line, margin + 8, y);
          y += 3.5;
        });
        y += 2;
      });

      y += 5;
      addSectionHeader("CODE STRUCTURE", "📁");
      addCode("src/lib/\n├── imageAnalyzer.ts      (600+ lines)\n├── videoAnalyzer.ts      (Frame + temporal)\n├── audioAnalyzer.ts      (FFT + quantum)\n├── documentAnalyzer.ts   (Metadata + entropy)\n└── quantumEntropyAnalyzer.ts (Von Neumann, Rényi)");

      y += 5;
      doc.setFillColor(254, 249, 195);
      doc.rect(margin, y - 2, contentWidth, 20, "F");
      doc.setFontSize(10);
      doc.setTextColor(161, 98, 7);
      doc.setFont("helvetica", "bold");
      doc.text("FINAL TIPS:", margin + 2, y + 3);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("1. Be honest — if something is a placeholder, say so", margin + 2, y + 8);
      doc.text("2. Know your code — be ready to show any function live", margin + 2, y + 12);
      doc.text("3. Emphasize the unique — Quantum entropy is YOUR differentiator", margin + 2, y + 16);

      // Save
      doc.save("SHANSHIELD_Final_Presentation_Script.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-lg max-w-md w-full p-6 text-center">
        <FileText className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Final Presentation Script</h2>
        <p className="text-gray-400 text-sm mb-6">
          Complete 10-minute script with all agents, algorithms, frameworks, Q&A prep, and academic references.
        </p>
        
        <div className="space-y-3">
          <Button 
            className="w-full bg-cyan-600 hover:bg-cyan-700" 
            onClick={handleDownload}
            disabled={isGenerating}
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating PDF..." : "Download Script PDF"}
          </Button>
          
          <Button variant="outline" className="w-full" onClick={onClose}>
            <X className="w-4 h-4 mr-2" /> Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PresentationScriptPDF;
