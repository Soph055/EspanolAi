const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const requireAuth = require('./middleware/authMiddleware');
const { rateLimit } = require('express-rate-limit');

const authLimiter = ratelimit({
    windowMs: 15 * 60 * 1000, //15 minute window
    limit: 10, //max 10 requests per IP
    standardHeaders: 'draft-8', //adds rate limit info to reponse headers
    legacyHeaders: false,
});

//register 
router.post('/register', authLimiter, authController.register);
//verify email (to potentially be done much much later...)

//login 
router.post('/login', authLimiter, authController.login);

//reset password
router.post("/reset-password", authLimiter, authController.resetPassword);

//logout
router.post('/logout', authController.logout);

module.exports = router; 