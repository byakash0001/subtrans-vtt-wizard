import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  isProcessing
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSelectFile(file);
    }
  }, []);

  const validateAndSelectFile = (file: File) => {
    if (!file.name.endsWith('.vtt')) {
      setError('Please select a .vtt subtitle file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    onFileSelect(file);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Upload Subtitle File
        </h2>
        <p className="text-muted-foreground">
          Select a dual-language .vtt file (English + Reference Language)
        </p>
      </div>

      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          dragActive 
            ? "border-primary bg-accent/50 shadow-glow" 
            : "border-border hover:border-primary/50",
          selectedFile && "border-success bg-success/5",
          error && "border-destructive bg-destructive/5"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".vtt"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <div className="text-center">
          {selectedFile ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <div>
                <p className="font-medium text-success">File Selected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <p className="font-medium text-destructive">Upload Error</p>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-primary mx-auto" />
              <div>
                <p className="font-medium text-foreground">
                  Drop your .vtt file here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum file size: 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedFile && !isProcessing && (
        <div className="mt-6 text-center">
          <Button 
            variant="upload" 
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          >
            <FileText className="h-4 w-4" />
            Choose Different File
          </Button>
        </div>
      )}
    </Card>
  );
};