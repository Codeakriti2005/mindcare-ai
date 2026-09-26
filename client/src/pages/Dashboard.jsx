import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Dashboard() {
  // =========================
  // STATES
  // =========================

  const [moodStats, setMoodStats] = useState({
    total: 0,
    moodCounts: {},
    recentMoods: [],
    moodTrend: [],
  });

  const [journalCount, setJournalCount] = useState(0);
  const [moodTrend, setMoodTrend] = useState([]);

  const [wellnessInsight, setWellnessInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(true);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [loadingStats, setLoadingStats] = useState(true);
  const [streak, setStreak] = useState(0);

  const navigate = useNavigate();

  // =========================
  // USER
  // =========================

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
  };

  // =========================
  // FETCH NOTIFICATIONS
  // =========================

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const data = await apiRequest("/notifications");

      if (!data) return;

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  // =========================
  // MARK NOTIFICATION AS READ
  // =========================

  const markNotificationAsRead = async (notificationId) => {
    try {
      const data = await apiRequest(
        `/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        }
      );

      if (!data) return;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );

      setUnreadCount((prev) =>
        Math.max(prev - 1, 0)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  // =========================
  // MARK ALL NOTIFICATIONS READ
  // =========================

  const markAllNotificationsAsRead = async () => {
    try {
      const data = await apiRequest(
        "/notifications/read-all",
        {
          method: "PATCH",
        }
      );

      if (!data) return;

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  // =========================
  // DELETE NOTIFICATION
  // =========================

  const deleteNotification = async (notificationId) => {
    try {
      const notificationToDelete =
        notifications.find(
          (notification) =>
            notification._id === notificationId
        );

      const data = await apiRequest(
        `/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      if (!data) return;

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification._id !== notificationId
        )
      );

      if (
        notificationToDelete &&
        !notificationToDelete.read
      ) {
        setUnreadCount((prev) =>
          Math.max(prev - 1, 0)
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error
      );
    }
  };

  // =========================
  // FETCH WELLNESS INSIGHT
  // =========================

  const fetchWellnessInsight = async () => {
    try {
      setLoadingInsight(true);

      const data = await apiRequest("/insights");

      if (!data) return;

      console.log(
        "Wellness Insight Response:",
        data
      );

      setWellnessInsight(
        data.insight ||
          "Keep checking in with yourself. Small steps toward self-awareness can make a meaningful difference."
      );
    } catch (error) {
      console.error(
        "Failed to fetch wellness insight:",
        error
      );

      setWellnessInsight(
        "Your wellness insight could not be loaded right now. Please try refreshing."
      );
    } finally {
      setLoadingInsight(false);
    }
  };

  // =========================
  // FETCH DASHBOARD STATS
  // =========================

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);

      const [moodData, journalData] =
        await Promise.all([
          apiRequest("/moods/stats"),
          apiRequest("/journals/stats"),
        ]);

      if (!moodData || !journalData) {
        return;
      }

      // =========================
      // MOOD DATA
      // =========================

      const recentMoods =
        moodData.recentMoods || [];

      const trend =
        moodData.moodTrend || [];

      setMoodStats({
        total: moodData.total || 0,
        moodCounts:
          moodData.moodCounts || {},
        recentMoods,
        moodTrend: trend,
      });

      setMoodTrend(trend);

      // =========================
      // JOURNAL DATA
      // =========================

      setJournalCount(
        journalData.total ||
          journalData.count ||
          0
      );

      // =========================
      // WELLNESS STREAK
      // =========================

      const dates = recentMoods
        .map((item) =>
          new Date(item.date).toDateString()
        );

      const uniqueDates = [
        ...new Set(dates),
      ];

      let currentStreak = 0;

      for (
        let i = uniqueDates.length - 1;
        i >= 0;
        i--
      ) {
        if (
          i ===
          uniqueDates.length - 1
        ) {
          currentStreak = 1;
        } else {
          const currentDate =
            new Date(uniqueDates[i]);

          const nextDate =
            new Date(uniqueDates[i + 1]);

          const difference =
            (nextDate - currentDate) /
            (1000 * 60 * 60 * 24);

          if (difference === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      setStreak(currentStreak);
    } catch (error) {
      console.error(
        "Dashboard stats error:",
        error
      );
    } finally {
      setLoadingStats(false);
    }
  };

  // =========================
  // INITIAL DASHBOARD LOAD
  // =========================

  useEffect(() => {
    fetchDashboardStats();
    fetchNotifications();

    // IMPORTANT:
    // This was missing earlier.
    // This loads the AI Wellness Insight.
    fetchWellnessInsight();
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =========================
  // MOOD ICON
  // =========================

  const getMoodIcon = (mood) => {
    const moodIcons = {
      "very-happy": "🤩",
      happy: "😊",
      okay: "😐",
      sad: "😔",
      "very-sad": "😢",
      angry: "😠",
      anxious: "😟",
      stressed: "😣",
    };

    return moodIcons[mood] || "🧠";
  };

  // =========================
  // MOOD COLORS
  // =========================

  const moodColors = [
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#64748b",
  ];

  // =========================
  // CURRENT MOOD
  // =========================

  const latestMood =
    moodStats.recentMoods?.length > 0
      ? moodStats.recentMoods[
          moodStats.recentMoods.length - 1
        ]?.mood
      : "";

  // =========================
  // RENDER
  // =========================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= NAVBAR ================= */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          {/* LOGO */}

          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-xl text-white shadow-sm">
              🧠
            </div>

            <div>

              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                MindCare AI
              </h1>

              <p className="hidden text-xs text-slate-400 sm:block">
                Your wellness companion
              </p>

            </div>

          </Link>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-2 sm:gap-3">

            {/* NOTIFICATIONS */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (prev) => !prev
                  )
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg transition hover:bg-slate-50"
                title="Notifications"
              >

                🔔

                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
                )}

              </button>

              {showNotifications && (
                <div className="absolute right-0 top-14 z-50 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-[360px]">

                  {/* HEADER */}

                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                    <div>

                      <h3 className="font-bold text-slate-900">
                        Notifications
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {unreadCount > 0
                          ? `${unreadCount} unread notification${
                              unreadCount > 1
                                ? "s"
                                : ""
                            }`
                          : "You're all caught up"}
                      </p>

                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          markAllNotificationsAsRead
                        }
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                      >
                        Mark all as read
                      </button>
                    )}

                  </div>

                  {/* NOTIFICATIONS LIST */}

                  <div className="max-h-[360px] overflow-y-auto">

                    {loadingNotifications ? (

                      <div className="space-y-4 px-5 py-6">

                        {[1, 2, 3].map(
                          (item) => (
                            <div
                              key={item}
                              className="animate-pulse"
                            >

                              <div className="flex gap-3">

                                <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200"></div>

                                <div className="flex-1">

                                  <div className="h-3 w-3/4 rounded bg-slate-200"></div>

                                  <div className="mt-2 h-3 w-full rounded bg-slate-200"></div>

                                  <div className="mt-2 h-2 w-1/4 rounded bg-slate-200"></div>

                                </div>

                              </div>

                            </div>
                          )
                        )}

                      </div>

                    ) : notifications.length ===
                      0 ? (

                      <div className="px-5 py-10 text-center">

                        <div className="text-3xl">
                          🔔
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No notifications yet
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          You're all caught up!
                        </p>

                      </div>

                    ) : (

                      notifications.map(
                        (notification) => (
                          <div
                            key={
                              notification._id
                            }
                            onClick={() => {
                              if (
                                !notification.read
                              ) {
                                markNotificationAsRead(
                                  notification._id
                                );
                              }
                            }}
                            className={`flex cursor-pointer gap-3 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 ${
                              !notification.read
                                ? "bg-indigo-50/40"
                                : ""
                            }`}
                          >

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                              {notification.icon ||
                                "🔔"}
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <p className="min-w-0 flex-1 text-sm font-semibold text-slate-800">
                                  {
                                    notification.title
                                  }
                                </p>

                                <div className="flex shrink-0 items-center gap-2">

                                  {!notification.read && (
                                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                                  )}

                                  <button
                                    type="button"
                                    title="Delete notification"
                                    aria-label={`Delete ${notification.title}`}
                                    onClick={(
                                      event
                                    ) => {
                                      event.stopPropagation();

                                      deleteNotification(
                                        notification._id
                                      );
                                    }}
                                    className="rounded-lg px-1.5 py-1 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                  >
                                    🗑️
                                  </button>

                                </div>

                              </div>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {
                                  notification.message
                                }
                              </p>

                              <p className="mt-2 text-[11px] text-slate-400">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </p>

                            </div>

                          </div>
                        )
                      )

                    )}

                  </div>

                  {/* FOOTER */}

                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-center">

                    <button
                      type="button"
                      onClick={() =>
                        setShowNotifications(false)
                      }
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Close notifications
                    </button>

                  </div>

                </div>
              )}

            </div>

            {/* PROFILE */}

            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 transition hover:bg-slate-50 sm:px-3"
              title="Open Profile"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "U"}
              </div>

              <div className="hidden text-left sm:block">

                <p className="text-sm font-semibold text-slate-800">
                  {user?.name || "User"}
                </p>

                <p className="text-xs text-slate-400">
                  Wellness Member
                </p>

              </div>

            </button>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:block"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ================= WELCOME HEADER ================= */}

        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* GREETING */}

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">

            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>

              <p className="text-sm font-semibold text-indigo-600">
                Your personal wellness space
              </p>

            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Good to see you,{" "}
              {user.name.split(" ")[0]} 👋
            </h2>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
              Take a moment for yourself.
              Check in with your mood, reflect,
              or talk with your AI companion.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                to="/mood"
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                😊 Check-in
              </Link>

              <Link
                to="/companion"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                🤖 Talk to AI
              </Link>

              <Link
                to="/journal"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                📖 Write Journal
              </Link>

            </div>

          </div>

          {/* DAILY REFLECTION */}

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-7 text-white shadow-sm">

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10"></div>

            <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/10"></div>

            <div className="relative">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm">
                💭
              </div>

              <p className="mt-5 text-sm font-medium text-indigo-100">
                Daily reflection
              </p>

              <p className="mt-3 text-lg font-semibold leading-7">
                “Small steps every day can
                lead to meaningful change.”
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm text-indigo-100">
                <span>🌱</span>
                <span>
                  Take it one step at a time.
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="grid gap-5 md:grid-cols-3">

          <Link
            to="/companion"
            className="group rounded-3xl bg-indigo-600 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
              💬
            </div>

            <h3 className="mt-5 text-xl font-bold">
              AI Companion
            </h3>

            <p className="mt-2 text-sm leading-6 text-indigo-100">
              Talk, reflect, and share
              what's on your mind.
            </p>

            <div className="mt-5 text-sm font-semibold">
              Start conversation →
            </div>

          </Link>

          <Link
            to="/mood"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
              😊
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Mood Check-in
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Record how you're feeling and
              understand your patterns.
            </p>

            <div className="mt-5 text-sm font-semibold text-indigo-600">
              Check in →
            </div>

          </Link>

          <Link
            to="/journal"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
              ✍️
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              AI Journal
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Write freely and turn your
              reflections into insights.
            </p>

            <div className="mt-5 text-sm font-semibold text-indigo-600">
              Write today →
            </div>

          </Link>

        </section>

        {/* ================= MOOD TREND ================= */}

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-900">
              Your Mood Journey
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track how your mood has changed
              over your recent check-ins.
            </p>

          </div>

          {moodTrend.length === 0 ? (

            <div className="flex min-h-[280px] items-center justify-center text-center">

              <div>

                <p className="text-lg font-semibold text-slate-700">
                  No mood data yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Start checking in to see your
                  mood journey here.
                </p>

              </div>

            </div>

          ) : (

            <div className="h-[320px] w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={moodTrend}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(
                        date
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                        }
                      )
                    }
                  />

                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(value) => {
                      const labels = {
                        1: "Very Sad",
                        2: "Low",
                        3: "Okay",
                        4: "Happy",
                        5: "Very Happy",
                      };

                      return labels[value];
                    }}
                  />

                  <Tooltip
                    labelFormatter={(date) =>
                      new Date(
                        date
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    }
                    formatter={(
                      value,
                      name,
                      props
                    ) => [
                      props.payload.mood,
                      "Mood",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

        {/* ================= MOOD DISTRIBUTION ================= */}

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-900">
              Mood Distribution
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              See how your moods have been distributed
              across your check-ins.
            </p>

          </div>

          {Object.keys(
            moodStats.moodCounts || {}
          ).length === 0 ? (

            <div className="flex min-h-[350px] items-center justify-center text-center">

              <div>

                <div className="text-4xl">
                  📊
                </div>

                <p className="mt-4 text-lg font-semibold text-slate-700">
                  No mood data yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Complete a mood check-in to see
                  your mood distribution.
                </p>

                <Link
                  to="/mood"
                  className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Check in now →
                </Link>

              </div>

            </div>

          ) : (

            <div className="h-[350px] w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={Object.entries(
                      moodStats.moodCounts
                    ).map(
                      ([mood, count]) => ({
                        name: mood
                          .replace("-", " ")
                          .replace(
                            /\b\w/g,
                            (letter) =>
                              letter.toUpperCase()
                          ),
                        value: count,
                      })
                    )}
                    cx="50%"
                    cy="45%"
                    outerRadius={105}
                    innerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({
                      name,
                      percent,
                    }) =>
                      `${name} ${(
                        percent * 100
                      ).toFixed(0)}%`
                    }
                    labelLine={true}
                  >

                    {Object.entries(
                      moodStats.moodCounts
                    ).map(
                      ([mood], index) => (
                        <Cell
                          key={`mood-${mood}`}
                          fill={
                            moodColors[
                              index %
                                moodColors.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

        {/* ================= AI WELLNESS INSIGHTS ================= */}

        <div className="mt-8 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
              🧠
            </div>

            <div className="flex-1">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-2">

                  <h2 className="text-xl font-bold text-slate-900">
                    AI Wellness Insight
                  </h2>

                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    AI
                  </span>

                </div>

                <button
                  type="button"
                  onClick={
                    fetchWellnessInsight
                  }
                  disabled={loadingInsight}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingInsight
                    ? "Thinking..."
                    : "↻ Refresh"}
                </button>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                A gentle reflection based on
                your recent check-ins.
              </p>

              {loadingInsight ? (

                <div className="mt-5 animate-pulse">

                  <div className="h-4 w-3/4 rounded bg-slate-200"></div>

                  <div className="mt-3 h-4 w-full rounded bg-slate-200"></div>

                  <div className="mt-3 h-4 w-2/3 rounded bg-slate-200"></div>

                </div>

              ) : (

                <div className="mt-5 rounded-2xl bg-white/80 p-5">

                  <p className="text-sm leading-7 text-slate-700">
                    {wellnessInsight ||
                      "Take a moment to check in with yourself today. Your wellness journey starts with small, consistent steps."}
                  </p>

                </div>

              )}

              <p className="mt-4 text-xs text-slate-400">
                Wellness support only — not a
                medical diagnosis or professional
                treatment.
              </p>

            </div>

          </div>

        </div>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="mt-8">

          <div className="mb-5">

            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose how you'd like to take care
              of yourself today.
            </p>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* MOOD */}

            <Link
              to="/mood"
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            >

              <div className="flex items-start justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  😊
                </div>

                <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600">
                  →
                </span>

              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Check your mood
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Take a quick moment to record
                how you're feeling today.
              </p>

            </Link>

            {/* AI COMPANION */}

            <Link
              to="/companion"
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
            >

              <div className="flex items-start justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
                  🤖
                </div>

                <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-purple-600">
                  →
                </span>

              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Talk to AI Companion
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Share what's on your mind and
                have a supportive conversation.
              </p>

            </Link>

            {/* JOURNAL */}

            <Link
              to="/journal"
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >

              <div className="flex items-start justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                  📖
                </div>

                <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600">
                  →
                </span>

              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Write a journal
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Reflect on your day and turn your
                thoughts into meaningful insights.
              </p>

            </Link>

          </div>

        </section>

        {/* ================= OVERVIEW ================= */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL CHECK-INS */}

          <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Check-ins
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {loadingStats
                    ? "..."
                    : moodStats.total}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                😊
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Keep checking in with yourself.
            </p>

          </div>

          {/* JOURNAL ENTRIES */}

          <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Journal Entries
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {loadingStats
                    ? "..."
                    : journalCount}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                📖
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Your reflections are growing.
            </p>

          </div>

          {/* WELLNESS STREAK */}

          <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Wellness Streak
                </p>

                <div className="mt-3 flex items-baseline gap-2">

                  <span className="text-3xl font-bold text-slate-900">
                    {loadingStats
                      ? "..."
                      : streak}
                  </span>

                  <span className="text-sm text-slate-500">
                    days
                  </span>

                </div>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                🔥
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              {streak > 0
                ? "Keep going! You're doing great."
                : "Start your first check-in today."}
            </p>

          </div>

          {/* CURRENT MOOD */}

          <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Current Mood
                </p>

                <p className="mt-3 text-2xl font-bold capitalize text-slate-900">
                  {latestMood
                    ? latestMood.replace(
                        "-",
                        " "
                      )
                    : "Not checked in"}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
                {getMoodIcon(latestMood)}
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              {latestMood
                ? "Your latest mood check-in."
                : "How are you feeling today?"}
            </p>

          </div>

        </section>

        {/* ================= WELLNESS SECTION ================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <p className="text-sm font-medium text-indigo-600">
                Today's focus
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                Small steps matter.
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Your MindCare journey is about
                understanding yourself, building
                healthy habits, and taking one
                step at a time.
              </p>

            </div>

            <Link
              to="/mood"
              className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start today's check-in
            </Link>

          </div>

        </section>

        {/* ================= SAFETY ================= */}

        <section className="mt-8 rounded-3xl border border-rose-100 bg-rose-50 p-6">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl">
              🛟
            </div>

            <div>

              <h3 className="font-bold text-slate-900">
                You're not alone
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                MindCare AI is a wellness
                companion, not a doctor or
                emergency service. If you're in
                immediate danger or experiencing
                a crisis, please contact local
                emergency services or a trusted
                person who can help.
              </p>

            </div>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-500">
          © 2026 MindCare AI · Built for mindful living
        </div>

      </footer>

    </div>
  );
}

export default Dashboard;