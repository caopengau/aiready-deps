import React from 'react';

interface SeriesFooterProps {
  currentPart: number;
}

export const AgenticSeriesFooter = ({ currentPart }: SeriesFooterProps) => {
  const parts = [
    {
      n: 1,
      slug: 'the-agentic-wall',
      title: 'The Agentic Wall (Context Fragmentation)',
    },
    {
      n: 2,
      slug: 'beyond-the-sidekick',
      title: 'Beyond the Sidekick (Rise of the Agentic System)',
    },
    {
      n: 3,
      slug: 'the-economic-moat',
      title: 'The Economic Moat (Quantifying AI ROI)',
    },
    {
      n: 4,
      slug: 'the-neural-spine',
      title: 'The Neural Spine (Event-Driven Orchestration)',
    },
    {
      n: 5,
      slug: 'closing-the-loop',
      title: 'Closing the Loop (Git as a Runtime)',
    },
    {
      n: 6,
      slug: 'cognitive-tiering',
      title: 'Cognitive Tiering (Multi-Headed Brain)',
    },
    {
      n: 7,
      slug: 'resilience-fortress',
      title: 'The Resilience Fortress (Designing for Disaster)',
    },
    {
      n: 8,
      slug: 'observability-intelligence',
      title: 'Observability as Intelligence (Visualizing the Unseen)',
    },
    {
      n: 9,
      slug: 'human-agent-co-management',
      title: 'Human-Agent Co-Management (The Neural Reserve)',
    },
    {
      n: 10,
      slug: 'recursive-safety',
      title: 'Recursive Safety (Governing the Autonomous Swarm)',
    },
    {
      n: 11,
      slug: 'roadmap-to-autonomy',
      title: 'Roadmap to Autonomy (From Sandbox to Prod)',
    },
    {
      n: 12,
      slug: 'living-repository',
      title: 'The Living Repository (Reflections on the Future)',
    },
    {
      n: 13,
      slug: 'evolution-roi',
      title: 'Evolution ROI (Measuring the Infinite Value)',
    },
  ];

  return (
    <>
      <hr className="my-12 border-slate-200 dark:border-zinc-800" />
      <p className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100">
        Read the full &quot;The Agentic Readiness Shift&quot; series:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
        {parts.map((p) => (
          <li key={p.slug}>
            {p.n === currentPart ? (
              <strong>
                Part {p.n}: {p.title} ← You are here
              </strong>
            ) : (
              <a
                href={`/blog/${p.slug}`}
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors underline decoration-slate-300/50"
              >
                Part {p.n}: {p.title}
              </a>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};
