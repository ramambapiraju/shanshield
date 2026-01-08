import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Upload, 
  Image, 
  Video, 
  Mic, 
  FileText, 
  Camera,
  X,
  CheckCircle,
  VideoIcon,
  StopCircle,
  AlertCircle,
  SwitchCamera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type MediaType = 'image' | 'video' | 'audio' | 'document';

interface UploadedFile {
  file: File;
  type: MediaType;
  preview?: string;
  id: string;
}

interface MediaUploaderProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  isAnalyzing: boolean;
}

const mediaConfig = {
  image: {
    icon: Image,
    label: "Image",
    accept: ".jpg,.jpeg,.png,.webp,.gif",
    description: "JPEG, PNG, WebP"
  },
  video: {
    icon: Video,
    label: "Video",
    accept: ".mp4,.mov,.avi,.webm,.mkv",
    description: "MP4, MOV, AVI"
  },
  audio: {
    icon: Mic,
    label: "Audio",
    accept: ".wav,.mp3,.m4a,.ogg,.flac",
    description: "WAV, MP3, M4A"
  },
  document: {
    icon: FileText,
    label: "Document",
    accept: ".pdf",
    description: "PDF with media"
  }
};

const MediaUploader = ({ onFilesSelected, isAnalyzing }: MediaUploaderProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for multiple cameras on mount
  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (err) {
        console.log("Could not enumerate devices:", err);
      }
    };
    checkCameras();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // Attach stream to video after the <video> element mounts
  useEffect(() => {
    if (!cameraStream) return;

    let cancelled = false;

    const attach = () => {
      if (cancelled) return;

      const video = videoRef.current;
      if (!video) {
        requestAnimationFrame(attach);
        return;
      }

      video.srcObject = cameraStream;

      const markReadyIfPossible = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setCameraReady(true);
        }
      };

      video.onloadedmetadata = () => {
        markReadyIfPossible();
        video.play().catch(() => {});
      };

      video.oncanplay = () => {
        markReadyIfPossible();
      };

      video.play().catch(() => {});

      const start = performance.now();
      const poll = () => {
        if (cancelled) return;
        markReadyIfPossible();
        if ((video.videoWidth === 0 || video.videoHeight === 0) && performance.now() - start < 3000) {
          requestAnimationFrame(poll);
        }
      };
      requestAnimationFrame(poll);
    };

    attach();

    return () => {
      cancelled = true;
    };
  }, [cameraStream]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const getMediaType = (file: File): MediaType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const newFiles: UploadedFile[] = Array.from(files).map((file) => {
      const type = getMediaType(file);
      const uploadedFile: UploadedFile = {
        file,
        type,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      if (type === 'image' || type === 'video') {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      return uploadedFile;
    });

    setUploadedFiles((prev) => {
      const updated = [...prev, ...newFiles];
      onFilesSelected(updated);
      return updated;
    });
  }, [onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = (type: MediaType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = mediaConfig[type].accept;
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    const updated = uploadedFiles.filter(f => f.id !== id);
    setUploadedFiles(updated);
    onFilesSelected(updated);
  };

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    setCameraReady(false);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraStream(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      const constraintsBase: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      // First try with audio (best for recording). If mic permission is denied, fall back to video-only.
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ ...constraintsBase, audio: true });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ ...constraintsBase, audio: false });
      }

      streamRef.current = stream;
      setFacingMode(mode);
      setCameraActive(true);
      setCameraStream(stream);

      // Re-check camera count after permissions are granted
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        // ignore
      }

      toast.success("Camera activated", {
        description: "Ready to capture frames or record video"
      });
    } catch (err) {
      console.error("Camera access denied:", err);

      let errorMessage = err instanceof Error ? err.message : "Camera access denied";
      const errName = err instanceof DOMException ? err.name : undefined;

      if (errName === "NotAllowedError" || errName === "SecurityError") {
        const inIframe = (() => {
          try {
            return window.self !== window.top;
          } catch {
            return true;
          }
        })();

        if (inIframe) {
          errorMessage = `${errorMessage} (Camera is often blocked inside embedded previews; open in a new tab.)`;
        }
      }

      setCameraError(errorMessage);
      toast.error("Camera Error", {
        description: errorMessage
      });

      setCameraStream(null);
      setCameraActive(false);
      setCameraReady(false);
    }
  };

  const switchCamera = async () => {
    if (isRecording) {
      toast.error("Cannot switch camera while recording");
      return;
    }
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    await startCamera(newMode);
    toast.success(`Switched to ${newMode === 'user' ? 'front' : 'back'} camera`);
  };

  const captureFromCamera = () => {
    if (!cameraReady || !videoRef.current) {
      toast.error("Camera not ready", {
        description: "Please wait for the camera to initialize"
      });
      return;
    }

    const video = videoRef.current;
    
    // Ensure video has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error("Camera not ready", {
        description: "Video stream not available yet"
      });
      return;
    }

    // Use canvas ref or create one
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          processFiles([file]);
          toast.success("Frame captured!", {
            description: "Image added to analysis queue"
          });
        } else {
          toast.error("Capture failed", {
            description: "Could not capture frame"
          });
        }
      }, 'image/jpeg', 0.95);
    } else {
      toast.error("Capture failed", {
        description: "Canvas context not available"
      });
    }
  };

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream) {
      toast.error("Camera not active", { description: "Start the camera first" });
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      toast.error("Recording not supported", {
        description: "This browser/device does not support video recording"
      });
      return;
    }

    recordedChunksRef.current = [];
    setRecordingTime(0);

    const startedAt = Date.now();

    // Prefer MP4 on Safari, WebM on Chromium.
    const mimeCandidates = [
      'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];

    const selectedMime = mimeCandidates.find((t) => MediaRecorder.isTypeSupported(t));

    try {
      const mediaRecorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        const mime = selectedMime || mediaRecorder.mimeType || 'video/webm';
        const ext = mime.includes('mp4') ? 'mp4' : 'webm';

        const blob = new Blob(recordedChunksRef.current, { type: mime });
        const file = new File([blob], `recording-${Date.now()}.${ext}`, { type: mime });

        processFiles([file]);
        toast.success("Video recorded!", {
          description: `${durationSeconds}s video added to analysis queue`
        });
        setRecordingTime(0);
      };

      mediaRecorder.start(250);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.info("Recording started", {
        description: "Click Stop Recording to finish"
      });
    } catch (err) {
      console.error("Recording error:", err);
      toast.error("Recording failed", {
        description: "Unable to start video recording"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const stopCamera = () => {
    if (isRecording) {
      stopRecording();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraStream(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraReady(false);
    setCameraError(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm font-bold text-foreground tracking-widest uppercase">
          Operational Media Input
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Field & Open-Source Sources
      </p>

      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all duration-300",
          dragActive 
            ? "border-primary bg-primary/10" 
            : "border-border/50 hover:border-primary/50",
          isAnalyzing && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
          multiple
        />
        
        <div className="text-center">
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Drag & drop media files here
          </p>
          
          {/* Media Type Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(mediaConfig) as MediaType[]).map((type) => {
              const config = mediaConfig[type];
              const Icon = config.icon;
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 bg-card/50 border-border/50 hover:border-primary hover:bg-primary/10"
                  onClick={() => handleFileSelect(type)}
                  disabled={isAnalyzing}
                >
                  <Icon className="w-5 h-5 mb-1 text-primary" />
                  <span className="text-xs font-display tracking-wide">{config.label}</span>
                  <span className="text-[10px] text-muted-foreground">{config.description}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Capture */}
      <div className="bg-card/50 border border-border/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-accent" />
            <span className="text-xs font-display tracking-wider text-foreground uppercase">
              Live Capture
            </span>
          </div>
          {!cameraActive && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => startCamera()}
              disabled={isAnalyzing}
              className="border-accent/50 hover:border-accent hover:bg-accent/10"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          )}
        </div>
        
        {cameraError && (
          <div className="flex items-center gap-2 text-destructive text-xs mb-3 bg-destructive/10 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            {cameraError}
          </div>
        )}
        
        {cameraActive && (
          <div className="space-y-3">
            {/* Live Preview - Always visible when camera is on */}
            <div className="relative aspect-video bg-background rounded-lg overflow-hidden border border-border/50">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                onClick={() => {
                  const v = videoRef.current;
                  if (v) v.play().catch(() => {});
                }}
                className="w-full h-full object-cover"
              />
              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Status indicator */}
              <div className={cn(
                "absolute top-2 left-2 flex items-center gap-2 px-2 py-1 rounded text-xs font-medium text-white",
                isRecording ? "bg-destructive" : "bg-green-600"
              )}>
                <div className={cn(
                  "w-2 h-2 bg-white rounded-full",
                  isRecording || !cameraReady ? "animate-pulse" : ""
                )} />
                {!cameraReady ? "LOADING..." : isRecording ? `REC ${formatTime(recordingTime)}` : "LIVE"}
              </div>
              
              {/* Camera info */}
              <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-black/50 text-white">
                {facingMode === 'user' ? 'Front' : 'Back'} Camera
              </div>
              
              {/* Recording progress bar */}
              {isRecording && (
                <div className="absolute bottom-2 left-2 right-2 bg-destructive/20 rounded-full h-1">
                  <div 
                    className="h-full bg-destructive rounded-full animate-pulse"
                    style={{ width: `${Math.min((recordingTime / 60) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
            
            {/* Camera Controls */}
            <div className="flex flex-wrap gap-2 justify-center">
              {!isRecording ? (
                <>
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={captureFromCamera}
                    disabled={!cameraReady}
                    className="flex-1 min-w-[100px]"
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Capture Photo
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={startRecording}
                    disabled={!cameraReady}
                    className="flex-1 min-w-[100px]"
                  >
                    <VideoIcon className="w-4 h-4 mr-1" />
                    Start Recording
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={stopRecording}
                  className="flex-1"
                >
                  <StopCircle className="w-4 h-4 mr-1" />
                  Stop Recording ({formatTime(recordingTime)})
                </Button>
              )}
              
              {/* Switch Camera - Only show on devices with multiple cameras */}
              {hasMultipleCameras && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={switchCamera}
                  disabled={isRecording || !cameraReady}
                  title="Switch Camera"
                >
                  <SwitchCamera className="w-4 h-4" />
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={stopCamera} 
                disabled={isRecording}
              >
                <X className="w-4 h-4 mr-1" />
                Stop
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs font-display tracking-wider text-foreground uppercase">
              Queued for Analysis ({uploadedFiles.length})
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {uploadedFiles.map((file) => {
              const Icon = mediaConfig[file.type].icon;
              return (
                <div 
                  key={file.id}
                  className="relative bg-card/70 border border-border/30 rounded-lg p-2 group"
                >
                  {file.preview ? (
                    <div className="aspect-square rounded overflow-hidden mb-2">
                      {file.type === 'video' ? (
                        <video src={file.preview} className="w-full h-full object-cover" />
                      ) : (
                        <img src={file.preview} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square rounded bg-muted/20 flex items-center justify-center mb-2">
                      <Icon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground truncate">{file.file.name}</p>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isAnalyzing}
                  >
                    <X className="w-3 h-3 text-destructive-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
