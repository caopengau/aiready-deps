import { SignalContext, SignalResult } from './types';
import { isMagicNumber, isMagicString } from '../helpers';
import {
  CATEGORY_MAGIC_LITERAL,
  CATEGORY_DEEP_CALLBACK,
  CALLBACK_DEPTH_THRESHOLD,
} from './constants';
import type { TSESTree } from '@typescript-eslint/types';
import type * as Parser from 'web-tree-sitter';
import {
  isVisualizationFile,
  isCliCommandFile,
  isReactFile,
} from './visitor-helpers';
import {
  checkTreeSitterLiterals,
  checkEsTreeLiterals,
  checkBooleanTraps,
  checkAmbiguousName,
} from './detection-helpers';

/**
 * Traverses the AST and detects structural signals like magic literals,
 * boolean traps, and ambiguous naming that may reduce AI signal clarity.
 *
 * @param ctx - Context for the current signal analysis
 * @param ast - The parsed AST
 * @returns Object containing detected issues and signal counts
 */
export function detectStructuralSignals(
  ctx: SignalContext,
  ast: TSESTree.Node | { rootNode: Parser.Node }
): SignalResult {
  const issues: any[] = [];
  const signals = {
    magicLiterals: 0,
    booleanTraps: 0,
    ambiguousNames: 0,
    deepCallbacks: 0,
  };

  const { filePath, options, domainVocabulary, code } = ctx;

  let callbackDepth = 0;
  let maxCallbackDepth = 0;

  const isConfigFile =
    filePath.endsWith('.config.ts') ||
    filePath.endsWith('.config.js') ||
    filePath.endsWith('.config.mts') ||
    filePath.endsWith('.config.mjs') ||
    filePath.includes('sst.config.ts') ||
    filePath.endsWith('playwright.config.ts');

  const isVisualization = isVisualizationFile(filePath, code);
  const isCliCommand = isCliCommandFile(filePath, code);

  /**
   * Main visitor function for AST traversal.
   */
  const visitNode = (
    node: TSESTree.Node | Parser.Node,
    parent?: TSESTree.Node | Parser.Node,
    keyInParent?: string
  ) => {
    if (!node) return;

    const isTreeSitter = 'namedChildren' in node;

    // --- Magic Literals & Boolean Traps ---
    if (!isConfigFile && !isVisualization && !isCliCommand) {
      if (isTreeSitter) {
        checkTreeSitterLiterals(node as Parser.Node, {
          filePath,
          domainVocabulary,
          signals,
          issues,
        });
      } else {
        const esNode = node as TSESTree.Node;
        if (esNode.type === 'Literal') {
          checkEsTreeLiterals(
            esNode as TSESTree.Literal,
            parent as TSESTree.Node,
            keyInParent,
            { filePath, domainVocabulary, signals, issues, isConfigFile }
          );
        }
      }
    }

    if (!isCliCommand) {
      checkBooleanTraps(node, parent, isTreeSitter, {
        filePath,
        options,
        signals,
        issues,
      });
    }

    checkAmbiguousName(node, { filePath, code, options, signals, issues });

    // --- Callback Depth ---
    const nodeType = (
      (isTreeSitter
        ? (node as Parser.Node).type
        : (node as TSESTree.Node).type) || ''
    ).toLowerCase();
    const isFunction =
      nodeType.includes('function') ||
      nodeType.includes('arrow') ||
      nodeType.includes('lambda') ||
      nodeType === 'method_declaration';

    if (isFunction) {
      callbackDepth++;
      maxCallbackDepth = Math.max(maxCallbackDepth, callbackDepth);
    }

    // Recurse children
    if ('namedChildren' in node) {
      for (const child of node.namedChildren) visitNode(child, node);
    } else {
      const estreeNode = node as any;
      for (const key in estreeNode) {
        if (['parent', 'loc', 'range', 'tokens'].includes(key)) continue;
        const child = estreeNode[key];
        if (child && typeof child === 'object') {
          if (Array.isArray(child)) {
            child.forEach((c) => {
              if (c && typeof c.type === 'string') {
                c.parent = estreeNode;
                visitNode(c, estreeNode, key);
              }
            });
          } else if (typeof child.type === 'string') {
            child.parent = estreeNode;
            visitNode(child, estreeNode, key);
          }
        }
      }
    }

    if (isFunction) callbackDepth--;
  };

  if ('rootNode' in ast) visitNode(ast.rootNode);
  else visitNode(ast as TSESTree.Node);

  const threshold = isReactFile(filePath) ? 5 : CALLBACK_DEPTH_THRESHOLD;
  if (options.checkDeepCallbacks !== false && maxCallbackDepth >= threshold) {
    signals.deepCallbacks = maxCallbackDepth - (threshold - 1);
    issues.push({
      type: 'ai-signal-clarity',
      category: CATEGORY_DEEP_CALLBACK,
      severity: 'major',
      message: `Deeply nested logic (depth ${maxCallbackDepth}) — AI loses control flow context beyond ${threshold} levels.`,
      location: { file: filePath, line: 1 },
      suggestion:
        'Extract nested logic into named functions or flatten the structure.',
    });
  }

  return { issues, signals };
}
