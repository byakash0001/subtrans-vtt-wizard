import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelect: (englishFile: File | null, koreanFile: File | null) => void;
  englishFile: File | null;
  koreanFile: File | null;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelect,
  englishFile,
  koreanFile,
  isProcessing
}) => {
  const [dragActiveEn, setDragActiveEn] = useState(false);
  const [dragActiveKo, setDragActiveKo] = useState(false);
  const [errorEn, setErrorEn] = useState<string | null>(null);
  const [errorKo, setErrorKo] = useState<string | null>(null);

  const createDragHandlers = (type: 'english' | 'korean') => ({
    handleDrag: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        type === 'english' ? setDragActiveEn(true) : setDragActiveKo(true);
      } else if (e.type === "dragleave") {
        type === 'english' ? setDragActiveEn(false) : setDragActiveKo(false);
      }
    },
    handleDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      type === 'english' ? setDragActiveEn(false) : setDragActiveKo(false);
      type === 'english' ? setErrorEn(null) : setErrorKo(null);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        validateAndSelectFile(file, type);
      }
    }
  });

  const englishHandlers = createDragHandlers('english');
  const koreanHandlers = createDragHandlers('korean');

  const handleFileChange = (type: 'english' | 'korean') => (e: React.ChangeEvent<HTMLInputElement>) => {
    type === 'english' ? setErrorEn(null) : setErrorKo(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSelectFile(file, type);
    }
  };

  const validateAndSelectFile = (file: File, type: 'english' | 'korean') => {
    if (!file.name.endsWith('.vtt')) {
      const error = 'Please select a .vtt subtitle file';
      type === 'english' ? setErrorEn(error) : setErrorKo(error);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      const error = 'File size must be less than 10MB';
      type === 'english' ? setErrorEn(error) : setErrorKo(error);
      return;
    }

    if (type === 'english') {
      onFilesSelect(file, koreanFile);
    } else {
      onFilesSelect(englishFile, file);
    }
  };

  const renderFileUpload = (type: 'english' | 'korean', file: File | null, error: string | null, dragActive: boolean, handlers: any) => (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 transition-all duration-300",
        dragActive 
          ? "border-primary bg-accent/50 shadow-glow" 
          : "border-border hover:border-primary/50",
        file && "border-success bg-success/5",
        error && "border-destructive bg-destructive/5"
      )}
      onDragEnter={handlers.handleDrag}
      onDragLeave={handlers.handleDrag}
      onDragOver={handlers.handleDrag}
      onDrop={handlers.handleDrop}
    >
      <input
        type="file"
        accept=".vtt"
        onChange={handleFileChange(type)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
        id={`file-${type}`}
      />

      <div className="text-center">
        {file ? (
          <div className="space-y-3">
            <CheckCircle className="h-8 w-8 text-success mx-auto" />
            <div>
              <p className="font-medium text-success text-sm">File Selected</p>
              <p className="text-xs text-muted-foreground mt-1">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <div>
              <p className="font-medium text-destructive text-sm">Upload Error</p>
              <p className="text-xs text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="h-8 w-8 text-primary mx-auto" />
            <div>
              <p className="font-medium text-foreground text-sm">
                Drop {type} .vtt file here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Upload Subtitle Files
        </h2>
        <p className="text-muted-foreground">
          Upload separate English and Korean .vtt files for better translation context
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 text-center">
            English Subtitles
          </h3>
          {renderFileUpload('english', englishFile, errorEn, dragActiveEn, englishHandlers)}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 text-center">
            Korean Subtitles
          </h3>
          {renderFileUpload('korean', koreanFile, errorKo, dragActiveKo, koreanHandlers)}
        </div>
      </div>

      {(englishFile || koreanFile) && !isProcessing && (
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4">
            {englishFile && (
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-english')?.click()}
              >
                <FileText className="h-4 w-4" />
                Change English File
              </Button>
            )}
            {koreanFile && (
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-korean')?.click()}
              >
                <FileText className="h-4 w-4" />
                Change Korean File
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};