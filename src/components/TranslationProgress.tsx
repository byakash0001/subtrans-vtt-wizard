import React from 'react';
import { Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface TranslationProgressProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  currentBatch?: number;
  totalBatches?: number;
  error?: string;
  onDownload?: () => void;
  onReset?: () => void;
}

export const TranslationProgress: React.FC<TranslationProgressProps> = ({
  status,
  progress,
  currentBatch,
  totalBatches,
  error,
  onDownload,
  onReset
}) => {
  if (status === 'idle') return null;

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 animate-slide-up">
      <div className="text-center">
        {status === 'processing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <h3 className="text-lg font-semibold text-foreground">
                Translating Subtitles...
              </h3>
            </div>
            
            <div className="space-y-2">
              <Progress value={progress} className="w-full h-3" />
              <p className="text-sm text-muted-foreground">
                {currentBatch && totalBatches 
                  ? `Processing batch ${currentBatch} of ${totalBatches}` 
                  : `${Math.round(progress)}% complete`
                }
              </p>
            </div>

            <div className="bg-accent/20 rounded-lg p-4 text-sm text-muted-foreground">
              <p>✨ Using AI to provide accurate, context-aware translations</p>
              <p className="mt-1">🔄 Processing in batches to ensure quality</p>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-8 w-8 text-success" />
              <h3 className="text-xl font-semibold text-success">
                Translation Complete!
              </h3>
            </div>
            
            <p className="text-muted-foreground">
              Your subtitles have been successfully translated and are ready for download.
            </p>

            <div className="flex gap-3 justify-center">
              <Button variant="success" size="lg" onClick={onDownload}>
                <Download className="h-5 w-5" />
                Download Translated File
              </Button>
              <Button variant="outline" onClick={onReset}>
                Translate Another File
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h3 className="text-xl font-semibold text-destructive">
                Translation Failed
              </h3>
            </div>
            
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-medium mb-2">Error Details:</p>
              <p className="text-sm text-destructive/80">
                {error || 'An unexpected error occurred during translation.'}
              </p>
            </div>

            <Button variant="outline" onClick={onReset}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};