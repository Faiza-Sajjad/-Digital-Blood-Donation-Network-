const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const connectDB = require("./config/db");
connectDB();

const User = require("./models/User");
const Request = require("./models/Request");
const Feedback = require("./models/Feedback");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Socket.IO Setup ─────────────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Online users track — { userId: socketId }
const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // User ID register
    socket.on("register", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
        // Disconnect -> remove
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        console.log("❌ Socket disconnected:", socket.id);
    });
});

// Global io access
app.set("io", io);
app.set("onlineUsers", onlineUsers);

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes    = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");

app.use("/api/auth",     authRoutes);
app.use("/api/requests", requestRoutes);

// ─── DONOR SEARCH with Distance ──────────────────────────────────────────────
// /api/donor/search?bloodGroup=A+&city=Lahore&lat=31.5&lng=74.3
app.get("/api/donor/search", async (req, res) => {
    try {
        const { bloodGroup, city, lat, lng } = req.query;
        let query = { role: "donor", availability: true };

        if (bloodGroup && bloodGroup.trim() !== "" && bloodGroup !== "All Groups") {
            query.bloodGroup = bloodGroup.trim();
        }
        if (city && city.trim() !== "") {
            query.city = { $regex: city.trim().replace(/\s+/g, ' '), $options: "i" };
        }

        const donors = await User.find(query).select("-password").sort({ createdAt: -1 });

        // Distance calculate  seeker coordinates 
        let donorsWithDistance = donors.map(donor => {
            const d = donor.toObject();
            if (lat && lng && donor.location?.lat && donor.location?.lng) {
                d.distance = haversineDistance(
                    parseFloat(lat), parseFloat(lng),
                    donor.location.lat, donor.location.lng
                );
            } else {
                d.distance = null;
            }
            return d;
        });

        // Distance sort 
        if (lat && lng) {
            donorsWithDistance.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        }

        res.json({ success: true, donors: donorsWithDistance });
    } catch (error) {
        res.status(500).json({ success: false, message: "Search failed" });
    }
});

// Haversine formula — 2 coordinates-> km distance
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // 1 decimal place
}

// ─── Donor routes ─────────────────────────────────────────────────────────────
const donorRoutes = require("./routes/donorRoutes");
app.use("/api/donor", donorRoutes);

// ─── UPDATE PROFILE (lat/lng bhi) ──────────────────────────────────
app.put("/api/auth/update-profile/:id", async (req, res) => {
    try {
        const { name, phone, city, bloodGroup, dateOfBirth, lat, lng } = req.body;
        const updateData = { name, phone, city, bloodGroup, dateOfBirth };

        // Coordinates save 
        if (lat && lng) {
            updateData.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, updateData, { new: true }
        ).select("-password");

        if (!updatedUser) return res.status(404).json({ success: false, message: "User nahi mila" });
        res.json({ success: true, message: "Profile update ho gaya!", data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Profile update failed" });
    }
});

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────
app.post("/api/feedback", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Saare fields required hain" });
        }
        const newFeedback = new Feedback({ name, email, message });
        await newFeedback.save();
        res.json({ success: true, message: "Feedback receive ho gaya. Shukriya!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Feedback save nahi hua" });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════════════════
app.get("/api/admin/stats", async (req, res) => {
    try {
        const [donors, seekers, requests, messages] = await Promise.all([
            User.countDocuments({ role: 'donor' }),
            User.countDocuments({ role: 'seeker' }),
            Request.countDocuments(),
            Feedback.countDocuments()
        ]);
        res.json({ success: true, donors, seekers, requests, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Stats nahi aaye" });
    }
});

app.get("/api/admin/donors", async (req, res) => {
    try {
        const data = await User.find({ role: 'donor' }).select("-password").sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.get("/api/admin/seekers", async (req, res) => {
    try {
        const data = await User.find({ role: 'seeker' }).select("-password").sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.get("/api/admin/all-requests", async (req, res) => {
    try {
        const data = await Request.find().sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.get("/api/admin/feedbacks", async (req, res) => {
    try {
        const data = await Feedback.find().sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.delete("/api/admin/:collection/:id", async (req, res) => {
    try {
        const { collection, id } = req.params;
        const modelMap = {
            donors:    () => User.findByIdAndDelete(id),
            seekers:   () => User.findByIdAndDelete(id),
            requests:  () => Request.findByIdAndDelete(id),
            feedbacks: () => Feedback.findByIdAndDelete(id),
        };
        if (!modelMap[collection]) return res.status(400).json({ success: false, message: "Invalid collection" });
        await modelMap[collection]();
        res.json({ success: true, message: "Record delete ho gaya" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed" });
    }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
    server.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
    });
}

module.exports = app;
