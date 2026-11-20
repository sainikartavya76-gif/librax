import { useState } from 'react';
import { ArrowDown, RotateCcw, Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

interface StackItem {
  id: string;
  action: string;
  target: string;
  timestamp: string;
}

const INITIAL_STACK: StackItem[] = [
  { id: '1', action: 'ISSUE_BOOK', target: 'Clean Code (Copy #1)', timestamp: '10:14:02' },
  { id: '2', action: 'UPDATE_RECORD', target: 'ISBN 978-0132350884', timestamp: '10:18:45' },
  { id: '3', action: 'RESERVE_HOLD', target: 'Design Patterns', timestamp: '10:22:11' },
];

export default function StackVisualizer() {
  const [stack, setStack] = useState<StackItem[]>(INITIAL_STACK);
  const [customAction, setCustomAction] = useState('RETURN_BOOK');
  const [customTarget, setCustomTarget] = useState('Structure & Interpretation of CS');
  const [lastPopped, setLastPopped] = useState<StackItem | null>(null);

  const handlePush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTarget) return;
    const newItem: StackItem = {
      id: Math.random().toString(36).substring(2, 7),
      action: customAction,
      target: customTarget,
      timestamp: new Date().toLocaleTimeString()
    };
    setStack([newItem, ...stack]);
    setCustomTarget('');
  };

  const handlePop = () => {
    if (stack.length === 0) return;
    const [popped, ...rest] = stack;
    setLastPopped(popped);
    setStack(rest);
  };

  const handleClear = () => {
    setStack([]);
    setLastPopped(null);
  };

  return (
    <div className="space-y-5">
      {/* Configuration & Controls */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-ink text-sm">Undoable Librarian Operations Stack</h3>
          <p className="text-2xs text-ink-muted">Strict LIFO (Last-In, First-Out) memory container with rollback support.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="danger"
            onClick={handlePop}
            disabled={stack.length === 0}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Pop / Undo Top
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleClear}
            disabled={stack.length === 0}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear Stack
          </Button>
        </div>
      </div>

      {/* Push Form */}
      <form onSubmit={handlePush} className="card p-4 flex flex-col sm:flex-row gap-3 items-end bg-surface-2">
        <div className="w-full sm:w-44">
          <label className="label-base">Operation Type</label>
          <select
            value={customAction}
            onChange={e => setCustomAction(e.target.value)}
            className="select-base text-xs h-8"
          >
            <option value="ISSUE_BOOK">ISSUE_BOOK</option>
            <option value="RETURN_BOOK">RETURN_BOOK</option>
            <option value="RESERVE_HOLD">RESERVE_HOLD</option>
            <option value="PAY_FINE">PAY_FINE</option>
            <option value="CATALOG_ADD">CATALOG_ADD</option>
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="label-base">Target Entity / Detail</label>
          <input
            type="text"
            value={customTarget}
            onChange={e => setCustomTarget(e.target.value)}
            placeholder="e.g. Introduction to Algorithms (Copy #2)"
            className="input-base text-xs h-8"
            required
          />
        </div>
        <Button size="sm" type="submit" leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Push to Stack
        </Button>
      </form>

      {/* Stack Graphic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card p-6 flex flex-col items-center bg-surface min-h-[300px]">
          <div className="flex items-center gap-1.5 text-2xs font-mono uppercase text-accent mb-3 font-semibold">
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" /> TOP OF STACK (SP: {stack.length > 0 ? '0x0' : 'NULL'})
          </div>

          <div className="w-full max-w-md flex flex-col gap-2 relative">
            {stack.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg py-12 text-center text-xs text-ink-muted">
                Stack is currently empty (Underflow state)
              </div>
            ) : (
              stack.map((item: StackItem, idx: number) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-md border flex items-center justify-between transition-all ${
                    idx === 0
                      ? 'border-accent bg-accent-bg text-ink shadow-sm ring-1 ring-accent'
                      : 'border-border bg-surface-2 text-ink-2'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center font-mono text-2xs font-bold text-ink-muted">
                      {stack.length - 1 - idx}
                    </span>
                    <div>
                      <span className="text-2xs font-bold uppercase tracking-wider text-accent font-mono">
                        {item.action}
                      </span>
                      <p className="text-xs font-medium text-ink">{item.target}</p>
                    </div>
                  </div>
                  <span className="text-3xs font-mono text-ink-muted">{item.timestamp}</span>
                </div>
              ))
            )}
          </div>

          <div className="w-full max-w-md border-b-2 border-border mt-3 text-center text-3xs font-mono uppercase text-ink-muted pt-1">
            BOTTOM OF STACK (Fixed Base)
          </div>
        </div>

        {/* Stack State & Theory */}
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">Stack Diagnostics</h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-ink-muted">Current Depth:</span>
                <span className="font-bold text-ink">{stack.length} items</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-ink-muted">Top Element:</span>
                <span className="font-bold text-accent truncate max-w-[130px]">{stack[0]?.action || 'None'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-ink-muted">Push Cost:</span>
                <span className="font-bold text-ink">O(1) amortized</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-ink-muted">Pop Cost:</span>
                <span className="font-bold text-ink">O(1) strict</span>
              </div>
            </div>
          </div>

          {lastPopped && (
            <div className="card p-3 border-crit/40 bg-crit-bg/20 text-xs">
              <span className="text-2xs uppercase font-bold text-crit block mb-1">Last Reverted / Popped Action</span>
              <p className="font-medium text-ink">{lastPopped.action}: {lastPopped.target}</p>
              <span className="text-3xs font-mono text-ink-muted mt-0.5 block">Popped at {lastPopped.timestamp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
