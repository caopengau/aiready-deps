import type {
  Severity,
  GraphData as CoreGraphData,
  GraphNode,
  GraphEdge,
  GraphMetadata as CoreGraphMetadata,
  IssueOverlay,
} from '@aiready/core';

/**
 * Severity levels for issues
 */
export type IssueSeverity = Severity;

/**
 * File node in the dependency graph
 */
export interface FileNode extends GraphNode {
  id: string;
  path: string;
  label: string;

  // Metrics
  linesOfCode?: number;
  tokenCost?: number;
  complexity?: number;

  // Issue counts
  duplicates?: number;
  inconsistencies?: number;

  // Categorization
  domain?: string;
  moduleType?: 'component' | 'util' | 'service' | 'config' | 'test' | 'other';

  // Visual properties (from GraphNode)
  color?: string;
  size?: number;
  group?: string;
}

/**
 * Dependency edge between files
 */
export interface DependencyEdge extends GraphEdge {
  source: string;
  target: string;

  // Edge properties
  type?: 'import' | 'require' | 'dynamic' | any;
  weight?: number;

  // Visual properties (from GraphLink)
  color?: string;
  width?: number;
  label?: string;
}

/**
 * Domain or module cluster
 */
export interface Cluster {
  id: string;
  name: string;
  nodeIds: string[];
  color?: string;
  description?: string;
}

/**
 * Complete graph data structure
 */
export interface GraphData extends CoreGraphData {
  nodes: FileNode[];
  edges: DependencyEdge[];
  clusters: Cluster[];
  issues: IssueOverlay[];
  metadata: CoreGraphMetadata;
}

/**
 * Filter options for the visualization
 */
export interface FilterOptions {
  severities?: IssueSeverity[];
  issueTypes?: string[];
  domains?: string[];
  moduleTypes?: FileNode['moduleType'][];
  minTokenCost?: number;
  maxTokenCost?: number;
  showOnlyIssues?: boolean;
}

/**
 * Layout configuration
 */
export interface LayoutConfig {
  type: 'force' | 'hierarchical' | 'circular' | 'radial';
  chargeStrength?: number;
  linkDistance?: number;
  collisionRadius?: number;
}

/**
 * Visualization configuration
 */
export interface VisualizationConfig {
  layout: LayoutConfig;
  filters: FilterOptions;
  colorBy: 'severity' | 'domain' | 'moduleType' | 'tokenCost';
  sizeBy: 'tokenCost' | 'loc' | 'complexity' | 'duplicates';
  showLabels: boolean;
  showClusters: boolean;
}
