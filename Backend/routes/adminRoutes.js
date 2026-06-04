const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Request = require("../models/Request");
const Feedback = require("../models/Feedback");
const { protect } = require("../middleware/authMiddleware");

// ─── STATS (AdminDashboard overview tab) ─────────────────────────────────────
router.get("/stats", protect, async (req, res) => {
    try {
        const [donors, seekers, requests, messages] = await Promise.all([
            User.countDocuments({ role: 'donor' }),
            User.countDocuments({ role: 'seeker' }),
            Request.countDocuments(),
            Feedback.countDocuments()
        ]);
        res.json({ success: true, donors, seekers, requests, messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── GET ALL DONORS ───────────────────────────────────────────────────────────
router.get("/donors", protect, async (req, res) => {
    try {
        const donors = await User.find({ role: 'donor' }).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: donors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── DELETE DONOR ─────────────────────────────────────────────────────────────
router.delete("/donors/:id", protect, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Donor delete ho gaya" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── GET ALL SEEKERS ──────────────────────────────────────────────────────────
router.get("/seekers", protect, async (req, res) => {
    try {
        const seekers = await User.find({ role: 'seeker' }).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: seekers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── DELETE SEEKER ────────────────────────────────────────────────────────────
router.delete("/seekers/:id", protect, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Seeker delete ho gaya" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── GET ALL REQUESTS ─────────────────────────────────────────────────────────
router.get("/all-requests", protect, async (req, res) => {
    try {
        const requests = await Request.find().sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── DELETE REQUEST ───────────────────────────────────────────────────────────
router.delete("/requests/:id", protect, async (req, res) => {
    try {
        await Request.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Request delete ho gayi" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── GET ALL FEEDBACKS ────────────────────────────────────────────────────────
router.get("/feedbacks", protect, async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json({ success: true, data: feedbacks });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── DELETE FEEDBACK ──────────────────────────────────────────────────────────
router.delete("/feedbacks/:id", protect, async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Feedback delete ho gayi" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;