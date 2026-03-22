import meta from './eclawnomy-part-2.meta';
import React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Cpu,
  Database,
  Blocks,
  Activity,
  Share2,
  Layers,
  Zap,
} from 'lucide-react';

const Post = () => (
  <>
    <div className="my-8 max-w-4xl mx-auto">
      <div className="aspect-[21/9] w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent"></div>
        <div className="z-10 text-center">
          <div className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-4">
            Unit // Dissection
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
            THE ANATOMY OF <span className="text-indigo-500">AGENCY</span>
          </h1>
        </div>
      </div>
    </div>

    <p className="text-xl font-medium text-slate-400 italic mb-10">
      To the ordinary person, an AI agent looks like magic. But magic is just
      technology with a high knowledge barrier. Today, we’re tearing down that
      barrier. Let’s dissect the &quot;Claw&quot; and see how the{' '}
      <strong>Eclawnomy</strong> actually functions at the unit level.
    </p>

    <h2 className="text-3xl font-black mt-16 mb-8 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 text-indigo-500">
        <Layers className="w-6 h-6" />
      </div>
      The 6-Layer Agentic Stack
    </h2>

    <p>
      If GPT-5.4 is the &quot;Brain,&quot; then a Claw is the &quot;Body.&quot;
      To move from a chatbot to an autonomous coworker, an agent needs more than
      just reasoning. They need a 6-layer stack.
    </p>

    <div className="grid md:grid-cols-2 gap-6 my-12">
      <div className="p-6 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <h3 className="font-black text-lg mb-2 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          1. Infrastructure
        </h3>
        <p className="text-sm text-slate-500">
          The underlying cloud environment (like the serverless AWS/SST stack)
          that provides the compute and networking required for autonomous
          action.
        </p>
      </div>

      <div className="p-6 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <h3 className="font-black text-lg mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          2. The Energy (Tokens)
        </h3>
        <p className="text-sm text-slate-500">
          Tokens are the fuel. Every thought has a price. We use a hierarchy of
          models (o1/Claude) to balance reasoning power with unit cost.
        </p>
      </div>

      <div className="p-6 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <h3 className="font-black text-lg mb-2 flex items-center gap-2">
          <Blocks className="w-4 h-4 text-purple-500" />
          3. Skills
        </h3>
        <p className="text-sm text-slate-500">
          Pre-defined templates and logic blocks that an agent can
          &quot;load&quot; into its context to perform specific tasks like
          refactoring or testing.
        </p>
      </div>

      <div className="p-6 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <h3 className="font-black text-lg mb-2 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-green-500" />
          4. MCP (The Ports)
        </h3>
        <p className="text-sm text-slate-500">
          Model Context Protocol is the universal port. It standardizes how
          models interact with your tools, GitHub, or Stripe without custom
          code.
        </p>
      </div>

      <div className="p-6 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <h3 className="font-black text-lg mb-2 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-red-500" />
          5. Memory
        </h3>
        <p className="text-sm text-slate-500">
          Cognitive Tiering: Real-time session data, local context, and episodic
          memory from previous failures or successes.
        </p>
      </div>

      <div className="p-6 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <h3 className="font-black text-lg mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-500" />
          6. Orchestration
        </h3>
        <p className="text-sm text-slate-500">
          The &quot;Director&quot; logic. Agentic Team Building—coordinating the
          Planner, the Coder, and the QA Auditor into a single reliable unit.
        </p>
      </div>
    </div>

    <h2 className="text-3xl font-black mt-16 mb-8 flex items-center gap-4">
      Why You Should Care
    </h2>

    <p>
      Understanding this stack is the first step to overcoming the{' '}
      <strong>Knowledge Barrier.</strong> You don&apos;t need to write the code
      for these layers—Frameworks like <strong>OpenClaw</strong> and{' '}
      <strong>ServerlessClaw</strong> do that for you.
    </p>

    <p>
      But knowing <em>how</em> they work allows you to manage your agentic team
      with the same confidence you once managed a human department.
    </p>

    <div className="mt-16 pt-12 border-t border-slate-200 dark:border-zinc-800">
      <h3 className="text-xl font-black mb-8">Ready for the Physics?</h3>

      <Link
        href="/blog/eclawnomy-part-3-physics-serverless"
        className="p-8 bg-blue-50 dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-3xl hover:border-blue-300 dark:hover:border-zinc-700 transition-all group block"
      >
        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          PART 03 // INFRA_ECONOMY
        </div>
        <h4 className="text-2xl font-black mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors italic">
          $0 Idle Cost: The Physics of the Eclawnomy
        </h4>
        <div className="inline-flex items-center gap-2 text-sm text-slate-500 font-bold group-hover:translate-x-1 transition-transform">
          Learn about Zero-Idle Costs
          <ChevronRight className="w-4 h-4" />
        </div>
      </Link>
    </div>
  </>
);

export default Post;
