import meta from './eclawnomy-part-3.meta';
import React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Zap,
  DollarSign,
  Cloud,
  Terminal,
  AlertCircle,
} from 'lucide-react';

const Post = () => (
  <>
    <div className="my-8 max-w-4xl mx-auto">
      <div className="aspect-[21/9] w-full bg-black border border-zinc-800 rounded-3xl overflow-hidden relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#3b82f655_0%,_transparent_70%)]"></div>
        <div className="z-10 text-center">
          <div className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.5em] mb-4">
            Physics // Efficiency
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
            $0 <span className="text-blue-500">IDLE</span> COST
          </h1>
        </div>
      </div>
    </div>

    <p className="text-xl font-medium text-blue-400 italic mb-10 text-center">
      The biggest threat to the agentic economy isn&apos;t an AI apocalypse;
      it&apos;s a $2,500 AWS bill for an EC2 instance that did nothing but{' '}
      <strong>WAIT.</strong>
    </p>

    <h2 className="text-3xl font-black mt-16 mb-8 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
        <AlertCircle className="w-6 h-6" />
      </div>
      The Infrastructure Problem
    </h2>

    <p>
      Traditional agentic setups—docker containers, always-on servers,
      long-running Python scripts—are inherently <strong>inefficient</strong>.
      They force you to pay for &quot;upkeep&quot; even when no work is being
      done.
    </p>

    <p>
      In the <strong>Eclawnomy</strong>, if an agent isn&apos;t producing value,
      it shouldn&apos;t cost a cent. While competitors like NanoClaw and
      ZeroClaw offer various approaches, we believe the only viable path for the
      ordinary folk is <strong>pure serverless</strong>.
    </p>

    <h2 className="text-3xl font-black mt-16 mb-8 flex items-center gap-4 text-blue-500">
      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
        <Cloud className="w-6 h-6" />
      </div>
      The Solution: ServerlessClaw
    </h2>

    <div className="space-y-12 my-12">
      <section>
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          1. The AgentBus (AWS EventBridge)
        </h3>
        <p>
          Instead of a &quot;Main Loop&quot; that polls for tasks,{' '}
          <strong>ServerlessClaw</strong> uses an asynchronous event
          architecture. We call it the <strong>AgentBus</strong>.
        </p>
        <p className="text-sm border-l-2 border-blue-500 pl-4 my-4 italic">
          Task submitted -&gt; published to AgentBus -&gt; specialized Lambda
          wakes up -&gt; executes -&gt; terminates.
        </p>
        <p>
          <strong>Result:</strong> If no events are flowing, the system costs
          exactly <strong>$0.00</strong>.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          2. Cognitive Tiering
        </h3>
        <p>
          Reasoning is the main cost driver. Using GPT-4o for a simple code
          search is like hiring a neurosurgeon to open a bag of chips. We
          implement tiered models:
        </p>
        <ul className="list-disc list-inside space-y-2 mt-4 text-slate-400">
          <li>
            <strong>Navigation</strong>: Fast mini-models (gpt-4o-mini).
          </li>
          <li>
            <strong>Implementation</strong>: Mid-tier standard models.
          </li>
          <li>
            <strong>Architecture</strong>: High-tier models (o1/Claude 3.5
            Sonnet) only for complex planning.
          </li>
        </ul>
      </section>
    </div>

    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl my-10 font-mono text-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-4 text-blue-400">
        <Terminal className="w-4 h-4" />
        <span>COST_COMPARISON.log</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between border-b border-zinc-800 pb-2">
          <span>Always-on VPS (24/7)</span>
          <span className="text-red-500">$45.00/mo</span>
        </div>
        <div className="flex justify-between border-b border-zinc-800 pb-2">
          <span>ServerlessClaw (Idle)</span>
          <span className="text-green-500">$0.00/mo</span>
        </div>
        <div className="flex justify-between pt-2 italic">
          <span>Savings Realized</span>
          <span className="text-blue-400">100% IDLE EFFICIENCY</span>
        </div>
      </div>
    </div>

    <div className="mt-16 pt-12 border-t border-slate-200 dark:border-zinc-800">
      <h3 className="text-xl font-black mb-8">Management & EaaS</h3>

      <Link
        href="/blog/eclawnomy-part-4-eaas-mutation"
        className="p-8 bg-purple-50 dark:bg-zinc-900 border border-purple-100 dark:border-zinc-800 rounded-3xl hover:border-purple-300 dark:hover:border-zinc-700 transition-all group block"
      >
        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          PART 04 // PLATFORM_EVOLUTION
        </div>
        <h4 className="text-2xl font-black mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors italic">
          Evolution-as-a-Service: The Business of Mutation
        </h4>
        <div className="inline-flex items-center gap-2 text-sm text-slate-500 font-bold group-hover:translate-x-1 transition-transform">
          Discover ClawMore
          <ChevronRight className="w-4 h-4" />
        </div>
      </Link>
    </div>
  </>
);

export default Post;
