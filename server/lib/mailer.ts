import 'dotenv/config';
import * as nodemailer from 'nodemailer';
import logger from './logger';

//configured email sender used across the app
const transporter = nodemailer.createTransport({
    service : "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

interface EmailOptions{
    to: string;
    subject: string;
    html: string;
    replyTo?: string;

}

//generic send function
async function sendEmail({to, subject, html, replyTo} : EmailOptions): Promise<void> {

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
            replyTo,

        });
    } catch(err){
        logger.error("[mailer.sendEmail]", err);
        throw err;
    }
}
export { sendEmail };

