import { useState, useEffect } from "react";
import { Atom, Zap, Binary, Waves, Info, BookOpen } from "lucide-react";
import { QuantumEntropyResult, interpretQuantumResults } from "@/lib/quantumEntropyAnalyzer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuantumEntropyVisualizerProps {
  result: QuantumEntropyResult | null;
  isAnalyzing?: boolean;
}

const QuantumEntropyVisualizer = ({ result, isAnalyzing }: QuantumEntropyVisualizerProps) => {
  const [animatedValues, setAnimatedValues] = useState({
    vonNeumann: 0,
    minEntropy: 0,
    renyi: 0,
    coherence: 0,
    purity: 0
  });

  useEffect(() => {
    if (result) {
      // Animate values
      const duration = 1000;
      const steps = 30;
      const interval = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

        setAnimatedValues({
          vonNeumann: result.vonNeumannEntropy * eased,
          minEntropy: result.minEntropy * eased,
          renyi: result.renyiEntropy * eased,
          coherence: result.quantumCoherence * eased,
          purity: result.purityMeasure * eased
        });

        if (step >= steps) clearInterval(timer);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [result]);

  if (isAnalyzing) {
    return (
      <div className="relative p-6 bg-card/90 border border-accent/30 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 animate-pulse" />
        <div className="relative flex items-center justify-center gap-3">
          <Atom className="w-8 h-8 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">Quantum Entropy Analysis</p>
            <p className="text-sm text-muted-foreground">Computing von Neumann entropy spectrum...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const interpretation = interpretQuantumResults(result);
  const maxEntropy = Math.log2(result.analysisDetails.matrixDimension);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Atom className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Quantum Entropy Analysis
              </h3>
              <p className="text-xs text-muted-foreground">
                Quantum Information Theory Algorithms
              </p>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-help">
                <BookOpen className="w-4 h-4" />
                <span>Learn More</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Based on von Neumann (1932) and Rényi (1961). These are real quantum information 
                theory algorithms running on classical hardware.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Von Neumann Entropy */}
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Von Neumann</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">S(ρ) = -Tr(ρ log₂ ρ)</p>
                  <p className="text-xs mt-1">Quantum generalization of Shannon entropy</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-purple-400 font-mono">
              {animatedValues.vonNeumann.toFixed(3)}
            </p>
            <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (animatedValues.vonNeumann / maxEntropy) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">max: {maxEntropy.toFixed(2)} bits</p>
          </div>

          {/* Min-Entropy */}
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Min-Entropy</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">H_min(ρ) = -log₂(max λᵢ)</p>
                  <p className="text-xs mt-1">Used in Quantum Key Distribution</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-cyan-400 font-mono">
              {animatedValues.minEntropy.toFixed(3)}
            </p>
            <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (animatedValues.minEntropy / maxEntropy) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">worst-case unpredictability</p>
          </div>

          {/* Rényi Entropy */}
          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Rényi (α=2)</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">H_α(ρ) = (1/(1-α)) log₂(Σ λᵢ^α)</p>
                  <p className="text-xs mt-1">Collision entropy for quantum crypto</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-amber-400 font-mono">
              {animatedValues.renyi.toFixed(3)}
            </p>
            <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (animatedValues.renyi / maxEntropy) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Rényi (1961)</p>
          </div>

          {/* Quantum Coherence */}
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Coherence</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">C(ρ) = Σᵢ≠ⱼ |ρᵢⱼ|</p>
                  <p className="text-xs mt-1">Off-diagonal density matrix measure</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-green-400 font-mono">
              {(animatedValues.coherence * 100).toFixed(1)}%
            </p>
            <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${animatedValues.coherence * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">quantum superposition</p>
          </div>
        </div>

        {/* Eigenvalue Spectrum Visualization */}
        <div className="p-4 bg-card/50 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Waves className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Eigenvalue Spectrum (λᵢ)</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {result.eigenvalueSpectrum.slice(0, 16).map((eigenvalue, index) => (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                style={{ 
                  height: `${Math.max(4, eigenvalue * 100)}%`,
                  animationDelay: `${index * 50}ms`
                }}
                title={`λ${index + 1} = ${eigenvalue.toFixed(4)}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>λ₁</span>
            <span>Density Matrix Eigenvalues</span>
            <span>λ{Math.min(16, result.eigenvalueSpectrum.length)}</span>
          </div>
        </div>

        {/* Purity & Anomaly Detection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-card/50 border border-border rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Binary className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Purity Tr(ρ²)</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xl font-bold text-foreground font-mono">
                {animatedValues.purity.toFixed(4)}
              </p>
              <span className="text-xs text-muted-foreground">
                {result.purityMeasure > 0.9 ? 'Near Pure State' : 
                 result.purityMeasure > 0.5 ? 'Mixed State' : 'Highly Mixed'}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${
            result.entropyAnomaly 
              ? 'bg-destructive/10 border-destructive/50' 
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`w-4 h-4 ${result.entropyAnomaly ? 'text-destructive' : 'text-green-400'}`} />
              <span className="text-sm font-medium text-foreground">Anomaly Detection</span>
            </div>
            <div className="flex items-center gap-3">
              <p className={`text-xl font-bold font-mono ${
                result.entropyAnomaly ? 'text-destructive' : 'text-green-400'
              }`}>
                {(result.anomalyScore * 100).toFixed(1)}%
              </p>
              <span className="text-xs text-muted-foreground">
                {result.entropyAnomaly ? 'Anomaly Detected' : 'Normal Pattern'}
              </span>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10 border border-accent/30 rounded-xl">
          <p className="text-sm text-muted-foreground">{interpretation}</p>
        </div>

        {/* Honest Disclosure */}
        <div className="p-3 bg-card/30 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            <span className="text-purple-400 font-semibold">Quantum Information Theory</span> algorithms 
            (von Neumann 1932, Rényi 1961) running on classical hardware. 
            Mathematics from quantum mechanics, classical execution.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default QuantumEntropyVisualizer;
