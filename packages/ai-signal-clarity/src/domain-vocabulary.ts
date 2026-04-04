/**
 * Domain Vocabulary Awareness for AI Signal Clarity.
 *
 * Extracts domain-specific vocabulary from the codebase to reduce false positives.
 * Common identifiers, imports, and constants are considered valid domain terms.
 *
 * @lastUpdated 2026-03-27
 */

import { readFileSync } from 'fs';
import { getParser } from '@aiready/core';

/**
 * Domain vocabulary cache to avoid re-scanning files
 */
const vocabularyCache = new Map<string, Set<string>>();

/**
 * Extract domain vocabulary from a file.
 * Collects identifiers from imports, exports, constants, and function names.
 */
export async function extractDomainVocabulary(
  filePath: string
): Promise<Set<string>> {
  // Check cache first
  if (vocabularyCache.has(filePath)) {
    return vocabularyCache.get(filePath)!;
  }

  const vocabulary = new Set<string>();

  try {
    const code = readFileSync(filePath, 'utf-8');
    const parser = await getParser(filePath);

    if (parser) {
      await parser.initialize();
      const parseResult = parser.parse(code, filePath);

      // Extract from imports
      for (const imp of parseResult.imports) {
        for (const spec of imp.specifiers) {
          if (spec && spec !== '*' && spec !== 'default') {
            vocabulary.add(spec.toLowerCase());
          }
        }
      }

      // Extract from exports
      for (const exp of parseResult.exports) {
        if (exp.name && exp.name !== 'default') {
          vocabulary.add(exp.name.toLowerCase());
        }
      }
    }

    // Also extract common identifiers using regex (fallback)
    const identifierPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    const matches = code.match(identifierPattern) || [];

    // Count identifier frequency
    const frequency = new Map<string, number>();
    for (const match of matches) {
      const lower = match.toLowerCase();
      frequency.set(lower, (frequency.get(lower) || 0) + 1);
    }

    // Add identifiers that appear multiple times (likely domain terms)
    for (const [identifier, count] of frequency.entries()) {
      if (count >= 2 && identifier.length >= 3) {
        vocabulary.add(identifier);
      }
    }

    // Cache the result
    vocabularyCache.set(filePath, vocabulary);
  } catch (_error) {
    // Silently ignore errors
  }

  return vocabulary;
}

/**
 * Build a combined domain vocabulary from multiple files.
 */
export async function buildDomainVocabulary(
  files: string[],
  maxFiles: number = 50
): Promise<Set<string>> {
  const combinedVocabulary = new Set<string>();

  // Process a sample of files to build vocabulary
  const sampleFiles = files.slice(0, maxFiles);

  for (const file of sampleFiles) {
    const fileVocabulary = await extractDomainVocabulary(file);
    for (const term of fileVocabulary) {
      combinedVocabulary.add(term);
    }
  }

  return combinedVocabulary;
}

/**
 * Check if a term is a domain-specific term.
 *
 * @param term - The word to check
 * @param domainVocabulary - The set of known domain terms
 */
export function isDomainTerm(
  term: string,
  domainVocabulary: Set<string>
): boolean {
  return domainVocabulary.has(term.toLowerCase());
}

/**
 * Clear the vocabulary cache (useful for testing)
 */
export function clearVocabularyCache(): void {
  vocabularyCache.clear();
}
