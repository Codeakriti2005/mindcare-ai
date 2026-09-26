import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Mood from "./pages/Mood";
import Journal from "./pages/Journal";
import Companion from "./pages/Companion";
import Profile from "./pages/Profile";

import AdminDashboard from "./AdminDashboard";
import AdminRoute from "./AdminRoute";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Welcome from "./pages/Welcome";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= NAVBAR ================= */}

      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
              🧠
            </div>

            <div>
              <h1 className="text-xl font-bold">
                MindCare AI
              </h1>

              <p className="text-xs text-slate-500">
                Your wellness companion
              </p>
            </div>

          </div>

          <div className="hidden items-center gap-8 md:flex">

            <a
              href="#features"
              className="text-sm text-slate-600 hover:text-indigo-600"
            >
              Features
            </a>

            <a
              href="#how"
              className="text-sm text-slate-600 hover:text-indigo-600"
            >
              How it works
            </a>

            <a
              href="#safety"
              className="text-sm text-slate-600 hover:text-indigo-600"
            >
              Safety
            </a>

          </div>

          <a
            href="/welcome"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Get Started
          </a>

        </div>
      </nav>

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden">

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">

          {/* HERO TEXT */}

          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              ✨ AI-powered wellness companion
            </div>

            <h2 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              A safe space to
              <span className="text-indigo-600">
                {" "}talk, reflect{" "}
              </span>
              and grow.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              MindCare AI helps you reflect on your thoughts,
              track your mood, build healthy habits and discover
              personalized wellness activities — all in one
              private space.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <a
                href="/welcome"
                className="rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              >
                Start Your Journey →
              </a>

              <a
                href="#features"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Explore Features
              </a>

            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500">
              <span>✓ Private by design</span>
              <span>✓ Wellness focused</span>
              <span>✓ Available anytime</span>
            </div>

          </div>

          {/* AI CHAT PREVIEW */}

          <div className="relative">

            <div className="absolute -inset-4 rounded-[2rem] bg-indigo-100/60 blur-3xl"></div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

              {/* Chat Header */}

              <div className="flex items-center gap-3 border-b border-slate-100 p-5">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-xl">
                  🧠
                </div>

                <div>

                  <h3 className="font-semibold">
                    MindCare Companion
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Here to listen
                  </div>

                </div>

              </div>

              {/* Chat */}

              <div className="space-y-5 bg-slate-50 p-6">

                <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-indigo-600 p-4 text-sm text-white">
                  I've been feeling really stressed lately.
                </div>

                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                  I'm glad you shared that with me. It sounds
                  like things have been feeling overwhelming
                  lately. Would you like to talk about what's
                  been causing the most stress?
                </div>

                <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-indigo-600 p-4 text-sm text-white">
                  Mostly college and deadlines.
                </div>

              </div>

              {/* Input */}

              <div className="flex items-center gap-3 border-t border-slate-100 p-4">

                <div className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-400">
                  Share what's on your mind...
                </div>

                <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  ↑
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="bg-white py-20"
      >

        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto max-w-2xl text-center">

            <p className="font-semibold text-indigo-600">
              EVERYTHING IN ONE PLACE
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              Your personal wellness space
            </h2>

            <p className="mt-4 text-slate-600">
              Tools designed to help you understand your
              patterns, reflect on your day and build healthier
              routines.
            </p>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <Feature
              icon="💬"
              title="AI Companion"
              description="Have supportive conversations whenever you need a space to talk."
            />

            <Feature
              icon="😊"
              title="Mood Tracking"
              description="Track your daily mood and discover patterns over time."
            />

            <Feature
              icon="📔"
              title="AI Journal"
              description="Write privately and receive thoughtful reflection prompts."
            />

            <Feature
              icon="📊"
              title="Wellness Insights"
              description="Understand your mood, habits and progress through analytics."
            />

          </div>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section
        id="how"
        className="bg-slate-50 py-20"
      >

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <p className="font-semibold text-indigo-600">
              SIMPLE PROCESS
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              Your journey starts here
            </h2>

          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">

            <Step
              number="01"
              title="Check in"
              description="Tell MindCare how you're feeling and record your daily mood."
            />

            <Step
              number="02"
              title="Reflect"
              description="Talk with your AI companion or write in your private journal."
            />

            <Step
              number="03"
              title="Grow"
              description="Use personalized wellness activities and insights to build better habits."
            />

          </div>

        </div>

      </section>

      {/* ================= SAFETY ================= */}

      <section
        id="safety"
        className="bg-white py-20"
      >

        <div className="mx-auto max-w-4xl px-6 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
            🛡️
          </div>

          <h2 className="mt-6 text-4xl font-bold">
            Built with safety in mind
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
            MindCare AI is designed as a wellness and support
            companion, not a replacement for professional mental
            health care. When a conversation indicates that
            someone may be in immediate danger, the application
            can guide them toward appropriate human and emergency
            support.
          </p>

        </div>

      </section>

      {/* ================= CTA ================= */}

      <section className="px-6 py-20">

        <div className="mx-auto max-w-6xl rounded-3xl bg-indigo-600 px-8 py-16 text-center text-white shadow-xl">

          <h2 className="text-4xl font-bold">
            Start taking a moment for yourself.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-indigo-100">
            Build a healthier relationship with your thoughts,
            one day at a time.
          </p>

          <a
            href="/welcome"
            className="mt-8 inline-block rounded-xl bg-white px-7 py-3.5 font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            Get Started →
          </a>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">

          <p>
            © 2026 MindCare AI
          </p>

          <p>
            AI wellness companion • Privacy • Safety
          </p>

        </div>

      </footer>

    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>

    </div>
  );
}

function Step({
  number,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">

      <span className="text-sm font-bold text-indigo-600">
        {number}
      </span>

      <h3 className="mt-4 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>

    </div>
  );
}

function App() {
  return (
    <Routes>

      {/* =========================================
          HOME
      ========================================= */}

      <Route
        path="/"
        element={<Home />}
      />

      {/* =========================================
          PUBLIC ROUTES
      ========================================= */}

      <Route element={<PublicRoute />}>

        <Route
          path="/welcome"
          element={<Welcome />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

      </Route>

      {/* =========================================
          PASSWORD RESET
      ========================================= */}

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* =========================================
          PROTECTED USER ROUTES
      ========================================= */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/mood"
          element={<Mood />}
        />

        <Route
          path="/journal"
          element={<Journal />}
        />

        <Route
          path="/companion"
          element={<Companion />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Route>

      {/* =========================================
          PROTECTED ADMIN ROUTE
      ========================================= */}

      <Route element={<AdminRoute />}>

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

      </Route>

    </Routes>
  );
}

export default App;