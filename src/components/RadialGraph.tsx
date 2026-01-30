import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import {
  PHASES,
  PHASE_COLORS,
  RELATION_TYPES,
  getAllRelations,
} from '../data/ontology';
import type { Category } from '../data/ontology';

interface Props {
  onSelectNode: (cat: Category | null) => void;
  selectedNode: Category | null;
  activeFilters: string[];
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  phaseId: string;
  phaseName: string;
  category: Category;
  groupAngle: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  type: string;
  condition?: string;
}

export default function RadialGraph({ onSelectNode, selectedNode, activeFilters }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setHoveredNode] = useState<string | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  const buildGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.34;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    // Defs for arrow markers
    const defs = svg.append('defs');
    RELATION_TYPES.forEach(rt => {
      defs
        .append('marker')
        .attr('id', `arrow-${rt.id}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', rt.color);
    });

    // Build nodes
    const phaseCount = PHASES.length;
    const nodes: GraphNode[] = [];

    PHASES.forEach((phase, pi) => {
      const angleStart = (pi / phaseCount) * 2 * Math.PI - Math.PI / 2;
      const angleEnd = ((pi + 1) / phaseCount) * 2 * Math.PI - Math.PI / 2;
      const catCount = phase.categories.length;

      phase.categories.forEach((cat, ci) => {
        const angle = angleStart + ((ci + 0.5) / catCount) * (angleEnd - angleStart);
        const r = radius + (ci % 2 === 0 ? 0 : 25);
        nodes.push({
          id: cat.id,
          name: cat.name,
          phaseId: phase.id,
          phaseName: phase.name,
          category: cat,
          groupAngle: angle,
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r,
        });
      });
    });

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Build links
    const allRelations = getAllRelations();
    const links: GraphLink[] = allRelations
      .filter(r => nodeMap.has(r.source) && nodeMap.has(r.target))
      .map(r => ({
        source: r.source,
        target: r.target,
        type: r.type,
        condition: r.condition,
      }));

    // Force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id(d => d.id)
          .distance(120)
          .strength(0.1)
      )
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(centerX, centerY).strength(0.05))
      .force(
        'radial',
        d3.forceRadial<GraphNode>(radius, centerX, centerY).strength(0.4)
      )
      .force(
        'angular',
        d3.forceX<GraphNode>(d => centerX + Math.cos(d.groupAngle) * radius).strength(0.3)
      )
      .force(
        'angularY',
        d3.forceY<GraphNode>(d => centerY + Math.sin(d.groupAngle) * radius).strength(0.3)
      )
      .force('collision', d3.forceCollide(22));

    simulationRef.current = simulation;

    // Phase arc backgrounds
    const arcGroup = svg.append('g').attr('class', 'arcs');
    const arcGenerator = d3.arc();
    const innerR = radius - 60;
    const outerR = radius + 60;

    PHASES.forEach((phase, pi) => {
      const startAngle = (pi / phaseCount) * 2 * Math.PI - Math.PI / 2;
      const endAngle = ((pi + 1) / phaseCount) * 2 * Math.PI - Math.PI / 2;

      arcGroup
        .append('path')
        .attr('d', arcGenerator({
          innerRadius: innerR,
          outerRadius: outerR,
          startAngle: startAngle + Math.PI / 2,
          endAngle: endAngle + Math.PI / 2,
        }))
        .attr('transform', `translate(${centerX},${centerY})`)
        .attr('fill', PHASE_COLORS[phase.id])
        .attr('opacity', 0.06)
        .attr('stroke', PHASE_COLORS[phase.id])
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.15);

      // Phase label
      const labelAngle = (startAngle + endAngle) / 2;
      const labelR = radius + 85;
      const lx = centerX + Math.cos(labelAngle) * labelR;
      const ly = centerY + Math.sin(labelAngle) * labelR;

      const textAngle = (labelAngle * 180) / Math.PI;
      const flipText = textAngle > 90 || textAngle < -90;

      arcGroup
        .append('text')
        .attr('x', lx)
        .attr('y', ly)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr(
          'transform',
          `rotate(${flipText ? textAngle + 180 : textAngle},${lx},${ly})`
        )
        .attr('fill', PHASE_COLORS[phase.id])
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('opacity', 0.8)
        .text(phase.name);
    });

    // Links
    const linkGroup = svg.append('g').attr('class', 'links');
    const linkElements = linkGroup
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', d => {
        const rt = RELATION_TYPES.find(r => r.id === d.type);
        return rt ? rt.color : '#999';
      })
      .attr('stroke-width', d => (d.type === 'inhibits' ? 2.5 : 1.5))
      .attr('stroke-dasharray', d => {
        const rt = RELATION_TYPES.find(r => r.id === d.type);
        return rt?.dash || '';
      })
      .attr('marker-end', d => `url(#arrow-${d.type})`)
      .attr('opacity', 0.4);

    // Nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any
      );

    nodeElements
      .append('circle')
      .attr('r', 14)
      .attr('fill', d => PHASE_COLORS[d.phaseId])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9);

    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#fff')
      .attr('font-size', '7px')
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .text(d => d.id.replace('L2_', ''));

    // Tooltip label
    nodeElements
      .append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', -20)
      .attr('fill', '#e2e8f0')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('opacity', 0)
      .attr('pointer-events', 'none')
      .text(d => d.name);

    // Events
    nodeElements
      .on('mouseenter', function (_, d) {
        setHoveredNode(d.id);
        d3.select(this).select('.node-label').attr('opacity', 1);
        d3.select(this).select('circle').attr('r', 18).attr('stroke-width', 3);

        // Highlight connected links
        const connectedIds = new Set<string>();
        connectedIds.add(d.id);
        linkElements.each(function (l) {
          const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : String(l.source);
          const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : String(l.target);
          if (sourceId === d.id || targetId === d.id) {
            connectedIds.add(sourceId);
            connectedIds.add(targetId);
            d3.select(this).attr('opacity', 0.9).attr('stroke-width', (ll: any) => ll.type === 'inhibits' ? 3.5 : 2.5);
          } else {
            d3.select(this).attr('opacity', 0.05);
          }
        });

        nodeElements.each(function (n) {
          if (!connectedIds.has(n.id)) {
            d3.select(this).attr('opacity', 0.15);
          }
        });
      })
      .on('mouseleave', function () {
        setHoveredNode(null);
        d3.select(this).select('.node-label').attr('opacity', 0);
        d3.select(this).select('circle').attr('r', 14).attr('stroke-width', 2);

        linkElements.attr('opacity', 0.4).attr('stroke-width', (d: any) => d.type === 'inhibits' ? 2.5 : 1.5);
        nodeElements.attr('opacity', 1);
      })
      .on('click', (_, d) => {
        onSelectNode(d.category);
      });

    // Curved link path
    function linkPath(d: GraphLink) {
      const source = d.source as GraphNode;
      const target = d.target as GraphNode;
      if (!source.x || !source.y || !target.x || !target.y) return '';

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Offset start/end by node radius
      const sr = 16;
      const tr = 16;
      const sx = source.x + (dx / dist) * sr;
      const sy = source.y + (dy / dist) * sr;
      const tx = target.x - (dx / dist) * tr;
      const ty = target.y - (dy / dist) * tr;

      // Curve
      const curvature = 0.2;
      const mx = (sx + tx) / 2 + dy * curvature;
      const my = (sy + ty) / 2 - dx * curvature;

      return `M${sx},${sy} Q${mx},${my} ${tx},${ty}`;
    }

    simulation.on('tick', () => {
      linkElements.attr('d', linkPath);
      nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Apply filters
    function applyFilters() {
      linkElements.attr('visibility', d =>
        activeFilters.length === 0 || activeFilters.includes(d.type)
          ? 'visible'
          : 'hidden'
      );
    }
    applyFilters();

    return () => {
      simulation.stop();
    };
  }, [activeFilters, onSelectNode]);

  useEffect(() => {
    const cleanup = buildGraph();
    const handleResize = () => buildGraph();
    window.addEventListener('resize', handleResize);
    return () => {
      cleanup?.();
      window.removeEventListener('resize', handleResize);
    };
  }, [buildGraph]);

  // Highlight selected node
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll<SVGGElement, GraphNode>('.nodes g').each(function (d) {
      const isSelected = selectedNode?.id === d.id;
      d3.select(this)
        .select('circle')
        .attr('stroke', isSelected ? '#fbbf24' : '#fff')
        .attr('stroke-width', isSelected ? 3 : 2);
      d3.select(this)
        .select('.node-label')
        .attr('opacity', isSelected ? 1 : 0);
    });
  }, [selectedNode]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
