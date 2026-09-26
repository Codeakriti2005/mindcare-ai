import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [moodAnalytics, setMoodAnalytics] = useState(null);
  const [userActivity, setUserActivity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // =========================================================
  // ADMIN API REQUEST
  // =========================================================

  const adminRequest = async (endpoint) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Your session has expired. Please login again.");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return null;
    }

    if (response.status === 403) {
      throw new Error(
        "Admin access required. This account does not have administrator permissions."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to fetch admin dashboard data."
      );
    }

    return data;
  };

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadAdminDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [statsData, moodData, activityData] =
        await Promise.all([
          adminRequest("/admin/stats"),
          adminRequest("/admin/mood-analytics"),
          adminRequest("/admin/user-activity"),
        ]);

      if (statsData) {
        setStats(statsData);
      }

      if (moodData) {
        setMoodAnalytics(moodData);
      }

      if (activityData) {
        setUserActivity(activityData);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Admin Dashboard Error:", error);

      setError(
        error.message || "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  // =========================================================
  // STAT CARDS
  // =========================================================

  const statCards = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      {
        title: "Total Users",
        value: stats.totalUsers || 0,
        icon: "👥",
        description: "Registered users",
      },
      {
        title: "Mood Check-ins",
        value: stats.totalMoods || 0,
        icon: "😊",
        description: "Mood records",
      },
      {
        title: "Journal Entries",
        value: stats.totalJournals || 0,
        icon: "📝",
        description: "Saved reflections",
      },
      {
        title: "AI Conversations",
        value: stats.totalConversations || 0,
        icon: "🤖",
        description: "AI sessions",
      },
      {
        title: "Notifications",
        value: stats.totalNotifications || 0,
        icon: "🔔",
        description: "Platform notifications",
      },
      {
        title: "Administrators",
        value: stats.adminUsers || 0,
        icon: "🛡️",
        description: "Admin accounts",
      },
    ];
  }, [stats]);

  // =========================================================
  // PLATFORM ACTIVITY DATA
  // =========================================================

  const platformActivityData = useMemo(() => {
    if (!userActivity) {
      return [];
    }

    const dates = new Set([
      ...(userActivity.userGrowth || []).map(
        (item) => item._id
      ),

      ...(userActivity.journalActivity || []).map(
        (item) => item._id
      ),

      ...(userActivity.conversationActivity || []).map(
        (item) => item._id
      ),
    ]);

    return [...dates]
      .sort()
      .map((date) => ({
        date,

        users:
          userActivity.userGrowth?.find(
            (item) => item._id === date
          )?.count || 0,

        journals:
          userActivity.journalActivity?.find(
            (item) => item._id === date
          )?.count || 0,

        conversations:
          userActivity.conversationActivity?.find(
            (item) => item._id === date
          )?.count || 0,
      }));
  }, [userActivity]);

  // =========================================================
  // FORMAT NUMBER
  // =========================================================

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString();
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              MindCare AI
            </p>

            <h1 className="mt-1 text-xl font-bold sm:text-2xl">
              Admin Dashboard 🛡️
            </h1>

            <p className="mt-1 hidden text-sm text-slate-400 sm:block">
              Platform monitoring & analytics
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            {/* Refresh */}

            <button
              onClick={() => loadAdminDashboard(true)}
              disabled={loading || refreshing}
              className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            {/* User Dashboard */}

            <Link
              to="/dashboard"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition hover:bg-white/10 sm:px-4"
            >
              <span className="hidden sm:inline">
                ← User Dashboard
              </span>

              <span className="sm:hidden">
                ← Dashboard
              </span>
            </Link>

          </div>

        </div>

      </header>

      {/* =====================================================
          SYSTEM STATUS
      ====================================================== */}

      <div className="border-b border-white/10 bg-slate-900/40">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

          <div className="flex items-center gap-2">

            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>

            <span className="text-xs font-semibold text-emerald-300 sm:text-sm">
              System Operational
            </span>

          </div>

          {lastUpdated && (
            <p className="text-xs text-slate-500">
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

        </div>

      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* ===================================================
            INTRO
        ==================================================== */}

        <section className="mb-8">

          <div className="max-w-3xl">

            <p className="mb-2 text-sm font-semibold text-cyan-400">
              PLATFORM OVERVIEW
            </p>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              MindCare AI Control Center
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              Monitor platform usage, wellness activity and
              safety signals through privacy-conscious
              aggregate analytics.
            </p>

          </div>

        </section>

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center shadow-xl">

            <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

            <h3 className="font-semibold">
              Loading dashboard
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Fetching secure aggregate analytics...
            </p>

          </div>
        )}

        {/* ===================================================
            ERROR
        ==================================================== */}

        {!loading && error && (
          <div className="rounded-3xl border border-red-400/20 bg-red-500/[0.06] p-6 shadow-xl">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                    ⚠️
                  </div>

                  <h3 className="font-semibold text-red-300">
                    Dashboard unavailable
                  </h3>

                </div>

                <p className="mt-3 text-sm leading-6 text-red-200/70">
                  {error}
                </p>

              </div>

              <button
                onClick={() => loadAdminDashboard(true)}
                className="shrink-0 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
              >
                Try Again
              </button>

            </div>

          </div>
        )}

        {/* ===================================================
            DASHBOARD CONTENT
        ==================================================== */}

        {!loading && !error && stats && (
          <>

            {/* =================================================
                KPI CARDS
            ================================================== */}

            <section>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {statCards.map((card) => (
                  <div
                    key={card.title}
                    className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.07] sm:p-6"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-sm font-medium text-slate-400">
                          {card.title}
                        </p>

                        <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                          {formatNumber(card.value)}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {card.description}
                        </p>

                      </div>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl transition duration-300 group-hover:scale-110">
                        {card.icon}
                      </div>

                    </div>

                  </div>
                ))}

              </div>

            </section>

            {/* =================================================
                SAFETY OVERVIEW
            ================================================== */}

            <section className="mt-10">

              <div className="mb-6">

                <p className="text-sm font-semibold text-red-300">
                  SAFETY MONITORING
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Safety Overview 🚨
                </h2>

                <p className="mt-2 text-sm text-slate-400 sm:text-base">
                  Aggregate safety signals detected by the
                  MindCare AI companion.
                </p>

              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {/* Total */}

                <div className="rounded-2xl border border-amber-400/10 bg-amber-500/[0.04] p-5 shadow-lg sm:p-6">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-sm text-slate-400">
                        Total Safety Events
                      </p>

                      <p className="mt-2 text-3xl font-bold">
                        {formatNumber(stats.totalSafetyEvents)}
                      </p>

                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-xl">
                      🚨
                    </div>

                  </div>

                </div>

                {/* High */}

                <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.06] p-5 shadow-lg sm:p-6">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-sm text-red-200/70">
                        High-Risk Events
                      </p>

                      <p className="mt-2 text-3xl font-bold text-red-300">
                        {formatNumber(stats.highRiskEvents)}
                      </p>

                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-xl">
                      🆘
                    </div>

                  </div>

                </div>

                {/* Medium */}

                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-5 shadow-lg sm:p-6">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-sm text-amber-200/70">
                        Medium-Risk Events
                      </p>

                      <p className="mt-2 text-3xl font-bold text-amber-300">
                        {formatNumber(stats.mediumRiskEvents)}
                      </p>

                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-xl">
                      ⚠️
                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                MOOD ANALYTICS
            ================================================== */}

            {moodAnalytics && (
              <section className="mt-10">

                <div className="mb-6">

                  <p className="text-sm font-semibold text-cyan-400">
                    WELLNESS ANALYTICS
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Mood Analytics 📊
                  </h2>

                  <p className="mt-2 text-sm text-slate-400 sm:text-base">
                    Aggregate mood activity across the MindCare AI
                    platform.
                  </p>

                </div>

                <div className="grid gap-6 lg:grid-cols-2">

                  {/* Mood Distribution */}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl sm:p-6">

                    <div className="mb-5">

                      <h3 className="text-lg font-semibold">
                        Mood Distribution
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Total mood check-ins by category
                      </p>

                    </div>

                    {moodAnalytics.moodDistribution?.length ===
                    0 ? (

                      <div className="flex h-80 items-center justify-center text-center text-sm text-slate-400">
                        No mood data available yet.
                      </div>

                    ) : (

                      <div className="h-80 w-full">

                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >

                          <BarChart
                            data={
                              moodAnalytics.moodDistribution
                            }
                            margin={{
                              top: 10,
                              right: 10,
                              left: -15,
                              bottom: 5,
                            }}
                          >

                            <CartesianGrid
                              strokeDasharray="3 3"
                              strokeOpacity={0.12}
                            />

                            <XAxis
                              dataKey="_id"
                              tick={{
                                fill: "#94a3b8",
                                fontSize: 12,
                              }}
                              tickLine={false}
                              axisLine={false}
                            />

                            <YAxis
                              allowDecimals={false}
                              tick={{
                                fill: "#94a3b8",
                                fontSize: 12,
                              }}
                              tickLine={false}
                              axisLine={false}
                            />

                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                border:
                                  "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                color: "#fff",
                              }}
                              cursor={{
                                fill: "rgba(255,255,255,0.04)",
                              }}
                            />

                            <Bar
                              dataKey="count"
                              name="Check-ins"
                              radius={[8, 8, 0, 0]}
                            />

                          </BarChart>

                        </ResponsiveContainer>

                      </div>

                    )}

                  </div>

                  {/* Daily Mood Activity */}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl sm:p-6">

                    <div className="mb-5">

                      <h3 className="text-lg font-semibold">
                        Daily Mood Activity
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Mood check-ins over time
                      </p>

                    </div>

                    {moodAnalytics.dailyActivity?.length ===
                    0 ? (

                      <div className="flex h-80 items-center justify-center text-center text-sm text-slate-400">
                        No activity available yet.
                      </div>

                    ) : (

                      <div className="h-80 w-full">

                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >

                          <LineChart
                            data={
                              moodAnalytics.dailyActivity
                            }
                            margin={{
                              top: 10,
                              right: 10,
                              left: -15,
                              bottom: 5,
                            }}
                          >

                            <CartesianGrid
                              strokeDasharray="3 3"
                              strokeOpacity={0.12}
                            />

                            <XAxis
                              dataKey="_id"
                              tick={{
                                fill: "#94a3b8",
                                fontSize: 12,
                              }}
                              tickLine={false}
                              axisLine={false}
                            />

                            <YAxis
                              allowDecimals={false}
                              tick={{
                                fill: "#94a3b8",
                                fontSize: 12,
                              }}
                              tickLine={false}
                              axisLine={false}
                            />

                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                border:
                                  "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                color: "#fff",
                              }}
                              cursor={{
                                stroke: "rgba(255,255,255,0.15)",
                              }}
                            />

                            <Line
                              type="monotone"
                              dataKey="count"
                              name="Check-ins"
                              strokeWidth={3}
                              dot={{ r: 3 }}
                              activeDot={{ r: 6 }}
                            />

                          </LineChart>

                        </ResponsiveContainer>

                      </div>

                    )}

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                PLATFORM ACTIVITY
            ================================================== */}

            {userActivity && (
              <section className="mt-10">

                <div className="mb-6">

                  <p className="text-sm font-semibold text-violet-300">
                    PLATFORM ENGAGEMENT
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Platform Activity 📈
                  </h2>

                  <p className="mt-2 text-sm text-slate-400 sm:text-base">
                    Track aggregate user growth and platform
                    engagement over time.
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl sm:p-6">

                  <div className="mb-5">

                    <h3 className="text-lg font-semibold">
                      Users, Journals & AI Conversations
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Daily platform activity
                    </p>

                  </div>

                  {platformActivityData.length === 0 ? (

                    <div className="flex h-96 items-center justify-center text-center text-sm text-slate-400">
                      No platform activity available yet.
                    </div>

                  ) : (

                    <div className="h-96 w-full">

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <LineChart
                          data={platformActivityData}
                          margin={{
                            top: 10,
                            right: 10,
                            left: -15,
                            bottom: 5,
                          }}
                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                            strokeOpacity={0.12}
                          />

                          <XAxis
                            dataKey="date"
                            tick={{
                              fill: "#94a3b8",
                              fontSize: 12,
                            }}
                            tickLine={false}
                            axisLine={false}
                          />

                          <YAxis
                            allowDecimals={false}
                            tick={{
                              fill: "#94a3b8",
                              fontSize: 12,
                            }}
                            tickLine={false}
                            axisLine={false}
                          />

                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              border:
                                "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "12px",
                              color: "#fff",
                            }}
                          />

                          <Line
                            type="monotone"
                            dataKey="users"
                            name="New Users"
                            strokeWidth={3}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                          />

                          <Line
                            type="monotone"
                            dataKey="journals"
                            name="Journal Entries"
                            strokeWidth={3}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                          />

                          <Line
                            type="monotone"
                            dataKey="conversations"
                            name="AI Conversations"
                            strokeWidth={3}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                          />

                        </LineChart>

                      </ResponsiveContainer>

                    </div>

                  )}

                </div>

              </section>
            )}

            {/* =================================================
                PRIVACY NOTICE
            ================================================== */}

            <section className="mt-10 rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.05] p-5 shadow-lg sm:p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
                  🔐
                </div>

                <div>

                  <h3 className="font-semibold text-cyan-100">
                    Privacy-conscious administration
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    This dashboard displays aggregate platform
                    statistics only. Private journal entries,
                    personal AI conversation content and
                    individual safety messages are not displayed
                    here.
                  </p>

                </div>

              </div>

            </section>

          </>
        )}

      </main>

    </div>
  );
};

export default AdminDashboard;