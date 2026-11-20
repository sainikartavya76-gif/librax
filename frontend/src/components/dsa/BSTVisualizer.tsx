import React, { useState } from 'react';
import { Plus, Search, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';

interface TreeNode {
  val: number;
  title: string;
  left?: TreeNode | null;
  right?: TreeNode | null;
}

const INITIAL_TREE: TreeNode = {
  val: 50,
  title: 'Data Structures & Algorithms',
  left: {
    val: 25,
    title: 'Clean Architecture',
    left: { val: 12, title: 'Refactoring', left: null, right: null },
    right: { val: 37, title: 'Pragmatic Programmer', left: null, right: null }
  },
  right: {
    val: 75,
    title: 'Operating Systems',
    left: { val: 62, title: 'Database Internals', left: null, right: null },
    right: { val: 88, title: 'Computer Networks', left: null, right: null }
  }
};

export default function BSTVisualizer() {
  const [root, setRoot] = useState<TreeNode | null>(INITIAL_TREE);
  const [newValue, setNewValue] = useState<number>(30);
  const [newTitle, setNewTitle] = useState<string>('Designing Data-Intensive Apps');
  const [searchVal, setSearchVal] = useState<number>(37);
  const [highlightPath, setHighlightPath] = useState<number[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Binary Search Tree ready. Nodes represent indexed Book IDs.');

  // BST Insert
  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue || !newTitle) return;

    function insertNode(curr: TreeNode | null, val: number, title: string): TreeNode {
      if (!curr) return { val, title, left: null, right: null };
      if (val < curr.val) {
        curr.left = insertNode(curr.left || null, val, title);
      } else if (val > curr.val) {
        curr.right = insertNode(curr.right || null, val, title);
      }
      return { ...curr };
    }

    setRoot(prev => insertNode(prev, newValue, newTitle));
    setStatusMessage(`Inserted Book ID #${newValue} ("${newTitle}") in O(log n) time.`);
    setHighlightPath([newValue]);
  };

  // BST Search
  const handleSearch = () => {
    const path: number[] = [];
    let curr = root;
    let found = false;

    while (curr) {
      path.push(curr.val);
      if (curr.val === searchVal) {
        found = true;
        break;
      } else if (searchVal < curr.val) {
        curr = curr.left || null;
      } else {
        curr = curr.right || null;
      }
    }

    setHighlightPath(path);
    if (found) {
      setStatusMessage(`Found Book ID #${searchVal} after traversing ${path.length} comparison levels.`);
    } else {
      setStatusMessage(`Book ID #${searchVal} not found in index.`);
    }
  };

  // In-order traversal representation
  const getInorder = (node: TreeNode | null, list: number[] = []): number[] => {
    if (!node) return list;
    if (node.left) getInorder(node.left, list);
    list.push(node.val);
    if (node.right) getInorder(node.right, list);
    return list;
  };

  const inorderList = getInorder(root);

  // Render tree node recursive
  const renderNode = (node: TreeNode | null) => {
    if (!node) return null;
    const isHighlighted = highlightPath.includes(node.val);
    const isTarget = isHighlighted && highlightPath[highlightPath.length - 1] === node.val;

    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center font-mono transition-all shadow-sm ${
            isTarget
              ? 'border-accent bg-accent text-white scale-110 shadow-lg'
              : isHighlighted
              ? 'border-warn bg-warn-bg text-warn font-bold'
              : 'border-border bg-surface-2 text-ink'
          }`}
          title={node.title}
        >
          <span className="text-xs font-bold leading-none">#{node.val}</span>
        </div>
        <span className="text-3xs text-ink-muted clamp-1 max-w-[80px] text-center mt-1">
          {node.title}
        </span>

        {(node.left || node.right) && (
          <div className="flex gap-4 sm:gap-8 pt-4 relative">
            <div className="flex flex-col items-center">
              {renderNode(node.left || null)}
            </div>
            <div className="flex flex-col items-center">
              {renderNode(node.right || null)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-ink text-sm">Binary Search Tree (BST) Book Indexing</h3>
          <p className="text-2xs text-ink-muted">Enables logarithmic O(log n) lookups by Book Identification Key.</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setRoot(INITIAL_TREE);
            setHighlightPath([]);
            setStatusMessage('Reset to initial indexed tree.');
          }}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset BST
        </Button>
      </div>

      {/* Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insert form */}
        <form onSubmit={handleInsert} className="card p-3.5 space-y-2 bg-surface-2 text-xs">
          <span className="font-semibold text-ink uppercase text-2xs">Insert Book Key</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={newValue}
              onChange={e => setNewValue(Number(e.target.value))}
              placeholder="ID (e.g. 40)"
              className="input-base w-24 h-8"
              required
            />
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Book Title"
              className="input-base flex-1 h-8"
              required
            />
            <Button size="sm" type="submit" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Insert
            </Button>
          </div>
        </form>

        {/* Search form */}
        <div className="card p-3.5 space-y-2 bg-surface-2 text-xs">
          <span className="font-semibold text-ink uppercase text-2xs">Search by Book ID</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={searchVal}
              onChange={e => setSearchVal(Number(e.target.value))}
              placeholder="Target ID"
              className="input-base flex-1 h-8"
            />
            <Button size="sm" onClick={handleSearch} leftIcon={<Search className="w-3.5 h-3.5" />}>
              Traverse BST
            </Button>
          </div>
        </div>
      </div>

      {/* Tree Visualization Stage */}
      <div className="card p-6 bg-surface overflow-x-auto min-h-[340px] flex items-center justify-center">
        {root ? (
          <div className="py-4">{renderNode(root)}</div>
        ) : (
          <div className="text-xs text-ink-muted">BST is empty.</div>
        )}
      </div>

      {/* Log & Inorder view */}
      <div className="card p-4 space-y-2 bg-surface-2">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-ink font-medium">{statusMessage}</span>
        </div>
        <div className="text-2xs text-ink-muted pt-1 flex items-center gap-2">
          <span className="font-semibold uppercase">In-Order Sorted Traversal:</span>
          <span className="font-mono text-accent">[{inorderList.join(' → ')}]</span>
        </div>
      </div>
    </div>
  );
}
