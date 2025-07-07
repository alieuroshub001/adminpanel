import nodemailer from 'nodemailer';

// Email configuration from .env
const EMAIL_CONFIG = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME || 'ali.rayyan001@gmail.com',
    pass: process.env.EMAIL_PASSWORD || ''
  }
};

const ADMIN_EMAIL = process.env.EMAIL_FROM || 'ali.rayyan001@gmail.com';
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Create transporter
const transporter = nodemailer.createTransport({
  service: EMAIL_CONFIG.service,
  auth: {
    user: EMAIL_CONFIG.auth.user,
    pass: EMAIL_CONFIG.auth.pass
  }
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('Email connection error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Admin Panel" <${EMAIL_CONFIG.auth.user}>`,
      ...options
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendOTPEmail(otp: string): Promise<boolean> {
  const subject = 'Your Admin Panel Verification Code';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2c3e50;">Admin Panel Access</h2>
      <p>Here's your verification code:</p>
      <div style="background: #f8f9fa; padding: 15px; text-align: center; 
          border-radius: 5px; font-size: 24px; font-weight: bold; 
          margin: 20px 0; color: #2c3e50; border: 1px dashed #ddd;">
        ${otp}
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p style="font-size: 12px; color: #7f8c8d;">
        If you didn't request this code, please secure your account immediately.
      </p>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject,
    html
  });
}

export async function sendPasswordResetEmail(resetToken: string): Promise<boolean> {
  const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;
  const subject = 'Admin Panel Password Reset';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2c3e50;">Password Reset Request</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${resetLink}" 
         style="display: inline-block; padding: 12px 24px; background: #3498db; 
         color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;
         font-weight: bold;">
        Reset Password
      </a>
      <p>Or copy this link to your browser:</p>
      <p style="word-break: break-all; font-size: 14px; background: #f8f9fa; 
         padding: 10px; border-radius: 5px;">
        ${resetLink}
      </p>
      <p style="font-size: 12px; color: #7f8c8d;">
        This link expires in 1 hour. If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject,
    html
  });
}