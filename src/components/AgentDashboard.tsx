import { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  Bell,
  BellRing,
  Settings,
  History,
  AlertTriangle,
  CheckCircle,
  Eye,
  Mic,
  Clock,
  Database,
  Zap,
  Brain,
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Cpu,
  Wifi,
  WifiOff,
  X,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  timestamp: Date;
  type: 'deepfake' | 'suspicious' | 'system';
  message: string;
  severity: 'high' | 'medium' | 'low';
  source: string;
}

interface AnalysisSession {
  id: string;
  timestamp: Date;
  fileName: string;
  verdict: string;
  confidence: number;
  duration: number;
}

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  action: string;
}

interface AgentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AgentDashboard = ({ isOpen, onClose }: AgentDashboardProps) => {
  const [activeTab, setActiveTab] = useState("monitor");
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Demo data
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'deepfake',
      message: 'High-confidence deepfake detected in uploaded video',
      severity: 'high',
      source: 'Cloud ML Agent'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      type: 'suspicious',
      message: 'AI signature detected: Possible Midjourney generation',
      severity: 'medium',
      source: 'AI Signature Agent'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: 'system',
      message: 'Gemini 3 model upgraded successfully',
      severity: 'low',
      source: 'System'
    }
  ]);

  const [sessions, setSessions] = useState<AnalysisSession[]>([
    { id: '1', timestamp: new Date(), fileName: 'video_call_001.mp4', verdict: 'authentic', confidence: 94, duration: 2300 },
    { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 10), fileName: 'suspect_image.jpg', verdict: 'deepfake', confidence: 87, duration: 1200 },
    { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 25), fileName: 'voice_message.wav', verdict: 'suspicious', confidence: 62, duration: 800 }
  ]);

  const [rules, setRules] = useState<AutomationRule[]>([
    { id: '1', name: 'Auto-alert on deepfake', enabled: true, trigger: 'Deepfake detected (>80% confidence)', action: 'Send alert + log to history' },
    { id: '2', name: 'Cloud ML failover', enabled: true, trigger: 'Cloud ML timeout (>30s)', action: 'Switch to offline mode' },
    { id: '3', name: 'Live call protection', enabled: false, trigger: 'Video call starts', action: 'Auto-enable real-time analysis' },
    { id: '4', name: 'Batch processing', enabled: true, trigger: 'Multiple files queued', action: 'Process in parallel (max 3)' }
  ]);

  const [agentStats, setAgentStats] = useState({
    visual: { active: true, score: 87, lastRun: new Date() },
    audio: { active: true, score: 92, lastRun: new Date() },
    temporal: { active: true, score: 78, lastRun: new Date() },
    aiSignature: { active: true, score: 95, lastRun: new Date() },
    metadata: { active: true, score: 88, lastRun: new Date() },
    quantum: { active: true, score: 72, lastRun: new Date() },
    arbiter: { active: true, score: 91, lastRun: new Date() }
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/50';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/50';
      default: return 'text-muted-foreground';
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'deepfake': return 'text-red-400';
      case 'suspicious': return 'text-yellow-400';
      case 'authentic': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
                AI Agent Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time monitoring & control center • Powered by Gemini 3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="outline" className="bg-green-500/10 border-green-500/50 text-green-400">
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-500/10 border-red-500/50 text-red-400">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
              
              <Badge variant="outline" className={cn(
                isMonitoring 
                  ? "bg-green-500/10 border-green-500/50 text-green-400"
                  : "bg-muted border-border text-muted-foreground"
              )}>
                <Activity className={cn("w-3 h-3 mr-1", isMonitoring && "animate-pulse")} />
                {isMonitoring ? 'Active' : 'Paused'}
              </Badge>
            </div>

            {/* Quick Controls */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl bg-card/50">
            <TabsTrigger value="monitor" className="gap-2">
              <Activity className="w-4 h-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="w-4 h-4" />
              Alerts
              {alerts.filter(a => a.severity === 'high').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">
                  {alerts.filter(a => a.severity === 'high').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Settings className="w-4 h-4" />
              Rules
            </TabsTrigger>
          </TabsList>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-6">
            {/* Agent Status Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(agentStats).map(([name, stats]) => (
                <div key={name} className="p-4 bg-card border border-border/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {name === 'visual' && <Eye className="w-4 h-4 text-blue-400" />}
                      {name === 'audio' && <Mic className="w-4 h-4 text-purple-400" />}
                      {name === 'temporal' && <Clock className="w-4 h-4 text-cyan-400" />}
                      {name === 'aiSignature' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      {name === 'metadata' && <Database className="w-4 h-4 text-amber-400" />}
                      {name === 'quantum' && <Zap className="w-4 h-4 text-violet-400" />}
                      {name === 'arbiter' && <Brain className="w-4 h-4 text-primary" />}
                      <span className="text-sm font-medium capitalize">{name}</span>
                    </div>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      stats.active ? "bg-green-400 animate-pulse" : "bg-muted"
                    )} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-bold">{stats.score}%</span>
                    </div>
                    <Progress value={stats.score} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-400">127</div>
                <div className="text-sm text-muted-foreground">Authentic</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-yellow-400">23</div>
                <div className="text-sm text-muted-foreground">Suspicious</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 rounded-xl text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-red-400">8</div>
                <div className="text-sm text-muted-foreground">Deepfakes</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-xl text-center">
                <Cpu className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">158</div>
                <div className="text-sm text-muted-foreground">Total Scans</div>
              </div>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={cn(
                  "p-4 border rounded-xl flex items-start gap-4",
                  getSeverityColor(alert.severity)
                )}
              >
                <div className="p-2 rounded-lg bg-background/50">
                  {alert.type === 'deepfake' && <AlertTriangle className="w-5 h-5" />}
                  {alert.type === 'suspicious' && <Eye className="w-5 h-5" />}
                  {alert.type === 'system' && <Settings className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{alert.message}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{alert.source}</span>
                    <span>•</span>
                    <span>{alert.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium">File</th>
                    <th className="text-left p-4 text-sm font-medium">Verdict</th>
                    <th className="text-left p-4 text-sm font-medium">Confidence</th>
                    <th className="text-left p-4 text-sm font-medium">Duration</th>
                    <th className="text-left p-4 text-sm font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-t border-border/30">
                      <td className="p-4 text-sm">{session.fileName}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={getVerdictColor(session.verdict)}>
                          {session.verdict}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm font-mono">{session.confidence}%</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {(session.duration / 1000).toFixed(1)}s
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {session.timestamp.toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className="p-4 bg-card border border-border/50 rounded-xl flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{rule.name}</span>
                    <Badge variant="outline" className={cn(
                      rule.enabled 
                        ? "bg-green-500/10 border-green-500/50 text-green-400"
                        : "bg-muted border-border text-muted-foreground"
                    )}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary">Trigger:</span> {rule.trigger}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-cyan-400">Action:</span> {rule.action}
                  </p>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>SHANSHIELD AI Agent Dashboard v1.0</span>
          <span>Powered by Google Gemini 3 Flash Preview</span>
          <span>Last sync: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};

export default AgentDashboard;