import { useState } from "react";
import { Upload, Music, X } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";

interface AudioUploadSectionProps {
  onFileUploaded: (file: File) => void;
  onFileSelected(file: File): void
}

export function AudioUploadSection({ onFileUploaded }: AudioUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === "audio/mpeg" || file.type === "audio/wav" || file.type === "audio/mp3") {
      setUploadedFile(file);
      setIsProcessing(true);
      setProgress(0);
      
      // Simulate processing
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsProcessing(false);
            return 100;
          }
          return prev + 10;
        });
      }, 150);

      // Call onFileUploaded after processing completes
      setTimeout(() => {
        onFileUploaded(file);
      }, 150 * 11); // 11 intervals to reach 100%
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setProgress(0);
  };

  return (
    <Card 
      className={`p-8 md:p-10 transition-all border-2 bg-gradient-to-br from-zinc-900 to-zinc-800 ${ 
        isDragging ? "border-green-500 bg-green-500/5 shadow-lg shadow-green-500/20" : "border-zinc-700/50 hover:border-zinc-600"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!uploadedFile ? (
        <div className="flex flex-col items-center justify-center gap-5">
          <div className="size-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30">
            <Upload className="size-10 text-green-400" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white mb-2">
              Drop your audio file here
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Supported formats: MP3, WAV
            </p>
            <label>
              <input
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                onChange={handleFileInput}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="cursor-pointer bg-green-500 hover:bg-green-600 text-black border-none font-semibold" 
                asChild
              >
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30">
              <Music className="size-6 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-white truncate">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-gray-400">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="shrink-0 text-gray-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="size-5" />
            </Button>
          </div>
          {isProcessing && (
            <div className="space-y-3">
              <Progress value={progress} className="h-2 bg-zinc-800" />
              <p className="text-sm text-gray-400 text-center font-medium">
                Analyzing audio... {progress}%
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}