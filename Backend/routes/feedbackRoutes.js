const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// POST /api/feedback  — FeedbackSection.jsx use karta hai
router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Saare fields required hain" });
        }

        const feedback = new Feedback({ name, email, message });
        await feedback.save();

        res.status(201).json({ success: true, message: "Feedback receive ho gaya. Shukriya!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error: " + err.message });
    }
});

module.exports = router;