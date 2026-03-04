import type { DependencyNode, FileClassification } from './types';

/**
 * Classify a file into a specific type for better analysis context
 */
export function classifyFile(
  node: DependencyNode,
  cohesionScore: number = 1,
  domains: string[] = []
): FileClassification {
  // 1. Detect barrel exports (primarily re-exports)
  if (isBarrelExport(node)) {
    return 'barrel-export';
  }

  // 2. Detect type definition files
  if (isTypeDefinition(node)) {
    return 'type-definition';
  }

  // 3. Detect Next.js App Router pages
  if (isNextJsPage(node)) {
    return 'nextjs-page';
  }

  // 4. Detect Lambda handlers
  if (isLambdaHandler(node)) {
    return 'lambda-handler';
  }

  // 5. Detect Service files
  if (isServiceFile(node)) {
    return 'service-file';
  }

  // 6. Detect Email templates
  if (isEmailTemplate(node)) {
    return 'email-template';
  }

  // 7. Detect Parser/Transformer files
  if (isParserFile(node)) {
    return 'parser-file';
  }

  // 8. Detect Session/State management files
  if (isSessionFile(node)) {
    // If it has high cohesion, it's a cohesive module
    if (cohesionScore >= 0.25 && domains.length <= 1) return 'cohesive-module';
    return 'utility-module'; // Group with utility for now
  }

  // 9. Detect Utility modules (multi-domain but functional purpose)
  if (isUtilityModule(node)) {
    return 'utility-module';
  }

  // 10. Detect Config/Schema files
  if (isConfigFile(node)) {
    return 'cohesive-module';
  }

  // Cohesion and Domain heuristics
  if (domains.length <= 1 && domains[0] !== 'unknown') {
    return 'cohesive-module';
  }

  if (domains.length > 1 && cohesionScore < 0.4) {
    return 'mixed-concerns';
  }

  if (cohesionScore >= 0.7) {
    return 'cohesive-module';
  }

  return 'unknown';
}

/**
 * Detect if a file is a barrel export (index.ts)
 */
export function isBarrelExport(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  // Barrel files are typically named index.ts or index.js
  const isIndexFile = fileName === 'index.ts' || fileName === 'index.js';

  // Small file with many exports is likely a barrel
  const isSmallAndManyExports =
    node.tokenCost < 1000 && (exports || []).length > 5;

  // RE-EXPORT HEURISTIC for non-index files
  const isReexportPattern =
    (exports || []).length >= 5 &&
    (exports || []).every(
      (e) =>
        e.type === 'const' ||
        e.type === 'function' ||
        e.type === 'type' ||
        e.type === 'interface'
    );

  return !!isIndexFile || !!isSmallAndManyExports || !!isReexportPattern;
}

/**
 * Detect if a file is primarily type definitions
 */
export function isTypeDefinition(node: DependencyNode): boolean {
  const { file } = node;

  // Check file extension
  if (file.endsWith('.d.ts')) return true;

  // Check if all exports are types or interfaces
  const nodeExports = node.exports || [];
  const hasExports = nodeExports.length > 0;
  const areAllTypes =
    hasExports &&
    nodeExports.every((e) => e.type === 'type' || e.type === 'interface');
  const allTypes: boolean = !!areAllTypes;

  // Check if path includes 'types' or 'interfaces'
  const isTypePath =
    file.toLowerCase().includes('/types/') ||
    file.toLowerCase().includes('/interfaces/') ||
    file.toLowerCase().includes('/models/');

  return allTypes || (isTypePath && hasExports);
}

/**
 * Detect if a file is a utility module
 */
export function isUtilityModule(node: DependencyNode): boolean {
  const { file } = node;

  // Check if path includes 'utils', 'helpers', etc.
  const isUtilPath =
    file.toLowerCase().includes('/utils/') ||
    file.toLowerCase().includes('/helpers/') ||
    file.toLowerCase().includes('/util/') ||
    file.toLowerCase().includes('/helper/');

  const fileName = file.split('/').pop()?.toLowerCase();
  const isUtilName =
    fileName?.includes('utils.') ||
    fileName?.includes('helpers.') ||
    fileName?.includes('util.') ||
    fileName?.includes('helper.');

  return !!isUtilPath || !!isUtilName;
}

/**
 * Detect if a file is a Lambda/API handler
 */
