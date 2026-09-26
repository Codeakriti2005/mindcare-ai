import { Link } from "react-router-dom";

function WelcomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= NAVBAR ================= */}

      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl text-white shadow-md">
              🧠
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                MindCare AI
              </h1>

              <p className="hidden text-xs text-slate-400 sm:block">
                Your wellness companion
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>

        </div>
      </nav>


      {/* ================= HERO ================= */}

      <main>

        <section className="relative overflow-hidden">

          {/* Background decoration */}

          <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl"></div>

          <div className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl"></div>


          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">

            {/* LEFT */}

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                AI-powered wellness support
              </div>


              <h2 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">

                A calmer space for
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  your everyday mind.
                </span>

              </h2>


              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">

                MindCare AI helps you reflect, track your mood, journal
                your thoughts, and have supportive conversations with an
                AI wellness companion — all in one private space.

              </p>


              {/* CTA */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/register"
                  className="rounded-2xl bg-indigo-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
                >
                  Start Your Journey →
                </Link>

                <Link
                  to="/login"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  I already have an account
                </Link>

              </div>


              {/* Trust points */}

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">

                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  Private personal space
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  AI-powered insights
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  Free to use
                </div>

              </div>

            </div>


            {/* RIGHT VISUAL */}

            <div className="relative">

              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-2xl"></div>


              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/60 sm:p-7">

                {/* Window header */}

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">

                  <div className="flex items-center gap-2">

                    <div className="h-3 w-3 rounded-full bg-red-300"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-300"></div>
                    <div className="h-3 w-3 rounded-full bg-green-300"></div>

                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    MindCare AI
                  </span>

                </div>


                {/* Dashboard preview */}

                <div className="mt-6">

                  <p className="text-sm font-semibold text-indigo-600">
                    Your wellness space
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    How are you feeling today?
                  </h3>


                  {/* Mood cards */}

                  <div className="mt-6 grid grid-cols-5 gap-2">

                    {[
                      ["😢", "Very Sad"],
                      ["😔", "Sad"],
                      ["😐", "Okay"],
                      ["😊", "Happy"],
                      ["🤩", "Great"],
                    ].map(([emoji, label]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-2 text-center"
                      >
                        <div className="text-xl sm:text-2xl">
                          {emoji}
                        </div>

                        <p className="mt-1 text-[9px] font-medium text-slate-400 sm:text-[10px]">
                          {label}
                        </p>
                      </div>
                    ))}

                  </div>


                  {/* AI insight */}

                  <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                        🧠
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          AI Wellness Insight
                        </p>

                        <p className="text-xs text-slate-400">
                          Gentle reflection
                        </p>
                      </div>

                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      Small moments of reflection can help you understand
                      your emotions and build healthier daily habits.
                    </p>

                  </div>


                  {/* Stats */}

                  <div className="mt-5 grid grid-cols-3 gap-3">

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        Check-ins
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-800">
                        12
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        Journals
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-800">
                        8
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        Streak
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-800">
                        🔥 5
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= FEATURES ================= */}

        <section className="border-y border-slate-200 bg-white">

          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                Everything in one place
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built around your wellness journey
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                Tools designed to help you reflect, understand patterns,
                and build healthier everyday habits.
              </p>

            </div>


            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {[
                {
                  icon: "🤖",
                  title: "AI Companion",
                  text: "Have supportive conversations and share what's on your mind.",
                },
                {
                  icon: "😊",
                  title: "Mood Tracking",
                  text: "Record your mood and understand your emotional patterns over time.",
                },
                {
                  icon: "📖",
                  title: "AI Journal",
                  text: "Write freely and receive gentle AI-powered reflections.",
                },
                {
                  icon: "📊",
                  title: "Wellness Analytics",
                  text: "Visualize mood trends, check-ins, journals and personal progress.",
                },
                {
                  icon: "🔔",
                  title: "Smart Notifications",
                  text: "Stay aware of journal updates, milestones and wellness activities.",
                },
                {
                  icon: "🛟",
                  title: "Safety Support",
                  text: "Safety-aware responses encourage real-world support when needed.",
                },
              ].map((feature) => (

                <div
                  key={feature.title}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-lg"
                >

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    {feature.icon}
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.text}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* ================= PRIVACY / SAFETY ================= */}

        <section className="bg-slate-50">

          <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-6 lg:px-8">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
              🔒
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">
              Your wellness space should feel safe
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              MindCare AI is designed as a wellness support companion.
              Your personal experience is separated by your account,
              while safety-aware features encourage appropriate real-world
              support when necessary.
            </p>

            <p className="mx-auto mt-5 max-w-2xl rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs leading-6 text-slate-600">
              MindCare AI is not a doctor, therapist or emergency service,
              and it does not replace professional medical or mental health
              care. If you are in immediate danger, contact your local
              emergency service or a qualified professional.
            </p>

          </div>

        </section>


        {/* ================= FINAL CTA ================= */}

        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700">

          <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-6 lg:px-8">

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Start taking a moment for yourself.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
              Check in with your mood, write your thoughts, or simply
              start a conversation.
            </p>

            <Link
              to="/register"
              className="mt-8 inline-flex rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Create Your Free Account →
            </Link>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-center text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between md:text-left lg:px-8">

          <p>
            © 2026 MindCare AI
          </p>

          <p>
            Built for mindful living 🧠
          </p>

        </div>

      </footer>

    </div>
  );
}

export default WelcomePage;