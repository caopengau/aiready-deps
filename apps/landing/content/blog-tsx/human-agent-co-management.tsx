import meta from './human-agent-co-management.meta';
import React from 'react';
import { AgenticSeriesFooter } from '@/components/AgenticSeriesFooter';

const Post = () => (
  <>
    <blockquote>
      Part 9 of our series:{' '}
      <strong>
        &quot;The Agentic Readiness Shift: Building for Autonomous
        Engineers.&quot;
      </strong>
    </blockquote>

    <div className="my-12 max-w-5xl mx-auto text-center">
      <img
        src="/agentic-shift-series-9.png"
        alt="Human-Agent Co-Management Cover"
        className="w-full h-auto rounded-3xl mb-12 shadow-2xl border border-white/5"
      />
    </div>

    <h2>The Fragmentation Problem</h2>
    <p>
      Current AI tools are siloed. You talk to one agent in a web browser,
      another in your IDE, and maybe a third in a dedicated mobile app. Your
      context is scattered, and none of them talk to each other. This isn&apos;t
      just a UX issue; it&apos;s a management failure.
    </p>
    <p>
      In an <strong>Agentic Team</strong>, your AI agent should be ubiquitous.
      It shouldn&apos;t matter if you&apos;re on your laptop, your phone, or in
      a team chat—the agent is always one pulse away. This is the foundation of{' '}
      <strong>Human-Agent Co-Management</strong>.
    </p>

    <h2>The Unified Gateway</h2>
    <p>
      We built a <strong>Unified Gateway</strong> that normalizes signals from
      different messaging platforms into a single &quot;intent stream.&quot;
      Whether the trigger is a <code>/deploy</code> command from Telegram or an
      automated bug report from Slack, the core engine receives the same
      structured payload.
    </p>

    <div className="bg-slate-900 rounded-2xl p-8 my-12 border border-slate-800">
      <div className="text-cyber-purple font-mono text-[10px] uppercase tracking-widest mb-6 border-b border-white/5 pb-2">
        GATEWAY_REGISTRY.json (ACTIVE)
      </div>
      <pre className="text-xs font-mono text-zinc-300 overflow-x-auto">
        {`{
  "supported_channels": [
    "telegram_bot_api",
    "discord_webhooks",
    "slack_events_api",
    "bluebubbles_imessage_bridge"
  ],
  "normalization_engine": "v2. Standard"
}`}
      </pre>
    </div>

    <h2>A Culture of Shared Agency</h2>
    <p>
      The real shift isn&apos;t just technical; it&apos;s cultural. We are
      moving from &quot;AI as a tool&quot; to &quot;AI as a team member.&quot;
      This means:
    </p>
    <ul className="list-disc pl-6 mb-8 space-y-3">
      <li>
        <strong>Delegation</strong>: Giving agents permission to operate on
        critical paths.
      </li>
      <li>
        <strong>Review Loops</strong>: Treating agent commits with the same
        rigor (and respect) as human commits.
      </li>
      <li>
        <strong>Shared Identity</strong>: Maintaining context whether you are at
        your desk or answering a Slack message on your phone.
      </li>
    </ul>

    <p className="text-xl font-medium text-indigo-300">
      The most successful engineering teams of the next decade won&apos;t just
      have the best humans; they&apos;ll have the best human-agent synergy.
    </p>

    <AgenticSeriesFooter currentPart={9} />
  </>
);

export default Post;
