const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const moodRoutes = require("./routes/moodRoutes");
const journalRoutes = require("./routes/journalRoutes");
const aiRoutes = require("./routes/aiRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const insightRoutes = require("./routes/insightRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Trust Render / Reverse Proxy
|--------------------------------------------------------------------------
| Render sits behind a reverse proxy and forwards the original client IP
| through X-Forwarded-For. Express needs to trust the first proxy.
*/
app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

/*
|--------------------------------------------------------------------------
| API Rate Limiter
|--------------------------------------------------------------------------
*/
app.use("/api", apiLimiter);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

/*
|--------------------------------------------------------------------------
| MongoDB Connection
|--------------------------------------------------------------------------
*/
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "mindcare_ai",
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("MongoDB connected successfully ✅");
  })
  .catch((error) => {
    console.error("MongoDB connection failed ❌");
    console.error(error.message);
  });

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
app.get("/", (req, res) => {
  res.json({
    message: "MindCare AI backend is running 🧠",
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(err.status || 500).json({
    message: "Something went wrong. Please try again later.",
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MindCare AI server running on port ${PORT}`);
});