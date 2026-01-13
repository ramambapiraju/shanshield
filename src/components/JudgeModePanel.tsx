import { useState, useEffect } from "react";
import { X, Lightbulb, Code, Eye, Mic, Clock, Database, Shield, FileCheck, Wifi } from "lucide-react";

const JudgeModePanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("visual");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "j") {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isVisible) return null;

  const features = [
    {
      id: "visual",
      label: "Visual Analysis",
      icon: Eye,
      language: "Python + TypeScript",
      framework: "TensorFlow / React",
      description: "CNN-based facial inconsistency detection, GAN artifact analysis, and texture analysis",
      code: `# Visual Detection Agent (Python)
import tensorflow as tf
from deepface import DeepFace

class VisualAnalyzer:
    def __init__(self):
        self.model = tf.keras.models.load_model('visual_detector.h5')
    
    def analyze(self, frame):
        # Extract facial features
        faces = DeepFace.extract_faces(frame)
        
        # Check for GAN artifacts
        artifacts = self.detect_gan_artifacts(frame)
        
        # Analyze skin texture consistency
        texture_score = self.analyze_texture(faces)
        
        return {
            "confidence": self.model.predict(frame),
            "artifacts": artifacts,
            "texture_score": texture_score
        }`
    },
    {
      id: "audio",
      label: "Audio Analysis",
      icon: Mic,
      language: "Python",
      framework: "PyTorch / Librosa",
      description: "Spectral analysis, voice cloning detection, and lip-sync verification",
      code: `# Audio Detection Agent (Python)
import librosa
import torch

class AudioAnalyzer:
    def __init__(self):
        self.voice_model = torch.load('voice_detector.pt')
    
    def analyze(self, audio_path):
        # Load and extract features
        y, sr = librosa.load(audio_path)
        
        # Mel-frequency cepstral coefficients
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        
        # Detect voice cloning artifacts
        spectral = librosa.stft(y)
        artifacts = self.detect_synthesis_artifacts(spectral)
        
        return {
            "is_synthetic": self.voice_model(mfcc),
            "artifacts": artifacts,
            "confidence": self.calculate_confidence(mfcc)
        }`
    },
    {
      id: "temporal",
      label: "Temporal Analysis",
      icon: Clock,
      language: "Python",
      framework: "OpenCV / NumPy",
      description: "Frame-by-frame consistency, optical flow analysis, and motion pattern detection",
      code: `# Temporal Consistency Analyzer (Python)
import cv2
import numpy as np

class TemporalAnalyzer:
    def analyze_video(self, video_path):
        cap = cv2.VideoCapture(video_path)
        frames = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            frames.append(frame)
        
        # Optical flow analysis
        flow_consistency = self.analyze_optical_flow(frames)
        
        # Frame interpolation detection
        interp_score = self.detect_interpolation(frames)
        
        # Temporal coherence check
        coherence = self.check_coherence(frames)
        
        return {
            "flow_score": flow_consistency,
            "interpolation": interp_score,
            "coherence": coherence
        }`
    },
    {
      id: "metadata",
      label: "Metadata Analysis",
      icon: Database,
      language: "TypeScript",
      framework: "React / Node.js",
      description: "EXIF data verification, compression artifact detection, and file integrity checks",
      code: `// Metadata Analyzer (TypeScript)
import ExifReader from 'exifreader';

interface MetadataResult {
  isModified: boolean;
  compressionLevel: number;
  creationDate: Date | null;
  software: string[];
}

export class MetadataAnalyzer {
  async analyze(file: File): Promise<MetadataResult> {
    const buffer = await file.arrayBuffer();
    const tags = ExifReader.load(buffer);
    
    // Check for editing software signatures
    const software = this.detectEditingSoftware(tags);
    
    // Analyze compression patterns
    const compression = this.analyzeCompression(buffer);
    
    // Verify creation timestamps
    const timestamps = this.verifyTimestamps(tags);
    
    return {
      isModified: software.length > 0,
      compressionLevel: compression.level,
      creationDate: timestamps.created,
      software: software
    };
  }
}`
    },
    {
      id: "explainable",
      label: "Explainable AI",
      icon: Lightbulb,
      language: "TypeScript + Python",
      framework: "React / SHAP",
      description: "Provides human-readable explanations for why media was flagged as synthetic",
      code: `// Explainable AI Component (React/TypeScript)
interface ExplanationProps {
  analysisResult: AnalysisResult;
}

export const ExplainableAI: React.FC<ExplanationProps> = ({ 
  analysisResult 
}) => {
  const explanations = useMemo(() => {
    return analysisResult.agents.map(agent => ({
      name: agent.name,
      confidence: agent.confidence,
      reasons: agent.findings.map(f => ({
        indicator: f.type,
        severity: f.severity,
        description: f.humanReadable,
        // SHAP values for feature importance
        importance: f.shapValue
      }))
    }));
  }, [analysisResult]);

  return (
    <div className="space-y-4">
      {explanations.map(exp => (
        <ExplanationCard key={exp.name} {...exp} />
      ))}
    </div>
  );
};`
    },
    {
      id: "chainofcustody",
      label: "Chain of Custody",
      icon: FileCheck,
      language: "TypeScript",
      framework: "React / Crypto API",
      description: "Forensic-grade tracking with cryptographic hashes for legal admissibility",
      code: `// Chain of Custody System (TypeScript)
interface CustodyRecord {
  hash: string;
  timestamp: Date;
  action: 'uploaded' | 'analyzed' | 'exported';
  actor: string;
  previousHash: string;
}

export class ChainOfCustody {
  private chain: CustodyRecord[] = [];

  async addRecord(file: File, action: string): Promise<string> {
    // Generate SHA-256 hash of file
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hash = this.bufferToHex(hashBuffer);
    
    const record: CustodyRecord = {
      hash,
      timestamp: new Date(),
      action,
      actor: this.getCurrentUser(),
      previousHash: this.getLastHash()
    };
    
    this.chain.push(record);
    return hash;
  }

  verify(): boolean {
    return this.chain.every((record, i) => 
      i === 0 || record.previousHash === this.chain[i-1].hash
    );
  }
}`
    },
    {
      id: "fieldmode",
      label: "Field Mode",
      icon: Wifi,
      language: "TypeScript",
      framework: "React / TensorFlow.js",
      description: "Offline-capable analysis using lightweight models for low-bandwidth environments",
      code: `// Field Mode Controller (TypeScript)
import * as tf from '@tensorflow/tfjs';

export class FieldModeAnalyzer {
  private lightweightModel: tf.LayersModel | null = null;
  private isOffline: boolean = false;

  async initialize() {
    // Load quantized model for offline use
    this.lightweightModel = await tf.loadLayersModel(
      'indexeddb://field-mode-model'
    );
  }

  async analyzeOffline(imageData: ImageData): Promise<Result> {
    if (!this.lightweightModel) {
      await this.initialize();
    }
    
    // Preprocess for lightweight inference
    const tensor = tf.browser.fromPixels(imageData)
      .resizeBilinear([224, 224])
      .expandDims(0)
      .div(255);
    
    // Run inference locally
    const prediction = this.lightweightModel!.predict(tensor);
    
    return {
      confidence: (prediction as tf.Tensor).dataSync()[0],
      mode: 'offline',
      latency: performance.now()
    };
  }
}`
    },
    {
      id: "multiagent",
      label: "Multi-Agent System",
      icon: Shield,
      language: "Python + TypeScript",
      framework: "Custom Orchestrator",
      description: "Ensemble voting across specialized agents for robust detection",
      code: `# Multi-Agent Orchestrator (Python)
from typing import List, Dict
import asyncio

class AgentOrchestrator:
    def __init__(self):
        self.agents = [
            VisualAnalyzer(),
            AudioAnalyzer(),
            TemporalAnalyzer(),
            MetadataAnalyzer()
        ]
    
    async def analyze(self, media_path: str) -> Dict:
        # Run all agents in parallel
        tasks = [agent.analyze(media_path) for agent in self.agents]
        results = await asyncio.gather(*tasks)
        
        # Weighted ensemble voting
        weights = [0.35, 0.25, 0.25, 0.15]
        final_score = sum(
            r['confidence'] * w 
            for r, w in zip(results, weights)
        )
        
        return {
            "verdict": "SYNTHETIC" if final_score > 0.7 else "AUTHENTIC",
            "confidence": final_score,
            "agent_results": results,
            "explanation": self.generate_explanation(results)
        }`
    }
  ];

  const activeFeature = features.find(f => f.id === activeTab) || features[0];

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-primary/30 bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Code className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-primary tracking-wider">TECH SHOWCASE</h2>
            <p className="text-xs text-muted-foreground">Press Ctrl+J to toggle • ESC to close</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 py-3 border-b border-border/50 overflow-x-auto">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display text-xs tracking-wide transition-all whitespace-nowrap ${
                activeTab === feature.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/50 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {feature.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Feature Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <activeFeature.icon className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                {activeFeature.label}
              </h3>
              <p className="text-muted-foreground">{activeFeature.description}</p>
            </div>
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-lg">
              <Code className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">{activeFeature.language}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{activeFeature.framework}</span>
            </div>
          </div>

          {/* Code Block */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <span className="text-xs text-muted-foreground font-mono ml-2">
                {activeFeature.id}.{activeFeature.language.includes("Python") ? "py" : "tsx"}
              </span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code className="text-foreground font-mono whitespace-pre leading-relaxed">
                {activeFeature.code}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Footer tip */}
      <div className="px-6 py-3 border-t border-border/50 bg-card/30">
        <p className="text-center text-xs text-muted-foreground">
          💡 Click tabs to show different features • Explain the multi-agent architecture and explainability focus
        </p>
      </div>
    </div>
  );
};

export default JudgeModePanel;
