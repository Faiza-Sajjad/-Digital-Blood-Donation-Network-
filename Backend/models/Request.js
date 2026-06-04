const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    seekerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    patientName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    units: { type: Number, required: true },
    hospital: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    urgency: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: { type: String, enum: ["Pending", "Accepted", "Completed"], default: "Pending" },
    additionalNotes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Request", requestSchema);