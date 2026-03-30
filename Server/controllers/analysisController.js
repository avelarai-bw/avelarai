const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Analysis = require('../models/Analysis');
const { parseFile } = require('../services/fileParser');
const { analyzeData } = require('../services/aiService');

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('File type not supported'));
  }
}).single('file');

const uploadAndAnalyze = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Free tier limit — 5 analyses
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    if (user.tier === 'free' && user.uploadsUsed >= 5) {
      return res.status(403).json({ message: 'Free tier limit reached. Upgrade to continue.' });
    }

    // Create analysis record
    const analysis = await Analysis.create({
      userId: req.user.userId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      status: 'processing'
    });

    res.status(202).json({ message: 'Processing started', analysisId: analysis._id });

    // Process in background
    try {
      const parsed = await parseFile(req.file.path, req.file.mimetype);
      const result = await analyzeData(parsed.text, parsed.type, req.file.originalname);

      await Analysis.findByIdAndUpdate(analysis._id, {
        status: 'complete',
        rawData: parsed.text.slice(0, 5000),
        statistics: result.statistics,
        interpretation: result.interpretation,
        chartData: {
          summary: result.summary,
          keyInsights: result.keyInsights,
          chartSuggestions: result.chartSuggestions
        }
      });

      await User.findByIdAndUpdate(req.user.userId, { $inc: { uploadsUsed: 1 } });

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
    } catch (e) {
      await Analysis.findByIdAndUpdate(analysis._id, { status: 'failed' });
      console.error('Analysis failed:', e.message);
    }
  });
};

const getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.json(analysis);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select('fileName fileType status createdAt');
    res.json(analyses);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadAndAnalyze, getAnalysis, getMyAnalyses };