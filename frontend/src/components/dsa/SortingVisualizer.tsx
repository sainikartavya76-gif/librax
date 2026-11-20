import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import Button from '../ui/Button';

interface Step {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
}

const ALGORITHMS = [
  { id: 'bubble', name: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', desc: 'Repeatedly swaps adjacent elements if in wrong order.' },
  { id: 'selection', name: 'Selection Sort', time: 'O(n²)', space: 'O(1)', desc: 'Finds the minimum element and puts it at the beginning.' },
  { id: 'insertion', name: 'Insertion Sort', time: 'O(n²)', space: 'O(1)', desc: 'Builds sorted array one element at a time by shifting.' },
  { id: 'merge', name: 'Merge Sort', time: 'O(n log n)', space: 'O(n)', desc: 'Divide-and-conquer: splits array and merges sorted halves.' },
  { id: 'quick', name: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)', desc: 'Partitions array around a pivot element recursively.' },
  { id: 'heap', name: 'Heap Sort', time: 'O(n log n)', space: 'O(1)', desc: 'Builds a max-heap and repeatedly extracts the maximum.' },
];

let audioCtx: AudioContext | null = null;
function playTone(val: number, max: number) {
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (audioCtx) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const freq = 120 + (val / Math.max(max, 1)) * 680;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    }
  } catch {}
}

function generateSteps(algo: string, initialArr: number[]): { steps: Step[]; comparisons: number; swaps: number } {
  const steps: Step[] = [];
  const arr = [...initialArr];
  let comparisons = 0;
  let swaps = 0;
  const sortedIndices = new Set<number>();

  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [] });

  if (algo === 'bubble') {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        steps.push({ array: [...arr], comparing: [j, j + 1], swapping: [], sorted: Array.from(sortedIndices) });
        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          steps.push({ array: [...arr], comparing: [], swapping: [j, j + 1], sorted: Array.from(sortedIndices) });
        }
      }
      sortedIndices.add(n - i - 1);
    }
    sortedIndices.add(0);
  } else if (algo === 'selection') {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        comparisons++;
        steps.push({ array: [...arr], comparing: [minIdx, j], swapping: [], sorted: Array.from(sortedIndices) });
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        swaps++;
        steps.push({ array: [...arr], comparing: [], swapping: [i, minIdx], sorted: Array.from(sortedIndices) });
      }
      sortedIndices.add(i);
    }
    sortedIndices.add(n - 1);
  } else if (algo === 'insertion') {
    const n = arr.length;
    sortedIndices.add(0);
    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= 0) {
        comparisons++;
        steps.push({ array: [...arr], comparing: [j, j + 1], swapping: [], sorted: Array.from(sortedIndices) });
        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          swaps++;
          steps.push({ array: [...arr], comparing: [], swapping: [j, j + 1], sorted: Array.from(sortedIndices) });
          j--;
        } else {
          break;
        }
      }
      arr[j + 1] = key;
      for (let k = 0; k <= i; k++) sortedIndices.add(k);
    }
  } else if (algo === 'merge') {
    function merge(l: number, m: number, r: number) {
      const left = arr.slice(l, m + 1);
      const right = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;
      while (i < left.length && j < right.length) {
        comparisons++;
        steps.push({ array: [...arr], comparing: [l + i, m + 1 + j], swapping: [], sorted: Array.from(sortedIndices) });
        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
          swaps++;
        }
        steps.push({ array: [...arr], comparing: [], swapping: [k], sorted: Array.from(sortedIndices) });
        k++;
      }
      while (i < left.length) { arr[k++] = left[i++]; }
      while (j < right.length) { arr[k++] = right[j++]; }
      if (l === 0 && r === arr.length - 1) {
        for (let idx = 0; idx < arr.length; idx++) sortedIndices.add(idx);
      }
    }
    function mergeSortRec(l: number, r: number) {
      if (l < r) {
        const m = Math.floor((l + r) / 2);
        mergeSortRec(l, m);
        mergeSortRec(m + 1, r);
        merge(l, m, r);
      }
    }
    mergeSortRec(0, arr.length - 1);
    for (let idx = 0; idx < arr.length; idx++) sortedIndices.add(idx);
  } else if (algo === 'quick') {
    function partition(low: number, high: number): number {
      const pivot = arr[high];
      let i = low - 1;
      for (let j = low; j < high; j++) {
        comparisons++;
        steps.push({ array: [...arr], comparing: [j, high], swapping: [], sorted: Array.from(sortedIndices) });
        if (arr[j] < pivot) {
          i++;
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
          swaps++;
          steps.push({ array: [...arr], comparing: [], swapping: [i, j], sorted: Array.from(sortedIndices) });
        }
      }
      const temp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = temp;
      swaps++;
      steps.push({ array: [...arr], comparing: [], swapping: [i + 1, high], sorted: Array.from(sortedIndices) });
      sortedIndices.add(i + 1);
      return i + 1;
    }
    function quickSortRec(low: number, high: number) {
      if (low < high) {
        const pi = partition(low, high);
        quickSortRec(low, pi - 1);
        quickSortRec(pi + 1, high);
      } else if (low === high) {
        sortedIndices.add(low);
      }
    }
    quickSortRec(0, arr.length - 1);
    for (let idx = 0; idx < arr.length; idx++) sortedIndices.add(idx);
  } else if (algo === 'heap') {
    function heapify(n: number, i: number) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n) {
        comparisons++;
        steps.push({ array: [...arr], comparing: [largest, left], swapping: [], sorted: Array.from(sortedIndices) });
        if (arr[left] > arr[largest]) largest = left;
      }
      if (right < n) {
        comparisons++;
        steps.push({ array: [...arr], comparing: [largest, right], swapping: [], sorted: Array.from(sortedIndices) });
        if (arr[right] > arr[largest]) largest = right;
      }
      if (largest !== i) {
        const swap = arr[i];
        arr[i] = arr[largest];
        arr[largest] = swap;
        swaps++;
        steps.push({ array: [...arr], comparing: [], swapping: [i, largest], sorted: Array.from(sortedIndices) });
        heapify(n, largest);
      }
    }
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
    for (let i = n - 1; i > 0; i--) {
      const temp = arr[0];
      arr[0] = arr[i];
      arr[i] = temp;
      swaps++;
      sortedIndices.add(i);
      steps.push({ array: [...arr], comparing: [], swapping: [0, i], sorted: Array.from(sortedIndices) });
      heapify(i, 0);
    }
    sortedIndices.add(0);
  }

  steps.push({ array: [...arr], comparing: [], swapping: [], sorted: Array.from({ length: arr.length }, (_, i) => i) });
  return { steps, comparisons, swaps };
}

