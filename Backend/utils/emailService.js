const nodemailer = require("nodemailer");

// 6 digit OTP generate karna
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email, otp, userName) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rimsharanii211@gmail.com',
                pass: 'jwkrrthqomqobrlx'
            }
        });

        const mailOptions = {
            from: '"RedLife Admin" <rimsharanii211@gmail.com>',
            to: email,
            subject: "Verify Your Account - RedLife",
            html: `
                <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #e63946;">RedLife Verification</h2>
                    <p>Assalam-o-Alaikum <strong>${userName}</strong>,</p>
                    <p>Account verify karne ke liye niche diya gaya OTP code enter karein:</p>
                    <h1 style="background: #f8f9fa; padding: 15px; text-align: center; color: #333; letter-spacing: 5px;">${otp}</h1>
                    <p style="color: #777;">Ye code sirf 10 minutes tak valid hai.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ OTP Email successfully sent to:", email);
    } catch (error) {
        console.log("❌ Email sending failed. Error details:", error);
    }
};

module.exports = { generateOTP, sendOTP };