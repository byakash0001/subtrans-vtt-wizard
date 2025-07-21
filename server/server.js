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

app.post('/api/translate', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.body.targetLanguage) {
      return res.status(400).json({ error: 'Target language is required' });
    }

    const filePath = req.file.path;
    const targetLanguage = req.body.targetLanguage;

    // Read and parse the VTT file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const subtitleBlocks = parseVTT(fileContent);

    if (!subtitleBlocks || subtitleBlocks.length === 0) {
      return res.status(400).json({ error: 'Invalid VTT file format' });
    }

    // Translate the subtitles
    const translatedBlocks = await translateSubtitles(subtitleBlocks, targetLanguage, (progress) => {
      // TODO: Implement WebSocket for real-time progress updates
      console.log(`Translation progress: ${progress}%`);
    });

    // Format back to VTT
    const translatedVTT = formatVTT(translatedBlocks);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Send translated file
    res.setHeader('Content-Type', 'text/vtt');
    res.setHeader('Content-Disposition', 'attachment; filename="translated-subtitles.vtt"');
    res.send(translatedVTT);

  } catch (error) {
    console.error('Translation error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Translation failed', 
      details: error.message 
    });
  }
});

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