import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { LanguageSelector } from './LanguageSelector';
import { TranslationProgress } from './TranslationProgress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Languages, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranslationState {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  currentBatch?: number;
  totalBatches?: number;
  error?: string;
  translatedFile?: string;
}

export const SubtitleTranslator: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [translationState, setTranslationState] = useState<TranslationState>({
    status: 'idle',
    progress: 0
  });
  const { toast } = useToast();

  const handleTranslation = async () => {
    if (!selectedFile || !selectedLanguage) {
      toast({
        title: "Missing Requirements",
        description: "Please select both a file and target language.",
        variant: "destructive"
      });
      return;
    }

    setTranslationState({
      status: 'processing',
      progress: 0,
      currentBatch: 1,
      totalBatches: 1
    });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('targetLanguage', selectedLanguage);

      // For demo purposes, we'll simulate the translation process
      // In production, replace this with actual backend call:
      
      // Simulate batch processing
      const simulatedBatches = Math.ceil(Math.random() * 5) + 2; // 3-7 batches
      setTranslationState(prev => ({ ...prev, totalBatches: simulatedBatches }));

      for (let i = 1; i <= simulatedBatches; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        setTranslationState(prev => ({
          ...prev,
          progress: (i / simulatedBatches) * 100,
          currentBatch: i
        }));
      }

      // Actual backend call (uncomment when backend is running):
      /*
      const response = await fetch('http://localhost:3001/api/translate', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }

      const blob = await response.blob();
      const translatedFile = new File([blob], 'translated-subtitles.vtt', { type: 'text/vtt' });
      */

      setTranslationState({
        status: 'completed',
        progress: 100,
        translatedFile: 'translated-subtitles.vtt'
      });

      toast({
        title: "Translation Complete!",
        description: "Your subtitles have been successfully translated.",
      });

    } catch (error) {
      setTranslationState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Translation failed'
      });

      toast({
        title: "Translation Failed",
        description: "An error occurred during translation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    // TODO: Implement actual file download
    const element = document.createElement('a');
    const file = new Blob(['Sample translated content'], { type: 'text/vtt' });
    element.href = URL.createObjectURL(file);
    element.download = 'translated-subtitles.vtt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Download Started",
      description: "Your translated subtitle file is downloading.",
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedLanguage('');
    setTranslationState({
      status: 'idle',
      progress: 0
    });
  };

  const isReadyToTranslate = selectedFile && selectedLanguage && translationState.status === 'idle';
  const isProcessing = translationState.status === 'processing';

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="pt-12 pb-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Languages className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Subtitle Translator
            </h1>
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional AI-powered subtitle translation preserving timing, context, and tone
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="space-y-8 max-w-4xl mx-auto">
          
          {/* File Upload */}
          <FileUpload
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
            isProcessing={isProcessing}
          />

          {/* Language Selection */}
          {selectedFile && (
            <div className="animate-slide-up">
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                disabled={isProcessing}
              />
            </div>
          )}

          {/* Translation Button */}
          {isReadyToTranslate && (
            <div className="text-center animate-slide-up">
              <Card className="inline-block p-6 bg-gradient-subtle shadow-elegant">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Ready to Translate
                  </div>
                  <Button 
                    variant="default" 
                    size="xl"
                    onClick={handleTranslation}
                    className="shadow-glow"
                  >
                    <Languages className="h-5 w-5" />
                    Start AI Translation
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Using advanced AI to preserve context and timing
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Translation Progress */}
          <TranslationProgress
            status={translationState.status}
            progress={translationState.progress}
            currentBatch={translationState.currentBatch}
            totalBatches={translationState.totalBatches}
            error={translationState.error}
            onDownload={handleDownload}
            onReset={handleReset}
          />

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-16 pt-8 pb-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Professional subtitle translation powered by OpenAI GPT-4</p>
          <p className="mt-1">Supports dual-language .vtt files • Preserves timing and structure</p>
        </div>
      </div>
    </div>
  );
};