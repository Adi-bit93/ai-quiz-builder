import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {

    const navigate = useNavigate();

  const categories = [
    { id: 1, title: "Science", icon: "🔬" },
    { id: 2, title: "History", icon: "🏺" },
    { id: 3, title: "Pop Culture", icon: "🎬" },
    { id: 4, title: "Technology", icon: "💻" },
    { id: 5, title: "Art / Gifts", icon: "🎨" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-slate-50 flex flex-col">
      {/* NAVBAR */}
      <header className="w-full py-6">
        <div className="max-w-7xl mx-auto px-6 py-2 rounded-md flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 ">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-pink-500 to-rose-400 flex items-center justify-center shadow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 8H9L12 2Z" fill="white" />
                  <path d="M12 22L9 16H15L12 22Z" fill="white" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900">QUIZIFY</div>
                <div className="text-xs text-slate-500 -mt-0.5">AI quiz builder</div>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-slate-600 hover:text-slate-900" href="#features">Home</a>
            <a className="text-slate-600 hover:text-slate-900" href="#categories">Categories</a>
            <a className="text-slate-600 hover:text-slate-900" href="#contact">Contact</a>
            <button className="ml-2 px-4 py-2 bg-pink-500 text-white rounded-xl shadow hover:brightness-95"
                onClick={() => navigate("/login")}>
              Sign Up
            </button>
          </nav>

          {/* mobile menu placeholder */}
          <div className="md:hidden">
            <button aria-label="open menu" className="p-2 rounded-lg text-slate-700">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* HERO + MONITOR MOCKUP */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Content */}
          <div className="lg:col-span-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              Challenge Your Mind. <br /> Play Smarter with AI Quizzes.
            </h1>

            <p className="mt-4 text-slate-600 max-w-xl">
              Play curated quizzes, create your own, host live leaderboard matches and track progress — all in one delightful experience.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-600 text-white font-medium shadow hover:opacity-95"
                onClick={() => navigate("/login")}
              >
                Explore Quizzes
              </button>

              <button
                className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-slate-200 text-white font-medium bg-gradient-to-br from-indigo-400 to-pink-400 hover:shadow"
                onClick={() => navigate("/login")}
              >
                Create Your Own
              </button>
            </div>

            {/* Featured categories */}
            <div id="categories" className="mt-10">
              <h3 className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-4">Featured Quiz Categories</h3>
              <div className="flex gap-3 flex-wrap">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xl">{cat.icon}</div>
                    <div className="text-sm font-medium text-slate-700">{cat.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: monitor mockup with screen */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="monitor-mockup w-[720px] max-w-full lg:mr-8">
              
              <div className="rounded-2xl overflow-hidden  bg-black/80 shadow-2xl transform scale-[0.95] md:scale-100">
                
                <div className="bg-gradient-to-b from-white to-slate-50 p-8 md:p-12">
                  
                  <div className="bg-white rounded-xl p-6 md:p-8 shadow-inner">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">Q</div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">javascript Quiz</div>
                          <div className="text-xs text-slate-400">Welcome, Rahul</div>
                        </div>
                      </div>
                      <div className="text-yellow-500 font-mono text-sm">Score: 26</div>
                    </div>

                    {/* mini question card */}
                    <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 md:p-6">
                      <div className="text-sm text-slate-500 mb-2">Question 2 of 10</div>
                      <div className="text-slate-800 font-semibold">What is the correct way to write a JavaScript array?</div>

                      <div className="mt-4 space-y-3">
                        <div className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm">A. var colors = ["red","green","blue"]</div>
                        <div className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm">B. var colors = "red", "green", "blue"</div>
                        <div className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm">C. var colors = (1:"red",2:"green",3:"blue")</div>
                        <div className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm">D. var colors = 1 = ("red","green","blue")</div>
                      </div>

                      <div className="mt-4 text-center">
                        <button className="px-5 py-2 rounded-md bg-emerald-500 text-white text-sm">Next Question →</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* monitor bottom bezel */}
                <div className="bg-slate-800 h-8 flex items-center justify-center">
                  <div className="w-32 h-3 bg-slate-700 rounded-full"></div>
                </div>
              </div>

              {/* monitor stand */}
              <div className="mt-4 flex items-center justify-center">
                <div className="w-48 h-6 bg-slate-200 rounded-b-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer id="contact" className="mt-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center font-bold">Q</div>
              <div>
                <div className="font-bold text-lg">Quizify</div>
                <div className="text-slate-400 text-sm">Make learning social.</div>
              </div>
            </div>
            <p className="mt-4 text-slate-400 text-sm max-w-sm">
              Host live quizzes, compete with friends and share results. Built with love.
            </p>
          </div>

          <div className="flex gap-6 justify-between md:justify-center">
            <div>
              <h4 className="font-semibold text-slate-200 mb-3">Product</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-3">Company</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-3">Support</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>

          {/* Social + links */}
          <div className="md:col-span-1">
            <h4 className="font-semibold text-slate-200 mb-3">Connect</h4>
            <div className="flex items-center gap-3">
              <a href="https://github.com/Adi-bit93" target="_blank" rel="noreferrer" className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700">
                {/* GitHub SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.9.57.1.78-.25.78-.55 0-.27-.01-1-.01-1.96-3.2.7-3.87-1.45-3.87-1.45-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.67 1.25 3.32.96.1-.76.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.72 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.18a10.9 10.9 0 0 1 2.86-.39c.97.01 1.95.13 2.86.39 2.17-1.49 3.13-1.18 3.13-1.18.62 1.58.23 2.75.11 3.04.73.81 1.17 1.83 1.17 3.09 0 4.45-2.7 5.42-5.27 5.7.41.36.77 1.07.77 2.16 0 1.56-.01 2.82-.01 3.2 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" /></svg>
              </a>

              <a href="https://www.linkedin.com/in/aditya-chavan-b52a6b274/" target="_blank" rel="noreferrer" className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700">
                {/* LinkedIn SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0 1.38-1.11 2.5-2.48 2.5S0 4.88 0 3.5 1.11 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4v13h-4zM9.5 8h3.84v1.76h.05c.53-.99 1.82-2.04 3.75-2.04 4 0 4.74 2.63 4.74 6.05V21h-4v-6.05c0-1.44-.03-3.29-2-3.29-2 0-2.3 1.55-2.3 3.17V21H9.5z"/></svg>
              </a>

              <a href="https://x.com/AdityaChav6901" target="_blank" rel="noreferrer" className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9.07 9.07 0 0 1-2.86 1.1A4.52 4.52 0 0 0 12 4.77a12.83 12.83 0 0 1-9.29-4.7 4.5 4.5 0 0 0 1.4 6 4.41 4.41 0 0 1-2-.55v.06a4.52 4.52 0 0 0 3.63 4.42 4.5 4.5 0 0 1-2 .07 4.52 4.52 0 0 0 4.21 3.13A9.06 9.06 0 0 1 1 19.54a12.76 12.76 0 0 0 6.92 2.03c8.3 0 12.84-6.88 12.84-12.84v-.58A9.22 9.22 0 0 0 23 3z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 py-4 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Quizify · Built with ❤️ · <a href="https://github.com/Adi-bit93/ai-quiz-builder" className="ml-1 underline">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
