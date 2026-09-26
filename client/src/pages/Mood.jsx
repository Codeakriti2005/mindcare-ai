import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const moods = [
  {
    value: "very-happy",
    emoji: "😄",
    label: "Very Happy",
  },
  {
    value: "happy",
    emoji: "😊",
    label: "Happy",
  },
  {
    value: "okay",
    emoji: "🙂",
    label: "Okay",
  },
  {
    value: "sad",
    emoji: "😔",
    label: "Sad",
  },
  {
    value: "very-sad",
    emoji: "😢",
    label: "Very Sad",
  },
  {
    value: "angry",
    emoji: "😡",
    label: "Angry",
  },
  {
    value: "anxious",
    emoji: "😰",
    label: "Anxious",
  },
  {
    value: "stressed",
    emoji: "😣",
    label: "Stressed",
  },
];

function Mood() {
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);
  const [selectedCalendarEntry, setSelectedCalendarEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const getStreakData = () => {
  if (!history.length) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalCheckIns: 0,
    };
  }

  const uniqueDates = [
    ...new Set(
      history.map((item) => {
        const date = new Date(item.createdAt);

        return `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`;
      })
    ),
  ];

  const sortedDates = uniqueDates
    .map((date) => new Date(`${date}T00:00:00`))
    .sort((a, b) => b - a);

  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      streak = 1;
    } else {
      const difference =
        (sortedDates[i - 1] - sortedDates[i]) /
        (1000 * 60 * 60 * 24);

      if (difference === 1) {
        streak++;
      } else {
        streak = 1;
      }
    }

    bestStreak = Math.max(bestStreak, streak);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latestDate = sortedDates[0];
  const daysSinceLatest =
    (today - latestDate) /
    (1000 * 60 * 60 * 24);

  if (daysSinceLatest <= 1) {
    currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const difference =
        (sortedDates[i - 1] - sortedDates[i]) /
        (1000 * 60 * 60 * 24);

      if (difference === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    bestStreak,
    totalCheckIns: history.length,
  };
};

const streakData = getStreakData();

  const token = localStorage.getItem("token");

  // ================= MOOD SUMMARY =================

const today = new Date();

const todayEntries = history.filter((item) => {
  const date = new Date(item.createdAt);

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
});

const weekAgo = new Date();
weekAgo.setDate(today.getDate() - 7);

const weekEntries = history.filter(
  (item) => new Date(item.createdAt) >= weekAgo
);

const moodCounts = history.reduce((acc, item) => {
  acc[item.mood] = (acc[item.mood] || 0) + 1;
  return acc;
}, {});

const mostFrequentMoodValue =
  Object.keys(moodCounts).length > 0
    ? Object.keys(moodCounts).reduce((a, b) =>
        moodCounts[a] > moodCounts[b] ? a : b
      )
    : null;

const mostFrequentMood = moods.find(
  (item) => item.value === mostFrequentMoodValue
);

const todaysMood =
  todayEntries.length > 0
    ? moods.find(
        (item) => item.value === todayEntries[0].mood
      )
    : null;


// ================= MOOD STREAK =================

const getDateKey = (date) => {
  const currentDate = new Date(date);

  return `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(
    currentDate.getDate()
  ).padStart(2, "0")}`;
};

const uniqueMoodDates = [
  ...new Set(history.map((item) => getDateKey(item.createdAt))),
].sort((a, b) => new Date(b) - new Date(a));

let currentStreak = 0;

if (uniqueMoodDates.length > 0) {
  const todayKey = getDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday);

  if (
    uniqueMoodDates[0] === todayKey ||
    uniqueMoodDates[0] === yesterdayKey
  ) {
    currentStreak = 1;

    for (let i = 1; i < uniqueMoodDates.length; i++) {
      const previousDate = new Date(uniqueMoodDates[i - 1]);
      const currentDate = new Date(uniqueMoodDates[i]);

      const difference =
        (previousDate - currentDate) /
        (1000 * 60 * 60 * 24);

      if (difference === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
}

let longestStreak = 0;
let runningStreak = 0;

for (let i = 0; i < uniqueMoodDates.length; i++) {
  if (i === 0) {
    runningStreak = 1;
  } else {
    const previousDate = new Date(uniqueMoodDates[i - 1]);
    const currentDate = new Date(uniqueMoodDates[i]);

    const difference =
      (previousDate - currentDate) /
      (1000 * 60 * 60 * 24);

    if (difference === 1) {
      runningStreak++;
    } else {
      runningStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, runningStreak);
}

  // ================= FETCH MOOD HISTORY =================

  const fetchMoodHistory = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/moods",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
  setHistory(Array.isArray(data) ? data : data.moods || []);
}
    } catch (error) {
      console.error("Unable to fetch mood history:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMoodHistory();
    }
  }, [token]);

  // ================= SAVE MOOD =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMood) {
      setMessage("Please select your mood first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/moods",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            mood: selectedMood,
            note,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save mood.");
        setLoading(false);
        return;
      }

      setMessage("Mood saved successfully 💙");
      setSelectedMood("");
      setNote("");

      fetchMoodHistory();
    } catch (error) {
      setMessage("Server connection failed.");
    }

    setLoading(false);
  };
  // ================= DELETE MOOD =================

