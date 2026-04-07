const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Missing email configuration (EMAIL_USER or EMAIL_PASS) in environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOtpEmail = async (email, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Weave Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your email - Weave',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4F46E5; text-align: center;">Welcome to Weave!</h2>
        <p style="font-size: 16px; color: #475569; text-align: center;">
          To complete your registration and start exploring internship opportunities, please verify your email address.
        </p>
        <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 10px;">Your Verification Code</p>
          <h1 style="font-size: 48px; font-weight: 800; color: #1e293b; margin: 0; letter-spacing: 0.25em;">${otp}</h1>
        </div>
        <p style="font-size: 14px; color: #94a3b8; text-align: center;">
          This code will expire in 10 minutes. If you did not request this email, please ignore it.
        </p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
        <p style="font-size: 12px; color: #cbd5e1; text-align: center;">
          &copy; 2026 Weave Platform. All rights reserved.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
