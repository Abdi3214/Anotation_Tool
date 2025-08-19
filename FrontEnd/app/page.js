"use client"
import Link from "next/link"

function Home() {
  return (
    <div className="space-y-32 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden px-6 py-32 sm:py-40 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.100),transparent)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.950),transparent)] opacity-60 animate-pulse" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 shadow-2xl ring-1 ring-blue-100 dark:ring-blue-800 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center transition-all duration-700 hover:skew-x-[-25deg]" />

        <div className="mx-auto max-w-2xl lg:max-w-4xl relative z-10">
          <figure className="mt-10 space-y-8 text-center">
            <blockquote className="transform transition-all duration-1000 hover:scale-105">
              <p className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent leading-tight animate-gradient bg-300% animate-pulse">
                Your Translation Annotation Companion
              </p>
            </blockquote>
            <blockquote className="transform transition-all duration-700 delay-300">
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed max-w-3xl mx-auto">
                Easily review, rate, and improve machine-translated content in your language pair with our intuitive
                platform.
              </p>
            </blockquote>
            <Link
              href="/login"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 mt-8 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 relative overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
          </figure>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to streamline your translation annotation workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Intuitive Interface",
                desc: "Review translations with checkboxes, ratings, and in-line comments in a clean, user-friendly environment.",
                icon: "🎯",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                title: "Easy Navigation",
                desc: "Move quickly through assigned texts with Save, Skip, and smart keyboard shortcuts for efficiency.",
                icon: "⚡",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                title: "Export Ready",
                desc: "Download all annotations for model feedback or academic analysis in multiple formats.",
                icon: "📊",
                gradient: "from-green-500 to-emerald-500",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`group relative p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 ${
                  idx === 1 ? "md:-mt-8" : ""
                }`}
                style={{
                  animationDelay: `${idx * 200}ms`,
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}
                />

                <div className="relative z-10 text-center">
                  <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-12 rounded-3xl shadow-2xl text-center bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 border border-gray-200 dark:border-gray-700 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5 animate-gradient bg-300%" />

            <div className="relative z-10">
              <h3 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                How It Works
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
                Get started with our streamlined annotation process in just five simple steps
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-4xl mx-auto">
                {[
                  { step: 1, text: "Login to your dashboard", icon: "🔐" },
                  { step: 2, text: "View source and translated text pairs", icon: "📝" },
                  { step: 3, text: "Check for issues: Omission, Addition, Mistranslation, Untranslation", icon: "🔍" },
                  { step: 4, text: "Rate the translation and leave comments", icon: "⭐" },
                  { step: 5, text: "Save or submit your annotations", icon: "✅" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 transition-all duration-500 hover:scale-105 hover:shadow-xl"
                    style={{
                      animationDelay: `${idx * 100}ms`,
                    }}
                  >
                    <div className="text-3xl mb-3 transform transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{item.step}</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function LandPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 text-gray-800 dark:text-gray-100 transition-colors duration-500">
      {/* Navbar */}
      <header className="w-full border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto h-20 px-6 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              A
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Annotation Tool
            </span>
          </Link>

          <nav className="flex items-center gap-8 text-base font-medium">
            <a
              href="#features"
              className="relative group text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="#how-it-works"
              className="relative group text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
            >
              How it Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
            </a>
            <Link
              href="/login"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Home />
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 dark:text-gray-400 py-8 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm">© {new Date().getFullYear()} Annotation Tool. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
