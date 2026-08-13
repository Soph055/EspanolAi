import express from "express";
import * as authController from "../controllers/authController";
import requireAuth from "../middleware/authMiddleware";
import { rateLimit } from "express-rate-limit";

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minute window
    limit: 1000, //max 10 requests per IP
    standardHeaders: 'draft-8', //adds rate limit info to reponse headers
    legacyHeaders: false,
});

//register 
router.post('/register', authLimiter, authController.register);

//verify email
router.get('/verify/:token', authController.verifyEmail);

//login 
router.post('/login', authLimiter, authController.login);

// User submits email to request a reset link
router.post("/reset-password", authLimiter, authController.requestResetPassword);

// User submits new password using the token from email
router.post("/reset-password/:token", authLimiter, authController.confirmPasswordReset);

//logout
router.post('/logout', authController.logout);

//check if user is logged in on frontend
router.get('/me',requireAuth, authController.getMe);
export default router; 