export function isLambdaHandler(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  const handlerPatterns = [
    'handler',
    '.handler.',
    '-handler.',
    'lambda',
    '.lambda.',
    '-lambda.',
  ];
  const isHandlerName = handlerPatterns.some((pattern) =>
    fileName?.includes(pattern)
  );

  const isHandlerPath =
    file.toLowerCase().includes('/handlers/') ||
    file.toLowerCase().includes('/lambdas/') ||
    file.toLowerCase().includes('/lambda/') ||
    file.toLowerCase().includes('/functions/');

  const hasHandlerExport = (exports || []).some(
    (e) =>
      e.name.toLowerCase() === 'handler' ||
      e.name.toLowerCase() === 'main' ||
      e.name.toLowerCase() === 'lambdahandler' ||
      e.name.toLowerCase().endsWith('handler')
  );

  return !!isHandlerName || !!isHandlerPath || !!hasHandlerExport;
}

/**
 * Detect if a file is a service file
 */
export function isServiceFile(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  const servicePatterns = ['service', '.service.', '-service.', '_service.'];
  const isServiceName = servicePatterns.some((pattern) =>
    fileName?.includes(pattern)
  );
  const isServicePath = file.toLowerCase().includes('/services/');
  const hasServiceNamedExport = (exports || []).some(
    (e) =>
      e.name.toLowerCase().includes('service') ||
      e.name.toLowerCase().endsWith('service')
  );
  const hasClassExport = (exports || []).some((e) => e.type === 'class');

  return (
    !!isServiceName ||
    !!isServicePath ||
    (!!hasServiceNamedExport && !!hasClassExport)
  );
}

/**
 * Detect if a file is an email template/layout
 */
export function isEmailTemplate(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  const emailTemplatePatterns = [
    '-email-',
    '.email.',
    '_email_',
    '-template',
    '.template.',
    '_template',
    '-mail.',
    '.mail.',
  ];
  const isEmailTemplateName = emailTemplatePatterns.some((pattern) =>
    fileName?.includes(pattern)
  );
  const isEmailPath =
    file.toLowerCase().includes('/emails/') ||
    file.toLowerCase().includes('/mail/') ||
    file.toLowerCase().includes('/notifications/');

  const hasTemplateFunction = (exports || []).some(
    (e) =>
      e.type === 'function' &&
      (e.name.toLowerCase().startsWith('render') ||
        e.name.toLowerCase().startsWith('generate') ||
        (e.name.toLowerCase().includes('template') &&
          e.name.toLowerCase().includes('email')))
  );

  return !!isEmailPath || !!isEmailTemplateName || !!hasTemplateFunction;
}

/**
 * Detect if a file is a parser/transformer
 */
export function isParserFile(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  const parserPatterns = [
    'parser',
    '.parser.',
    '-parser.',
    '_parser.',
    'transform',
    '.transform.',
    'converter',
    'mapper',
    'serializer',
  ];
  const isParserName = parserPatterns.some((pattern) =>
    fileName?.includes(pattern)
  );
  const isParserPath =
    file.toLowerCase().includes('/parsers/') ||
    file.toLowerCase().includes('/transformers/');

  const hasParseFunction = (exports || []).some(
    (e) =>
      e.type === 'function' &&
      (e.name.toLowerCase().startsWith('parse') ||
        e.name.toLowerCase().startsWith('transform') ||
        e.name.toLowerCase().startsWith('extract'))
  );

  return !!isParserName || !!isParserPath || !!hasParseFunction;
}

/**
 * Detect if a file is a session/state management file
 */
export function isSessionFile(node: DependencyNode): boolean {
  const { file, exports } = node;
  const fileName = file.split('/').pop()?.toLowerCase();

  const sessionPatterns = ['session', 'state', 'context', 'store'];
  const isSessionName = sessionPatterns.some((pattern) =>
    fileName?.includes(pattern)
  );
  const isSessionPath =
    file.toLowerCase().includes('/sessions/') ||
    file.toLowerCase().includes('/state/');

  const hasSessionExport = (exports || []).some(
    (e) =>
      e.name.toLowerCase().includes('session') ||
      e.name.toLowerCase().includes('state') ||
      e.name.toLowerCase().includes('store')
  );

  return !!isSessionName || !!isSessionPath || !!hasSessionExport;
}

/**
 * Detect if a file is a configuration or schema file
 */
