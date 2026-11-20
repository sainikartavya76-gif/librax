import React, { useState } from 'react';
import SortingVisualizer from '../components/dsa/SortingVisualizer';
import SearchVisualizer from '../components/dsa/SearchVisualizer';
import StackVisualizer from '../components/dsa/StackVisualizer';
import QueueVisualizer from '../components/dsa/QueueVisualizer';
import BSTVisualizer from '../components/dsa/BSTVisualizer';
import HashTableVisualizer from '../components/dsa/HashTableVisualizer';
import GraphVisualizer from '../components/dsa/GraphVisualizer';
import { ArrowDownAZ, Search, Layers, Clock, GitFork, Hash, Network } from 'lucide-react';

const MODULES = [
  {
    id: 'sort',
    label: 'Sorting Algorithms',
    icon: ArrowDownAZ,
    category: 'Algorithms',
    description: 'Bubble, Selection, Insertion, Merge, Quick, & Heap sorts for catalogue ordering.'
  },
  {
    id: 'search',
    label: 'Search Algorithms',
    icon: Search,
    category: 'Algorithms',
    description: 'Linear & Binary search demonstrations with target indexing.'
  },
  {
    id: 'stack',
    label: 'Operation Stack',
    icon: Layers,
    category: 'Data Structures',
    description: 'LIFO stack container driving undoable librarian actions.'
  },
  {
    id: 'queue',
    label: 'Reservation Queue',
    icon: Clock,
    category: 'Data Structures',
    description: 'FIFO waiting queue for fair copy allocations.'
  },
  {
    id: 'bst',
    label: 'Binary Search Tree',
    icon: GitFork,
    category: 'Data Structures',
    description: 'Book ID logarithmic indexing and traversal.'
  },
  {
    id: 'hash',
    label: 'Hash Table',
    icon: Hash,
    category: 'Data Structures',
    description: 'O(1) ISBN lookups with separate chaining collision resolution.'
  },
  {
    id: 'graph',
    label: 'Recommendation Graph',
    icon: Network,
    category: 'Advanced Structures',
    description: 'Topological book recommendation network with BFS & DFS traversal.'
  },
];

const DSALabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sort');

  const renderVisualizer = () => {
    switch (activeTab) {
      case 'sort': return <SortingVisualizer />;
      case 'search': return <SearchVisualizer />;
      case 'stack': return <StackVisualizer />;
      case 'queue': return <QueueVisualizer />;
      case 'bst': return <BSTVisualizer />;
      case 'hash': return <HashTableVisualizer />;
      case 'graph': return <GraphVisualizer />;
      default: return null;
    }
  };

  const currentModule = MODULES.find(m => m.id === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="heading-page">Interactive DSA Laboratory</h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Hands-on algorithm and data structure visualizer powering LibraX's core indexing and scheduling engines.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {MODULES.map(m => {
          const isActive = activeTab === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-24 ${
                isActive
                  ? 'border-accent bg-accent-bg ring-1 ring-accent'
                  : 'border-border bg-surface hover:bg-surface-2'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-ink-muted'}`} />
                <span className="text-3xs uppercase font-mono text-ink-muted">{m.category.split(' ')[0]}</span>
              </div>
              <div>
                <span className={`text-xs font-semibold block leading-tight ${isActive ? 'text-ink' : 'text-ink-2'}`}>
                  {m.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Module Header */}
      <div className="card p-4 bg-surface-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">{currentModule.label}</h2>
          <p className="text-2xs text-ink-muted mt-0.5">{currentModule.description}</p>
        </div>
      </div>

      {/* Visualizer Container */}
      <div className="card p-6 bg-surface">
        {renderVisualizer()}
      </div>
    </div>
  );
};

export default DSALabPage;
