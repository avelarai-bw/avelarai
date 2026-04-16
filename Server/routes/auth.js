const { Router } =require('express');
const { register, login, getMe, verifyEmail, resendVerification  } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;