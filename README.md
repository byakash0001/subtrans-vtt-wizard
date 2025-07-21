# 🌍 Subtitle Translator

Professional AI-powered subtitle translation application that converts dual-language .vtt files into high-quality translations while preserving timing, context, and tone.

## ✨ Features

- 🎯 **Dual-Language Processing** - Handles English + Reference language VTT files
- 🤖 **OpenAI GPT-4 Translation** - Context-aware, professional translations
- 📦 **Batch Processing** - Efficiently processes large files in 20-subtitle batches
- 🌍 **Multi-Language Support** - German, Spanish, French, Japanese, Chinese, Korean, Portuguese, Russian, Italian
- ⚡ **Real-time Progress** - Live translation progress with batch tracking
- 💎 **Professional UI** - Beautiful, responsive interface with smooth animations
- 🔄 **Error Handling** - Automatic retries and comprehensive error management
- 📥 **Easy Download** - One-click download of translated subtitle files

## 🏗️ Architecture

### Frontend (React + TypeScript)
- Modern React with hooks and TypeScript
- Tailwind CSS with custom design system
- Drag & drop file upload
- Real-time progress tracking
- Professional UI components

### Backend (Node.js + Express)
- Express.js server with file upload handling
- OpenAI GPT-4 API integration
- Custom VTT parser and formatter
- Batch processing for optimal performance
- Comprehensive error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- OpenAI API key

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=your_api_key_here

# Start the server
npm run dev
```

The backend will be available at `http://localhost:3001`

## 📝 Usage

1. **Upload File**: Drag & drop or select a dual-language .vtt file
2. **Select Language**: Choose your target translation language
3. **Start Translation**: Click "Start AI Translation" 
4. **Monitor Progress**: Watch real-time batch processing
5. **Download Result**: Download your translated .vtt file

## 📋 Input File Format

Your .vtt file should contain dual-language subtitles:

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

- First line: English subtitle
- Second line: Reference language (e.g., Korean, Spanish, etc.)

## 🌍 Supported Languages

| Language | Code | Flag |
|----------|------|------|
| German | de | 🇩🇪 |
| Spanish | es | 🇪🇸 |
| French | fr | 🇫🇷 |
| Japanese | ja | 🇯🇵 |
| Chinese | zh | 🇨🇳 |
| Korean | ko | 🇰🇷 |
| Portuguese | pt | 🇵🇹 |
| Russian | ru | 🇷🇺 |
| Italian | it | 🇮🇹 |

## 🔧 API Reference

### POST /api/translate

Translate a dual-language VTT file.

**Parameters:**
- `file` (form-data): The .vtt file to translate
- `targetLanguage` (form-data): Target language code

**Response:**
- Success: Translated .vtt file download
- Error: JSON with error details

## 🎨 Design System

The application features a professional design system with:

- **Color Palette**: Modern teal/blue primary colors
- **Typography**: Clean, readable fonts with proper hierarchy  
- **Animations**: Smooth transitions and hover effects
- **Components**: Reusable UI components with variants
- **Responsive**: Works beautifully on all device sizes

## 🛠️ Development

### Project Structure
```
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── pages/             # Page components
│   └── lib/               # Utilities
├── server/                # Backend Node.js app
│   ├── services/          # Business logic
│   ├── utils/             # Utilities
│   └── server.js          # Main server file
└── example-subtitles.vtt  # Sample file for testing
```

### Key Components
- `SubtitleTranslator` - Main application component
- `FileUpload` - Drag & drop file upload with validation
- `LanguageSelector` - Language selection dropdown
- `TranslationProgress` - Real-time progress tracking

### Backend Services
- `translationService` - OpenAI API integration
- `vttParser` - VTT file parsing and formatting
- File upload handling with Multer

## 🔒 Security & Best Practices

- File validation and size limits
- Secure API key handling
- Input sanitization
- Error handling and logging
- Temporary file cleanup

## 📈 Performance

- Batch processing for large files
- Rate limiting for API calls
- Efficient memory usage
- Optimized bundle size

## 🚀 Production Deployment

### Frontend
Deploy to Vercel, Netlify, or any static hosting service.

### Backend
Deploy to Heroku, Railway, or any Node.js hosting service.

**Environment Variables:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (production/development)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue on GitHub

---

**Built with ❤️ using React, TypeScript, Node.js, and OpenAI GPT-4**