// Answer Engine Optimization (AEO) and Universal Content Protocol (UCP) Schema
// Optimized for AI search engines: ChatGPT, Perplexity, Claude, Gemini, etc.

export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://getaiready.dev/#organization',
    name: 'AIReady',
    legalName: 'AIReady Open Source Project',
    url: 'https://getaiready.dev',
    logo: {
      '@type': 'ImageObject',
      url: 'https://getaiready.dev/logo-transparent-bg.png',
      width: 512,
      height: 512,
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://getaiready.dev/logo-transparent-bg.png',
      width: 512,
      height: 512,
    },
    description: 'Open source tools to optimize codebases for AI collaboration. Free developer tools for detecting semantic duplicates, analyzing context windows, and maintaining code consistency.',
    foundingDate: '2025',
    sameAs: [
      'https://github.com/caopengau/aiready-cli',
      'https://www.npmjs.com/package/@aiready/cli',
      'https://twitter.com/aireadytools',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Technical Support',
      url: 'https://github.com/caopengau/aiready-cli/issues',
      availableLanguage: ['English'],
    },
    keywords: 'AI codebase optimization, semantic duplicate detection, context window analysis, code consistency, AI readiness, developer tools, static analysis',
  };
};

export const generateSoftwareApplicationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://getaiready.dev/#software',
    name: 'AIReady CLI',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Windows, macOS, Linux',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description: 'Free and open source',
    },
    softwareVersion: '0.7.x',
    downloadUrl: 'https://www.npmjs.com/package/@aiready/cli',
    installUrl: 'https://www.npmjs.com/package/@aiready/cli',
    screenshot: 'https://getaiready.dev/logo-text.png',
    image: {
      '@type': 'ImageObject',
      url: 'https://getaiready.dev/logo-text.png',
      width: 2046,
      height: 800,
    },
    softwareHelp: {
      '@type': 'CreativeWork',
      url: 'https://github.com/caopengau/aiready-cli#readme',
    },
    author: {
      '@type': 'Organization',
      name: 'AIReady',
      url: 'https://getaiready.dev',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      ratingCount: '2',
      bestRating: '5',
      worstRating: '1',
    },
    description: 'CLI tool for analyzing codebase AI readiness. Detects semantic duplicates, analyzes context windows, and checks code consistency to optimize for AI pair programming.',
    featureList: [
      'Semantic duplicate detection across TypeScript/JavaScript codebases',
      'Context window analysis for token usage optimization',
      'Code consistency checking for pattern adherence',
      'AI Readiness Score calculation',
      'Zero network calls - runs completely offline',
      'Open source and free to use',
      'Support for monorepos and large codebases',
    ],
    keywords: 'CLI, code analysis, AI optimization, semantic duplicates, context window, code consistency, developer tools, static analysis, TypeScript, JavaScript',
    programmingLanguage: ['TypeScript', 'JavaScript'],
    codeRepository: 'https://github.com/caopengau/aiready-cli',
    softwareRequirements: 'Node.js 18+',
    releaseNotes: 'https://github.com/caopengau/aiready-cli/releases',
    license: 'https://opensource.org/licenses/MIT',
  };
};

export const generateTechArticleSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': 'https://getaiready.dev/#article',
    headline: 'How to Make Your Codebase AI-Ready',
    description: 'Comprehensive guide to optimizing your codebase for AI collaboration. Learn about semantic duplicates, context window optimization, and code consistency patterns.',
    author: {
      '@type': 'Organization',
      name: 'AIReady',
      url: 'https://getaiready.dev',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AIReady',
      logo: {
        '@type': 'ImageObject',
        url: 'https://getaiready.dev/logo-transparent-bg.png',
      },
    },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    image: {
      '@type': 'ImageObject',
      url: 'https://getaiready.dev/logo-text.png',
      width: 2046,
      height: 800,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://getaiready.dev/',
    },
    proficiencyLevel: 'Beginner',
    dependencies: 'Node.js, npm or pnpm',
    about: [
      {
        '@type': 'Thing',
        name: 'Artificial Intelligence',
      },
      {
        '@type': 'Thing',
        name: 'Software Development',
      },
      {
        '@type': 'Thing',
        name: 'Code Quality',
      },
    ],
  };
};

