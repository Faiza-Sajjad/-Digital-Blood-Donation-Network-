const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP, sendOTP } = require("../utils/emailService");

// OTP temporary store — Key: email, Value: { otp, fullName, expiresAt }
const otpStore = new Map();

// --- STEP 1: SEND OTP ---
exports.sendOTP = async (req, res) => {
    try {
        const { email, fullName } = req.body;
        if (!email || !fullName) {
            return res.status(400).json({ success: false, message: "Email aur naam required hain" });
        }
        const lowerEmail = email.toLowerCase().trim();

        const existing = await User.findOne({ email: lowerEmail });
        if (existing) {
            return res.status(400).json({ success: false, message: "Yeh email pehle se registered hai" });
        }

        const otp = generateOTP();
        otpStore.set(lowerEmail, { otp, fullName, expiresAt: Date.now() + 10 * 60 * 1000 });

        await sendOTP(lowerEmail, otp, fullName);

        res.status(200).json({ success: true, message: `OTP bhej diya gaya ${email} pe. 10 minute mein enter karein.` });
    } catch (error) {
        console.error("OTP Error:", error);
        res.status(500).json({ success: false, message: "Email bhejne mein masla hua: " + error.message });
    }
};

// --- STEP 2: VERIFY OTP + REGISTER ---
exports.register = async (req, res) => {
    try {
        const { email, otp, password, role, phone, dateOfBirth, lastDonationDate, fullName } = req.body;
        const lowerEmail = email.toLowerCase().trim();

        // Admin ke liye OTP nahi — seedha register
        if (role === 'admin') {
            return res.status(403).json({ success: false, message: "Admin alag route se banta hai" });
        }

        const stored = otpStore.get(lowerEmail);
        if (!stored) return res.status(400).json({ success: false, message: "OTP nahi mila. Pehle OTP mangwayein." });
        if (Date.now() > stored.expiresAt) {
            otpStore.delete(lowerEmail);
            return res.status(400).json({ success: false, message: "OTP expire ho gaya. Dobara bhejwayein." });
        }
        if (stored.otp !== otp.toString().trim()) {
            return res.status(400).json({ success: false, message: "OTP galat hai. Dobara check karein." });
        }
        if (!phone) return res.status(400).json({ success: false, message: "Phone number required hai" });

        // Donor age check
        if (role === 'donor' && dateOfBirth) {
            const dob = new Date(dateOfBirth);
            let age = new Date().getFullYear() - dob.getFullYear();
            const m = new Date().getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && new Date().getDate() < dob.getDate())) age--;
            if (age < 18 || age > 65) {
                return res.status(400).json({ success: false, message: "Donor ki umar 18 se 65 ke darmiyan honi chahiye" });
            }
        }

        // 56-day gap check
        if (role === 'donor' && lastDonationDate) {
            const days = Math.floor((new Date() - new Date(lastDonationDate)) / 86400000);
            if (days < 56) {
                return res.status(400).json({ success: false, message: `Aakhri donation ke baad ${56 - days} din aur chahiye` });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: stored.fullName,
            email: lowerEmail,
            password: hashedPassword,
            role: role || 'seeker',
            phone: phone.replace(/\D/g, ''),
            dateOfBirth: dateOfBirth || null,
            lastDonationDate: lastDonationDate || null,
            isVerified: true,
        });
        await newUser.save();
        otpStore.delete(lowerEmail);

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET || "secret_key",
            { expiresIn: '1d' }
        );

        res.status(201).json({
            success: true,
            message: `Welcome ${newUser.name}! Account verified aur ban gaya.`,
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

// --- LOGIN ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const lowerEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: lowerEmail });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid Email or Password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid Email or Password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret_key",
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: `Welcome back ${user.name}`,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

// --- ADMIN MANAGEMENT ---
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: admins || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching admins" });
    }
};

exports.createNewAdmin = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const lowerEmail = email.toLowerCase().trim();
        const emailExists = await User.findOne({ email: lowerEmail });
        if (emailExists) return res.status(400).json({ success: false, message: "Email already exists" });
        if (!phone) return res.status(400).json({ success: false, message: "Phone number required hai" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new User({
            name, email: lowerEmail, password: hashedPassword,
            phone: phone.replace(/\D/g, ''), role: 'admin', isVerified: true
        });
        await newAdmin.save();
        res.status(201).json({ success: true, message: "Admin create ho gaya!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Admin remove ho gaya!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};

exports.makeAdmin = async (req, res) => { res.json({ msg: "Make admin route working" }); };