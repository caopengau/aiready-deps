/**
 * Graph builder for the platform - transforms AIReady analysis results into graph data.
 * Refactored from @aiready/visualizer to be environment-agnostic (no fs/path).
 */

export type IssueSeverity = 'critical' | 'major' | 'minor' | 'info';

export interface FileNode {
  id: string;
  label: string;
  value: number;
  color: string;
  title: string;
  duplicates?: number;
  tokenCost?: number;
  severity?: string;
  group?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: FileNode[];
  edges: GraphEdge[];
  metadata?: {
    timestamp: string;
    totalFiles: number;
    totalDependencies: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
    infoIssues: number;
  };
}

export class GraphBuilder {
  private nodesMap: Map<string, FileNode>;
  private edges: GraphEdge[];
  private edgesSet: Set<string>;

  constructor() {
    this.nodesMap = new Map();
    this.edges = [];
    this.edgesSet = new Set();
  }

  private normalizeLabel(filePath: string) {
    // Simple path normalization without 'path' module
    return filePath.split('/').pop() || filePath;
  }

  private extractReferencedPaths(message: string): string[] {
    if (!message || typeof message !== 'string') return [];
    // Basic regex for file paths
    const reRel = /(?:[\w\-.]+\/)+[\w\-.]+\.(?:ts|tsx|js|jsx|py|java|go)/g;
    return (message.match(reRel) || []) as string[];
  }

  private getPackageGroup(fp?: string | null) {
    if (!fp) return undefined;
    const parts = fp.split('/');
    const pkgIdx = parts.indexOf('packages');
    if (pkgIdx >= 0 && parts.length > pkgIdx + 1)
      return `packages/${parts[pkgIdx + 1]}`;
    if (parts.includes('landing')) return 'landing';
    if (parts.includes('scripts')) return 'scripts';
    return parts.length > 1 ? parts[0] : 'root';
  }

  addNode(id: string, title = '', value = 5) {
    if (!id) return;
    if (!this.nodesMap.has(id)) {
      const node: FileNode = {
        id,
        label: this.normalizeLabel(id),
        title,
        value: value || 5,
        color: '#97c2fc',
      };
      this.nodesMap.set(id, node);
    } else {
      const node = this.nodesMap.get(id)!;
      if (title && !node.title.includes(title)) {
        node.title = (node.title ? node.title + '\n' : '') + title;
      }
      if (value > node.value) node.value = value;
    }
  }

  addEdge(from: string, to: string, type: string = 'link') {
    if (!from || !to || from === to) return;
    const key = `${from}->${to}`;
    if (!this.edgesSet.has(key)) {
      this.edges.push({ source: from, target: to, type });
      this.edgesSet.add(key);
    }
  }

  static buildFromReport(report: any): GraphData {
    const builder = new GraphBuilder();
    const fileIssues: Map<
      string,
      { count: number; maxSeverity: IssueSeverity | null; duplicates: number }
    > = new Map();

    const rankSeverity = (s?: string | null): IssueSeverity | null => {
      if (!s) return null;
      const ss = String(s).toLowerCase();
      if (ss.includes('critical')) return 'critical';
      if (ss.includes('major')) return 'major';
      if (ss.includes('minor')) return 'minor';
      if (ss.includes('info')) return 'info';
      return null;
    };

    const bumpIssue = (file: string, sev?: IssueSeverity | null) => {
      if (!file) return;
      if (!fileIssues.has(file))
        fileIssues.set(file, { count: 0, maxSeverity: null, duplicates: 0 });
      const rec = fileIssues.get(file)!;
      rec.count += 1;
      if (sev) {
        const order = { critical: 3, major: 2, minor: 1, info: 0 };
        if (!rec.maxSeverity || order[sev] > order[rec.maxSeverity])
          rec.maxSeverity = sev;
      }
    };

    // 1. Process patterns
    (report.patterns || []).forEach((entry: any) => {
      const file = entry.fileName;
      builder.addNode(
        file,
        `Issues: ${(entry.issues || []).length}`,
        entry.metrics?.tokenCost || 5
      );

      (entry.issues || []).forEach((issue: any) => {
        const sev = rankSeverity(issue.severity || null);
        bumpIssue(file, sev);

        const refs = builder.extractReferencedPaths(issue.message || '');
        refs.forEach((ref) => {
          builder.addNode(ref, 'Referenced file', 5);
          builder.addEdge(file, ref, 'reference');
        });
      });
    });

    // 2. Duplicates
    (report.duplicates || []).forEach((dup: any) => {
      builder.addNode(dup.file1, 'Similarity target', 5);
      builder.addNode(dup.file2, 'Similarity target', 5);
      builder.addEdge(dup.file1, dup.file2, 'similarity');

      if (!fileIssues.has(dup.file1))
        fileIssues.set(dup.file1, {
          count: 0,
          maxSeverity: null,
          duplicates: 0,
        });
      if (!fileIssues.has(dup.file2))
        fileIssues.set(dup.file2, {
          count: 0,
          maxSeverity: null,
          duplicates: 0,
        });
      fileIssues.get(dup.file1)!.duplicates += 1;
      fileIssues.get(dup.file2)!.duplicates += 1;
    });

    // 3. Context
    (report.context || []).forEach((ctx: any) => {
      const file = ctx.file;
      builder.addNode(file, `Deps: ${ctx.dependencyCount || 0}`, 10);

      (ctx.issues || []).forEach((issue: any) => {
        const sev = rankSeverity(
          typeof issue === 'string' ? null : issue.severity
        );
        bumpIssue(file, sev);
      });

      (ctx.relatedFiles || []).forEach((rel: string) => {
        builder.addNode(rel, 'Related file', 5);
        builder.addEdge(file, rel, 'related');
      });

      (ctx.dependencyList || []).forEach((dep: string) => {
        // Only add internal dependencies for clarity
        if (dep.startsWith('.') || dep.startsWith('@aiready')) {
          builder.addNode(dep, 'Dependency', 2);
          builder.addEdge(file, dep, 'dependency');
        }
      });
    });

    const colorFor = (sev: IssueSeverity | null) => {
      switch (sev) {
        case 'critical':
          return '#ff4d4f';
        case 'major':
          return '#ff9900';
        case 'minor':
          return '#ffd666';
        case 'info':
          return '#91d5ff';
        default:
          return '#97c2fc';
      }
    };

    let criticalIssues = 0,
      majorIssues = 0,
      minorIssues = 0,
      infoIssues = 0;

    const nodes = Array.from((builder as any).nodesMap.values()) as FileNode[];
    for (const node of nodes) {
      const rec = fileIssues.get(node.id);
      if (rec) {
        node.duplicates = rec.duplicates;
        node.color = colorFor(rec.maxSeverity);
        node.group = builder.getPackageGroup(node.id);
        if (rec.maxSeverity === 'critical') criticalIssues += rec.count;
        else if (rec.maxSeverity === 'major') majorIssues += rec.count;
        else if (rec.maxSeverity === 'minor') minorIssues += rec.count;
        else if (rec.maxSeverity === 'info') infoIssues += rec.count;
      }
    }

    return {
      nodes,
      edges: (builder as any).edges,
      metadata: {
        timestamp: new Date().toISOString(),
        totalFiles: nodes.length,
        totalDependencies: (builder as any).edges.length,
        criticalIssues,
        majorIssues,
        minorIssues,
        infoIssues,
      },
    };
  }
}
