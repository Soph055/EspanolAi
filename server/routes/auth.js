const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/authMiddleware');
const { rateLimit } = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minute window
    limit: 10, //max 10 requests per IP
    standardHeaders: 'draft-8', //adds rate limit info to reponse headers
    legacyHeaders: false,
});

//register 
router.post('/register', authLimiter, authController.register);
//verify email (to potentially be done much much later...)

//verify email
router.get('/verify/:token', authController.verifyEmail);

//login 
router.post('/login', authLimiter, authController.login);

// User submits email to request a reset link
router.post("/reset-password", authLimiter, authController.requestPasswordReset);

// User submits new password using the token from email
router.post("/reset-password/:token", authLimiter, authController.resetPassword);

//logout
router.post('/logout', authController.logout);

module.exports = router; 