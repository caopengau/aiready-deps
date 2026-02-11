import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  [key: string]: any;
}

export interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  source: string | SimulationNode;
  target: string | SimulationNode;
  [key: string]: any;
}

export interface ForceSimulationOptions {
  /**
   * Strength of the charge force (repulsion between nodes)
   * @default -300
   */
  chargeStrength?: number;

  /**
   * Distance for links between nodes
   * @default 100
   */
  linkDistance?: number;

  /**
   * Strength of the link force
   * @default 1
   */
  linkStrength?: number;

  /**
   * Strength of collision detection
   * @default 1
   */
  collisionStrength?: number;

  /**
   * Radius for collision detection (node size)
   * @default 10
   */
  collisionRadius?: number;

  /**
   * Strength of centering force
   * @default 0.1
   */
  centerStrength?: number;

  /**
   * Width of the simulation space
   */
  width: number;

  /**
   * Height of the simulation space
   */
  height: number;

  /**
   * Alpha decay rate (how quickly the simulation cools down)
   * @default 0.0228
   */
  alphaDecay?: number;

  /**
   * Velocity decay (friction)
   * @default 0.4
   */
  velocityDecay?: number;

  /**
   * Optional tick callback invoked on each simulation tick with current nodes/links and the simulation instance
   */
  onTick?: (nodes: SimulationNode[], links: SimulationLink[], sim: d3.Simulation<SimulationNode, SimulationLink>) => void;
}

export interface UseForceSimulationReturn {
  /**
   * Current nodes with positions
   */
  nodes: SimulationNode[];

  /**
   * Current links
   */
  links: SimulationLink[];

  /**
   * Restart the simulation
   */
  restart: () => void;

  /**
   * Stop the simulation
   */
  stop: () => void;

  /**
   * Whether the simulation is currently running
   */
  isRunning: boolean;

  /**
   * Current alpha value (simulation heat)
   */
  alpha: number;
}

/**
 * Hook for managing d3-force simulations
 * Automatically handles simulation lifecycle, tick updates, and cleanup
 *
 * @param initialNodes - Initial nodes for the simulation
 * @param initialLinks - Initial links for the simulation
 * @param options - Configuration options for the force simulation
 * @returns Simulation state and control functions
 *
 * @example
 * ```tsx
 * function NetworkGraph() {
 *   const nodes = [
 *     { id: 'node1', name: 'Node 1' },
 *     { id: 'node2', name: 'Node 2' },
 *     { id: 'node3', name: 'Node 3' },
 *   ];
 *
 *   const links = [
 *     { source: 'node1', target: 'node2' },
 *     { source: 'node2', target: 'node3' },
 *   ];
 *
 *   const { nodes: simulatedNodes, links: simulatedLinks, restart } = useForceSimulation(
 *     nodes,
 *     links,
 *     {
 *       width: 800,
 *       height: 600,
 *       chargeStrength: -500,
 *       linkDistance: 150,
 *     }
 *   );
 *
 *   return (
 *     <svg width={800} height={600}>
 *       {simulatedLinks.map((link, i) => (
 *         <line
 *           key={i}
 *           x1={(link.source as SimulationNode).x}
 *           y1={(link.source as SimulationNode).y}
 *           x2={(link.target as SimulationNode).x}
 *           y2={(link.target as SimulationNode).y}
 *           stroke="#999"
 *         />
 *       ))}
 *       {simulatedNodes.map((node) => (
 *         <circle
 *           key={node.id}
 *           cx={node.x}
 *           cy={node.y}
 *           r={10}
 *           fill="#69b3a2"
 *         />
 *       ))}
 *     </svg>
 *   );
 * }
 * ```
 */
