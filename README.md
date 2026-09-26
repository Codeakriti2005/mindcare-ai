# 🧠 MindCare AI

> An AI-powered mental wellness companion designed to help users talk, reflect, track their mood, journal, and build healthier daily habits.

MindCare AI is a full-stack mental wellness platform that combines an AI companion, mood tracking, AI-powered journaling, wellness insights, notifications, safety-focused support, and an administrative analytics dashboard.

The project is designed with privacy, security, user isolation, and responsible AI usage in mind.

---

## ✨ Features

### 🤖 AI Companion

- Supportive AI-powered conversations
- Local AI inference using Ollama
- Conversation history
- Multiple conversations
- New conversation creation
- Conversation deletion
- Typing-style responses
- Voice input using browser Speech Recognition
- Voice output using browser Speech Synthesis
- Safety-aware responses
- Prompt-injection resistant system prompts

### 😊 Mood Tracking

- Daily mood check-ins
- Multiple mood categories
- Optional mood notes
- Mood history
- Mood statistics
- Mood journey visualization
- Mood distribution analytics
- Streak tracking

### 📔 AI Journal

- Private journal entries
- Journal title and content
- Sentiment analysis
- Positive / Neutral / Negative classification
- AI-generated journal reflections
- Journal history
- Journal deletion
- Journal statistics

### 💡 Wellness Insights

- Personalized wellness reflections
- Mood-based insights
- Journal-based insights
- Dashboard wellness overview
- Refreshable AI insights

### 🔔 Notifications

- Mood notifications
- Journal notifications
- AI insight notifications
- Streak notifications
- System notifications
- Read/unread tracking
- Unread notification count

### 🛡️ Safety System

MindCare AI includes a rule-based first-pass safety detection system.

It identifies potentially high-risk and medium-risk messages and changes the AI response accordingly.

High-risk situations can trigger guidance toward:

- Local emergency services
- Crisis support
- Trusted people
- Professional mental health support

For users in India, the application can provide:

- Tele-MANAS: 14416 / 1800-89-14416
- Emergency: 112

The safety system is not a medical diagnosis or clinical risk assessment system.

### 👤 Authentication & Security

- User registration
- Secure login
- JWT authentication
- Password hashing with bcrypt
- Protected routes
- Role-based authorization
- Admin-only routes
- Password change
- Forgot password
- Password reset
- Session invalidation using token versions
- Input validation
- Rate limiting
- Helmet security headers
- CORS configuration
- User-specific data isolation

### 👨‍💼 Admin Dashboard

The admin dashboard provides privacy-conscious aggregate analytics including:

- Total users
- Total moods
- Total journal entries
- Total conversations
- Total notifications
- Safety event counts
- Mood distribution
- Daily mood activity
- User growth
- Journal activity
- Conversation activity

The admin dashboard does not expose private journal content, conversation content, passwords, or password reset tokens.

---

# 🏗️ Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Recharts
- JavaScript
- Browser Speech Recognition API
- Browser Speech Synthesis API

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Express Validator
- Helmet
- Express Rate Limit
- CORS

## AI

- Ollama
- Llama 3.2 3B
- Local AI inference

## Development Tools

- VS Code
- Git
- GitHub
- npm

---

# 📁 Project Structure

```text
mindcare-ai/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── pages/
│   │   │   ├── Companion.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Journal.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Mood.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── Welcome.jsx
│   │   │
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminRoute.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── PublicRoute.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md