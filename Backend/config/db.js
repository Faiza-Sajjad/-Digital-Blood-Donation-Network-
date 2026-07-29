const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;
