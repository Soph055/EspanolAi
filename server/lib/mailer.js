require('dotenv').config();
const nodemailer = require("nodemailer");
const logger = require("./logger");


//configured email sender used across the app
const transporter = nodemailer.createTransport({
    service : "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

//generic send function
async function sendEmail({to, subject, html, replyTo}) {

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
module.exports = {sendEmail};
