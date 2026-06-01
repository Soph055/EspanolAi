const db = require("../db/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const logger = require("../lib/logger");
const { z } = require("zod");
const { sendEmail } = require("../lib/mailer");

// Registration input schema
const registerSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.email("Invalid email format").trim().toLowerCase(),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password too long")
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/\d/, "Password must contain a digit")
        .regex(/[!@#$%^&*]/, "Password must contain a special symbol"),
});

const emailSchema = registerSchema.pick({ email: true });
const resetPasswordSchema = registerSchema.pick({ password: true });

// -------- Registration --------
exports.register = async (req, res) => {
    // Validate request body
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { firstName, lastName, email, password } = result.data;

    try {
        // Hash password and generate verification token
        const hashedPassword = await bcrypt.hash(password, 12);
        const verifyToken = crypto.randomBytes(32).toString("hex");

        // Insert new user
        await db.query(
            "INSERT INTO users (first_name, last_name, email, password, verify_token) VALUES ($1, $2, $3, $4, $5)",
            [firstName, lastName, email, hashedPassword, verifyToken]
        );

        // Build verification URL and send email
        const verifyURL = `${process.env.FRONTEND_URL}/verify/${verifyToken}`;

        sendEmail({
            to: email,
            subject: "Verify your EspañolAI account",
            html: `<p>Hi ${firstName},</p>
                   <p>Welcome to EspañolAI! Please verify your email by clicking the link below:</p>
                   <a href="${verifyURL}">${verifyURL}</a>`,
        }).catch(err => logger.error("[register sendEmail]", err));

        logger.info(`User registered: ${email}`);
        return res.status(201).json({ message: "User registered. Please verify your email." });

    } catch (err) {
        // Handle duplicate email
        if (err.code === '23505') {
            return res.status(409).json({ message: "Email already registered" });
        }
        logger.error("[authController.register]", err);
        return res.status(500).json({ message: "Error creating user" });
    }
};

// -------- Verify Email --------
exports.verifyEmail = async (req, res) => {
    const token = req.params.token;

    try {
        // Mark user verified and clear token
        const result = await db.query(
            "UPDATE users SET is_verified = TRUE, verify_token = NULL WHERE verify_token = $1",
            [token]
        );

        if (result.rowCount === 0) {
            return res.status(400).json({ message: "Invalid or expired verification link" });
        }

        return res.status(200).json({ message: "Email verified. You can now log in." });

    } catch (err) {
        logger.error("[authController.verifyEmail]", err);
        return res.status(500).json({ message: "Verification failed" });
    }
};

// -------- Login --------
exports.login = async (req, res) => {
    const result = emailSchema.safeParse({ email: req.body.email });

    if (!result.success) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const { email } = result.data;
    const { password } = req.body;

    try {
        // Look up user by email
        const result = await db.query(
            "SELECT id, password, is_verified FROM users WHERE email = $1",
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Verify password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Require verified email
        if (!user.is_verified) {
            return res.status(403).json({ message: "Please verify your email before logging in" });
        }

        // Issue JWT
        const token = jwt.sign(
            { id: user.id, email: email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Set authentication cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60,
        });

        logger.info(`User logged in: ${email}`);
        return res.status(200).json({ message: "Logged in successfully" });

    } catch (err) {
        logger.error("[authController.login]", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// -------- Logout --------
exports.logout = async (req, res) => {
    // Clear authentication cookie
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.status(200).json({ message: "Logged out" });
};


// -------- Request Password Reset --------
exports.requestResetPassword = async (req, res) => {
    // Validate input
    const result = emailSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { email } = result.data;

    try {
        // Generate token and 1-hour expiry
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

        // Attach reset token to user if email exists
        const data = await db.query(
            "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
            [resetToken, resetTokenExpiry, email]
        );

        // Only send email if a user was actually found
        if (data.rowCount > 0) {
            const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

            sendEmail({
                to: email,
                subject: "Reset your EspañolAI password",
                html: `<p>You requested a password reset for your EspañolAI account.</p>
                       <p>Click the link below to set a new password. This link expires in 1 hour.</p>
                       <a href="${resetURL}">${resetURL}</a>
                       <p>If you didn't request this, you can safely ignore this email.</p>`,
            }).catch(err => logger.error("[requestResetPassword sendEmail]", err));

            logger.info(`Password reset requested for: ${email}`);
        }

        // Same response regardless of whether email exists
        return res.status(200).json({
            message: "If an account with that email exists, a reset link has been sent"
        });

    } catch (err) {
        logger.error("[authController.requestResetPassword]", err);
        return res.status(500).json({ message: "Server error" });
    }
};
// -------- Confirm Password Reset --------

exports.confirmPasswordReset = async (req, res) => {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { password } = result.data;
    const token = req.params.token;

    try {
        const data = await db.query(
            `SELECT id, reset_token_expiry FROM users WHERE reset_token = $1`,
            [token]
        );

        const user = data.rows[0];

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset link" });

        }

        if (new Date() > new Date(user.reset_token_expiry)) {
            return res.status(400).json({ message: "Invalid or expired reset link" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await db.query(
            "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2",
            [hashedPassword, user.id]
        );
        logger.info(`Password reset completed for user id: ${user.id}`);
        return res.status(200).json({ message: "Password reset successful. You can now log in." });

    } catch (err) {
        logger.error("[authController.confirmPasswordReset]", err);
        return res.status(500).json({ message: "Failed to reset password" });

    }
};