export const generateCollectionPageSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://getaiready.dev/#collection',
    name: 'AIReady Developer Tools',
    description: 'Collection of free tools for analyzing and optimizing codebases for AI collaboration',
    url: 'https://getaiready.dev',
    hasPart: [
      {
        '@type': 'WebPage',
        name: 'Pattern Detection Tool',
        description: 'Detect semantic duplicates and similar patterns in your codebase',
        url: 'https://getaiready.dev/#pattern-detect',
      },
      {
        '@type': 'WebPage',
        name: 'Context Analyzer',
        description: 'Analyze context window usage and token costs for AI models',
        url: 'https://getaiready.dev/#context-analyzer',
      },
      {
        '@type': 'WebPage',
        name: 'Consistency Checker',
        description: 'Check code consistency and pattern adherence across your project',
        url: 'https://getaiready.dev/#consistency',
      },
    ],
    image: {
      '@type': 'ImageObject',
      url: 'https://getaiready.dev/logo-text.png',
      width: 2046,
      height: 800,
    },
  };
};

// AI-specific meta tags for different search engines
export const aiMetaTags = {
  // OpenAI/ChatGPT specific
  chatgpt: {
    'chatgpt:description': 'AIReady provides free CLI tools for analyzing codebase AI readiness. Run npx @aiready/cli scan . to detect semantic duplicates, analyze context windows, and check code consistency. Completely offline, no code upload required.',
    'chatgpt:category': 'Developer Tools',
    'chatgpt:keywords': 'code analysis, AI optimization, semantic duplicates, developer tools',
  },
  // Perplexity specific
  perplexity: {
    'perplexity:summary': 'Free open-source CLI tool for optimizing codebases for AI pair programming. Key features: semantic duplicate detection, context window analysis, code consistency checking. Install: npx @aiready/cli scan .',
    'perplexity:intent': 'informational, transactional',
  },
  // General AI engines
  general: {
    'ai:summary': 'AIReady CLI analyzes codebases for AI collaboration readiness. Free, open-source, runs offline. Detects semantic duplicates, analyzes token usage, checks pattern consistency.',
    'ai:category': 'Software/Developer Tools',
    'ai:type': 'CLI Tool',
    'ai:pricing': 'Free',
    'ai:license': 'MIT',
  },
};

// Semantic HTML hints for AI parsers
export const semanticHints = {
  mainPurpose: 'AIReady helps developers optimize their codebases for better AI collaboration by detecting issues that confuse AI models.',
  primaryAction: 'Install and run: npx @aiready/cli scan .',
  keyFeatures: [
    'Semantic duplicate detection - finds similar code patterns that waste AI context',
    'Context window analysis - calculates token usage for optimal AI prompting',
    'Code consistency checking - ensures patterns AI models can learn from',
    'AI Readiness Score - quantifies how well your code works with AI',
  ],
  targetAudience: 'Software developers, engineering teams, open source maintainers',
  uniqueValue: 'Unlike linters that check syntax, AIReady checks AI understandability. Runs completely offline with zero network calls.',
  commonQuestions: [
    'Q: Is it free? A: Yes, completely free and open source.',
    'Q: Does it upload my code? A: No, everything runs locally on your machine.',
    'Q: What languages are supported? A: Currently TypeScript/JavaScript, Python and Java coming soon.',
    'Q: How is this different from a linter? A: Linters check correctness, AIReady checks AI understandability.',
  ],
};

// Content hints for AI answer generation
export const answerEngineContent = {
  whatIsIt: 'AIReady is a free CLI tool that analyzes your codebase to identify issues that make it harder for AI models to understand and work with your code.',
  howToUse: 'Run npx @aiready/cli scan . in your project root. The tool will analyze your code and generate a detailed report with an AI Readiness Score and actionable recommendations.',
  whenToUse: 'Use AIReady when starting AI pair programming, before major refactors, during code reviews, or to maintain code quality in AI-assisted development.',
  whyItMatters: 'AI models have context window limits and struggle with inconsistent patterns. AIReady helps you optimize for these constraints, making AI collaboration more effective.',
  comparison: 'Unlike ESLint or TSLint which check code correctness, AIReady specifically checks for patterns that affect AI understanding: semantic duplicates, context fragmentation, and pattern inconsistencies.',
};

