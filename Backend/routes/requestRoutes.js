const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// POST /api/requests/create
router.post("/create", protect, async (req, res) => {
    try {
        const newRequest = new Request({
            ...req.body,
            seekerId: req.user.id
        });
        await newRequest.save();

        // HIGH urgency pe notification bhejo
        if (req.body.urgency === "High") {
            const io = req.app.get("io");
            const onlineUsers = req.app.get("onlineUsers");

            // Matching blood group donors dhundo
            const matchingDonors = await User.find({
                role: "donor",
                availability: true,
                bloodGroup: req.body.bloodGroup
            }).select("_id name");

            // Admins dhundo
            const admins = await User.find({ role: "admin" }).select("_id");

            const notification = {
                type: "URGENT_REQUEST",
                message: `🚨 URGENT! ${req.body.bloodGroup} blood needed at ${req.body.hospital}`,
                patientName: req.body.patientName,
                bloodGroup: req.body.bloodGroup,
                hospital: req.body.hospital,
                phone: req.body.phone,
                requestId: newRequest._id,
                timestamp: new Date()
            };

            // Har matching donor ko notify karo
            matchingDonors.forEach(donor => {
                const socketId = onlineUsers.get(donor._id.toString());
                if (socketId) {
                    io.to(socketId).emit("urgent_notification", notification);
                    console.log(`✅ Notified donor: ${donor.name}`);
                }
            });

            // Har admin ko notify karo
            admins.forEach(admin => {
                const socketId = onlineUsers.get(admin._id.toString());
                if (socketId) {
                    io.to(socketId).emit("urgent_notification", {
                        ...notification,
                        message: `🚨 ADMIN ALERT: ${req.body.bloodGroup} blood urgently needed!`
                    });
                }
            });
        }

        res.status(201).json({ success: true, message: "Request posted successfully", data: newRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/requests/all — pending requests
router.get("/all", async (req, res) => {
    try {
        const requests = await Request.find({ status: "Pending" }).sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