export function isConfigFile(node: DependencyNode): boolean {
  const { file, exports } = node;
  const lowerPath = file.toLowerCase();
  const fileName = file.split('/').pop()?.toLowerCase();

  const configPatterns = [
    '.config.',
    'tsconfig',
    'jest.config',
    'package.json',
    'aiready.json',
    'next.config',
    'sst.config',
  ];
  const isConfigName = configPatterns.some((p) => fileName?.includes(p));
  const isConfigPath =
    lowerPath.includes('/config/') ||
    lowerPath.includes('/settings/') ||
    lowerPath.includes('/schemas/');

  const hasSchemaExports = (exports || []).some(
    (e) =>
      e.name.toLowerCase().includes('schema') ||
      e.name.toLowerCase().includes('config') ||
      e.name.toLowerCase().includes('setting')
  );

  return !!isConfigName || !!isConfigPath || !!hasSchemaExports;
}

/**
 * Detect if a file is a Next.js App Router page
 */
export function isNextJsPage(node: DependencyNode): boolean {
  const { file, exports } = node;
  const lowerPath = file.toLowerCase();
  const fileName = file.split('/').pop()?.toLowerCase();

  const isInAppDir =
    lowerPath.includes('/app/') || lowerPath.startsWith('app/');
  const isPageFile = fileName === 'page.tsx' || fileName === 'page.ts';

  if (!isInAppDir || !isPageFile) return false;

  const hasDefaultExport = (exports || []).some((e) => e.type === 'default');
  const nextJsExports = [
    'metadata',
    'generatemetadata',
    'faqjsonld',
    'jsonld',
    'icon',
  ];
  const hasNextJsExports = (exports || []).some((e) =>
    nextJsExports.includes(e.name.toLowerCase())
  );

  return !!hasDefaultExport || !!hasNextJsExports;
}

/**
 * Adjust cohesion score based on file classification
 */
export function adjustCohesionForClassification(
  baseCohesion: number,
  classification: FileClassification,
  node?: DependencyNode
): number {
  switch (classification) {
    case 'barrel-export':
      return 1;
    case 'type-definition':
      return 1;
    case 'nextjs-page':
      return 1;
    case 'utility-module': {
      if (
        node &&
        hasRelatedExportNames(
          (node.exports || []).map((e) => e.name.toLowerCase())
        )
      ) {
        return Math.max(0.8, Math.min(1, baseCohesion + 0.45));
      }
      return Math.max(0.75, Math.min(1, baseCohesion + 0.35));
    }
    case 'service-file':
      return Math.max(0.72, Math.min(1, baseCohesion + 0.3));
    case 'lambda-handler':
      return Math.max(0.75, Math.min(1, baseCohesion + 0.35));
    case 'email-template':
      return Math.max(0.72, Math.min(1, baseCohesion + 0.3));
    case 'parser-file':
      return Math.max(0.7, Math.min(1, baseCohesion + 0.3));
    case 'cohesive-module':
      return Math.max(baseCohesion, 0.7);
    case 'mixed-concerns':
      return baseCohesion;
    default:
      return Math.min(1, baseCohesion + 0.1);
  }
}

/**
 * Check if export names suggest related functionality
 */
function hasRelatedExportNames(exportNames: string[]): boolean {
  if (exportNames.length < 2) return true;

  const stems = new Set<string>();
  const domains = new Set<string>();

  const verbs = [
    'get',
    'set',
    'create',
    'update',
    'delete',
    'fetch',
    'save',
    'load',
    'parse',
    'format',
    'validate',
  ];
  const domainPatterns = [
    'user',
    'order',
    'product',
    'session',
    'email',
    'file',
    'db',
    'api',
    'config',
  ];

  for (const name of exportNames) {
    for (const verb of verbs) {
      if (name.startsWith(verb) && name.length > verb.length) {
        stems.add(name.slice(verb.length).toLowerCase());
      }
    }
    for (const domain of domainPatterns) {
      if (name.includes(domain)) domains.add(domain);
    }
  }

  if (stems.size === 1 || domains.size === 1) return true;

  return false;
}

/**
 * Adjust fragmentation score based on file classification
 */
export function adjustFragmentationForClassification(
  baseFragmentation: number,
  classification: FileClassification
): number {
  switch (classification) {
    case 'barrel-export':
      return 0;
    case 'type-definition':
      return 0;
    case 'utility-module':
    case 'service-file':
    case 'lambda-handler':
    case 'email-template':
    case 'parser-file':
    case 'nextjs-page':
      return baseFragmentation * 0.2;
    case 'cohesive-module':
      return baseFragmentation * 0.3;
    case 'mixed-concerns':
      return baseFragmentation;
    default:
      return baseFragmentation * 0.7;
  }
}