const handleDeleteMood = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this mood entry?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/moods/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Unable to delete mood.");
      return;
    }

    setMessage("Mood entry deleted successfully 🗑️");

    setHistory((previousHistory) =>
      previousHistory.filter((item) => item._id !== id)
    );
  } catch (error) {
    console.error("Delete mood error:", error);
    setMessage("Unable to connect to the server.");
  }
};
// ================= MOOD CALENDAR =================

const [calendarDate, setCalendarDate] = useState(new Date());

const calendarYear = calendarDate.getFullYear();
const calendarMonth = calendarDate.getMonth();

const firstDayOfMonth = new Date(
  calendarYear,
  calendarMonth,
  1
).getDay();

const daysInMonth = new Date(
  calendarYear,
  calendarMonth + 1,
  0
).getDate();

const previousMonth = () => {
  setCalendarDate(
    new Date(calendarYear, calendarMonth - 1, 1)
  );
};

const nextMonth = () => {
  setCalendarDate(
    new Date(calendarYear, calendarMonth + 1, 1)
  );
};

const getMoodForDate = (day) => {
  return history.find((item) => {
    const date = new Date(item.createdAt);

    return (
      date.getDate() === day &&
      date.getMonth() === calendarMonth &&
      date.getFullYear() === calendarYear
    );
  });
};

const monthName = calendarDate.toLocaleDateString(
  "en-US",
  {
    month: "long",
    year: "numeric",
  }
);
  // ================= UI =================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
              🧠
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                MindCare AI
              </h1>

              <p className="text-xs text-slate-500">
                Mood Tracker
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            ← Dashboard
          </Link>

        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-indigo-600">
            Daily Check-in
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            How are you feeling today?
          </h2>

          <p className="mt-2 max-w-2xl text-slate-500">
            There is no right or wrong answer. Take a moment to
            check in with yourself.
          </p>

        </div>

        {/* ================= MOOD SUMMARY ================= */}

<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

  {/* TOTAL CHECK-INS */}

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">
        Total Check-ins
      </span>

      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
        📊
      </span>
    </div>

    <p className="mt-4 text-3xl font-bold text-slate-900">
      {history.length}
    </p>

    <p className="mt-1 text-xs text-slate-400">
      All-time mood entries
    </p>

  </div>


  {/* TODAY'S MOOD */}

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">
        Today's Mood
      </span>

      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
        🌤️
      </span>
    </div>

    <p className="mt-4 text-2xl font-bold text-slate-900">
      {todaysMood
        ? `${todaysMood.emoji} ${todaysMood.label}`
        : "Not checked in"}
    </p>

    <p className="mt-1 text-xs text-slate-400">
      Your latest check-in today
    </p>

  </div>


  {/* THIS WEEK */}

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">
        This Week
      </span>

      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-xl">
        📅
      </span>
    </div>

    <p className="mt-4 text-3xl font-bold text-slate-900">
      {weekEntries.length}
    </p>

    <p className="mt-1 text-xs text-slate-400">
      Check-ins in the last 7 days
    </p>

  </div>


  {/* MOST FREQUENT */}

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">
        Most Frequent
      </span>

      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl">
        💭
      </span>
    </div>

    <p className="mt-4 text-2xl font-bold text-slate-900">
      {mostFrequentMood
        ? `${mostFrequentMood.emoji} ${mostFrequentMood.label}`
        : "No data"}
    </p>

    <p className="mt-1 text-xs text-slate-400">
      Based on your mood history
    </p>

  </div>

</div>

{/* ================= STREAK ================= */}

