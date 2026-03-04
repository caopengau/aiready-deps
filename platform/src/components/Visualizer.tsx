'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { FileNode, GraphEdge, GraphData } from '@/lib/graph-builder';

interface Props {
  data: GraphData;
}

export default function Visualizer({ data }: Props) {
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-[#0a0a0f] rounded-3xl overflow-hidden border border-white/5 shadow-2xl"
    >
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff11 1px, transparent 1px), linear-gradient(90deg, #ffffff11 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {dimensions.width > 0 && (
        <GraphCanvas
          data={data}
          width={dimensions.width}
          height={dimensions.height}
          onNodeClick={setSelectedNode}
        />
      )}

      {/* Legend */}
      <div className="absolute top-6 left-6 z-20">
        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 shadow-xl backdrop-blur-md">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Severity Legend
          </h4>
          <div className="space-y-2">
            <LegendItem color="#ff4d4f" label="Critical" />
            <LegendItem color="#ff9900" label="Major" />
            <LegendItem color="#ffd666" label="Minor" />
            <LegendItem color="#91d5ff" label="Info" />
            <LegendItem color="#97c2fc" label="Healthy" />
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-6 left-6 z-20">
        <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 flex items-center gap-3 shadow-lg">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />{' '}
            Drag to move
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]" />{' '}
            Scroll to zoom
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />{' '}
            Click for details
          </span>
        </div>
      </div>

      {/* Node Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute top-6 right-6 bottom-6 w-80 z-30"
          >
            <div className="glass-card h-full rounded-3xl border border-cyan-500/20 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="font-bold text-white truncate pr-4">
                  {selectedNode.label}
                </h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-500 hover:text-white transition-colors p-1"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Full Path
                  </label>
                  <p className="text-xs text-slate-300 font-mono break-all bg-black/30 p-3 rounded-xl border border-white/5">
                    {selectedNode.id}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <StatItem
                    label="Token Cost"
                    value={selectedNode.tokenCost || 'N/A'}
                  />
                  <StatItem
                    label="Duplicates"
                    value={selectedNode.duplicates || 0}
                  />
                </div>

                {selectedNode.title && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Insights
                    </label>
                    <div className="space-y-2">
                      {selectedNode.title.split('\n').map((line, i) => (
                        <p
                          key={i}
                          className="text-xs text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div
        className="w-2.5 h-2.5 rounded-full shadow-lg transition-transform group-hover:scale-125"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}44` }}
      />
      <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
        {label}
      </span>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
        {label}
      </div>
      <div className="text-sm font-black text-white">{value}</div>
    </div>
  );
}

function GraphCanvas({
  data,
  width,
  height,
  onNodeClick,
}: {
  data: GraphData;
  width: number;
  height: number;
  onNodeClick: (node: FileNode | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svg.append('g');

    // Zoom setup
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        zoomTransformRef.current = event.transform;
      });

    svg.call(zoom);
    svg.call(zoom.transform, zoomTransformRef.current);

    // Simulation setup
    const nodes = data.nodes.map((d) => ({ ...d }));
    const links = data.edges.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100)
          .strength(0.2)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    // Draw links
    const link = container
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => {
        if (d.type === 'similarity') return '#ffd666';
        if (d.type === 'reference') return '#91d5ff';
        return '#ffffff11';
      })
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', (d: any) => (d.type === 'similarity' ? 2 : 1))
      .attr('stroke-dasharray', (d: any) =>
        d.type === 'reference' ? '4,4' : null
      );

    // Draw nodes
    const node = container
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d as FileNode);
      })
      .call(
        d3
          .drag<any, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any
      );

    // Node circles
    node
      .append('circle')
      .attr('r', (d: any) => Math.sqrt(d.value || 5) + 6)
      .attr('fill', (d: any) => d.color || '#97c2fc')
      .attr('stroke', '#0a0a0f')
      .attr('stroke-width', 2)
      .style('filter', (d: any) => `drop-shadow(0 0 4px ${d.color}66)`);

    // Labels
    node
      .append('text')
      .text((d: any) => d.label)
      .attr('dy', (d: any) => Math.sqrt(d.value || 5) + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    svg.on('click', () => onNodeClick(null));

    return () => {
      simulation.stop();
    };
  }, [data, width, height, onNodeClick]);

  return (
    <svg ref={svgRef} width="100%" height="100%" className="relative z-10" />
  );
}
