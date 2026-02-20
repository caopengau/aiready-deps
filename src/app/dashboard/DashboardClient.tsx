'use client';

import { useState } from 'react';
import { Repository, Analysis } from '@/lib/db';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface RepoWithAnalysis extends Repository {
  latestAnalysis: Analysis | null;
}

interface DashboardClientProps {
  user: User;
  repos: RepoWithAnalysis[];
  overallScore: number | null;
}

export default function DashboardClient({ user, repos: initialRepos, overallScore: initialScore }: DashboardClientProps) {
  const [repos, setRepos] = useState<RepoWithAnalysis[]>(initialRepos);
  const [overallScore, setOverallScore] = useState<number | null>(initialScore);
  const [showAddRepo, setShowAddRepo] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add repository form state
  const [newRepo, setNewRepo] = useState({
    name: '',
    url: '',
    description: '',
    defaultBranch: 'main',
  });

  // Upload form state
  const [uploadData, setUploadData] = useState('');

  // Handle add repository
  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRepo),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add repository');
      }

      const { repo } = await res.json();
      setRepos([...repos, { ...repo, latestAnalysis: null }]);
      setShowAddRepo(false);
      setNewRepo({ name: '', url: '', description: '', defaultBranch: 'main' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add repository');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete repository
  const handleDeleteRepo = async (repoId: string) => {
    if (!confirm('Are you sure you want to delete this repository?')) return;

    try {
      const res = await fetch(`/api/repos?id=${repoId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete repository');
      setRepos(repos.filter(r => r.id !== repoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete repository');
    }
  };

  // Handle upload analysis
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepo) {
      setError('Please select a repository');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = JSON.parse(uploadData);
      const res = await fetch('/api/analysis/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId: selectedRepo, data }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload analysis');
      }

      const { analysis } = await res.json();
      
      // Update repos with new analysis
      setRepos(repos.map(r => 
        r.id === selectedRepo 
          ? { ...r, latestAnalysis: analysis, aiScore: analysis.aiScore, lastAnalysisAt: analysis.timestamp }
          : r
      ));

      // Recalculate overall score
      const updatedRepos = repos.map(r => 
        r.id === selectedRepo 
          ? { ...r, aiScore: analysis.aiScore }
          : r
      );
      const scoredRepos = updatedRepos.filter(r => r.aiScore !== undefined);
      if (scoredRepos.length > 0) {
        setOverallScore(Math.round(scoredRepos.reduce((sum, r) => sum + (r.aiScore || 0), 0) / scoredRepos.length));
      }

      setShowUpload(false);
      setUploadData('');
      setSelectedRepo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload analysis');
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/login';
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

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
              <span className="text-sm text-slate-600">{user.email}</span>
              <button 
                onClick={handleSignOut}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back, {user.name || 'Developer'}!
          </h2>
          <p className="text-slate-600 mt-1">
            Monitor your codebase AI readiness and track improvements over time.
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

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
            <button 
              onClick={() => setShowAddRepo(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
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
            <button 
              onClick={() => setShowUpload(true)}
              disabled={repos.length === 0}
              className="w-full px-4 py-2 border-2 border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload Results
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">AI Score</h3>
              <span className="text-2xl">🎯</span>
            </div>
            {overallScore !== null ? (
              <>
                <div className={`text-3xl font-black ${getScoreColor(overallScore)} mb-1`}>
                  {overallScore}/100
                </div>
                <p className="text-sm text-slate-600">
                  Across {repos.filter(r => r.aiScore !== undefined).length} repositor{repos.filter(r => r.aiScore !== undefined).length === 1 ? 'y' : 'ies'}
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-black text-slate-400 mb-1">
                  --/100
                </div>
                <p className="text-sm text-slate-600">
                  Run your first analysis to get scored
                </p>
              </>
            )}
          </div>
        </div>

        {/* Repositories list */}
        {repos.length > 0 ? (
          <div className="bg-white rounded-xl border-2 border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Your Repositories</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {repos.map((repo) => (
                <div key={repo.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📦</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{repo.name}</h4>
                      <p className="text-sm text-slate-500">{repo.url}</p>
                      {repo.description && (
                        <p className="text-sm text-slate-400 mt-1">{repo.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {repo.aiScore !== undefined ? (
                      <div className="text-center">
                        <div className={`text-xl font-bold ${getScoreColor(repo.aiScore)}`}>
                          {repo.aiScore}
                        </div>
                        <div className="text-xs text-slate-500">AI Score</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-xl font-bold text-slate-300">--</div>
                        <div className="text-xs text-slate-500">No data</div>
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-xs text-slate-400">
                        {repo.lastAnalysisAt 
                          ? `Last: ${new Date(repo.lastAnalysisAt).toLocaleDateString()}`
                          : 'No analysis yet'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRepo(repo.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-slate-200 p-12 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Get Started with AIReady
            </h3>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              Add a repository and run the CLI to analyze your codebase AI readiness.
            </p>
            <div className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm font-mono max-w-lg mx-auto">
              <div className="mb-1"># Install and run analysis</div>
              <div className="text-cyan-400">npx @aiready/cli scan .</div>
              <div className="mt-2 mb-1"># Upload to platform</div>
              <div className="text-cyan-400">aiready upload --repo-id YOUR_REPO_ID</div>
            </div>
          </div>
        )}
      </main>

      {/* Add Repository Modal */}
      {showAddRepo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Repository</h3>
            <form onSubmit={handleAddRepo}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newRepo.name}
                    onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="my-awesome-project"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                  <input
                    type="text"
                    value={newRepo.url}
                    onChange={(e) => setNewRepo({ ...newRepo, url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://github.com/user/repo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={newRepo.description}
                    onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="A brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Default Branch</label>
                  <input
                    type="text"
                    value={newRepo.defaultBranch}
                    onChange={(e) => setNewRepo({ ...newRepo, defaultBranch: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="main"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddRepo(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Analysis Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload Analysis</h3>
            <form onSubmit={handleUpload}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Repository</label>
                  <select
                    value={selectedRepo || ''}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a repository</option>
                    {repos.map((repo) => (
                      <option key={repo.id} value={repo.id}>
                        {repo.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Analysis JSON
                    <span className="text-slate-400 font-normal ml-2">(paste output from CLI)</span>
                  </label>
                  <textarea
                    value={uploadData}
                    onChange={(e) => setUploadData(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    rows={10}
                    placeholder='{"metadata": {...}, "summary": {...}, "breakdown": {...}}'
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowUpload(false); setUploadData(''); setSelectedRepo(null); }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedRepo}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}