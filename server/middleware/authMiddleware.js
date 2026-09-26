const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. Please login first.",
      });
    }

    // Extract token
    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. Please login first.",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Make sure required JWT data exists
    if (!decoded.userId || decoded.tokenVersion === undefined) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // Find current user from database
    const user = await User.findById(decoded.userId).select(
      "_id tokenVersion role"
    );

    if (!user) {
      return res.status(401).json({
        message: "User account no longer exists.",
      });
    }

    // Invalidate old tokens after password/security changes
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }

    // Attach current user information
    req.user = {
      userId: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = protect;