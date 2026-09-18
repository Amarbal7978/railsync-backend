const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  family: 4,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "RailSync AI - Password Reset OTP",
    text: `Your RailSync AI password reset OTP is: ${otp}. This OTP is valid for 10 minutes.`,
  });
}

module.exports = { sendOtpEmail };