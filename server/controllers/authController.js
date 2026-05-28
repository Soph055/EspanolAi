const db = require("../db/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const logger = require("../lib/logger");
const { z } = require("zod");
const { sendEmail } = require("../lib/mailer");

//validation rules for registration, checks all fields before we touch the db
const registerSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.email("Invalid email format").trim().toLowerCase(),
    password: z.string()
        .min(8, "Password must be atleast 8 charachters")
        .max(30, "Password too long")
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/\d/, "Password must contain a digit")
        .regex(/[!@#$%^&*]/, "Password must contain a special symbol"),
});

//--------Registration--------
exports.register = async (req, res) => {
    //run req body through zod, bail early if anything's invalid
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        //just send back the first error so we dont dump everything at once
        return res.status(400).json({ message: result.error.issues[0].message });
    }

    //result.data is the cleaned version (trimmed + lowercased)
    const { firstName, lastName, email, password } = result.data;

    try {
        //hash before storing, never store plain password. 12 = salt rounds
        const hashedPassword = await bcrypt.hash(password, 12);

   
        const verifyToken = crypto.randomBytes(32).toString("hex");


        await db.query(
            "INSERT INTO users (first_name, last_name, email, password, verify_token) VALUES ($1, $2, $3, $4, $5)",
            [firstName, lastName, email, hashedPassword, verifyToken]
        );

        //link points to frontend route, frontend grabs the token and calls verify endpoint
        const verifyURL = `${process.env.FRONTEND_URL}/verify/${verifyToken}`;


        sendEmail({
            to: email,
            subject: "Verify your EspañolAI account",
            html: `<p> Hi ${firstName},</p>
                    <p> Welcome to EspañolAI! Please verify your email by clicking the link below! </p>
                    <a href="${verifyURL}">${verifyURL}</a>`,
        }).catch(err => logger.error("[register sendEmail]", err));

        logger.info(`User registered: ${email}`);
        return res.status(201).json({ message: "User registered. Please verify your email" });

    } catch (err) {
        //23505 = postgres duplicate key, means email already exists (email is UNIQUE)
        if (err.code === '23505') {
            return res.status(409).json({ message: "Email already registered" });
        }
        //anything else is unexpected, log it for me to see but dont leak details to user
        logger.error("[authController.register]", err);
        return res.status(500).json({ message: "Error creating user" });
    }
}