const DEFAULT_ARRAY = [42, 17, 89, 34, 61, 23, 95, 12, 56, 78, 29, 67, 8, 50, 83];

export default function SortingVisualizer() {
  const [selectedAlgo, setSelectedAlgo] = useState('merge');
  const [initialArray, setInitialArray] = useState<number[]>(DEFAULT_ARRAY);
  const [customInput, setCustomInput] = useState(DEFAULT_ARRAY.join(', '));
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [speed, setSpeed] = useState(50); // ms per step
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, executionTimeMs: 0 });
  const timerRef = useRef<any>(null);

  const activeAlgo = ALGORITHMS.find(a => a.id === selectedAlgo)!;

  // Initialize steps whenever array or algorithm changes
  const initEngine = (arr: number[], algo: string) => {
    const t0 = performance.now();
    const result = generateSteps(algo, arr);
    const t1 = performance.now();
    setSteps(result.steps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setStats({
      comparisons: result.comparisons,
      swaps: result.swaps,
      executionTimeMs: Number((t1 - t0).toFixed(3))
    });
  };

  useEffect(() => {
    initEngine(initialArray, selectedAlgo);
  }, [selectedAlgo, initialArray]);

  // Animation loop with sound synthesis
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) {
            const nextIdx = prev + 1;
            const step = steps[nextIdx];
            if (isAudioEnabled && step) {
              const activeIdx = step.swapping[0] ?? step.comparing[0] ?? 0;
              playTone(step.array[activeIdx] || 50, 100);
            }
            return nextIdx;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps, speed, isAudioEnabled]);

  // Presets
  const setPreset = (type: 'random' | 'reverse' | 'nearly' | 'few') => {
    let arr: number[] = [];
    if (type === 'random') {
      arr = Array.from({ length: 16 }, () => Math.floor(Math.random() * 85) + 12);
    } else if (type === 'reverse') {
      arr = [95, 88, 81, 74, 68, 60, 53, 47, 40, 33, 27, 20, 14, 8];
    } else if (type === 'nearly') {
      arr = [10, 15, 18, 24, 30, 27, 36, 42, 50, 48, 62, 70, 78, 85];
    } else if (type === 'few') {
      arr = [20, 55, 80, 20, 55, 80, 20, 55, 80, 20, 55, 80];
    }
    setInitialArray(arr);
    setCustomInput(arr.join(', '));
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customInput
      .split(/[, ]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0 && n <= 100);
    if (parsed.length >= 4) {
      setInitialArray(parsed.slice(0, 30));
    }
  };

  const currentStep = steps[currentStepIndex] || {
    array: initialArray,
    comparing: [],
    swapping: [],
    sorted: []
  };

  const maxVal = Math.max(...currentStep.array, 100);

  return (
    <div className="space-y-5">
      {/* Algorithm selector pills */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {ALGORITHMS.map(a => (
          <button
            key={a.id}
            onClick={() => setSelectedAlgo(a.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedAlgo === a.id
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-ink-2 hover:text-ink'
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Algorithm details card */}
      <div className="card p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs bg-surface-2">
        <div>
          <span className="font-semibold text-ink text-sm">{activeAlgo.name}</span>
          <p className="text-2xs text-ink-muted mt-0.5">{activeAlgo.desc}</p>
        </div>
        <div className="flex items-center gap-4 text-2xs font-mono">
          <div>
            <span className="text-ink-muted block uppercase">Time Complexity</span>
            <span className="font-semibold text-accent">{activeAlgo.time}</span>
          </div>
          <div>
            <span className="text-ink-muted block uppercase">Space Complexity</span>
            <span className="font-semibold text-info">{activeAlgo.space}</span>
          </div>
        </div>
      </div>

      {/* Visualizer Stage */}
      <div className="card p-6 flex flex-col items-center justify-end h-72 bg-surface overflow-hidden relative">
        <div className="w-full h-full flex items-end justify-center gap-1.5 sm:gap-2 px-2">
          {currentStep.array.map((val, idx) => {
            const isComparing = currentStep.comparing.includes(idx);
            const isSwapping = currentStep.swapping.includes(idx);
            const isSorted = currentStep.sorted.includes(idx);

            let bgClass = 'bg-surface-2 border border-border text-ink-muted';
            if (isComparing) bgClass = 'bg-warn text-white border-warn';
            if (isSwapping) bgClass = 'bg-crit text-white border-crit animate-bounce';
            if (isSorted) bgClass = 'bg-accent text-white border-accent';

            const heightPct = Math.max(12, Math.round((val / maxVal) * 90));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full max-w-[40px] group">
                <span className="text-2xs font-mono mb-1 text-ink-muted group-hover:text-ink transition-colors">
                  {val}
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-sm transition-all duration-75 ${bgClass} flex items-center justify-center`}
                />
                <span className="text-3xs font-mono text-ink-muted mt-1 opacity-50">
                  {idx}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Playback Controls & Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Controls */}
        <div className="card p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsPlaying(p => !p)}
              leftIcon={isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            >
              {isPlaying ? 'Pause' : 'Start Animation'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(p => Math.min(steps.length - 1, p + 1));
              }}
              disabled={isPlaying || currentStepIndex >= steps.length - 1}
              leftIcon={<SkipForward className="w-3.5 h-3.5" />}
            >
              Step
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(0);
              }}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
            <button
              onClick={() => setIsAudioEnabled(p => !p)}
              className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-colors ${
                isAudioEnabled ? 'border-accent text-accent bg-accent-bg' : 'border-border text-ink-muted'
              }`}
              title="Toggle audio tone synthesis"
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 pt-1 text-xs">
            <span className="text-ink-muted text-2xs font-medium">Presets:</span>
            {[
              { id: 'random', label: 'Random' },
              { id: 'reverse', label: 'Reverse' },
              { id: 'nearly', label: 'Nearly Sorted' },
              { id: 'few', label: 'Duplicates' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id as any)}
                className="px-2 py-0.5 rounded text-3xs font-mono bg-surface-2 hover:bg-border text-ink-2 transition-colors border border-border"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Speed slider */}
          <div className="flex items-center gap-3 text-xs pt-1">
            <span className="text-ink-muted font-medium w-16">Speed:</span>
            <input
              type="range"
              min="10"
              max="250"
              step="10"
              value={260 - speed}
              onChange={e => setSpeed(260 - Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            <span className="font-mono text-ink-2 text-2xs w-12 text-right">
              {Math.round(1000 / speed)} op/s
            </span>
          </div>

          {/* Custom array form */}
          <form onSubmit={handleApplyCustom} className="flex gap-2 pt-1">
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="e.g. 50, 12, 85, 32, 99"
              className="input-base text-xs h-7 flex-1 font-mono"
            />
            <Button size="sm" variant="secondary" type="submit">
              Apply Array
            </Button>
          </form>
        </div>

        {/* Live Counters */}
        <div className="card p-4 grid grid-cols-2 gap-3 text-xs">
          <div className="card-2 p-3">
            <span className="text-ink-muted block text-2xs uppercase">Step Progress</span>
            <span className="text-base font-bold text-ink tabular font-mono">
              {currentStepIndex + 1} / {steps.length}
            </span>
            <span className="text-3xs text-ink-muted block mt-0.5">
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% complete
            </span>
          </div>

          <div className="card-2 p-3">
            <span className="text-ink-muted block text-2xs uppercase">Comparisons</span>
            <span className="text-base font-bold text-warn tabular font-mono">
              {stats.comparisons}
            </span>
            <span className="text-3xs text-ink-muted block mt-0.5">key inspections</span>
          </div>

          <div className="card-2 p-3">
            <span className="text-ink-muted block text-2xs uppercase">Array Swaps</span>
            <span className="text-base font-bold text-crit tabular font-mono">
              {stats.swaps}
            </span>
            <span className="text-3xs text-ink-muted block mt-0.5">element permutations</span>
          </div>

          <div className="card-2 p-3">
            <span className="text-ink-muted block text-2xs uppercase">Measured Time</span>
            <span className="text-base font-bold text-accent tabular font-mono">
              {stats.executionTimeMs} ms
            </span>
            <span className="text-3xs text-ink-muted block mt-0.5">native JS engine execution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
