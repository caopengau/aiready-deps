'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Hash,
  Activity,
  Zap,
  ChevronRight,
  DollarSign,
  TrendingDown,
  Cpu,
  Unplug,
} from 'lucide-react';
import Modal from '../../../components/Modal';
import LeadForm from '../../../components/LeadForm';
import SystemFlow from '../../../components/SystemFlow';
import Navbar from '../../../components/Navbar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import JsonLd from '../../../components/JsonLd';
import Link from 'next/link';

const IDLE_NODES = [
  {
    id: 'request',
    data: { label: 'REQUEST IN', type: 'event' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'bus',
    data: { label: 'AGENT BUS (WAIT)', type: 'bus' },
    position: { x: 200, y: 0 },
  },
  {
    id: 'agent',
    data: { label: 'COLD START (0.5s)', type: 'agent' },
    position: { x: 400, y: 0 },
  },
  {
    id: 'done',
    data: { label: 'SHUTDOWN ($0)', type: 'event' },
    position: { x: 600, y: 0 },
  },
];

const IDLE_EDGES = [
  { id: 'e1', source: 'request', target: 'bus', animated: true },
  { id: 'e2', source: 'bus', target: 'agent', animated: true },
  { id: 'e3', source: 'agent', target: 'done', animated: false },
];

export default function BlogPost() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const apiUrl = process.env.NEXT_PUBLIC_LEAD_API_URL || '';

  const BLOG_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Why $0 Idle is the Only Way to Scale',
    description:
      'The economics of the agentic era require a fundamental shift: from uptime to on-demand intelligence.',
    datePublished: '2026-03-31',
    author: {
      '@type': 'Person',
      name: 'Minimalist Architect',
    },
    image: '/blog-assets/zero-idle-scaling.png',
    url: '/blog/zero-idle-scaling',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyber-purple/30 selection:text-cyber-purple font-sans">
      <JsonLd data={BLOG_JSON_LD} />
      <Navbar variant="post" />

      <header className="py-24 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(0,188,255,0.05)_0%,_transparent_70%)] opacity-30" />

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-cyber-blue font-mono text-[9px] uppercase tracking-[0.4em] font-black border border-cyber-blue/20 px-2 py-1 bg-cyber-blue/5">
                MINIMAL_IA
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Hash className="w-3 h-3" />
                <span>HASH: zero-idle</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Clock className="w-3 h-3" />
                <span>05 MIN READ</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic leading-[1.1]">
              $0 Idle: <br />
              <span className="text-cyber-blue text-stroke-white">
                The Scaling Law
              </span>
            </h1>

            <p className="text-xl text-zinc-200 font-light leading-relaxed italic max-w-2xl mx-auto">
              The economics of the agentic era require a fundamental shift: from
              uptime to on-demand intelligence. If it isn&apos;t working, it
              shouldn&apos;t be costing.
            </p>
          </div>
        </div>
      </header>

      <main className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Breadcrumbs
              items={[
                { label: 'BLOG', href: '/blog' },
                {
                  label: 'ZERO IDLE SCALING',
                  href: '/blog/zero-idle-scaling',
                },
              ]}
            />

            <article className="prose prose-invert prose-zinc max-w-none">
              <section className="mt-12">
                <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4 italic uppercase">
                  <span className="text-cyber-blue font-mono text-sm not-italic border-b border-cyber-blue/50">
                    01
                  </span>
                  The Fossil Fuel of Computing
                </h2>
                <p className="text-zinc-200 leading-relaxed text-lg italic">
                  Traditional hosting is the fossil fuel of the digital age. You
                  burn money (uptime) to keep a server idling on the off-chance
                  it might be needed. In the <strong>Eclawnomy</strong>, where
                  an agentic workforce might consist of 100+ specialized Claws,
                  this &quot;Waiting Tax&quot; is the difference between a
                  high-margin business and bankruptcy.
                </p>
              </section>

              <SystemFlow
                nodes={IDLE_NODES}
                edges={IDLE_EDGES}
                height="300px"
              />

              <section className="mt-16">
                <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4 italic uppercase">
                  <span className="text-cyber-blue font-mono text-sm not-italic border-b border-cyber-blue/50">
                    02
                  </span>
                  Decoupling Uptime from Utility
                </h2>
                <p className="text-zinc-200 leading-relaxed text-lg">
                  ClawMore leverages a pure-serverless backbone. When an agent
                  isn&apos;t planning a refactor or auditing a security flaw,
                  its entire infrastructure—from compute to context
                  memory—dissolves into cold storage.
                </p>
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-sm my-10 relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <Unplug className="w-12 h-12 text-cyber-blue" />
                  </div>
                  <h4 className="text-cyber-blue font-mono text-[10px] uppercase tracking-widest mb-4">
                    OPTIMIZATION_RESULT
                  </h4>
                  <p className="font-mono text-sm text-zinc-400">
                    STATUS: [OPTIMIZED] <br />
                    IDLE_COST: $0.00000 <br />
                    WASTE_REDUCTION: 98.4% <br />
                    PROFIT_ALPHA: +22%
                  </p>
                </div>
              </section>

              <section className="mt-16">
                <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4 italic uppercase">
                  <span className="text-cyber-blue font-mono text-sm not-italic border-b border-cyber-blue/50">
                    03
                  </span>
                  Scaling Your Impact, Not Your Bill
                </h2>
                <p className="text-zinc-200 leading-relaxed text-lg">
                  This isn&apos;t just about saving cents; it&apos;s about{' '}
                  <strong>Permissionless Scaling</strong>. If your
                  infrastructure costs \$0 while idle, you can deploy an agentic
                  team for every sub-feature of your product without asking for
                  budget approval.
                </p>
              </section>

              <div className="mt-24 pt-12 border-t border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em] mb-8">
                  Up_Next_In_The_Mutation_Log
                </div>
                <Link href="/blog/safety-isolation-sst" className="block group">
                  <div className="glass-card p-8 flex items-center justify-between hover:border-cyber-blue/30 transition-all bg-white/[0.01]">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-sm bg-cyber-blue/10 flex items-center justify-center text-cyber-blue border border-cyber-blue/20">
                        <TrendingDown className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-cyber-blue uppercase tracking-widest mb-1">
                          PART 02 // SAFETY_GUARD
                        </div>
                        <div className="text-2xl font-black italic group-hover:text-white transition-colors uppercase">
                          Safety First: Isolating Intelligence with SST
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-cyber-blue group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </main>

      <footer className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center text-zinc-700 text-[10px] font-mono uppercase tracking-[0.5em]">
          TERMINAL_LOCKED // 2026 MUTATION_LOG
        </div>
      </footer>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <LeadForm type="waitlist" onSuccess={closeModal} apiUrl={apiUrl} />
      </Modal>
    </div>
  );
}
