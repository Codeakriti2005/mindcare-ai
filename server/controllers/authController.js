const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/emailService");

// ================= REGISTER =================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message:
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number",
  });
}

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Create JWT
    const token = jwt.sign(
  {
    userId: user._id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
},
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Something went wrong during registration",
    });
  }
};

// ================= LOGIN =================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });
    
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
  {
    userId: user._id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
},
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Something went wrong during login",
    });
  }
};
// ================= GET CURRENT USER =================

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get Current User Error:", error.message);

    res.status(500).json({
      message: "Unable to fetch account information",
    });
  }
};
// ================= UPDATE PROFILE =================

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters",
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        message: "Name cannot exceed 50 characters",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        name: name.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);

    res.status(500).json({
      message: "Unable to update profile",
    });
  }
};
// ================= CHANGE PASSWORD =================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    // Check new password length
    // Check new password strength
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

if (!passwordRegex.test(newPassword)) {
  return res.status(400).json({
    message:
      "New password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number",
  });
}

    // Get current user
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // Prevent using same password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    user.password = hashedPassword;

// Invalidate all existing JWT sessions
user.tokenVersion += 1;

await user.save();
    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error.message);

    res.status(500).json({
      message: "Unable to change password",
    });
  }
};

// ================= FORGOT PASSWORD =================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    // Same response whether account exists or not
    // This prevents email/account enumeration.
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, password reset instructions have been generated.",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the HASH of the token in database
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

// Create secure password reset link
const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

// Send reset email
await sendPasswordResetEmail(user.email, resetLink);

    res.status(200).json({
      message:
        "If an account exists with this email, password reset instructions have been generated.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);

    res.status(500).json({
      message: "Unable to process password reset request",
    });
  }
};


// ================= RESET PASSWORD =================

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    // Validate password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number",
      });
    }

    // Hash the token received from the user
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired password reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
user.resetPasswordToken = null;
user.resetPasswordExpires = null;

// Invalidate all previous login sessions
user.tokenVersion += 1;

await user.save();
    res.status(200).json({
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);

    res.status(500).json({
      message: "Unable to reset password",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
  