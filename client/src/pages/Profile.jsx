import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";

function Profile() {
  const navigate = useNavigate();

  // ================= USER STATE =================

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "user",
  });

  const [name, setName] = useState("");

  // ================= LOADING =================

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // ================= PROFILE MESSAGES =================

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // ================= PASSWORD STATE =================

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ================= FETCH PROFILE =================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setProfileError("");

        const data = await apiRequest("/auth/me");

        if (data?.user) {
          setUser(data.user);
          setName(data.user.name || "");

          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );
        }
      } catch (error) {
        console.error("Profile fetch error:", error);

        setProfileError(
          error.message || "Unable to load profile information."
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // ================= PASSWORD STRENGTH =================

  const getPasswordStrength = () => {
    if (!newPassword) {
      return {
        label: "Enter a new password",
        width: "w-0",
        text: "text-gray-400",
      };
    }

    let score = 0;

    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 2) {
      return {
        label: "Weak password",
        width: "w-1/3",
        text: "text-red-500",
      };
    }

    if (score <= 4) {
      return {
        label: "Good password",
        width: "w-2/3",
        text: "text-yellow-600",
      };
    }

    return {
      label: "Strong password",
      width: "w-full",
      text: "text-green-600",
    };
  };

  const passwordStrength = getPasswordStrength();

  // ================= UPDATE PROFILE =================

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setProfileError("Name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      setProfileError("Name must be at least 2 characters.");
      return;
    }

    if (trimmedName.length > 50) {
      setProfileError("Name cannot exceed 50 characters.");
      return;
    }

    try {
      setUpdatingProfile(true);

      const data = await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      if (data?.user) {
        const updatedUser = {
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        };

        setUser(updatedUser);
        setName(updatedUser.name);

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );
      }

      setProfileMessage("Profile updated successfully.");

      setTimeout(() => {
        setProfileMessage("");
      }, 3000);
    } catch (error) {
      console.error("Profile update error:", error);

      setProfileError(
        error.message || "Unable to update profile."
      );
    } finally {
      setUpdatingProfile(false);
    }
  };

  // ================= CHANGE PASSWORD =================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill all password fields."
      );
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const data = await apiRequest(
        "/auth/change-password",
        {
          method: "PUT",
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      setPasswordMessage(
        data?.message ||
          "Password changed successfully. Please login again."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      }, 1800);
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setPasswordError(
        error.message ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to sign out of MindCare AI?"
    );

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ================= LOADING =================

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-white bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
            🧠
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Loading your profile...
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Please wait a moment.
          </p>

          <div className="mx-auto mt-5 h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-600" />
          </div>
        </div>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">

          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl text-white shadow-md">
              🧠
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                MindCare AI
              </h1>

              <p className="hidden text-xs text-gray-500 sm:block">
                Your wellness companion
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-indigo-600 sm:px-4"
          >
            ← Dashboard
          </Link>

        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">

        {/* PAGE HEADER */}

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            ⚙️ Account Settings
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Profile & Security
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Manage your personal information, password,
            privacy and MindCare AI account settings.
          </p>
        </div>

        {/* ================= PROFILE CARD ================= */}

        <section className="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">

          {/* PROFILE HERO */}

          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 px-6 py-8 text-white sm:px-8">

            <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-purple-300/10 blur-2xl" />

            <div className="relative flex flex-col items-center gap-5 sm:flex-row">

              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white/30 bg-white/15 text-5xl shadow-xl backdrop-blur">
                🧠
              </div>

              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-indigo-100">
                  Welcome back
                </p>

                <h3 className="mt-1 text-2xl font-extrabold">
                  {user.name || "User"}
                </h3>

                <p className="mt-1 text-sm text-indigo-100">
                  {user.email || "Email not available"}
                </p>

                <div className="mt-3 inline-flex rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                  {user.role === "admin"
                    ? "🛡️ Administrator"
                    : "👤 User Account"}
                </div>
              </div>

            </div>
          </div>

          {/* PROFILE FORM */}

          <div className="p-6 sm:p-8">

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Personal Information
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Update the name associated with your account.
              </p>
            </div>

            {profileMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <span>✓</span>
                <span>{profileMessage}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>⚠️</span>
                <span>{profileError}</span>
              </div>
            )}

            <form
              onSubmit={handleUpdateProfile}
              className="space-y-5"
            >

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setProfileError("");
                    setProfileMessage("");
                  }}
                  maxLength={50}
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  2–50 characters
                </p>
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-500"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Your email is used for account authentication.
                </p>
              </div>

              {/* ROLE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Account Role
                </label>

                <input
                  type="text"
                  value={
                    user.role === "admin"
                      ? "Administrator"
                      : "User"
                  }
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingProfile
                  ? "Saving..."
                  : "Save Profile"}
              </button>

            </form>
          </div>
        </section>

        {/* ================= SECURITY ================= */}

        <section className="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">

          <div className="border-b border-gray-100 p-6 sm:p-8">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                🔐
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Account Security
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Keep your MindCare AI account protected.
                </p>
              </div>

            </div>

          </div>

          <div className="p-6 sm:p-8">

            {passwordMessage && (
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                ✓ {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                ⚠️ {passwordError}
              </div>
            )}

            <form
              onSubmit={handleChangePassword}
              className="space-y-5"
            >

              {/* CURRENT PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Current Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 pr-14 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    {showCurrentPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* NEW PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 pr-14 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    {showNewPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* PASSWORD STRENGTH */}

                <div className="mt-3">

                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Password strength
                    </span>

                    <span
                      className={`text-xs font-semibold ${passwordStrength.text}`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full bg-indigo-500 transition-all duration-300 ${passwordStrength.width}`}
                    />
                  </div>

                </div>

                <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">

                  <p>
                    {newPassword.length >= 8
                      ? "✓"
                      : "○"}{" "}
                    At least 8 characters
                  </p>

                  <p>
                    {/[A-Z]/.test(newPassword)
                      ? "✓"
                      : "○"}{" "}
                    One uppercase letter
                  </p>

                  <p>
                    {/[a-z]/.test(newPassword)
                      ? "✓"
                      : "○"}{" "}
                    One lowercase letter
                  </p>

                  <p>
                    {/\d/.test(newPassword)
                      ? "✓"
                      : "○"}{" "}
                    One number
                  </p>

                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 pr-14 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {confirmPassword && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      newPassword === confirmPassword
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {newPassword === confirmPassword
                      ? "✓ Passwords match"
                      : "Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </button>

            </form>

            {/* SECURITY FEATURES */}

            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                <div className="text-2xl">🔒</div>

                <h4 className="mt-3 font-bold text-gray-800">
                  Password Protected
                </h4>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Passwords are securely hashed before storage.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="text-2xl">🛡️</div>

                <h4 className="mt-3 font-bold text-gray-800">
                  Secure Sessions
                </h4>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Changing your password invalidates previous sessions.
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
                <div className="text-2xl">🔑</div>

                <h4 className="mt-3 font-bold text-gray-800">
                  Strong Password
                </h4>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Password rules help protect your account.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ================= PRIVACY ================= */}

        <section className="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">

          <div className="p-6 sm:p-8">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                🔏
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Privacy & Data
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Understand how your MindCare AI data is handled.
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-4">

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h4 className="font-bold text-gray-800">
                  🔐 Your account
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Your account information is associated with your
                  authenticated MindCare AI account.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h4 className="font-bold text-gray-800">
                  📊 Your wellness data
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Mood check-ins, journals and wellness activity
                  are associated with your account so the application
                  can provide your personal dashboard and insights.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h4 className="font-bold text-gray-800">
                  🧠 AI conversations
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  AI companion conversations are associated with
                  your account to support conversation history and
                  continuity.
                </p>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                <h4 className="font-bold text-indigo-900">
                  ℹ️ MindCare AI wellness notice
                </h4>

                <p className="mt-2 text-sm leading-6 text-indigo-800">
                  MindCare AI is a wellness support companion.
                  It does not replace doctors, therapists,
                  professional medical care or emergency services.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ================= SIGN OUT ================= */}

        <section className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-lg">

          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-xl">
                  🚪
                </div>

                <h3 className="text-lg font-bold text-gray-900">
                  Sign out
                </h3>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Sign out of your current MindCare AI session.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-2xl border border-red-200 bg-red-50 px-6 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              Sign Out
            </button>

          </div>
        </section>

        {/* ================= FOOTER ================= */}

        <footer className="pb-6 pt-8 text-center">
          <p className="text-sm text-gray-400">
            MindCare AI • Your wellness companion 🧠
          </p>

          <p className="mt-1 text-xs text-gray-300">
            Built with privacy, security and mindful design in mind.
          </p>
        </footer>

      </main>
    </div>
  );
}

export default Profile;