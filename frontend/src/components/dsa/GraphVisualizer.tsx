import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';

interface Node {
  id: string;
  title: string;
  category: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

const NODES: Node[] = [
  { id: '1', title: 'Clean Code', category: 'Engineering', x: 80, y: 120 },
  { id: '2', title: 'Refactoring', category: 'Engineering', x: 220, y: 60 },
  { id: '3', title: 'Design Patterns', category: 'Engineering', x: 220, y: 180 },
  { id: '4', title: 'Algorithms (CLRS)', category: 'CS Core', x: 380, y: 60 },
  { id: '5', title: 'Operating Systems', category: 'CS Core', x: 380, y: 180 },
  { id: '6', title: 'Database Internals', category: 'Systems', x: 520, y: 120 },
];

const EDGES: Edge[] = [
  { from: '1', to: '2' },
  { from: '1', to: '3' },
  { from: '2', to: '4' },
  { from: '3', to: '5' },
  { from: '4', to: '6' },
  { from: '5', to: '6' },
];

export default function GraphVisualizer() {
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [log, setLog] = useState('Select BFS or DFS to traverse the book recommendation relationship network.');

  const runTraversal = (type: 'bfs' | 'dfs') => {
    const order: string[] = [];
    const adj: Record<string, string[]> = {};
    NODES.forEach(n => { adj[n.id] = []; });
    EDGES.forEach(e => {
      adj[e.from].push(e.to);
      adj[e.to].push(e.from); // undirected relationships
    });

    if (type === 'bfs') {
      const queue: string[] = ['1'];
      const visited = new Set<string>(['1']);
      while (queue.length > 0) {
        const curr = queue.shift()!;
        order.push(curr);
        for (const neighbor of adj[curr]) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      setLog('Breadth-First Search (BFS): Discovers closest topical neighbors level by level using a Queue.');
    } else {
      const stack: string[] = ['1'];
      const visited = new Set<string>();
      while (stack.length > 0) {
        const curr = stack.pop()!;
        if (!visited.has(curr)) {
          visited.add(curr);
          order.push(curr);
          for (const neighbor of adj[curr].slice().reverse()) {
            if (!visited.has(neighbor)) {
              stack.push(neighbor);
            }
          }
        }
      }
      setLog('Depth-First Search (DFS): Traverses deeply into recommendation clusters before backtracking using a Stack.');
    }

    setVisitedNodes(order);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-ink text-sm">Book Recommendation Network Graph</h3>
          <p className="text-2xs text-ink-muted">Undirected knowledge graph representing semantic and topical cross-recommendations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => runTraversal('bfs')}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            Run BFS Traversal
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => runTraversal('dfs')}
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            Run DFS Traversal
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setVisitedNodes([]);
              setLog('Reset graph view.');
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* SVG Canvas Stage */}
      <div className="card p-6 bg-surface overflow-x-auto min-h-[300px] flex items-center justify-center">
        <svg viewBox="0 0 600 240" className="w-full max-w-[600px] h-60">
          {/* Render edges */}
          {EDGES.map((edge, i) => {
            const n1 = NODES.find(n => n.id === edge.from)!;
            const n2 = NODES.find(n => n.id === edge.to)!;
            const isTraversed = visitedNodes.includes(edge.from) && visitedNodes.includes(edge.to);
            return (
              <line
                key={i}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke={isTraversed ? '#3d8b6a' : '#252a38'}
                strokeWidth={isTraversed ? 2.5 : 1.5}
                strokeDasharray={isTraversed ? 'none' : '4 2'}
                className="transition-colors duration-300"
              />
            );
          })}

          {/* Render nodes */}
          {NODES.map(node => {
            const visitIndex = visitedNodes.indexOf(node.id);
            const isVisited = visitIndex !== -1;
            return (
              <g key={node.id} className="cursor-pointer">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={22}
                  fill={isVisited ? '#3d8b6a' : '#1c2030'}
                  stroke={isVisited ? '#4aa07c' : '#252a38'}
                  strokeWidth={2}
                  className="transition-all duration-300"
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="#e8e4dc"
                  fontSize={11}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {isVisited ? `#${visitIndex + 1}` : node.id}
                </text>
                <text
                  x={node.x}
                  y={node.y + 34}
                  textAnchor="middle"
                  fill="#8f9ab0"
                  fontSize={9}
                  fontFamily="sans-serif"
                >
                  {node.title.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Traversal Order & Log */}
      <div className="card p-4 space-y-2 bg-surface-2 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-ink">{log}</span>
        </div>
        {visitedNodes.length > 0 && (
          <div className="pt-2 border-t border-border flex flex-wrap items-center gap-1.5 text-2xs font-mono">
            <span className="text-ink-muted uppercase font-bold">Traversal Visitation Order:</span>
            {visitedNodes.map((id, i) => {
              const node = NODES.find(n => n.id === id)!;
              return (
                <span key={id} className="px-2 py-0.5 rounded bg-accent-bg text-accent font-semibold">
                  Step {i + 1}: {node.title}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