<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

  {/* CURRENT STREAK */}

  <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">

    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">
        Current Streak
      </span>

      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-xl">
        🔥
      </span>
    </div>

    <p className="mt-4 text-3xl font-bold text-slate-900">
      {currentStreak}
      <span className="ml-1 text-base font-medium text-slate-400">
        {currentStreak === 1 ? "day" : "days"}
      </span>
    </p>

    <p className="mt-1 text-xs text-slate-400">
      Consecutive check-in days
    </p>

  </div>


  {/* BEST STREAK */}

  <div className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm">

    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">
        Best Streak
      </span>

      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-xl">
        🏆
      </span>
    </div>

    <p className="mt-4 text-3xl font-bold text-slate-900">
      {longestStreak}
      <span className="ml-1 text-base font-medium text-slate-400">
        {longestStreak === 1 ? "day" : "days"}
      </span>
    </p>

    <p className="mt-1 text-xs text-slate-400">
      Your longest check-in streak
    </p>

  </div>


  {/* KEEP GOING */}

  <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">

    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">
        Keep Going
      </span>

      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
        🌱
      </span>
    </div>

    <p className="mt-4 text-base font-bold text-slate-900">
      {currentStreak >= 7
        ? "Amazing consistency!"
        : currentStreak >= 3
        ? "You're building a habit!"
        : "Every check-in counts."}
    </p>

    <p className="mt-1 text-xs leading-5 text-slate-400">
      Take a moment to check in whenever it feels useful.
    </p>

  </div>

</div>

{/* ================= MOOD CALENDAR ================= */}

<section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

  <div className="flex items-center justify-between">

    <div>
      <p className="text-sm font-semibold text-indigo-600">
        Mood Calendar
      </p>

      <h3 className="mt-1 text-xl font-bold text-slate-900">
        {monthName}
      </h3>
    </div>

    <div className="flex gap-2">

      <button
        type="button"
        onClick={previousMonth}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
        aria-label="Previous month"
      >
        ←
      </button>

      <button
        type="button"
        onClick={nextMonth}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
        aria-label="Next month"
      >
        →
      </button>

    </div>

  </div>

  <div className="mt-6 grid grid-cols-7 gap-2">

    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (day) => (
        <div
          key={day}
          className="py-2 text-center text-xs font-semibold text-slate-400"
        >
          {day}
        </div>
      )
    )}

  </div>

  <div className="grid grid-cols-7 gap-2">

    {Array.from({
      length: firstDayOfMonth,
    }).map((_, index) => (
      <div
        key={`empty-${index}`}
        className="min-h-14 rounded-xl"
      />
    ))}

    {Array.from({
      length: daysInMonth,
    }).map((_, index) => {

      const day = index + 1;

      const moodEntry = getMoodForDate(day);

      const mood = moodEntry
        ? moods.find(
            (item) => item.value === moodEntry.mood
          )
        : null;

      const today = new Date();

      const isToday =
        day === today.getDate() &&
        calendarMonth === today.getMonth() &&
        calendarYear === today.getFullYear();

      return (
        <div
          key={day}
          onClick={() => {
            if (moodEntry) {
              setSelectedCalendarEntry(moodEntry);
       }
          }}
          className={`min-h-14 cursor-pointer rounded-xl border p-2 text-center transition ${
            isToday
              ? "border-indigo-400 bg-indigo-50"
              : "border-slate-100 bg-slate-50"
          }`}
        >

          <p
            className={`text-xs font-semibold ${
              isToday
                ? "text-indigo-600"
                : "text-slate-500"
            }`}
          >
            {day}
          </p>

          {mood ? (
            <div
              className="mt-1 text-xl"
              title={mood.label}
            >
              {mood.emoji}
            </div>
          ) : (
            <div className="mt-1 text-sm text-slate-200">
              •
            </div>
          )}

        </div>
      );
    })}

  </div>

  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500">

    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-indigo-100" />
      Today
    </div>

    <div>
      😊 Mood logged
    </div>

    <div>
      • No check-in
    </div>

  </div>

</section>
{/* ================= SELECTED DATE DETAILS ================= */}

