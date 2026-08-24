"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController = __importStar(require("../controllers/authController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const express_rate_limit_1 = require("express-rate-limit");
const router = express_1.default.Router();
const authLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, //15 minute window
    limit: 50, //max 10 requests per IP
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
router.get('/me', authMiddleware_1.default, authController.getMe);
exports.default = router;
//# sourceMappingURL=auth.js.map