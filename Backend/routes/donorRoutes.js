const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

// ─── GET LOGGED-IN DONOR PROFILE ─────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ─── UPDATE DONOR PROFILE ─────────────────────────────────────────────────────
router.put("/me", protect, async (req, res) => {
    try {
        const { bloodGroup, city, phone, availability, lastDonationDate } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.bloodGroup = bloodGroup || user.bloodGroup;
        user.city = city || user.city;
        user.phone = phone ? phone.replace(/\D/g, '') : user.phone;
        user.availability = availability ?? user.availability;
        user.lastDonationDate = lastDonationDate || user.lastDonationDate;

        await user.save();
        res.json({ success: true, message: "Donor profile update ho gaya", user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ─── GET ALL AVAILABLE DONORS ────────────────────────────────────────────────
router.get("/all", async (req, res) => {
    try {
        const donors = await User.find({ role: "donor", availability: true }).select("-password");
        res.json({ success: true, total: donors.length, donors });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ─── SEARCH DONORS (case-insensitive fix) ────────────────────────────────────
// BloodSeekerDashboard: /api/donor/search?bloodGroup=A+&city=Lahore
router.get("/search", async (req, res) => {
    try {
        const { city, bloodGroup } = req.query;

        const query = { role: "donor", availability: true };

        // City: case-insensitive partial match (Lahore, lahore, LAHORE sab match hoga)
        if (city && city.trim()) {
            query.city = { $regex: city.trim(), $options: 'i' };
        }

        // BloodGroup: exact match (A+, B- etc.)
        if (bloodGroup && bloodGroup.trim()) {
            query.bloodGroup = bloodGroup.trim();
        }

        const donors = await User.find(query).select("-password");
        res.json({ success: true, total: donors.length, donors });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ─── GET DONOR BY ID ─────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const donor = await User.findOne({ _id: req.params.id, role: "donor" }).select("-password");
        if (!donor) return res.status(404).json({ success: false, message: "Donor not found" });
        res.json({ success: true, donor });
    } catch (error) {
        res.status(500).json({ success: false, message: "Invalid ID or server error" });
    }
});

module.exports = router;