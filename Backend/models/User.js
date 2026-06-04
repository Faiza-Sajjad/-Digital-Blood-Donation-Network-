const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:             { type: String, required: true },
    email:            { type: String, required: true, unique: true, lowercase: true },
    password:         { type: String, required: true },
    role:             { type: String, enum: ["donor", "seeker", "admin"], default: "seeker" },
    bloodGroup:       { type: String },
    city:             { type: String },
    phone:            { type: String, required: true },
    dateOfBirth:      { type: Date },
    lastDonationDate: { type: Date },
    availability:     { type: Boolean, default: true },
    isVerified:       { type: Boolean, default: false },
    // Distance ke liye coordinates
    location: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
