const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (toEmail, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"AvelarAI" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your AvelarAI account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #7c3aed;">Welcome to AvelarAI</h2>
        <p>Thanks for signing up. Click the button below to verify your email address.</p>
        <a href="${verificationUrl}"
           style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;
                  border-radius:6px;text-decoration:none;font-weight:600;">
          Verify Email
        </a>
        <p style="margin-top:16px;font-size:13px;color:#666;">
          This link expires in 24 hours. If you didn't sign up, ignore this email.
        </p>
      </div>
    `,
  });
};

module.exports = sendVerificationEmail;