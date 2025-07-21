const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { translateSubtitles } = require('./services/translationService');
const { parseVTT, formatVTT } = require('./utils/vttParser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/vtt' || file.originalname.endsWith('.vtt')) {
      cb(null, true);
    } else {
      cb(new Error('Only .vtt files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/translate', upload.fields([
  { name: 'englishFile', maxCount: 1 },
  { name: 'koreanFile', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.englishFile || !req.files.koreanFile) {
      return res.status(400).json({ error: 'Both English and Korean files are required' });
    }

    if (!req.body.targetLanguage) {
      return res.status(400).json({ error: 'Target language is required' });
    }

    const englishFilePath = req.files.englishFile[0].path;
    const koreanFilePath = req.files.koreanFile[0].path;
    const targetLanguage = req.body.targetLanguage;

    // Read and parse both VTT files
    const englishContent = fs.readFileSync(englishFilePath, 'utf8');
    const koreanContent = fs.readFileSync(koreanFilePath, 'utf8');
    
    const englishBlocks = parseVTT(englishContent);
    const koreanBlocks = parseVTT(koreanContent);

    if (!englishBlocks || englishBlocks.length === 0) {
      return res.status(400).json({ error: 'Invalid English VTT file format' });
    }

    if (!koreanBlocks || koreanBlocks.length === 0) {
      return res.status(400).json({ error: 'Invalid Korean VTT file format' });
    }

    // Merge English and Korean subtitles for dual-language context
    const mergedBlocks = mergeDualLanguageBlocks(englishBlocks, koreanBlocks);

    // Translate the subtitles
    const translatedBlocks = await translateSubtitles(mergedBlocks, targetLanguage, (progress) => {
      // TODO: Implement WebSocket for real-time progress updates
      console.log(`Translation progress: ${progress}%`);
    });

    // Format back to VTT
    const translatedVTT = formatVTT(translatedBlocks);

    // Clean up uploaded files
    fs.unlinkSync(englishFilePath);
    fs.unlinkSync(koreanFilePath);

    // Send translated file
    res.setHeader('Content-Type', 'text/vtt');
    res.setHeader('Content-Disposition', 'attachment; filename="translated-subtitles.vtt"');
    res.send(translatedVTT);

  } catch (error) {
    console.error('Translation error:', error);
    
    // Clean up uploaded files if they exist
    if (req.files) {
      if (req.files.englishFile && fs.existsSync(req.files.englishFile[0].path)) {
        fs.unlinkSync(req.files.englishFile[0].path);
      }
      if (req.files.koreanFile && fs.existsSync(req.files.koreanFile[0].path)) {
        fs.unlinkSync(req.files.koreanFile[0].path);
      }
    }

    res.status(500).json({ 
      error: 'Translation failed', 
      details: error.message 
    });
  }
});

// Helper function to merge English and Korean blocks
function mergeDualLanguageBlocks(englishBlocks, koreanBlocks) {
  const mergedBlocks = [];
  const maxLength = Math.max(englishBlocks.length, koreanBlocks.length);
  
  for (let i = 0; i < maxLength; i++) {
    const englishBlock = englishBlocks[i];
    const koreanBlock = koreanBlocks[i];
    
    if (englishBlock && koreanBlock) {
      // Use English timing as primary, combine text
      mergedBlocks.push({
        ...englishBlock,
        text: englishBlock.text,
        referenceText: koreanBlock.text
      });
    } else if (englishBlock) {
      // Only English available
      mergedBlocks.push({
        ...englishBlock,
        referenceText: ''
      });
    } else if (koreanBlock) {
      // Only Korean available, use as reference
      mergedBlocks.push({
        ...koreanBlock,
        text: '',
        referenceText: koreanBlock.text
      });
    }
  }
  
  return mergedBlocks;
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 10MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Subtitle Translator Backend running on port ${PORT}`);
  console.log(`📁 Upload endpoint: http://localhost:${PORT}/api/translate`);
  console.log(`💡 Make sure to set your OPENAI_API_KEY in .env file`);
});