import { useState } from "react";
import { 
  Brain, 
  Eye, 
  AudioLines, 
  Clock,
  ZoomIn,
  Play,
  Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface HeatmapRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number; // 0-100
  label: string;
}

interface TimelineMarker {
  timestamp: number; // in seconds
  type: 'anomaly' | 'warning' | 'info';
  label: string;
  description: string;
}

interface AudioSegment {
  start: number;
  end: number;
  type: 'normal' | 'irregular' | 'suspicious';
  label: string;
}

interface ExplainableAIProps {
  mediaType: 'image' | 'video' | 'audio' | 'document';
  heatmapRegions: HeatmapRegion[];
  timelineMarkers: TimelineMarker[];
  audioSegments: AudioSegment[];
  reasoning: string[];
}

const ExplainableAI = ({ 
  mediaType, 
  heatmapRegions, 
  timelineMarkers, 
  audioSegments,
  reasoning 
}: ExplainableAIProps) => {
  const [activeTab, setActiveTab] = useState("visual");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-display text-sm font-bold text-foreground tracking-widest uppercase">
          Why SHANSHIELD Reached This Decision
        </h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border/30">
          <TabsTrigger 
            value="visual" 
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Eye className="w-4 h-4 mr-2" />
            Visual Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="temporal"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Clock className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger 
            value="audio"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <AudioLines className="w-4 h-4 mr-2" />
            Audio
          </TabsTrigger>
        </TabsList>

        {/* Visual Heatmap Tab */}
        <TabsContent value="visual" className="mt-4">
          <div className="bg-card/50 border border-border/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-display tracking-wider text-muted-foreground uppercase">
                Manipulation Heatmap
              </span>
              <Button variant="ghost" size="sm" className="text-primary">
                <ZoomIn className="w-4 h-4 mr-1" />
                Zoom
              </Button>
            </div>
            
            {/* Simulated Heatmap Visualization */}
            <div className="relative aspect-video bg-background/50 rounded-lg overflow-hidden border border-border/20">
              {/* Grid overlay */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-primary/30" />
                ))}
              </div>

              {/* Heatmap regions */}
              {heatmapRegions.map((region, index) => (
                <div
                  key={index}
                  className="absolute rounded-lg border-2 border-dashed flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    left: `${region.x}%`,
                    top: `${region.y}%`,
                    width: `${region.width}%`,
                    height: `${region.height}%`,
                    borderColor: region.intensity > 70 
                      ? 'hsl(var(--destructive))' 
                      : region.intensity > 40 
                      ? 'hsl(var(--warning))' 
                      : 'hsl(var(--success))',
                    background: region.intensity > 70 
                      ? 'rgba(239, 68, 68, 0.2)' 
                      : region.intensity > 40 
                      ? 'rgba(251, 191, 36, 0.2)' 
                      : 'rgba(34, 197, 94, 0.1)'
                  }}
                >
                  <span className="text-[10px] font-mono text-foreground bg-background/80 px-1 rounded">
                    {region.label}
                  </span>
                </div>
              ))}

              {/* Scan line animation */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-destructive/50 border border-destructive" />
                <span className="text-xs text-muted-foreground">High Manipulation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-warning/50 border border-warning" />
                <span className="text-xs text-muted-foreground">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-success/50 border border-success" />
                <span className="text-xs text-muted-foreground">Low/None</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="temporal" className="mt-4">
          <div className="bg-card/50 border border-border/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-display tracking-wider text-muted-foreground uppercase">
                Temporal Anomaly Timeline
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>

            {/* Timeline Visualization */}
            <div className="relative h-16 bg-background/50 rounded-lg overflow-hidden border border-border/20">
              {/* Timeline track */}
              <div className="absolute inset-x-4 top-1/2 h-1 bg-muted/30 -translate-y-1/2 rounded" />
              
              {/* Markers */}
              {timelineMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute top-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: `${(marker.timestamp / 60) * 100}%` }}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 transition-transform hover:scale-125",
                    marker.type === 'anomaly' && "bg-destructive border-destructive",
                    marker.type === 'warning' && "bg-warning border-warning",
                    marker.type === 'info' && "bg-primary border-primary"
                  )} />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-popover border border-border rounded-lg p-2 text-xs whitespace-nowrap shadow-lg">
                      <div className="font-medium text-foreground">{marker.label}</div>
                      <div className="text-muted-foreground">{marker.description}</div>
                      <div className="text-primary font-mono">{marker.timestamp.toFixed(1)}s</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Playhead */}
              {isPlaying && (
                <div className="absolute top-0 bottom-0 w-0.5 bg-primary animate-data-stream" 
                  style={{ left: '10%' }} 
                />
              )}
            </div>

            {/* Timeline markers list */}
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
              {timelineMarkers.map((marker, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg",
                    marker.type === 'anomaly' && "bg-destructive/10",
                    marker.type === 'warning' && "bg-warning/10",
                    marker.type === 'info' && "bg-primary/10"
                  )}
                >
                  <span className="text-xs font-mono text-muted-foreground w-12">
                    {marker.timestamp.toFixed(1)}s
                  </span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    marker.type === 'anomaly' && "bg-destructive",
                    marker.type === 'warning' && "bg-warning",
                    marker.type === 'info' && "bg-primary"
                  )} />
                  <div className="flex-1">
                    <span className="text-sm text-foreground">{marker.label}</span>
                    <p className="text-xs text-muted-foreground">{marker.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio" className="mt-4">
          <div className="bg-card/50 border border-border/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-display tracking-wider text-muted-foreground uppercase">
                Audio Spectrogram Analysis
              </span>
            </div>

            {/* Spectrogram Visualization */}
            <div className="relative h-24 bg-background/50 rounded-lg overflow-hidden border border-border/20">
              {/* Fake spectrogram bars */}
              <div className="absolute inset-0 flex items-end px-1">
                {Array.from({ length: 60 }).map((_, i) => {
                  const height = Math.random() * 80 + 10;
                  const segment = audioSegments.find(
                    s => (i / 60) * 10 >= s.start && (i / 60) * 10 <= s.end
                  );
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 mx-px rounded-t transition-all",
                        segment?.type === 'suspicious' && "bg-destructive/60",
                        segment?.type === 'irregular' && "bg-warning/60",
                        (!segment || segment?.type === 'normal') && "bg-primary/40"
                      )}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>

              {/* Segment overlays */}
              {audioSegments.filter(s => s.type !== 'normal').map((segment, index) => (
                <div
                  key={index}
                  className={cn(
                    "absolute top-0 bottom-0 border-l-2 border-r-2",
                    segment.type === 'suspicious' && "bg-destructive/10 border-destructive/50",
                    segment.type === 'irregular' && "bg-warning/10 border-warning/50"
                  )}
                  style={{
                    left: `${(segment.start / 10) * 100}%`,
                    width: `${((segment.end - segment.start) / 10) * 100}%`
                  }}
                >
                  <span className="absolute top-1 left-1 text-[8px] font-mono text-foreground">
                    {segment.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Audio analysis summary */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {audioSegments.filter(s => s.type !== 'normal').map((segment, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-2 rounded-lg",
                    segment.type === 'suspicious' && "bg-destructive/10 border border-destructive/30",
                    segment.type === 'irregular' && "bg-warning/10 border border-warning/30"
                  )}
                >
                  <div className="text-xs font-medium text-foreground">{segment.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {segment.start.toFixed(1)}s - {segment.end.toFixed(1)}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reasoning Chain */}
      <div className="bg-card/30 border border-border/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-primary" />
          <span className="font-display text-xs tracking-widest uppercase text-primary">
            Decision Reasoning Chain
          </span>
        </div>
        <ol className="space-y-2">
          {reasoning.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default ExplainableAI;
