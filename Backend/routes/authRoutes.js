const express = require("express");
const router = express.Router();
const {
    sendOTP,
    register,
    login,
    createNewAdmin,
    makeAdmin,
    getAllAdmins,
    deleteAdmin
} = require("../controllers/authController");

router.post("/send-otp", sendOTP);         // Step 1: OTP bhejo
router.post("/register", register);         // Step 2: OTP verify + register
router.post("/login", login);
router.post("/create-admin", createNewAdmin);
router.patch("/make-admin", makeAdmin);
router.get("/all-admins", getAllAdmins);
router.delete("/delete-admin/:id", deleteAdmin);

module.exports = router;