{selectedCalendarEntry && (
  <section className="mb-8 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm sm:p-7">

    <div className="flex items-start justify-between gap-4">

      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Mood Details
        </p>

        <h3 className="mt-1 text-xl font-bold text-slate-900">
          {new Date(
            selectedCalendarEntry.createdAt
          ).toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h3>
      </div>

      <button
        type="button"
        onClick={() => setSelectedCalendarEntry(null)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
        aria-label="Close mood details"
      >
        ✕
      </button>

    </div>

    <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white bg-white p-4">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
        {
          moods.find(
            (item) =>
              item.value === selectedCalendarEntry.mood
          )?.emoji
        }
      </div>

      <div>
        <p className="text-lg font-bold text-slate-900">
          {
            moods.find(
              (item) =>
                item.value === selectedCalendarEntry.mood
            )?.label
          }
        </p>

        <p className="text-sm text-slate-500">
          Logged at{" "}
          {new Date(
            selectedCalendarEntry.createdAt
          ).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>

    </div>

    {selectedCalendarEntry.note && (
      <div className="mt-4 rounded-2xl border border-white bg-white p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Note
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {selectedCalendarEntry.note}
        </p>

      </div>
    )}

  </section>
)}

        <div className="grid gap-8 lg:grid-cols-3">

          {/* ================= MOOD FORM ================= */}

          <section className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

            <form onSubmit={handleSubmit}>

              <h3 className="text-lg font-bold text-slate-900">
                Select your mood
              </h3>

              {/* MOODS */}

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

                {moods.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setSelectedMood(item.value)
                    }
                    className={`rounded-2xl border p-4 text-center transition ${
                      selectedMood === item.value
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                        : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >

                    <div className="text-3xl">
                      {item.emoji}
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {item.label}
                    </p>

                  </button>
                ))}

              </div>

              {/* NOTE */}

              <div className="mt-7">

                <label className="text-sm font-semibold text-slate-700">
                  Want to share more?{" "}
                  <span className="font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  rows={5}
                  placeholder="Write a few thoughts about how you're feeling..."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {note.length}/500
                </p>

              </div>

              {/* MESSAGE */}

              {message && (
                <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
                  {message}
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Saving..."
                  : "Save My Mood 💙"}
              </button>

            </form>

          </section>

          {/* ================= INFO CARD ================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
              🌱
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Why check in?
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Regular mood check-ins can help you notice patterns
              in how you feel over time.
            </p>

            <div className="mt-6 space-y-4">

              <div className="flex gap-3">
                <span>🔎</span>
                <p className="text-sm text-slate-600">
                  Understand your emotional patterns
                </p>
              </div>

              <div className="flex gap-3">
                <span>📈</span>
                <p className="text-sm text-slate-600">
                  Track changes over time
                </p>
              </div>

              <div className="flex gap-3">
                <span>💡</span>
                <p className="text-sm text-slate-600">
                  Build better self-awareness
                </p>
              </div>

            </div>

          </section>

        </div>

        {/* ================= WELLNESS STREAK ================= */}

<section className="mb-8 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm sm:p-7">
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-sm font-semibold text-indigo-600">
        Your Wellness Journey
      </p>

      <h3 className="mt-1 text-2xl font-bold text-slate-900">
        Keep showing up for yourself 💙
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Small daily check-ins can help you understand your emotional patterns.
      </p>
    </div>

    <div className="text-4xl">
      🔥
    </div>
  </div>

  {/* STATS */}

  <div className="mt-6 grid gap-4 sm:grid-cols-3">

    {/* CURRENT STREAK */}

    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
          🔥
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Current Streak
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {streakData.currentStreak}
            <span className="ml-1 text-sm font-medium text-slate-400">
              days
            </span>
          </p>
        </div>
      </div>
    </div>

    {/* TOTAL CHECK-INS */}

    <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
          📅
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Check-ins
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {streakData.totalCheckIns}
          </p>
        </div>
      </div>
    </div>

    {/* BEST STREAK */}

    <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl">
          🏆
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Best Streak
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {streakData.bestStreak}
            <span className="ml-1 text-sm font-medium text-slate-400">
              days
            </span>
          </p>
        </div>
      </div>
    </div>

  </div>

  {/* MOTIVATION */}

  <div className="mt-5 rounded-2xl border border-white bg-white/70 px-4 py-3">
    <p className="text-sm text-slate-600">
      {streakData.currentStreak === 0
        ? "Start your wellness journey with a mood check-in today 🌱"
        : streakData.currentStreak === 1
        ? "Great start! Come back tomorrow and keep your streak going 🌱"
        : streakData.currentStreak < 7
        ? `You're on a ${streakData.currentStreak}-day streak. Keep going! 💪`
        : "Amazing consistency! You're building a strong self-awareness habit 🏆"}
    </p>
  </div>
</section>

        {/* ================= HISTORY ================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Recent Mood History
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your latest check-ins
              </p>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              {history.length} entries
            </span>

          </div>

          {history.length === 0 ? (

            <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center">

              <div className="text-4xl">
                🌿
              </div>

              <p className="mt-3 font-semibold text-slate-700">
                No mood entries yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Your check-ins will appear here.
              </p>

            </div>

          ) : (

            <div className="mt-6 space-y-4">
  {history.map((item) => {
    const mood = moods.find(
      (m) => m.value === item.mood
    );

    return (
      <div
        key={item._id}
        className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        {/* LEFT SIDE */}
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
            {mood?.emoji || "🙂"}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-800">
                {mood?.label || item.mood}
              </p>

              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
                Mood check-in
              </span>
            </div>

            {item.note ? (
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {item.note}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-400">
                No note added
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-600">
              {new Date(item.createdAt).toLocaleDateString(
                "en-US",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )}
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              {new Date(item.createdAt).toLocaleTimeString(
                "en-US",
                {
                  hour: "numeric",
                  minute: "2-digit",
                }
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleDeleteMood(item._id)}
            className="rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
            title="Delete mood entry"
          >
            🗑️
          </button>
        </div>
      </div>
    );
  })}
</div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Mood;