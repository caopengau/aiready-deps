"use client";
import { useState } from "react";

export default function RequestForm() {
  const [email, setEmail] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const endpoint = process.env.NEXT_PUBLIC_REQUEST_URL;
      if (!endpoint) {
        throw new Error("Submission endpoint not configured");
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, repoUrl, notes })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to submit request");
      }

      setStatus("success");
      setMessage("🎉 Thanks! Your audit request has been received. We'll analyze your codebase and email the detailed report within 24-48 hours.");
      setEmail("");
      setRepoUrl("");
      setNotes("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Get Your Free Codebase Audit</h3>
        <p className="text-slate-600">Receive a detailed PDF report with actionable insights to make your code AI-ready.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-lg">📊</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">What you'll get:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Semantic duplicate detection report</li>
              <li>• Context window optimization recommendations</li>
              <li>• Consistency analysis and naming suggestions</li>
              <li>• Actionable next steps for AI adoption</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">GitHub Repo URL</label>
          <input
            type="url"
            required
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anything specific you'd like us to focus on"
            className="w-full rounded-md border border-slate-300 px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {status === "loading" ? "Submitting..." : "Request Report"}
          </button>
          {status === "success" && (
            <span className="text-green-700">{message}</span>
          )}
          {status === "error" && (
            <span className="text-red-700">{message}</span>
          )}
        </div>
      </form>
      <p className="text-xs text-slate-500 mt-4">We'll never share your data. We'll email from the address on the site footer.</p>
    </div>
  );
}
