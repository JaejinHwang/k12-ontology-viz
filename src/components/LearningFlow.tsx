import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  PHASES,
  PHASE_COLORS,
  RELATION_TYPES,
  getAllRelations,
} from '../data/ontology';
import type { Category } from '../data/ontology';

interface Props {
  onSelectNode: (cat: Category) => void;
}

export default function LearningFlow({ onSelectNode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const margin = { top: 50, right: 30, bottom: 30, left: 30 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Only show flow-related relations
    const flowTypes = ['precedes', 'triggers', 'enables'];
    const relations = getAllRelations().filter(r => flowTypes.includes(r.type));

    // Lane widths
    const laneW = innerW / PHASES.length;
    const nodeH = 30;
    const nodeW = laneW - 20;

    // Defs for arrows
    const defs = svg.append('defs');
    RELATION_TYPES.filter(rt => flowTypes.includes(rt.id)).forEach(rt => {
      defs
        .append('marker')
        .attr('id', `flow-arrow-${rt.id}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L10,0L0,4')
        .attr('fill', rt.color);
    });

    // Node positions map
    const nodePositions = new Map<string, { x: number; y: number; pi: number; ci: number }>();

    // Draw lanes
    PHASES.forEach((phase, pi) => {
      const laneX = pi * laneW;

      // Lane background
      g.append('rect')
        .attr('x', laneX)
        .attr('y', -30)
        .attr('width', laneW)
        .attr('height', innerH + 30)
        .attr('fill', PHASE_COLORS[phase.id])
        .attr('opacity', 0.05)
        .attr('rx', 6);

      // Lane header
      g.append('text')
        .attr('x', laneX + laneW / 2)
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .attr('fill', PHASE_COLORS[phase.id])
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .text(phase.name);

      // Category nodes
      const catCount = phase.categories.length;
      const spacing = Math.min((innerH - 20) / catCount, 55);

      phase.categories.forEach((cat, ci) => {
        const nx = laneX + 10;
        const ny = ci * spacing + 10;
        nodePositions.set(cat.id, { x: nx + nodeW / 2, y: ny + nodeH / 2, pi, ci });

        const nodeG = g.append('g')
          .attr('class', 'flow-node')
          .attr('cursor', 'pointer')
          .on('click', () => onSelectNode(cat));

        nodeG
          .append('rect')
          .attr('x', nx)
          .attr('y', ny)
          .attr('width', nodeW)
          .attr('height', nodeH)
          .attr('rx', 6)
          .attr('fill', PHASE_COLORS[phase.id])
          .attr('opacity', 0.15)
          .attr('stroke', PHASE_COLORS[phase.id])
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.4);

        nodeG
          .append('text')
          .attr('x', nx + nodeW / 2)
          .attr('y', ny + nodeH / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', '#e2e8f0')
          .attr('font-size', '9px')
          .attr('font-weight', '500')
          .text(cat.name);

        // Hover
        nodeG
          .on('mouseenter', function () {
            d3.select(this).select('rect').attr('opacity', 0.35);
          })
          .on('mouseleave', function () {
            d3.select(this).select('rect').attr('opacity', 0.15);
          });
      });
    });

    // Draw relations as curved paths
    const linkGroup = g.append('g').attr('class', 'flow-links');

    relations.forEach(rel => {
      const source = nodePositions.get(rel.source);
      const target = nodePositions.get(rel.target);
      if (!source || !target) return;

      const rt = RELATION_TYPES.find(r => r.id === rel.type);
      const color = rt?.color || '#666';

      const sx = source.x + nodeW / 2 - 5;
      const sy = source.y;
      const tx = target.x - nodeW / 2 + 5;
      const ty = target.y;

      // If same lane, short curve
      const isSameLane = source.pi === target.pi;
      let path: string;

      if (isSameLane) {
        const midX = sx + 30;
        path = `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx > sx ? tx : sx},${ty}`;
      } else {
        const midX = (sx + tx) / 2;
        path = `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`;
      }

      const pathEl = linkGroup
        .append('path')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', rt?.dash || '')
        .attr('marker-end', `url(#flow-arrow-${rel.type})`)
        .attr('opacity', 0.35);

      // Condition label
      if (rel.condition) {
        const pathNode = pathEl.node();
        if (pathNode) {
          const midPoint = pathNode.getPointAtLength(pathNode.getTotalLength() * 0.5);
          linkGroup
            .append('text')
            .attr('x', midPoint.x)
            .attr('y', midPoint.y - 5)
            .attr('text-anchor', 'middle')
            .attr('fill', color)
            .attr('font-size', '7px')
            .attr('opacity', 0.7)
            .text(rel.condition);
        }
      }
    });
  }, [onSelectNode]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
