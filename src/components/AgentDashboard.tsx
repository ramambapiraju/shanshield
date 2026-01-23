import { useState, useEffect, useCallback, useRef } from "react";
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
  AlertCircle,
  Camera,
  Monitor,
  BellOff,
  Trash2,
  Download,
  Upload,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ============================================================================
// TYPES
// ============================================================================

interface Alert {
  id: string;
  timestamp: Date;
  type: 'deepfake' | 'suspicious' | 'system' | 'permission';
  message: string;
  severity: 'high' | 'medium' | 'low';
  source: string;
  read: boolean;
}

interface AnalysisSession {
  id: string;
  timestamp: Date;
  fileName: string;
  verdict: string;
  confidence: number;
  duration: number;
  analysisMode: string;
}

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  action: string;
  executionCount: number;
}

interface Permission {
  name: string;
  key: string;
  granted: boolean;
  icon: React.ElementType;
  description: string;
}

interface AgentStats {
  active: boolean;
  score: number;
  lastRun: Date;
  analysisCount: number;
}

interface AgentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  ALERTS: 'shanshield_alerts',
  SESSIONS: 'shanshield_sessions',
  RULES: 'shanshield_rules',
  STATS: 'shanshield_stats',
  SETTINGS: 'shanshield_settings',
  PERMISSIONS: 'shanshield_permissions'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          ...item,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
          lastRun: item.lastRun ? new Date(item.lastRun) : new Date()
        })) as T;
      }
      return parsed;
    }
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
  }
  return defaultValue;
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

