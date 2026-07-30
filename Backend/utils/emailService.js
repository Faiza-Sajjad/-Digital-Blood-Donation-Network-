const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 6-digit random OTP generate
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP email send
async function sendOTP(email, otp, fullName) {
    const mailOptions = {
        from: `"Digital Blood Donation Network" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code - Blood Donation Network",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
                <h2 style="color: #ef4444;">Hi ${fullName},</h2>
                <p>Your OTP code for account verification is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ef4444; text-align: center; padding: 16px; background: #fff5f5; border-radius: 10px; margin: 16px 0;">
                    ${otp}
                </div>
                <p>This code will expire in <strong>10 minutes</strong>.</p>
                <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
}

module.exports = { generateOTP, sendOTP };
