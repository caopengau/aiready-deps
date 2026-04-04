/**
 * Shared dependency graph utilities used by context analyzers.
 */

export function calculateImportDepthFromEdges(
  file: string,
  edges: Map<string, Set<string>>,
  visited = new Set<string>(),
  depth = 0
): number {
  if (visited.has(file)) return depth;

  const dependencies = edges.get(file);
  if (!dependencies || dependencies.size === 0) return depth;

  const nextVisited = new Set(visited);
  nextVisited.add(file);

  let maxDepth = depth;
  for (const dep of dependencies) {
    maxDepth = Math.max(
      maxDepth,
      calculateImportDepthFromEdges(dep, edges, nextVisited, depth + 1)
    );
  }

  return maxDepth;
}

export function getTransitiveDependenciesFromEdges(
  file: string,
  edges: Map<string, Set<string>>,
  visited = new Set<string>()
): Map<string, number> {
  const result = new Map<string, number>();

  function dfs(current: string, depth: number) {
    if (visited.has(current)) {
      const existingDepth = result.get(current);
      if (existingDepth !== undefined && depth < existingDepth) {
        result.set(current, depth);
      }
      return;
    }
    visited.add(current);

    if (current !== file) {
      result.set(current, depth);
    }

    const dependencies = edges.get(current);
    if (!dependencies) return;

    for (const dep of dependencies) {
      dfs(dep, depth + 1);
    }
  }

  dfs(file, 0);
  return result;
}

export function detectGraphCycles(edges: Map<string, Set<string>>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(file: string, path: string[]): void {
    if (recursionStack.has(file)) {
      const cycleStart = path.indexOf(file);
      if (cycleStart !== -1) {
        cycles.push([...path.slice(cycleStart), file]);
      }
      return;
    }

    if (visited.has(file)) return;

    visited.add(file);
    recursionStack.add(file);

    const dependencies = edges.get(file);
    if (dependencies) {
      for (const dep of dependencies) {
        dfs(dep, [...path, file]);
      }
    }

    recursionStack.delete(file);
  }

  for (const file of edges.keys()) {
    if (!visited.has(file)) {
      dfs(file, []);
    }
  }

  return cycles;
}

export function detectGraphCyclesFromFile(
  file: string,
  edges: Map<string, Set<string>>
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(current: string, path: string[]): void {
    if (recursionStack.has(current)) {
      const cycleStart = path.indexOf(current);
      if (cycleStart !== -1) {
        cycles.push([...path.slice(cycleStart), current]);
      }
      return;
    }

    if (visited.has(current)) return;

    visited.add(current);
    recursionStack.add(current);

    const dependencies = edges.get(current);
    if (dependencies) {
      for (const dep of dependencies) {
        dfs(dep, [...path, current]);
      }
    }

    recursionStack.delete(current);
  }

  dfs(file, []);
  return cycles;
}
