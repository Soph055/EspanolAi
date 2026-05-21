const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const requireAuth = require('./middleware/authMiddleware');

//register (needs limiter)
router.post('/register', authController.register);
//verify email (to potentially be done much much later...)

//login (needs limiter)
router.post('/login', authController.login);

//logout
router.post('/logout', authController.logout);

module.exports = router; 