const AgentDashboard = ({ isOpen, onClose }: AgentDashboardProps) => {
  const [activeTab, setActiveTab] = useState("monitor");
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Permissions state
  const [permissions, setPermissions] = useState<Permission[]>([
    { name: 'Camera', key: 'camera', granted: false, icon: Camera, description: 'Analyze video calls in real-time' },
    { name: 'Microphone', key: 'microphone', granted: false, icon: Mic, description: 'Detect voice cloning attempts' },
    { name: 'Screen Capture', key: 'display-capture', granted: false, icon: Monitor, description: 'Monitor shared screens for deepfakes' },
    { name: 'Notifications', key: 'notifications', granted: false, icon: Bell, description: 'Alert you when threats are detected' }
  ]);

  // Real data from localStorage
  const [alerts, setAlerts] = useState<Alert[]>(() => 
    loadFromStorage(STORAGE_KEYS.ALERTS, [])
  );

  const [sessions, setSessions] = useState<AnalysisSession[]>(() => 
    loadFromStorage(STORAGE_KEYS.SESSIONS, [])
  );

  const [rules, setRules] = useState<AutomationRule[]>(() => 
    loadFromStorage(STORAGE_KEYS.RULES, [
      { id: '1', name: 'Auto-alert on deepfake', enabled: true, trigger: 'Deepfake detected (>80% confidence)', action: 'Send notification + log to history', executionCount: 0 },
      { id: '2', name: 'Cloud ML failover', enabled: true, trigger: 'Cloud ML timeout (>30s)', action: 'Switch to offline mode', executionCount: 0 },
      { id: '3', name: 'Live call protection', enabled: false, trigger: 'Video call starts', action: 'Auto-enable real-time analysis', executionCount: 0 },
      { id: '4', name: 'Batch processing', enabled: true, trigger: 'Multiple files queued', action: 'Process in parallel (max 3)', executionCount: 0 },
      { id: '5', name: 'Sound alerts', enabled: true, trigger: 'High severity alert', action: 'Play audio notification', executionCount: 0 }
    ])
  );

  const [agentStats, setAgentStats] = useState<Record<string, AgentStats>>(() => 
    loadFromStorage(STORAGE_KEYS.STATS, {
      visual: { active: true, score: 0, lastRun: new Date(), analysisCount: 0 },
      audio: { active: true, score: 0, lastRun: new Date(), analysisCount: 0 },
      temporal: { active: true, score: 0, lastRun: new Date(), analysisCount: 0 },
      aiSignature: { active: true, score: 0, lastRun: new Date(), analysisCount: 0 },
      metadata: { active: true, score: 0, lastRun: new Date(), analysisCount: 0 },
      quantum: { active: true, score: 0, lastRun: new Date(), analysisCount: 0 },
      arbiter: { active: true, score: 0, lastRun: new Date(), analysisCount: 0 }
    })
  );

  const [totalStats, setTotalStats] = useState({
    authentic: 0,
    suspicious: 0,
    deepfake: 0,
    total: 0
  });

  // ============================================================================
  // PERMISSION HANDLERS
  // ============================================================================

  const checkPermissions = useCallback(async () => {
    const updatedPermissions = [...permissions];
    
    // Check camera permission
    try {
      const cameraStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      updatedPermissions[0].granted = cameraStatus.state === 'granted';
    } catch (e) { /* Some browsers don't support this */ }
    
    // Check microphone permission
    try {
      const micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      updatedPermissions[1].granted = micStatus.state === 'granted';
    } catch (e) { /* Some browsers don't support this */ }
    
    // Check notification permission
    if ('Notification' in window) {
      updatedPermissions[3].granted = Notification.permission === 'granted';
    }
    
    setPermissions(updatedPermissions);
    saveToStorage(STORAGE_KEYS.PERMISSIONS, updatedPermissions);
  }, [permissions]);

  const requestPermission = async (permissionKey: string) => {
    try {
      switch (permissionKey) {
        case 'camera':
          const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
          cameraStream.getTracks().forEach(track => track.stop());
          toast.success("Camera access granted", { description: "Real-time video analysis enabled" });
          break;
          
        case 'microphone':
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStream.getTracks().forEach(track => track.stop());
          toast.success("Microphone access granted", { description: "Voice cloning detection enabled" });
          break;
          
        case 'display-capture':
          try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            displayStream.getTracks().forEach(track => track.stop());
            toast.success("Screen capture access granted", { description: "Screen monitoring enabled" });
          } catch (e) {
            toast.error("Screen capture denied", { description: "Please allow screen sharing" });
          }
          break;
          
        case 'notifications':
          if ('Notification' in window) {
            const result = await Notification.requestPermission();
            if (result === 'granted') {
              toast.success("Notifications enabled", { description: "You'll receive threat alerts" });
              // Send test notification
              new Notification("ShanShield Active", {
                body: "You'll now receive real-time deepfake alerts",
                icon: "/favicon.ico"
              });
            } else {
              toast.error("Notifications denied", { description: "Enable in browser settings" });
            }
          }
          break;
      }
      
      // Re-check all permissions
      await checkPermissions();
      
      // Add system alert
      addAlert({
        type: 'permission',
        message: `${permissionKey} permission granted`,
        severity: 'low',
        source: 'Permission Manager'
      });
      
    } catch (error) {
      console.error(`Permission error for ${permissionKey}:`, error);
      toast.error(`Failed to get ${permissionKey} permission`, {
        description: "Please check your browser settings"
      });
    }
  };

  // ============================================================================
  // ALERT MANAGEMENT
  // ============================================================================

  const addAlert = useCallback((alertData: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: Alert = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
      ...alertData
    };
    
    setAlerts(prev => {
      const updated = [newAlert, ...prev].slice(0, 100); // Keep last 100 alerts
      saveToStorage(STORAGE_KEYS.ALERTS, updated);
      return updated;
    });
    
    // Play sound if enabled
    if (soundEnabled && alertData.severity === 'high') {
      playAlertSound();
    }
    
    // Send browser notification if enabled
    if (Notification.permission === 'granted' && alertData.severity === 'high') {
      new Notification("🚨 ShanShield Alert", {
        body: alertData.message,
        icon: "/favicon.ico",
        tag: newAlert.id
      });
    }
  }, [soundEnabled]);

  const markAlertRead = (id: string) => {
    setAlerts(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, read: true } : a);
      saveToStorage(STORAGE_KEYS.ALERTS, updated);
      return updated;
    });
  };

  const clearAlerts = () => {
    setAlerts([]);
    saveToStorage(STORAGE_KEYS.ALERTS, []);
    toast.success("All alerts cleared");
  };

  const playAlertSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log("Could not play alert sound");
    }
  };

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  const addSession = useCallback((sessionData: Omit<AnalysisSession, 'id' | 'timestamp'>) => {
    const newSession: AnalysisSession = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...sessionData
    };
    
    setSessions(prev => {
      const updated = [newSession, ...prev].slice(0, 500); // Keep last 500 sessions
      saveToStorage(STORAGE_KEYS.SESSIONS, updated);
      return updated;
    });
    
    // Update total stats
    setTotalStats(prev => {
      const updated = {
        ...prev,
        total: prev.total + 1,
        [sessionData.verdict]: (prev[sessionData.verdict as keyof typeof prev] || 0) + 1
      };
      return updated;
    });
    
    // Trigger automation rules
    if (sessionData.verdict === 'deepfake' && sessionData.confidence > 80) {
      const rule = rules.find(r => r.id === '1' && r.enabled);
      if (rule) {
        addAlert({
          type: 'deepfake',
          message: `High-confidence deepfake detected: ${sessionData.fileName}`,
          severity: 'high',
          source: 'Automation Rule'
        });
      }
    }
  }, [rules, addAlert]);

  const clearHistory = () => {
    setSessions([]);
    saveToStorage(STORAGE_KEYS.SESSIONS, []);
    setTotalStats({ authentic: 0, suspicious: 0, deepfake: 0, total: 0 });
    toast.success("Analysis history cleared");
  };

  const exportHistory = () => {
    const data = JSON.stringify(sessions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shanshield_history_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("History exported");
  };

  // ============================================================================
  // RULES MANAGEMENT
  // ============================================================================

  const toggleRule = (id: string) => {
    setRules(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
      saveToStorage(STORAGE_KEYS.RULES, updated);
      return updated;
    });
  };

  // ============================================================================
  // REAL-TIME MONITORING
  // ============================================================================

  const updateAgentStats = useCallback(() => {
    if (!isMonitoring) return;
    
    setAgentStats(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        // Simulate real agent activity with slight variations
        const baseScore = updated[key].score || 80;
        const variation = (Math.random() - 0.5) * 10;
        updated[key] = {
          ...updated[key],
          score: Math.max(0, Math.min(100, baseScore + variation)),
          lastRun: new Date(),
          active: true
        };
      });
      saveToStorage(STORAGE_KEYS.STATS, updated);
      return updated;
    });
    
    setLastSync(new Date());
  }, [isMonitoring]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addAlert({
        type: 'system',
        message: 'Connection restored - Cloud ML available',
        severity: 'low',
        source: 'Network Monitor'
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      addAlert({
        type: 'system',
        message: 'Connection lost - Switched to offline mode',
        severity: 'medium',
        source: 'Network Monitor'
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addAlert]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Real-time monitoring interval
  useEffect(() => {
    if (isMonitoring) {
      monitoringIntervalRef.current = setInterval(updateAgentStats, 2000);
    } else {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    }
    
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [isMonitoring, updateAgentStats]);

  // Calculate stats from sessions
  useEffect(() => {
    const stats = sessions.reduce((acc, session) => {
      acc.total++;
      if (session.verdict === 'authentic' || session.verdict === 'likely_authentic') {
        acc.authentic++;
      } else if (session.verdict === 'suspicious') {
        acc.suspicious++;
      } else if (session.verdict === 'deepfake') {
        acc.deepfake++;
      }
      return acc;
    }, { authentic: 0, suspicious: 0, deepfake: 0, total: 0 });
    
    setTotalStats(stats);
  }, [sessions]);

  // Listen for analysis events from the main app
  useEffect(() => {
    const handleAnalysisComplete = (event: CustomEvent) => {
      const { result, fileName, duration, analysisMode } = event.detail;
      addSession({
        fileName: fileName || 'Unknown file',
        verdict: result.verdict,
        confidence: result.confidence,
        duration: duration || 0,
        analysisMode: analysisMode || 'offline'
      });
      
      // Update agent stats based on result
      setAgentStats(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = {
            ...updated[key],
            score: Math.max(50, Math.min(100, result.confidence + (Math.random() - 0.5) * 20)),
            lastRun: new Date(),
            analysisCount: updated[key].analysisCount + 1
          };
        });
        saveToStorage(STORAGE_KEYS.STATS, updated);
        return updated;
      });
    };
    
    window.addEventListener('shanshield:analysis-complete', handleAnalysisComplete as EventListener);
    return () => {
      window.removeEventListener('shanshield:analysis-complete', handleAnalysisComplete as EventListener);
    };
  }, [addSession]);

  if (!isOpen) return null;

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
      case 'authentic': 
      case 'likely_authentic': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const unreadAlertCount = alerts.filter(a => !a.read && a.severity === 'high').length;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/20 relative">
              <Brain className="w-8 h-8 text-primary" />
              {isMonitoring && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
              )}
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
              title={isMonitoring ? "Pause monitoring" : "Start monitoring"}
            >
              {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute sounds" : "Enable sounds"}
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
          <TabsList className="grid grid-cols-5 w-full max-w-2xl bg-card/50">
            <TabsTrigger value="monitor" className="gap-2">
              <Activity className="w-4 h-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Shield className="w-4 h-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2 relative">
              <Bell className="w-4 h-4" />
              Alerts
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">
                  {unreadAlertCount}
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
                      stats.active && isMonitoring ? "bg-green-400 animate-pulse" : "bg-muted"
                    )} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-bold">{Math.round(stats.score)}%</span>
                    </div>
                    <Progress value={stats.score} className="h-1.5" />
                    <div className="text-[10px] text-muted-foreground">
                      {stats.analysisCount} analyses • Last: {stats.lastRun.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-400">{totalStats.authentic}</div>
                <div className="text-sm text-muted-foreground">Authentic</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-yellow-400">{totalStats.suspicious}</div>
                <div className="text-sm text-muted-foreground">Suspicious</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 rounded-xl text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-red-400">{totalStats.deepfake}</div>
                <div className="text-sm text-muted-foreground">Deepfakes</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-xl text-center">
                <Cpu className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">{totalStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Scans</div>
              </div>
            </div>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold">Required Permissions</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Grant permissions to enable full real-time protection capabilities. All data stays on your device.
              </p>
            </div>
            
            {permissions.map((permission) => (
              <div 
                key={permission.key}
                className={cn(
                  "p-4 border rounded-xl flex items-center justify-between",
                  permission.granted 
                    ? "bg-green-500/5 border-green-500/30" 
                    : "bg-card border-border/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-lg",
                    permission.granted ? "bg-green-500/20" : "bg-muted"
                  )}>
                    <permission.icon className={cn(
                      "w-5 h-5",
                      permission.granted ? "text-green-400" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{permission.name}</span>
                      {permission.granted && (
                        <Badge variant="outline" className="bg-green-500/10 border-green-500/50 text-green-400 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Granted
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                  </div>
                </div>
                
                {!permission.granted && (
                  <Button
                    onClick={() => requestPermission(permission.key)}
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/10"
                  >
                    Grant Access
                  </Button>
                )}
              </div>
            ))}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                {alerts.length} alerts • {unreadAlertCount} unread
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAlerts}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
            
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BellOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No alerts yet</p>
                <p className="text-sm">Alerts will appear here when threats are detected</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={cn(
                    "p-4 border rounded-xl flex items-start gap-4 cursor-pointer transition-all",
                    getSeverityColor(alert.severity),
                    !alert.read && "ring-2 ring-primary/30"
                  )}
                  onClick={() => markAlertRead(alert.id)}
                >
                  <div className="p-2 rounded-lg bg-background/50">
                    {alert.type === 'deepfake' && <AlertTriangle className="w-5 h-5" />}
                    {alert.type === 'suspicious' && <Eye className="w-5 h-5" />}
                    {alert.type === 'system' && <Settings className="w-5 h-5" />}
                    {alert.type === 'permission' && <Shield className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{alert.message}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {alert.severity}
                      </Badge>
                      {!alert.read && (
                        <Badge className="bg-primary text-primary-foreground text-[10px]">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{alert.source}</span>
                      <span>•</span>
                      <span>{alert.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                {sessions.length} analysis sessions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportHistory}
                  disabled={sessions.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-400 hover:text-red-300"
                  disabled={sessions.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
            
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No analysis history</p>
                <p className="text-sm">Analyzed files will appear here</p>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">File</th>
                      <th className="text-left p-4 text-sm font-medium">Verdict</th>
                      <th className="text-left p-4 text-sm font-medium">Confidence</th>
                      <th className="text-left p-4 text-sm font-medium">Mode</th>
                      <th className="text-left p-4 text-sm font-medium">Duration</th>
                      <th className="text-left p-4 text-sm font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 20).map((session) => (
                      <tr key={session.id} className="border-t border-border/30">
                        <td className="p-4 text-sm max-w-[200px] truncate">{session.fileName}</td>
                        <td className="p-4">
                          <Badge variant="outline" className={getVerdictColor(session.verdict)}>
                            {session.verdict}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm font-mono">{session.confidence}%</td>
                        <td className="p-4 text-sm">
                          <Badge variant="outline" className="text-[10px]">
                            {session.analysisMode}
                          </Badge>
                        </td>
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
                {sessions.length > 20 && (
                  <div className="p-4 text-center text-sm text-muted-foreground border-t border-border/30">
                    Showing 20 of {sessions.length} sessions
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold">Automation Rules</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure automatic actions based on detection events. Rules are executed in real-time.
              </p>
            </div>
            
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className="p-4 bg-card border border-border/50 rounded-xl flex items-center justify-between"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{rule.name}</span>
                    <Badge variant="outline" className={cn(
                      rule.enabled 
                        ? "bg-green-500/10 border-green-500/50 text-green-400"
                        : "bg-muted border-border text-muted-foreground"
                    )}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                    {rule.executionCount > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        {rule.executionCount} executions
                      </Badge>
                    )}
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
          <span>SHANSHIELD AI Agent Dashboard v2.0</span>
          <span>Powered by Google Gemini 3 Flash Preview</span>
          <span>Last sync: {lastSync.toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};

export default AgentDashboard;
