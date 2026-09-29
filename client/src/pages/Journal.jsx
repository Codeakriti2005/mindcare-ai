import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api";

function Journal() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);

  // ================= JOURNAL STATS =================

  const totalEntries = journals.length;

  const totalWords = journals.reduce((total, journal) => {
    return (
      total +
      journal.content.trim().split(/\s+/).filter(Boolean).length
    );
  }, 0);

  const latestEntry =
    journals.length > 0
      ? new Date(journals[0].createdAt).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "No entries yet";

  const aiInsightStatus =
    journals.length > 0 ? "Ready" : "Waiting";

  const filteredJournals = journals.filter((journal) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      (journal.title || "").toLowerCase().includes(search) ||
      (journal.content || "").toLowerCase().includes(search) ||
      (journal.sentiment || "").toLowerCase().includes(search)
    );
  });

  const token = localStorage.getItem("token");

  // ================= FETCH JOURNALS =================

  const fetchJournals = async () => {
    try {
      const data = await apiRequest("/journals");

      if (data) {
        setJournals(data.journals || []);
      }
    } catch (error) {
      console.error("Journal fetch error:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchJournals();
    }
  }, [token]);

  // ================= SAVE JOURNAL =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setMessage("Please write something before saving.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await apiRequest("/journals", {
        method: "POST",

        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (!data) {
        setLoading(false);
        return;
      }

      setMessage("Journal saved successfully 💙");
      setTitle("");
      setContent("");

      fetchJournals();
    } catch (error) {
      setMessage(error.message || "Server connection failed.");
    }

    setLoading(false);
  };

  // ================= DELETE JOURNAL =================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this journal entry?"
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/journals/${id}`, {
        method: "DELETE",
      });

      setJournals((previous) =>
        previous.filter((journal) => journal._id !== id)
      );
    } catch (error) {
      setMessage(error.message || "Server connection failed.");
    }
  };

  // ================= AI JOURNAL INSIGHT =================

  const handleGenerateInsight = async (journal) => {
    try {
      setInsightLoading(true);
      setSelectedInsight(null);

      const data = await apiRequest(
        `/journals/${journal._id}/insight`
      );

      if (!data) {
        return;
      }

      setSelectedInsight({
        journalId: journal._id,
        title: journal.title || "My Journal",
        insight: data.insight,
      });
    } catch (error) {
      console.error("AI Insight Error:", error);
      setMessage(
        error.message || "Unable to connect to AI service."
      );
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= NAVBAR ================= */}

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
                AI Journal
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            Personal Reflection
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            What's on your mind?
          </h2>

          <p className="mt-2 max-w-2xl text-slate-500">
            Write freely. Your journal is a private space for
            thoughts, reflections, and everyday experiences.
          </p>
        </div>

        {/* ================= JOURNAL STATS ================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL ENTRIES */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total Entries
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalEntries}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                📖
              </div>
            </div>
          </div>

          {/* WORDS WRITTEN */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Words Written
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalWords}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
                ✍️
              </div>
            </div>
          </div>

          {/* LATEST ENTRY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Latest Entry
                </p>

                <p className="mt-2 truncate text-sm font-bold text-slate-900">
                  {latestEntry}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                📅
              </div>
            </div>
          </div>

          {/* AI INSIGHT */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  AI Insight
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {aiInsightStatus}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
                🤖
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ================= JOURNAL FORM ================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Title{" "}
                  <span className="font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="Give your reflection a title..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Your thoughts
                  </label>

                  <span className="text-xs text-slate-400">
                    {content.length}/5000
                  </span>
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={5000}
                  rows={12}
                  placeholder="Start writing here..."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-4 text-sm leading-7 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {message && (
                <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Saving..."
                  : "Save Journal Entry 💙"}
              </button>
            </form>
          </section>

          {/* ================= INFO ================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
              ✨
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Your private space
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Journaling can help you slow down, reflect, and
              understand your thoughts over time.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex gap-3">
                <span>🧘</span>
                <p className="text-sm text-slate-600">
                  Take a moment to pause
                </p>
              </div>

              <div className="flex gap-3">
                <span>📝</span>
                <p className="text-sm text-slate-600">
                  Put your thoughts into words
                </p>
              </div>

              <div className="flex gap-3">
                <span>🤖</span>
                <p className="text-sm text-slate-600">
                  AI insights will be available later
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs leading-5 text-slate-500">
                MindCare AI is a wellness companion and does not
                replace professional mental health care.
              </p>
            </div>
          </section>
        </div>

        {/* ================= AI INSIGHT RESULT ================= */}

        {selectedInsight && (
          <section className="mb-8 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  🤖
                </div>

                <div>
                  <p className="text-sm font-semibold text-indigo-600">
                    MindCare AI Reflection
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    {selectedInsight.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInsight(null)}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white hover:text-slate-600"
                title="Close insight"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-white/80 p-5">
              <p className="text-sm leading-7 text-slate-600">
                {selectedInsight.insight}
              </p>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              This reflection is generated by AI for wellness support and is
              not a diagnosis or substitute for professional mental health care.
            </p>
          </section>
        )}

        {/* ================= HISTORY ================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          {/* HISTORY HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Journal History
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your previous reflections
              </p>
            </div>

            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              {journals.length} entries
            </span>
          </div>

          {/* SEARCH */}

          <div className="mt-5">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔎 Search your journal entries..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* CONTENT */}

          {journals.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-10 text-center">
              <div className="text-4xl">📖</div>

              <p className="mt-3 font-semibold text-slate-700">
                Your journal is empty
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Your first reflection will appear here.
              </p>
            </div>
          ) : filteredJournals.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-10 text-center">
              <div className="text-4xl">🔎</div>

              <p className="mt-3 font-semibold text-slate-700">
                No matching entries
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try searching with a different word or phrase.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredJournals.map((journal) => (
                <article
                  key={journal._id}
                  className="group rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* ENTRY INFO */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900">
                          {journal.title || "My Journal"}
                        </h4>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                            journal.sentiment === "positive"
                              ? "bg-emerald-50 text-emerald-600"
                              : journal.sentiment === "negative"
                              ? "bg-rose-50 text-rose-600"
                              : journal.sentiment === "neutral"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {journal.sentiment === "positive"
                            ? "😊 Positive"
                            : journal.sentiment === "negative"
                            ? "😔 Negative"
                            : journal.sentiment === "neutral"
                            ? "😐 Neutral"
                            : "🤖 AI Pending"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(
                          journal.createdAt
                        ).toLocaleString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>

                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                        {journal.content}
                      </p>
                    </div>

                    {/* DELETE */}

                    <div className="flex flex-wrap gap-2">
                      {/* AI INSIGHT */}

                      <button
                        type="button"
                        onClick={() =>
                          handleGenerateInsight(journal)
                        }
                        disabled={insightLoading}
                        className="rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {insightLoading
                          ? "✨ Thinking..."
                          : "✨ AI Insight"}
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(journal._id)
                        }
                        className="rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                        title="Delete journal entry"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Journal;