"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPasswordReset = exports.requestResetPassword = exports.logout = exports.getMe = exports.login = exports.verifyEmail = exports.register = void 0;
const db_1 = __importDefault(require("../db/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const logger_1 = __importDefault(require("../lib/logger"));
const mailer_1 = require("../lib/mailer");
// Registration input schema - enforces strong password and proper name/email format
const registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().trim().min(1, "First name is required"),
    lastName: zod_1.z.string().trim().min(1, "Last name is required"),
    email: zod_1.z.email("Invalid email format").trim().toLowerCase(),
    password: zod_1.z.string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password too long")
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/\d/, "Password must contain a digit")
        .regex(/[!@#$%^&*]/, "Password must contain a special symbol"),
});
// Derived schemas - pick just the fields we need for these endpoints (DRY)
const emailSchema = registerSchema.pick({ email: true });
const resetPasswordSchema = registerSchema.pick({ password: true });
// Fail fast on startup if JWT_SECRET is missing - safer than crashing on first login
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
}
// -------- Register --------
// Creates a new user account. Password is hashed with bcrypt (12 rounds),
// a verification token is generated, and a verification email is sent.
// The user can't log in until they verify via the emailed link.
const register = async (req, res) => {
    // Validate input - returns 400 with the first Zod error message if anything's invalid
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }
    const { firstName, lastName, email, password } = result.data;
    try {
        // Hash password with bcrypt - never store plaintext passwords
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        // Generate a random verification token - 32 random bytes hex-encoded
        const verifyToken = crypto_1.default.randomBytes(32).toString("hex");
        // Insert new user (not yet verified, will be set true after they click the email link)
        await db_1.default.query("INSERT INTO users (first_name, last_name, email, password, verify_token) VALUES ($1, $2, $3, $4, $5)", [firstName, lastName, email, hashedPassword, verifyToken]);
        // Build verification URL and send email (fire-and-forget - don't block response on email send)
        const verifyURL = `${process.env.FRONTEND_URL}/verify/${verifyToken}`;
        (0, mailer_1.sendEmail)({
            to: email,
            subject: "Verify your EspañolAI account",
            html: `<p>Hi ${firstName},</p>
                   <p>Welcome to EspañolAI! Please verify your email by clicking the link below:</p>
                   <a href="${verifyURL}">${verifyURL}</a>`,
        }).catch(err => logger_1.default.error("[register sendEmail]", err));
        logger_1.default.info(`User registered: ${email}`);
        return res.status(201).json({ message: "User registered. Please verify your email." });
    }
    catch (err) {
        // Handle duplicate email (Postgres unique constraint violation = error code 23505)
        const pgErr = err;
        if (pgErr.code === '23505') {
            return res.status(409).json({ message: "Email already registered" });
        }
        logger_1.default.error("[authController.register]", err);
        return res.status(500).json({ message: "Error creating user" });
    }
};
exports.register = register;
// -------- Verify Email --------
// Marks a user as verified using the token from the verification email.
// Token is single-use - cleared on successful verification.
const verifyEmail = async (req, res) => {
    const token = req.params.token;
    try {
        // Mark user verified AND clear the token in one query - prevents token reuse
        const result = await db_1.default.query("UPDATE users SET is_verified = TRUE, verify_token = NULL WHERE verify_token = $1", [token]);
        // If no row matched, the token was invalid or already used
        if (result.rowCount === 0) {
            return res.status(400).json({ message: "Invalid or expired verification link" });
        }
        return res.status(200).json({ message: "Email verified. You can now log in." });
    }
    catch (err) {
        logger_1.default.error("[authController.verifyEmail]", err);
        return res.status(500).json({ message: "Verification failed" });
    }
};
exports.verifyEmail = verifyEmail;
// -------- Login --------
// Validates credentials and issues a JWT in an httpOnly cookie.
// Uses generic "Invalid credentials" for all auth failures to prevent email enumeration.
const login = async (req, res) => {
    // Validate email shape only - password is checked separately to avoid leaking which field failed
    const parsed = emailSchema.safeParse({ email: req.body.email });
    if (!parsed.success) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const { email } = parsed.data;
    const { password } = req.body;
    // Extra check in case frontend validation is bypassed
    if (!password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    try {
        // Look up user by email
        const result = await db_1.default.query("SELECT id, password, is_verified FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        // Same generic message whether user doesn't exist or password is wrong
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Verify password against stored hash with bcrypt
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Require verified email - 403 here is different from 401 because credentials WERE valid
        if (!user.is_verified) {
            return res.status(403).json({ message: "Please verify your email before logging in" });
        }
        // Sign a 1-hour JWT with the user's id and email
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: email }, JWT_SECRET, { expiresIn: "7d" });
        const isProduction = process.env.NODE_ENV === "production";
        // Set the JWT as an httpOnly cookie so JavaScript can't access it (XSS protection)
        // sameSite: strict prevents CSRF, secure: production-only HTTPS requirement
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction, // HTTPS only in prod
            sameSite: isProduction ? "none" : "strict", // cross-site in prod, strict locally
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        logger_1.default.info(`User logged in: ${email}`);
        return res.status(200).json({ message: "Logged in successfully" });
    }
    catch (err) {
        logger_1.default.error("[authController.login]", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.login = login;
// -------- Get Current User --------
// Returns basic info about the logged-in user based on their JWT cookie.
// The requireAuth middleware verifies the token; if invalid, it returns 401
// before this handler even runs.
const getMe = async (req, res) => {
    const userId = req.user?.id;
    try {
        const result = await db_1.default.query("SELECT id, first_name, last_name, email FROM users WHERE id = $1", [userId]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
        });
    }
    catch (err) {
        logger_1.default.error("[authController.getMe]", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getMe = getMe;
// -------- Logout --------
// Clears the auth cookie. No DB operation needed since JWTs are stateless.
const logout = async (req, res) => {
    // Must use the same cookie options as when setting it, otherwise browser won't clear
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.status(200).json({ message: "Logged out" });
};
exports.logout = logout;
// -------- Request Password Reset --------
// Generates a reset token and emails it to the user (if the email exists in our system).
// Returns the same response whether the email exists or not - prevents email enumeration.
const requestResetPassword = async (req, res) => {
    const result = emailSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }
    const { email } = result.data;
    try {
        // Generate a random reset token with a 1-hour expiry
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        // Attach reset token to user IF the email exists (silently does nothing if not)
        const data = await db_1.default.query("UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3", [resetToken, resetTokenExpiry, email]);
        // Only send the email if we actually matched a user
        // (truthy check handles the null case TypeScript warns about for rowCount)
        if (data.rowCount && data.rowCount > 0) {
            const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            (0, mailer_1.sendEmail)({
                to: email,
                subject: "Reset your EspañolAI password",
                html: `<p>You requested a password reset for your EspañolAI account.</p>
                       <p>Click the link below to set a new password. This link expires in 1 hour.</p>
                       <a href="${resetURL}">${resetURL}</a>
                       <p>If you didn't request this, you can safely ignore this email.</p>`,
            }).catch(err => logger_1.default.error("[requestResetPassword sendEmail]", err));
            logger_1.default.info(`Password reset requested for: ${email}`);
        }
        // Same response regardless of whether the email exists - prevents leaking which emails are registered
        return res.status(200).json({
            message: "If an account with that email exists, a reset link has been sent"
        });
    }
    catch (err) {
        logger_1.default.error("[authController.requestResetPassword]", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.requestResetPassword = requestResetPassword;
// -------- Confirm Password Reset --------
// Validates the reset token and updates the user's password.
// Token is single-use and expires after 1 hour.
const confirmPasswordReset = async (req, res) => {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }
    const { password } = result.data;
    const token = req.params.token;
    try {
        // Look up user by reset token
        const data = await db_1.default.query(`SELECT id, reset_token_expiry FROM users WHERE reset_token = $1`, [token]);
        const user = data.rows[0];
        // Same message for "no token match" and "expired token" to keep things vague
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset link" });
        }
        // Check expiry - tokens are valid for 1 hour after request
        if (new Date() > new Date(user.reset_token_expiry)) {
            return res.status(400).json({ message: "Invalid or expired reset link" });
        }
        // Hash the new password
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        // Update password AND clear the reset token in one query so it can't be reused
        await db_1.default.query("UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2", [hashedPassword, user.id]);
        logger_1.default.info(`Password reset completed for user id: ${user.id}`);
        return res.status(200).json({ message: "Password reset successful. You can now log in." });
    }
    catch (err) {
        logger_1.default.error("[authController.confirmPasswordReset]", err);
        return res.status(500).json({ message: "Failed to reset password" });
    }
};
exports.confirmPasswordReset = confirmPasswordReset;
//# sourceMappingURL=authController.js.map