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
  AlertCircle
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

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
    const newFiles: UploadedFile[] = Array.from(files).map(file => {
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

    setUploadedFiles(prev => [...prev, ...newFiles]);
    onFilesSelected([...uploadedFiles, ...newFiles]);
  }, [uploadedFiles, onFilesSelected]);

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

  const startCamera = async () => {
    setCameraError(null);
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setCameraActive(true);
      toast.success("Camera activated", {
        description: "Ready to capture frames or record video"
      });
    } catch (err) {
      console.error("Camera access denied:", err);
      const errorMessage = err instanceof Error ? err.message : "Camera access denied";
      setCameraError(errorMessage);
      toast.error("Camera Error", {
        description: errorMessage
      });
    }
  };

  const captureFromCamera = () => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            processFiles([file]);
            toast.success("Frame captured!", {
              description: "Image added to analysis queue"
            });
          }
        }, 'image/jpeg', 0.95);
      }
    } else {
      toast.error("Camera not ready", {
        description: "Please wait for the camera to initialize"
      });
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    setRecordingTime(0);

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : 'video/webm';
      
      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
        processFiles([file]);
        toast.success("Video recorded!", {
          description: `${recordingTime}s video added to analysis queue`
        });
        setRecordingTime(0);
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
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
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
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
          {cameraActive ? (
            <div className="flex gap-2 flex-wrap justify-end">
              {!isRecording ? (
                <>
                  <Button size="sm" variant="default" onClick={captureFromCamera}>
                    <Camera className="w-4 h-4 mr-1" />
                    Capture
                  </Button>
                  <Button size="sm" variant="secondary" onClick={startRecording}>
                    <VideoIcon className="w-4 h-4 mr-1" />
                    Record
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="destructive" onClick={stopRecording}>
                  <StopCircle className="w-4 h-4 mr-1" />
                  Stop ({formatTime(recordingTime)})
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={stopCamera} disabled={isRecording}>
                Stop Camera
              </Button>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={startCamera}
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
          <div className="relative aspect-video bg-background rounded-lg overflow-hidden border border-border/50">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            <div className={cn(
              "absolute top-2 left-2 flex items-center gap-2 px-2 py-1 rounded text-xs font-medium",
              isRecording ? "bg-destructive" : "bg-destructive/80"
            )}>
              <div className={cn(
                "w-2 h-2 bg-white rounded-full",
                isRecording ? "animate-pulse" : ""
              )} />
              {isRecording ? `REC ${formatTime(recordingTime)}` : "LIVE"}
            </div>
            {isRecording && (
              <div className="absolute bottom-2 left-2 right-2 bg-destructive/20 rounded-full h-1">
                <div 
                  className="h-full bg-destructive rounded-full animate-pulse"
                  style={{ width: `${Math.min((recordingTime / 60) * 100, 100)}%` }}
                />
              </div>
            )}
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
