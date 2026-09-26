import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      // Clear any previous session
localStorage.removeItem("token");
localStorage.removeItem("user");

// Save fresh JWT token
localStorage.setItem("token", data.token);

// Save fresh user information
localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white">
            🧠
          </div>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-slate-500">
            Continue your MindCare journey
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>

                <Link
  to="/forgot-password"
  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
>
  Forgot password?
</Link>
              </div>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create one
            </Link>
          </p>

        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-indigo-600"
          >
            ← Back to MindCare AI
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Login;