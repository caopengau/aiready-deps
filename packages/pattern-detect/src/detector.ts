import {
  Severity,
  calculateStringSimilarity,
  calculateHeuristicConfidence,
  extractCodeBlocks,
  CodeBlock,
} from '@aiready/core';

import { calculateSeverity } from './context-rules';
import type {
  DuplicatePattern,
  PatternType,
  FileContent,
  DetectionOptions,
} from './core/types';

export type { PatternType, DuplicatePattern };

import { normalizeCode } from './core/normalizer';

/**
 * Local wrapper for code extraction
 */
function extractBlocks(file: string, content: string): CodeBlock[] {
  return extractCodeBlocks(file, content);
}

/**
 * Local wrapper for core similarity
 */
function calculateSimilarity(a: string, b: string): number {
  return calculateStringSimilarity(a, b);
}

/**
 * Local wrapper for core confidence
 */
function calculateConfidence(
  similarity: number,
  tokens: number,
  lines: number
): number {
  return calculateHeuristicConfidence(similarity, tokens, lines);
}

/**
 * Detect duplicate patterns across files
 *
 * @param fileContents - Array of file contents to analyze.
 * @param options - Configuration for duplicate detection (thresholds, progress, etc).
 * @returns Promise resolving to an array of detected duplicate patterns sorted by similarity.
 */
export async function detectDuplicatePatterns(
  fileContents: FileContent[],
  options: DetectionOptions
): Promise<DuplicatePattern[]> {
  const {
    minSimilarity,
    minLines,
    streamResults,
    onProgress,
    excludePatterns = [],
    confidenceThreshold = 0,
    ignoreWhitelist = [],
  } = options;
  const allBlocks: CodeBlock[] = [];

  // Pre-compile exclude regexes
  const excludeRegexes = excludePatterns.map((p) => new RegExp(p, 'i'));

  for (const { file, content } of fileContents) {
    const blocks = extractBlocks(file, content);
    for (const b of blocks) {
      if (b.endLine - b.startLine + 1 < minLines) continue;

      // Filter out blocks matching exclude patterns
      const isExcluded = excludeRegexes.some((regex) => regex.test(b.code));
      if (isExcluded) continue;

      allBlocks.push(b);
    }
  }

  const duplicates: DuplicatePattern[] = [];
  const totalBlocks = allBlocks.length;
  let comparisons = 0;
  const totalComparisons = (totalBlocks * (totalBlocks - 1)) / 2;

  if (onProgress) {
    onProgress(
      0,
      totalComparisons,
      `Starting duplicate detection on ${totalBlocks} blocks...`
    );
  }

  for (let i = 0; i < allBlocks.length; i++) {
    // Yield to the event loop every 50 blocks to prevent blocking for too long
    if (i % 50 === 0 && i > 0) {
      await new Promise((resolve) => setImmediate(resolve));
      if (onProgress) {
        onProgress(
          comparisons,
          totalComparisons,
          `Analyzing blocks (${i}/${totalBlocks})...`
        );
      }
    }

    const b1 = allBlocks[i];
    const isPython1 = b1.file.toLowerCase().endsWith('.py');
    const norm1 = normalizeCode(b1.code, isPython1);

    for (let j = i + 1; j < allBlocks.length; j++) {
      comparisons++;
      const b2 = allBlocks[j];

      if (b1.file === b2.file) continue;

      // Check ignore whitelist (file pairs)
      const isWhitelisted = ignoreWhitelist.some((pattern) => {
        return (
          (b1.file.includes(pattern) && b2.file.includes(pattern)) ||
          pattern === `${b1.file}::${b2.file}` ||
          pattern === `${b2.file}::${b1.file}`
        );
      });
      if (isWhitelisted) continue;

      const isPython2 = b2.file.toLowerCase().endsWith('.py');
      const norm2 = normalizeCode(b2.code, isPython2);
      const sim = calculateSimilarity(norm1, norm2);

      if (sim >= minSimilarity) {
        const confidence = calculateConfidence(
          sim,
          b1.tokens,
          b1.endLine - b1.startLine + 1
        );

        if (confidence < confidenceThreshold) continue;

        const { severity, reason, suggestion, matchedRule } = calculateSeverity(
          b1.file,
          b2.file,
          b1.code,
          sim,
          b1.endLine - b1.startLine + 1
        );

        const dup: DuplicatePattern = {
          file1: b1.file,
          line1: b1.startLine,
          endLine1: b1.endLine,
          file2: b2.file,
          line2: b2.startLine,
          endLine2: b2.endLine,
          code1: b1.code,
          code2: b2.code,
          similarity: sim,
          confidence,
          patternType: b1.patternType as PatternType,

          tokenCost: b1.tokens + b2.tokens,
          severity: severity as Severity,
          reason,
          suggestion,
          matchedRule,
        };

        duplicates.push(dup);
        if (streamResults)
          console.log(
            `[DUPLICATE] ${dup.file1}:${dup.line1} <-> ${dup.file2}:${dup.line2} (${Math.round(sim * 100)}%, conf: ${Math.round(confidence * 100)}%)`
          );
      }
    }
  }

  if (onProgress) {
    onProgress(
      totalComparisons,
      totalComparisons,
      `Duplicate detection complete. Found ${duplicates.length} patterns.`
    );
  }

  return duplicates.sort((a, b) => b.similarity - a.similarity);
}
