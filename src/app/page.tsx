import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          AIReady Platform
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Monitor, analyze, and improve your codebase AI readiness
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
          >
            Sign in with GitHub
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:border-slate-400 transition-all"
          >
            Documentation
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border-2 border-slate-200 bg-white">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Track Trends</h3>
            <p className="text-sm text-slate-600">
              Monitor AI readiness scores over time with detailed historical data
            </p>
          </div>
          <div className="p-6 rounded-xl border-2 border-slate-200 bg-white">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Benchmark</h3>
            <p className="text-sm text-slate-600">
              Compare your codebase against similar projects and industry standards
            </p>
          </div>
          <div className="p-6 rounded-xl border-2 border-slate-200 bg-white">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Insights</h3>
            <p className="text-sm text-slate-600">
              Get actionable recommendations to improve AI comprehension
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}