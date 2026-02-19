import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AIReady
              </h1>
              <nav className="hidden md:flex items-center gap-6 ml-8">
                <a href="/dashboard" className="text-sm font-medium text-slate-900">Dashboard</a>
                <a href="/dashboard/repos" className="text-sm font-medium text-slate-500 hover:text-slate-900">Repositories</a>
                <a href="/dashboard/analytics" className="text-sm font-medium text-slate-500 hover:text-slate-900">Analytics</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{session.user.email}</span>
              <form action={async () => {
                'use server';
                await import('@/app/api/auth/[...nextauth]/route').then(m => m.signOut());
              }}>
                <button type="submit" className="text-sm text-slate-500 hover:text-slate-700">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back, {session.user.name || 'Developer'}!
          </h2>
          <p className="text-slate-600 mt-1">
            Monitor your codebase AI readiness and track improvements over time.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Add Repository</h3>
              <span className="text-2xl">📁</span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Connect a new repository to start tracking AI readiness
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              Add Repository
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Upload Analysis</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Upload CLI results to update your metrics
            </p>
            <button className="w-full px-4 py-2 border-2 border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:border-slate-400">
              Upload Results
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">AI Score</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              --/100
            </div>
            <p className="text-sm text-slate-600">
              Run your first analysis to get scored
            </p>
          </div>
        </div>

        {/* Empty state */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Get Started with AIReady
          </h3>
          <p className="text-slate-600 max-w-md mx-auto mb-6">
            Run the CLI to analyze your codebase and upload results to see your AI readiness score.
          </p>
          <div className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm font-mono max-w-lg mx-auto">
            <div className="mb-1"># Install and run analysis</div>
            <div className="text-cyan-400">npx @aiready/cli scan .</div>
            <div className="mt-2 mb-1"># Upload to platform</div>
            <div className="text-cyan-400">aiready upload --api-key YOUR_KEY</div>
          </div>
        </div>
      </main>
    </div>
  );
}