import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token.trim()) {
      setError("Reset token is required.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill both password fields.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

if (!passwordRegex.test(newPassword)) {
  setError(
    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."
  );
  return;
}

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token.trim(),
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to reset password.");
        return;
      }

      setMessage(
        "Password reset successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>

            <h1 className="text-2xl font-bold text-gray-900">
              Reset Password
            </h1>

            <p className="text-gray-500 mt-2 text-sm">
              Create a new secure password for your MindCare account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reset Token
              </label>

              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your reset token"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ← Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ResetPassword;