export function useForceSimulation(
  initialNodes: SimulationNode[],
  initialLinks: SimulationLink[],
  options: ForceSimulationOptions
): UseForceSimulationReturn & { setForcesEnabled: (enabled: boolean) => void } {
  const {
    chargeStrength = -300,
    linkDistance = 100,
    linkStrength = 1,
    collisionStrength = 1,
    collisionRadius = 10,
    centerStrength = 0.1,
    width,
    height,
    alphaDecay = 0.0228,
    velocityDecay = 0.4,
    onTick,
    // Optional throttle in milliseconds for tick updates (reduce React re-renders)
    // Lower values = smoother but more CPU; default ~30ms (~33fps)
    // @ts-ignore allow extra option
    tickThrottleMs = 33,
  } = options;

  const [nodes, setNodes] = useState<SimulationNode[]>(initialNodes);
  const [links, setLinks] = useState<SimulationLink[]>(initialLinks);
  const [isRunning, setIsRunning] = useState(false);
  const [alpha, setAlpha] = useState(1);

  const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);

  useEffect(() => {
    // Create a copy of nodes and links to avoid mutating the original data
    const nodesCopy = initialNodes.map((node) => ({ ...node }));
    const linksCopy = initialLinks.map((link) => ({ ...link }));

    // Create the simulation
    const simulation = d3
      .forceSimulation<SimulationNode>(nodesCopy)
      .force(
        'link',
        d3
          .forceLink<SimulationNode, SimulationLink>(linksCopy)
          .id((d) => d.id)
          .distance((d: any) => (d && d.distance != null ? d.distance : linkDistance))
          .strength(linkStrength)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(centerStrength))
      .force(
        'collision',
        d3
          .forceCollide<SimulationNode>()
          .radius((d: any) => {
            // Use node-specific size when available and add configured padding to ensure minimum spacing
            const nodeSize = (d && d.size) ? d.size : 10;
            return nodeSize + collisionRadius;
          })
          .strength(collisionStrength)
      )
      .alphaDecay(alphaDecay)
      .velocityDecay(velocityDecay);

    simulationRef.current = simulation;

    // Update state on each tick. Batch updates via requestAnimationFrame to avoid
    // excessive React re-renders which can cause visual flicker.
    let rafId: number | null = null;
    let lastUpdate = 0;
    const tickHandler = () => {
      try {
        if (typeof onTick === 'function') onTick(nodesCopy, linksCopy, simulation);
      } catch (e) {
        // ignore user tick errors
      }

      const now = Date.now();
      const shouldUpdate = now - lastUpdate >= (tickThrottleMs as number);
      if (rafId == null && shouldUpdate) {
        rafId = (globalThis.requestAnimationFrame || ((cb: FrameRequestCallback) => setTimeout(cb, 16)))(() => {
          rafId = null;
          lastUpdate = Date.now();
          setNodes([...nodesCopy]);
          setLinks([...linksCopy]);
          setAlpha(simulation.alpha());
          setIsRunning(simulation.alpha() > simulation.alphaMin());
        }) as unknown as number;
      }
    };

    simulation.on('tick', tickHandler);

    simulation.on('end', () => {
      setIsRunning(false);
    });

    // Cleanup on unmount
    return () => {
      try {
        simulation.on('tick', null as any);
      } catch (e) {}
      if (rafId != null) {
        try { (globalThis.cancelAnimationFrame || ((id: number) => clearTimeout(id)))(rafId); } catch (e) {}
        rafId = null;
      }
      simulation.stop();
    };
  }, [
    initialNodes,
    initialLinks,
    chargeStrength,
    linkDistance,
    linkStrength,
    collisionStrength,
    collisionRadius,
    centerStrength,
    width,
    height,
    alphaDecay,
    velocityDecay,
    onTick,
  ]);

  const restart = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
      setIsRunning(true);
    }
  };

  const stop = () => {
    if (simulationRef.current) {
      simulationRef.current.stop();
      setIsRunning(false);
    }
  };

  const originalForcesRef = useRef({ charge: chargeStrength, link: linkStrength, collision: collisionStrength });
  const forcesEnabledRef = useRef(true);

  const setForcesEnabled = (enabled: boolean) => {
    const sim = simulationRef.current;
    if (!sim) return;
    // avoid repeated updates
    if (forcesEnabledRef.current === enabled) return;
    forcesEnabledRef.current = enabled;

    try {
      // Only toggle charge and link forces to avoid collapse; keep collision/centering
      const charge: any = sim.force('charge');
      if (charge && typeof charge.strength === 'function') {
        charge.strength(enabled ? originalForcesRef.current.charge : 0);
      }

      const link: any = sim.force('link');
      if (link && typeof link.strength === 'function') {
        link.strength(enabled ? originalForcesRef.current.link : 0);
      }
    } catch (e) {
      // ignore
    }
  };

  return {
    nodes,
    links,
    restart,
    stop,
    isRunning,
    alpha,
    setForcesEnabled,
  };
}

/**
 * Hook for creating a draggable force simulation
 * Provides drag handlers that can be attached to node elements
 *
 * @param simulation - The d3 force simulation instance
 * @returns Drag behavior that can be applied to nodes
 *
 * @example
 * ```tsx
 * function DraggableNetworkGraph() {
 *   const simulation = useRef<d3.Simulation<SimulationNode, SimulationLink>>();
 *   const drag = useDrag(simulation.current);
 *
 *   return (
 *     <svg>
 *       {nodes.map((node) => (
 *         <circle
 *           key={node.id}
 *           {...drag}
 *           cx={node.x}
 *           cy={node.y}
 *           r={10}
 *         />
 *       ))}
 *     </svg>
 *   );
 * }
 * ```
 */
export function useDrag(simulation: d3.Simulation<SimulationNode, any> | null | undefined) {
  const dragStarted = (event: any, node: SimulationNode) => {
    if (!simulation) return;
    if (!event.active) simulation.alphaTarget(0.3).restart();
    node.fx = node.x;
    node.fy = node.y;
  };

  const dragged = (event: any, node: SimulationNode) => {
    node.fx = event.x;
    node.fy = event.y;
  };

  const dragEnded = (event: any, node: SimulationNode) => {
    if (!simulation) return;
    if (!event.active) simulation.alphaTarget(0);
    node.fx = null;
    node.fy = null;
  };

  return {
    onDragStart: dragStarted,
    onDrag: dragged,
    onDragEnd: dragEnded,
  };
}