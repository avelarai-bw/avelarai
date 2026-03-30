const { Router } = require('express');
const { exportPDF, exportWord } = require('../controllers/exportController');
const { protect } = require('../middlewares/auth');

const router = Router();

router.get('/:id/export/pdf', protect, exportPDF);
router.get('/:id/export/word', protect, exportWord);

module.exports = router;