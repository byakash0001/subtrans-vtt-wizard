import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
}

const languages = [
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  disabled = false
}) => {
  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Globe className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            Select Target Language
          </h2>
        </div>
        <p className="text-muted-foreground">
          Choose the language to translate your subtitles into
        </p>
      </div>

      <div className="relative">
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-full appearance-none bg-card border border-border rounded-lg px-4 py-3 text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-300",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "hover:border-primary/50 cursor-pointer"
          )}
        >
          <option value="">Choose a language...</option>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      </div>

      {selectedLanguage && (
        <div className="mt-4 p-3 bg-accent/30 rounded-lg border border-accent">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {languages.find(l => l.code === selectedLanguage)?.flag}
            </span>
            <span className="font-medium text-accent-foreground">
              Translating to: {languages.find(l => l.code === selectedLanguage)?.name}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};