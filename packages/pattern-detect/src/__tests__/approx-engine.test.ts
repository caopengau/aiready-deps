import { describe, it, expect } from 'vitest';
import { ApproxEngine } from '../core/approx-engine';
import type { CodeBlock } from '../core/types';

describe('ApproxEngine', () => {
  const createBlock = (file: string, startLine: number, endLine: number): CodeBlock => ({
    file,
    startLine,
    endLine,
    code: '',
    patternType: 'function',
  });

  describe('findCandidates', () => {
    it('should find candidates with shared rare tokens', () => {
      // Need enough blocks so rareTokens filter (freq < blocks.length * 0.1) works
      // With 30 blocks, threshold is 3, so tokens appearing <=2 times are rare
      const blocks: CodeBlock[] = [];
      const tokens: string[][] = [];

      // Add 28 unique blocks to dilute frequency
      for (let i = 0; i < 28; i++) {
        blocks.push(createBlock(`file${i}.ts`, 1, 5));
        tokens.push([`unique${i}`, `token${i}`, `data${i}`]);
      }

      // Add two blocks that share a rare token (appears 2 times < threshold of 3)
      blocks.push(createBlock('fileA.ts', 1, 5));
      tokens.push(['sharedRare', 'commonA', 'specificA1']);
      
      blocks.push(createBlock('fileB.ts', 1, 5));
      tokens.push(['sharedRare', 'commonB', 'specificB1']);

      const engine = new ApproxEngine(blocks, tokens);
      const candidates = engine.findCandidates(28, 1, 10);

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0].j).toBe(29);
      expect(candidates[0].shared).toBe(1);
    });

    it('should not return candidates from same file', () => {
      const blocks: CodeBlock[] = [];
      const tokens: string[][] = [];

      // Add 28 unique blocks
      for (let i = 0; i < 28; i++) {
        blocks.push(createBlock(`unique${i}.ts`, 1, 5));
        tokens.push([`token${i}`, `data${i}`, `id${i}`]);
      }

      // Add two blocks from same file with shared rare token
      blocks.push(createBlock('shared.ts', 1, 5));
      tokens.push(['sharedRare', 'func1']);
      
      blocks.push(createBlock('shared.ts', 10, 15));
      tokens.push(['sharedRare', 'func2']);

      const engine = new ApproxEngine(blocks, tokens);
      const candidates = engine.findCandidates(28, 1, 10);

      const sameFileCandidates = candidates.filter(c => blocks[c.j].file === 'shared.ts');
      expect(sameFileCandidates).toHaveLength(0);
    });

    it('should not return candidates with index <= blockIdx', () => {
      const blocks: CodeBlock[] = [
        createBlock('file1.ts', 1, 5),
        createBlock('file2.ts', 1, 5),
      ];
      const tokens = [
        ['foo', 'bar'],
        ['foo', 'bar'],
      ];

      const engine = new ApproxEngine(blocks, tokens);
      const candidates = engine.findCandidates(1, 1, 10);

      expect(candidates).toHaveLength(0);
    });

    it('should respect minSharedTokens threshold', () => {
      const blocks: CodeBlock[] = [];
      const tokens: string[][] = [];

      // Add 28 unique blocks
      for (let i = 0; i < 28; i++) {
        blocks.push(createBlock(`file${i}.ts`, 1, 5));
        tokens.push([`token${i}`, `data${i}`]);
      }

      // Add two blocks with only 1 shared rare token
      blocks.push(createBlock('fileA.ts', 1, 5));
      tokens.push(['sharedRare', 'uniqueA']);
      
      blocks.push(createBlock('fileB.ts', 1, 5));
      tokens.push(['sharedRare', 'uniqueB']);

      const engine = new ApproxEngine(blocks, tokens);
      // Require 2 shared tokens but they only share 1
      const candidates = engine.findCandidates(28, 2, 10);

      expect(candidates).toHaveLength(0);
    });

    it('should respect maxCandidates limit', () => {
      const blocks: CodeBlock[] = [];
      const tokens: string[][] = [];

      // Add 28 unique blocks
      for (let i = 0; i < 28; i++) {
        blocks.push(createBlock(`file${i}.ts`, 1, 5));
        tokens.push([`token${i}`, `data${i}`]);
      }

      // Add one block with a rare token
      blocks.push(createBlock('target.ts', 1, 5));
      tokens.push(['sharedRare', 'unique1']);
      
      // Add 3 more blocks sharing that rare token
      for (let i = 0; i < 3; i++) {
        blocks.push(createBlock(`match${i}.ts`, 1, 5));
        tokens.push(['sharedRare', `unique${i + 2}`]);
      }

      const engine = new ApproxEngine(blocks, tokens);
      const candidates = engine.findCandidates(28, 1, 2);

      expect(candidates.length).toBeLessThanOrEqual(2);
    });

    it('should sort candidates by shared token count descending', () => {
      const blocks: CodeBlock[] = [];
      const tokens: string[][] = [];

      // Add 28 unique blocks
      for (let i = 0; i < 28; i++) {
        blocks.push(createBlock(`file${i}.ts`, 1, 5));
        tokens.push([`token${i}`, `data${i}`]);
      }

      // Add target block
      blocks.push(createBlock('target.ts', 1, 5));
      tokens.push(['rare1', 'rare2', 'common']);
      
      // Block with 2 shared rare tokens
      blocks.push(createBlock('match1.ts', 1, 5));
      tokens.push(['rare1', 'rare2', 'other1']);
      
      // Block with 1 shared rare token
      blocks.push(createBlock('match2.ts', 1, 5));
      tokens.push(['rare1', 'other2', 'other3']);

      const engine = new ApproxEngine(blocks, tokens);
      const candidates = engine.findCandidates(28, 1, 10);

      expect(candidates.length).toBe(2);
      expect(candidates[0].shared).toBeGreaterThanOrEqual(candidates[1].shared);
    });

    it('should return empty for single block', () => {
      const blocks: CodeBlock[] = [
        createBlock('file1.ts', 1, 5),
      ];
      const tokens = [
        ['foo', 'bar', 'baz'],
      ];

      const engine = new ApproxEngine(blocks, tokens);
      const candidates = engine.findCandidates(0, 1, 10);

      expect(candidates).toHaveLength(0);
    });
  });
});
