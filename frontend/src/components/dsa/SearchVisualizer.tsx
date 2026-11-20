import { useState, useEffect } from 'react';
import { Search, RotateCcw, Play } from 'lucide-react';
import Button from '../ui/Button';

interface Step {
  current?: number;
  low?: number;
  high?: number;
  mid?: number;
  found?: number;
  message: string;
}

const SAMPLE_DATA = [12, 19, 24, 33, 41, 48, 55, 62, 70, 79, 85, 91, 98];

export default function SearchVisualizer() {
  const [data] = useState<number[]>(SAMPLE_DATA);
  const [target, setTarget] = useState(55);
  const [algorithm, setAlgorithm] = useState<'linear' | 'binary'>('binary');
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIdx, setStepIdx] = useState(0);

  const runSearch = () => {
    const s: Step[] = [];
    if (algorithm === 'linear') {
      let found = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i] === target) {
          s.push({ current: i, found: i, message: `Match found at index ${i} (${data[i]} == ${target})!` });
          found = true;
          break;
        } else {
          s.push({ current: i, message: `Comparing index ${i}: ${data[i]} != ${target}. Advancing pointer.` });
        }
      }
      if (!found) {
        s.push({ message: `Target ${target} was not found in the entire collection.` });
      }
    } else {
      let low = 0;
      let high = data.length - 1;
      let found = false;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (data[mid] === target) {
          s.push({ low, high, mid, found: mid, message: `Target found at mid index ${mid} (${data[mid]} == ${target}) in O(log N) steps!` });
          found = true;
          break;
        } else if (data[mid] < target) {
          s.push({ low, high, mid, message: `Index ${mid} (${data[mid]}) < ${target}. Discarding left half. Moving low to ${mid + 1}.` });
          low = mid + 1;
        } else {
          s.push({ low, high, mid, message: `Index ${mid} (${data[mid]}) > ${target}. Discarding right half. Moving high to ${mid - 1}.` });
          high = mid - 1;
        }
      }
      if (!found) {
        s.push({ low, high, message: `Low (${low}) exceeded High (${high}). Target ${target} does not exist.` });
      }
    }
    setSteps(s);
    setStepIdx(0);
  };

  useEffect(() => {
    runSearch();
  }, [algorithm, target]);

  const current = steps[stepIdx] || { message: 'Ready' };

  return (
    <div className="space-y-5">
      {/* Search Bar & Config */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAlgorithm('binary')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              algorithm === 'binary' ? 'bg-accent text-white' : 'bg-surface-2 text-ink-2 hover:text-ink'
            }`}
          >
            Binary Search (O(log n))
          </button>
          <button
            onClick={() => setAlgorithm('linear')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              algorithm === 'linear' ? 'bg-accent text-white' : 'bg-surface-2 text-ink-2 hover:text-ink'
            }`}
          >
            Linear Search (O(n))
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-ink-muted">Target Value:</label>
          <input
            type="number"
            value={target}
            onChange={e => setTarget(Number(e.target.value))}
            className="input-base w-20 h-8 text-xs font-mono tabular"
          />
          <Button size="sm" onClick={runSearch} leftIcon={<Search className="w-3.5 h-3.5" />}>
            Search
          </Button>
        </div>
      </div>

      {/* Visual Array Display */}
      <div className="card p-6 bg-surface overflow-x-auto">
        <div className="min-w-[600px] flex items-center justify-center gap-2 py-8">
          {data.map((val, idx) => {
            const isMid = current.mid === idx;
            const isLow = current.low === idx;
            const isHigh = current.high === idx;
            const isCurrent = current.current === idx;
            const isFound = current.found === idx;
            const inRange = algorithm === 'binary' && current.low !== undefined && current.high !== undefined
              ? idx >= current.low && idx <= current.high
              : true;

            let borderClass = 'border-border bg-surface-2 text-ink';
            if (!inRange) borderClass = 'border-border/30 bg-surface-2/30 text-ink-muted/30';
            if (isCurrent) borderClass = 'border-warn bg-warn-bg text-warn ring-2 ring-warn';
            if (isMid) borderClass = 'border-info bg-info-bg text-info ring-2 ring-info';
            if (isFound) borderClass = 'border-accent bg-accent text-white font-bold ring-2 ring-accent scale-110';

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                {/* Pointer tags */}
                <div className="h-4 text-3xs font-mono font-bold">
                  {isFound ? (
                    <span className="text-accent">FOUND!</span>
                  ) : isMid ? (
                    <span className="text-info">MID</span>
                  ) : isLow && isHigh ? (
                    <span className="text-warn">LOW=HIGH</span>
                  ) : isLow ? (
                    <span className="text-accent">LOW</span>
                  ) : isHigh ? (
                    <span className="text-crit">HIGH</span>
                  ) : isCurrent ? (
                    <span className="text-warn">PTR</span>
                  ) : null}
                </div>

                {/* Box */}
                <div className={`w-11 h-12 rounded-md border flex items-center justify-center font-mono text-sm font-semibold transition-all ${borderClass}`}>
                  {val}
                </div>

                {/* Index */}
                <span className="text-3xs font-mono text-ink-muted">[{idx}]</span>
              </div>
            );
          })}
        </div>

        {/* Status log */}
        <div className="card-2 p-3 text-xs flex items-center justify-between border-t border-border mt-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-ink font-mono">{current.message}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setStepIdx(0)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (stepIdx < steps.length - 1) {
                  setStepIdx(p => p + 1);
                }
              }}
              disabled={stepIdx >= steps.length - 1}
              leftIcon={<Play className="w-3.5 h-3.5" />}
            >
              Next Step ({stepIdx + 1}/{steps.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
