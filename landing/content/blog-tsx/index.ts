import InvisibleCodebase from './invisible-codebase';
import invisibleCodebaseMeta from './invisible-codebase.meta';
import AiCodeDebtTsunami from './ai-code-debt-tsunami';
import aiCodeDebtTsunamiMeta from './ai-code-debt-tsunami.meta';
import MetricsThatMatter from './metrics-that-actually-matter';
import metricsThatMatterMeta from './metrics-that-actually-matter.meta';
import SemanticDuplicateDetection from './semantic-duplicate-detection';
import semanticDuplicateDetectionMeta from './semantic-duplicate-detection.meta';
import HiddenCostImportChains from './hidden-cost-import-chains';
import hiddenCostImportChainsMeta from './hidden-cost-import-chains.meta';
import VisualizingInvisible from './visualizing-invisible';
import visualizingInvisibleMeta from './visualizing-invisible.meta';
import FutureHumanFriendlyCode from './future-human-friendly-code';
import futureHumanFriendlyCodeMeta from './future-human-friendly-code.meta';

export const posts = [
  {
    slug: futureHumanFriendlyCodeMeta.slug,
    title: futureHumanFriendlyCodeMeta.title,
    date: futureHumanFriendlyCodeMeta.date,
    excerpt: futureHumanFriendlyCodeMeta.excerpt,
    author: futureHumanFriendlyCodeMeta.author,
    tags: futureHumanFriendlyCodeMeta.tags || [],
    readingTime: futureHumanFriendlyCodeMeta.readingTime,
    Content: FutureHumanFriendlyCode,
  },
  {
    slug: visualizingInvisibleMeta.slug,
    title: visualizingInvisibleMeta.title,
    date: visualizingInvisibleMeta.date,
    excerpt: visualizingInvisibleMeta.excerpt,
    author: visualizingInvisibleMeta.author,
    tags: visualizingInvisibleMeta.tags || [],
    readingTime: visualizingInvisibleMeta.readingTime,
    Content: VisualizingInvisible,
  },
  {
    slug: invisibleCodebaseMeta.slug,
    title: invisibleCodebaseMeta.title,
    date: invisibleCodebaseMeta.date,
    excerpt: invisibleCodebaseMeta.excerpt,
    author: invisibleCodebaseMeta.author,
    tags: invisibleCodebaseMeta.tags || [],
    readingTime: invisibleCodebaseMeta.readingTime,
    Content: InvisibleCodebase,
  },
  {
    slug: aiCodeDebtTsunamiMeta.slug,
    title: aiCodeDebtTsunamiMeta.title,
    date: aiCodeDebtTsunamiMeta.date,
    excerpt: aiCodeDebtTsunamiMeta.excerpt,
    author: aiCodeDebtTsunamiMeta.author,
    tags: aiCodeDebtTsunamiMeta.tags || [],
    readingTime: aiCodeDebtTsunamiMeta.readingTime,
    Content: AiCodeDebtTsunami,
  },
  {
    slug: metricsThatMatterMeta.slug,
    title: metricsThatMatterMeta.title,
    date: metricsThatMatterMeta.date,
    excerpt: metricsThatMatterMeta.excerpt,
    author: metricsThatMatterMeta.author,
    tags: metricsThatMatterMeta.tags || [],
    readingTime: metricsThatMatterMeta.readingTime,
    Content: MetricsThatMatter,
  },
  {
    slug: semanticDuplicateDetectionMeta.slug,
    title: semanticDuplicateDetectionMeta.title,
    date: semanticDuplicateDetectionMeta.date,
    excerpt: semanticDuplicateDetectionMeta.excerpt,
    author: semanticDuplicateDetectionMeta.author,
    tags: semanticDuplicateDetectionMeta.tags || [],
    readingTime: semanticDuplicateDetectionMeta.readingTime,
    Content: SemanticDuplicateDetection,
  },
  {
    slug: hiddenCostImportChainsMeta.slug,
    title: hiddenCostImportChainsMeta.title,
    date: hiddenCostImportChainsMeta.date,
    excerpt: hiddenCostImportChainsMeta.excerpt,
    author: hiddenCostImportChainsMeta.author,
    tags: hiddenCostImportChainsMeta.tags || [],
    readingTime: hiddenCostImportChainsMeta.readingTime,
    Content: HiddenCostImportChains,
  },
];
