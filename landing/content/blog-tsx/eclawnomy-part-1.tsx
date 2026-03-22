import meta from './eclawnomy-part-1.meta';
import React from 'react';
import Link from 'next/link';
import { ChevronRight, Zap, Target, TrendingUp } from 'lucide-react';

const Post = () => (
  <>
    <div className="my-8 max-w-4xl mx-auto">
      <div className="aspect-[21/9] w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-3xl shadow-2xl flex items-center justify-center border border-white/10 overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter text-center px-4 z-10">
          THE <span className="text-indigo-400">ECLAWNOMY</span> <br />{' '}
          Manifesto
        </h1>
      </div>
    </div>

    <p className="text-xl font-medium text-indigo-400 italic">
      In our previous &quot;Agentic Readiness&quot; series, we talked about how
      to prepare your codebase for AI. But preparation is only half the battle.
      We are in 2026. GPT-5.4 is here, and the &quot;prompt engineering&quot;
      era is officially legacy. Today, we cross the Rubicon to the{' '}
      <strong>Eclawnomy</strong>.
    </p>

    <h2 className="text-3xl font-black mt-16 mb-8 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
        <Target className="w-6 h-6" />
      </div>
      The Agentic Wall
    </h2>

    <p>
      We&apos;ve all been there: you open a chat interface, paste some code, and
      ask for a fix. It works. You feel like a 10x developer. Then you try
      something bigger—a multi-file refactor, a complex integration—and you hit
      the <strong>Agentic Wall.</strong>
    </p>

    <p>
      The wall isn&apos;t just a lack of reasoning; it&apos;s a lack of{' '}
      <strong>Agency</strong> and a high <strong>Knowledge Barrier</strong>. A
      sidekick can&apos;t do the work while you sleep, and setting up an agentic
      team shouldn&apos;t require a PhD in AWS.
    </p>

    <p className="bg-slate-100 dark:bg-zinc-900 p-8 rounded-3xl border-l-4 border-indigo-500 my-10 italic text-lg">
      &quot;For that, you don&apos;t need a better LLM. You need a Coworker and
      a framework that lowers the barrier to entry.&quot;
    </p>

    <h2 className="text-3xl font-black mt-16 mb-8 flex items-center gap-4 text-indigo-500">
      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
        <Zap className="w-6 h-6" />
      </div>
      The Eclawnomy: A Framework I Created
    </h2>

    <p>
      The <strong>Eclawnomy</strong> is the term I created to describe the
      intersection of Open Source Agency (OpenClaw) and a sustainable economic
      model. It&apos;s about moving beyond the &quot;chat&quot; to the
      &quot;outcome.&quot;
    </p>

    <p>
      <Link
        href="https://github.com/openclaw"
        className="text-indigo-400 hover:underline font-bold"
      >
        OpenClaw
      </Link>{' '}
      represents a fundamental &quot;phase transition&quot; in the history of
      computing. It&apos;s an open-source framework designed for building agents
      that don&apos;t just &quot;talk&quot;—they <strong>act.</strong>
    </p>

    <h3 className="text-2xl font-bold mt-12 mb-6">
      The Three Pillars of an AI Coworker:
    </h3>

    <ul className="space-y-6 my-8">
      <li className="flex gap-4">
        <div className="mt-1 text-indigo-500 font-mono font-black">01</div>
        <div>
          <strong className="text-white block mb-1 underline decoration-indigo-500/30">
            Tool Mastery
          </strong>
          OpenClaw agents have a &quot;hand&quot; in the real world. They can
          read/write files, execute shell commands, and control APIs through the
          Model Context Protocol (MCP).
        </div>
      </li>
      <li className="flex gap-4">
        <div className="mt-1 text-indigo-500 font-mono font-black">02</div>
        <div>
          <strong className="text-white block mb-1 underline decoration-indigo-500/30">
            Autonomous Reasoning
          </strong>
          They don&apos;t wait for your next prompt. They have a goal, and they
          loop through planning, execution, and validation until it&apos;s done.
        </div>
      </li>
      <li className="flex gap-4">
        <div className="mt-1 text-indigo-500 font-mono font-black">03</div>
        <div>
          <strong className="text-white block mb-1 underline decoration-indigo-500/30">
            The Intelligence Ledger
          </strong>
          The <strong>Eclawnomy</strong> introduces a shift in how we spend. You
          aren&apos;t paying for &quot;hours&quot; of human labor; you are
          budgeting for &quot;tokens of intelligence.&quot;
        </div>
      </li>
    </ul>

    <h2 className="text-3xl font-black mt-16 mb-8 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
        <TrendingUp className="w-6 h-6" />
      </div>
      Decoupling Productivity from Headcount
    </h2>

    <p>
      In this new economy, your value isn&apos;t tied to how many people you
      manage, but how many <strong>Claws</strong> you orchestrate. A solopreneur
      can run a &quot;firm&quot; of 20 specialized agents.
    </p>

    <p>
      Micro-tasks are the currency. Instead of hiring a consultant for a
      $100,000+ &quot;architecture review,&quot; you deploy a{' '}
      <strong>Security Claw</strong> that fixes vulnerabilities for a fraction
      of the cost.
    </p>

    <div className="mt-16 pt-12 border-t border-slate-200 dark:border-zinc-800">
      <h3 className="text-xl font-black mb-8">
        What&apos;s Next in the Eclawnomy?
      </h3>

      <Link
        href="/blog/eclawnomy-part-2-anatomy-of-agency"
        className="p-8 bg-indigo-50 dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 rounded-3xl hover:border-indigo-300 dark:hover:border-zinc-700 transition-all group block"
      >
        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          PART 02 // UNIT_ANATOMY
        </div>
        <h4 className="text-2xl font-black mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors italic">
          The Anatomy of Agency: What&apos;s Inside a Claw?
        </h4>
        <div className="inline-flex items-center gap-2 text-sm text-slate-500 font-bold group-hover:translate-x-1 transition-transform">
          Continue to Part 2
          <ChevronRight className="w-4 h-4" />
        </div>
      </Link>
    </div>
  </>
);

export default Post;
