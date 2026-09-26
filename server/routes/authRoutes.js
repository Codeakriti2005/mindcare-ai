const rateLimit = require("express-rate-limit");
const express = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");

const { body } = require("express-validator");

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

// ================= REGISTER =================

router.post(
  "/register",authLimiter,

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain a number"),

  validate,
  registerUser
);

// ================= LOGIN =================

router.post(
  "/login", authLimiter,

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  validate,
  loginUser
);

router.get("/me", protect, getCurrentUser);

// ================= UPDATE PROFILE =================

router.put(
  "/profile",
  protect,

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  validate,
  updateProfile
);

// ================= CHANGE PASSWORD =================

router.put(
  "/change-password",
  protect,

  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/[a-z]/)
    .withMessage("New password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("New password must contain an uppercase letter")
    .matches(/\d/)
    .withMessage("New password must contain a number"),

  validate,
  changePassword
);

// ================= FORGOT PASSWORD =================

router.post(
  "/forgot-password", authLimiter,

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  validate,
  forgotPassword
);

// ================= RESET PASSWORD =================

router.post(
  "/reset-password", authLimiter,

  body("token")
    .trim()
    .notEmpty()
    .withMessage("Reset token is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain a number"),

  validate,
  resetPassword
);

module.exports = router;