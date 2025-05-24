import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();
// Configure transporter (adjust for your provider)
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD, // use App Password if 2FA is enabled
  },
});

/**
 * Send an email
 * @param {Object} params
 * @param {string|string[]} params.to - Recipient(s) email
 * @param {string} params.subject - Subject of the email
 * @param {string} [params.text] - Plain text body
 * @param {string} [params.html] - HTML body
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_NAME,
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
