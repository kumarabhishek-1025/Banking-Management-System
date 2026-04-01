const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Horizon Bank" <${process.env.EMAIL_USER || "horizonbank.noreply@gmail.com"}>`,
      to: email,
      subject: "🔐 Your Horizon Bank Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Horizon Bank</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Password Reset OTP</h2>
            <p style="color: #666;">Your One-Time Password (OTP) for resetting your Horizon Bank password is:</p>
            <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; border: 2px dashed #667eea; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 14px;">This OTP is valid for <strong>15 minutes</strong> only.</p>
            <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Horizon Bank. All rights reserved.</p>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    return false;
  }
};

const sendVerificationEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Horizon Bank" <${process.env.EMAIL_USER || "horizonbank.noreply@gmail.com"}>`,
      to: email,
      subject: "🔐 Verify Your Horizon Bank Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Horizon Bank</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Verify Your Email</h2>
            <p style="color: #666;">Thank you for registering with Horizon Bank. Your One-Time Password (OTP) for email verification is:</p>
            <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; border: 2px dashed #667eea; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 14px;">This OTP is valid for <strong>15 minutes</strong> only.</p>
            <p style="color: #999; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Horizon Bank. All rights reserved.</p>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("Verification email sending failed:", error.message);
    return false;
  }
};

module.exports = { sendOTPEmail, sendVerificationEmail };
