# Subtitle Translator Backend

Professional AI-powered subtitle translation service using OpenAI GPT-4.

## Features

- 🎯 **Dual-language VTT support** - Processes English + Reference language files
- 🤖 **OpenAI GPT-4 translation** - Context-aware, professional translations
- 📦 **Batch processing** - Handles large files efficiently in 20-subtitle batches
- 🔄 **Auto-retry** - Built-in error handling and retry logic
- ⚡ **Fast processing** - Optimized for speed and quality
- 🌍 **Multi-language** - Supports 9 target languages

## Supported Languages

- German (de)
- Spanish (es) 
- French (fr)
- Japanese (ja)
- Chinese (zh)
- Korean (ko)
- Portuguese (pt)
- Russian (ru)
- Italian (it)

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### POST /api/translate

Translate a dual-language VTT file.

**Parameters:**
- `file` (form-data): The .vtt file to translate
- `targetLanguage` (form-data): Target language code (de, es, fr, ja, zh, ko, pt, ru, it)

**Response:**
- Success: Translated .vtt file download
- Error: JSON with error details

**Example:**
```bash
curl -X POST \
  http://localhost:3001/api/translate \
  -F "file=@subtitles.vtt" \
  -F "targetLanguage=de"
```

### GET /health

Health check endpoint.

## File Format

### Input VTT Format:
```
WEBVTT

1
00:00:05.885 --> 00:00:06.965
You could say that
이렇게 말할 수 있겠네요

2
00:00:07.485 --> 00:00:10.885
I grew up in a working-class family
저는 노동자 계층에서 자랐어요
```

### Output VTT Format:
```
WEBVTT

1
00:00:05.885 --> 00:00:06.965
Man könnte es so sagen

2
00:00:07.485 --> 00:00:10.885
Ich bin in einer Arbeiterfamilie aufgewachsen
```

## Architecture

- **Express.js** server with file upload handling
- **Multer** for multipart file processing
- **OpenAI API** for translation with custom prompts
- **Custom VTT parser** for subtitle processing
- **Batch processing** for efficient API usage
- **Error handling** with automatic retries

## Error Handling

- File validation (VTT format, size limits)
- API rate limiting with delays
- Automatic retry logic for failed translations
- Comprehensive error logging
- Graceful cleanup of temporary files

## Development

```bash
# Start in development mode with auto-reload
npm run dev

# Check logs
tail -f logs/app.log
```

## Production Deployment

1. Set NODE_ENV=production
2. Configure reverse proxy (nginx/Apache)
3. Set up process manager (PM2)
4. Configure SSL certificates
5. Set up monitoring and logging