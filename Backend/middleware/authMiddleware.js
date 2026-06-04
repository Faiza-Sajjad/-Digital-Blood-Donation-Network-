const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Hum token se user ki ID aur Role dono save kar rahe hain
            req.user = decoded;
            return next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
    return res.status(401).json({ message: "Not authorized, no token" });
};

// 🛡️ NAYA FUNCTION: Sirf Admin ko ijazat dene ke liye
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied: Only Admins can do this!" });
    }
};

module.exports = { protect, adminOnly };