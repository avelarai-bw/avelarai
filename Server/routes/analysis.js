const { Router } = require('express');
const { uploadAndAnalyze, getAnalysis, getMyAnalyses } = require('../controllers/analysisController');
const { protect } = require('../middlewares/auth');

const router = Router();

router.post('/upload', protect, uploadAndAnalyze);
router.get('/my', protect, getMyAnalyses);
router.get('/:id', protect, getAnalysis);

module.exports = router;