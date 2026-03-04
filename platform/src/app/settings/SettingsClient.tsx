'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import type { ApiKey } from '@/lib/db';

interface Props {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    githubId?: string | null;
    googleId?: string | null;
  };
}

export default function SettingsClient({ user }: Props) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [keysLoading, setKeysLoading] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function fetchApiKeys() {
    try {
      const res = await fetch('/api/keys');
      const data = await res.json();
      if (res.ok) setApiKeys(data.keys);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName) return;
    setKeysLoading(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewlyCreatedKey(data.key);
        setNewKeyName('');
        fetchApiKeys();
        toast.success('API key generated');
      }
    } catch (err) {
      console.error('Failed to create API key:', err);
      toast.error('Failed to generate API key');
    } finally {
      setKeysLoading(false);
    }
  }

  async function handleDeleteKey(id: string) {
    if (!confirm('Delete this API key?')) return;
    try {
      const res = await fetch(`/api/keys?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
        toast.success('API key deleted');
      }
    } catch (err) {
      console.error('Failed to delete API key:', err);
      toast.error('Failed to delete API key');
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-blue w-96 h-96 -top-48 -right-48 opacity-30" />
        <div className="orb orb-purple w-80 h-80 bottom-0 -left-40 opacity-30" />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Header */}
      <Navbar user={user} activePage="settings" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <svg
                className="w-6 h-6 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Profile Settings
              </h1>
              <p className="text-slate-400 text-sm">
                Manage your account and developer access.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-white/5 space-y-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                {user.image ? (
                  <img
                    src={user.image}
                    className="w-20 h-20 rounded-2xl border-2 border-indigo-500/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl text-slate-500 font-bold">
                    {user.name?.[0] || user.email?.[0]}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-1.5 rounded-lg border-2 border-[#0a0a0f]">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">
                  {user.name || 'User'}
                </h3>
                <p className="text-slate-400 text-sm">{user.email}</p>
                <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Standard Member
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Integrations</h2>
              <p className="text-slate-400 text-sm">
                Connect your Git providers and manage repository access.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GitHub Account */}
            <div className="glass-card rounded-3xl p-8 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">GitHub</h3>
                    <p className="text-xs text-slate-400">
                      Manage repository access
                    </p>
                  </div>
                </div>
                {user.githubId ? (
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-lg border border-green-500/20 uppercase">
                    Connected
                  </span>
                ) : (
                  <button
                    onClick={() => signIn('github')}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
              <div className="pt-2">
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Connecting your GitHub account allows you to scan private
                  repositories you have access to.
                </p>
                <a
                  href="https://github.com/apps/aiready/installations/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Configure GitHub App Installation
                </a>
              </div>
            </div>

            {/* Google Account */}
            <div className="glass-card rounded-3xl p-8 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Google</h3>
                    <p className="text-xs text-slate-400">
                      Primary login method
                    </p>
                  </div>
                </div>
                {user.googleId ? (
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-lg border border-green-500/20 uppercase">
                    Connected
                  </span>
                ) : (
                  <button
                    onClick={() => signIn('google')}
                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/10"
                  >
                    Connect
                  </button>
                )}
              </div>
              <div className="pt-2">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your Google account is used for secure authentication and
                  profile management.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* API Keys Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
              <svg
                className="w-6 h-6 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">API Keys</h2>
              <p className="text-slate-400 text-sm">
                Create and manage keys for the AIReady CLI.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="glass-card rounded-3xl p-8 border border-white/5 h-fit">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                Generate New Key
              </h3>
              <form onSubmit={handleCreateKey} className="flex gap-4">
                <input
                  type="text"
                  placeholder="What is this key for? (e.g. CI/CD)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={keysLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
                >
                  {keysLoading ? 'Generating...' : 'Create Key'}
                </button>
              </form>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden border border-white/5 bg-slate-900/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-800/40 text-slate-400 border-b border-white/5">
                      <th className="px-8 py-5 font-semibold uppercase tracking-wider text-[11px]">
                        Name
                      </th>
                      <th className="px-8 py-5 font-semibold uppercase tracking-wider text-[11px]">
                        Key Prefix
                      </th>
                      <th className="px-8 py-5 font-semibold uppercase tracking-wider text-[11px]">
                        Created
                      </th>
                      <th className="px-8 py-5 font-semibold uppercase tracking-wider text-[11px] text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {apiKeys.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-8 py-12 text-center text-slate-500 italic"
                        >
                          No active API keys found.
                        </td>
                      </tr>
                    ) : (
                      apiKeys.map((key) => (
                        <tr
                          key={key.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-8 py-5 text-white font-semibold">
                            {key.name}
                          </td>
                          <td className="px-8 py-5 font-mono text-cyan-400">
                            {key.prefix}••••••••
                          </td>
                          <td className="px-8 py-5 text-slate-400">
                            {new Date(key.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => handleDeleteKey(key.id)}
                              className="px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                              Deactivate
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* New Key Modal */}
      <AnimatePresence>
        {newlyCreatedKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card rounded-3xl p-10 max-w-lg w-full border border-cyan-500/30 shadow-[0_0_100px_-20px_rgba(6,182,212,0.3)]"
            >
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-8 mx-auto border border-cyan-500/20">
                <svg
                  className="w-8 h-8 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-white text-center mb-2">
                Key Generated Successfully
              </h3>
              <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed">
                Copy this key now. It provides full access to your account via
                the CLI and{' '}
                <span className="text-white font-medium">
                  cannot be shown again
                </span>{' '}
                for security reasons.
              </p>

              <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-6 flex flex-col items-center gap-4 mb-8">
                <code className="text-cyan-300 font-mono text-xl tracking-tight break-all text-center">
                  {newlyCreatedKey}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newlyCreatedKey);
                    toast.success('Copied to clipboard!');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/20 transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy Secret Key
                </button>
              </div>

              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="w-full py-4 bg-white text-[#0a0a0f] font-black rounded-2xl shadow-xl hover:bg-slate-100 transition-all text-sm uppercase tracking-widest"
              >
                I've backed up this key
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
