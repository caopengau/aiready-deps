/**
 * Dynamic content loaders for blog posts.
 * Content is loaded on-demand, not at build time.
 * This keeps the context budget low.
 */
export const contentLoaders: Record<string, () => Promise<{ default: any }>> = {
  'beyond-the-sidekick': () => import('./beyond-the-sidekick'),
  'the-economic-moat': () => import('./the-economic-moat'),
  'the-neural-spine': () => import('./the-neural-spine'),
  'closing-the-loop': () => import('./closing-the-loop'),
  'cognitive-tiering': () => import('./cognitive-tiering'),
  'resilience-fortress': () => import('./resilience-fortress'),
  'observability-intelligence': () => import('./observability-intelligence'),
  'human-agent-co-management': () => import('./human-agent-co-management'),
  'recursive-safety': () => import('./recursive-safety'),
  'roadmap-to-autonomy': () => import('./roadmap-to-autonomy'),
  'living-repository': () => import('./living-repository'),
  'evolution-roi': () => import('./evolution-roi'),
  'the-agentic-wall': () => import('./the-agentic-wall'),
  'future-human-friendly-code': () => import('./future-human-friendly-code'),
  'visualizing-invisible': () => import('./visualizing-invisible'),
  'invisible-codebase': () => import('./invisible-codebase'),
  'ai-code-debt-tsunami': () => import('./ai-code-debt-tsunami'),
  'metrics-that-actually-matter': () =>
    import('./metrics-that-actually-matter'),
  'semantic-duplicate-detection': () =>
    import('./semantic-duplicate-detection'),
  'hidden-cost-import-chains': () => import('./hidden-cost-import-chains'),
  'mcp-superpowers-context-aware': () =>
    import('./mcp-superpowers-context-aware'),
  'mcp-superpowers-custom-tools': () =>
    import('./mcp-superpowers-custom-tools'),
  'mcp-superpowers-orchestration-loop': () =>
    import('./mcp-superpowers-orchestration-loop'),
  'agentic-roi-navigation-tax': () => import('./agentic-roi-navigation-tax'),
  'agentic-roi-token-roi': () => import('./agentic-roi-token-roi'),
  'agentic-roi-talent-moat': () => import('./agentic-roi-talent-moat'),
  '10-minute-ai-audit': () => import('./10-minute-ai-audit'),
  'eclawnomy-part-1-chatbot-to-coworker': () => import('./eclawnomy-part-1'),
  'eclawnomy-part-2-anatomy-of-agency': () => import('./eclawnomy-part-2'),
  'eclawnomy-part-3-physics-serverless': () => import('./eclawnomy-part-3'),
  'eclawnomy-part-4-eaas-mutation': () => import('./eclawnomy-part-4'),
  'the-token-tax': () => import('./the-token-tax'),
  'the-9-metrics': () => import('./the-9-metrics'),
  'living-documentation': () => import('./living-documentation'),
  'architecting-for-agents': () => import('./architecting-for-agents'),
  'the-readiness-scorecard': () => import('./the-readiness-scorecard'),
  'getting-started-with-aiready-cli': () =>
    import('./getting-started-with-aiready-cli'),
  'why-ai-coding-assistants-get-worse': () =>
    import('./why-ai-coding-assistants-get-worse'),
  'multi-human-multi-agent-collaboration': () =>
    import('./multi-human-multi-agent-collaboration'),
  'claweague-series-part-1-hiring-first-ai-colleague': () =>
    import('./claweague-series-part-1-hiring-first-ai-colleague'),
  'claweague-series-part-2-roi-autonomous-evolution': () =>
    import('./claweague-series-part-2-roi-autonomous-evolution'),
  'claweague-series-part-3-management-agentic-era': () =>
    import('./claweague-series-part-3-management-agentic-era'),
  'claweague-series-part-4-eclawnomy-manifesto': () =>
    import('./claweague-series-part-4-eclawnomy-manifesto'),
};
