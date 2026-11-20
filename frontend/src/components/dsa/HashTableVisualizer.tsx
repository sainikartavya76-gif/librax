import React, { useState } from 'react';
import { Search, Plus, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';

interface HashEntry {
  key: string; // ISBN
  title: string;
}

const BUCKET_COUNT = 8;

const INITIAL_ENTRIES: HashEntry[] = [
  { key: '978-0132350884', title: 'Clean Code' },
  { key: '978-0201633610', title: 'Design Patterns' },
  { key: '978-0262033848', title: 'Introduction to Algorithms' },
  { key: '978-0131103627', title: 'The C Programming Language' },
  { key: '978-1449331818', title: 'Learning JavaScript' },
];

function hashFunction(isbn: string, size: number): number {
  let hash = 0;
  for (let i = 0; i < isbn.length; i++) {
    hash = (hash * 31 + isbn.charCodeAt(i)) % size;
  }
  return Math.abs(hash);
}

export default function HashTableVisualizer() {
  const [entries, setEntries] = useState<HashEntry[]>(INITIAL_ENTRIES);
  const [isbnInput, setIsbnInput] = useState('978-0134494166');
  const [titleInput, setTitleInput] = useState('Clean Architecture');
  const [searchKey, setSearchKey] = useState('978-0132350884');
  const [activeBucket, setActiveBucket] = useState<number | null>(null);
  const [log, setLog] = useState('Hash table initialized with 8 buckets using separate chaining collision resolution.');

  // Distribute entries into buckets
  const buckets: HashEntry[][] = Array.from({ length: BUCKET_COUNT }, () => []);
  entries.forEach(e => {
    const idx = hashFunction(e.key, BUCKET_COUNT);
    buckets[idx].push(e);
  });

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isbnInput || !titleInput) return;
    const bucketIdx = hashFunction(isbnInput, BUCKET_COUNT);
    setEntries(prev => [...prev.filter(x => x.key !== isbnInput), { key: isbnInput, title: titleInput }]);
    setActiveBucket(bucketIdx);
    setLog(`Computed hash("${isbnInput}") % 8 = Bucket [${bucketIdx}]. Placed in chain.`);
    setIsbnInput('');
    setTitleInput('');
  };

  const handleSearch = () => {
    const bucketIdx = hashFunction(searchKey, BUCKET_COUNT);
    setActiveBucket(bucketIdx);
    const chain = buckets[bucketIdx];
    const match = chain.find(x => x.key === searchKey);
    if (match) {
      setLog(`Found "${match.title}" in Bucket [${bucketIdx}] (O(1) average hash lookup).`);
    } else {
      setLog(`Searched Bucket [${bucketIdx}], but ISBN was not present in the chain.`);
    }
  };

  const loadFactor = Number((entries.length / BUCKET_COUNT).toFixed(2));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-ink text-sm">Hash Table ISBN Lookup (Separate Chaining)</h3>
          <p className="text-2xs text-ink-muted">Demonstrates collision handling, modulo hashing, and O(1) inventory key lookups.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xs font-mono">
            <span className="text-ink-muted">Load Factor (α): </span>
            <span className={`font-bold ${loadFactor > 0.75 ? 'text-warn' : 'text-accent'}`}>{loadFactor}</span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEntries(INITIAL_ENTRIES);
              setActiveBucket(null);
              setLog('Reset to sample catalog hash table.');
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form onSubmit={handleInsert} className="card p-3.5 space-y-2 bg-surface-2 text-xs">
          <span className="font-semibold text-ink uppercase text-2xs">Insert ISBN Record</span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={isbnInput}
              onChange={e => setIsbnInput(e.target.value)}
              placeholder="ISBN (e.g. 978-013...)"
              className="input-base text-xs h-8 flex-1 font-mono"
              required
            />
            <input
              type="text"
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              placeholder="Book Title"
              className="input-base text-xs h-8 flex-1"
              required
            />
            <Button size="sm" type="submit" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Insert
            </Button>
          </div>
        </form>

        <div className="card p-3.5 space-y-2 bg-surface-2 text-xs">
          <span className="font-semibold text-ink uppercase text-2xs">O(1) Hash Lookup</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchKey}
              onChange={e => setSearchKey(e.target.value)}
              placeholder="Query ISBN"
              className="input-base text-xs h-8 flex-1 font-mono"
            />
            <Button size="sm" onClick={handleSearch} leftIcon={<Search className="w-3.5 h-3.5" />}>
              Hash Query
            </Button>
          </div>
        </div>
      </div>

      {/* Buckets Display */}
      <div className="card p-5 bg-surface space-y-3">
        <h4 className="text-2xs font-semibold uppercase tracking-wider text-ink-muted">Array of Linked List Buckets</h4>
        <div className="space-y-2.5">
          {buckets.map((chain, bIdx) => {
            const isActive = activeBucket === bIdx;
            return (
              <div
                key={bIdx}
                className={`p-2.5 rounded-md border flex items-center gap-3 transition-all ${
                  isActive
                    ? 'border-accent bg-accent-bg ring-1 ring-accent'
                    : 'border-border bg-surface-2'
                }`}
              >
                <div className="w-24 shrink-0 flex items-center gap-1.5 font-mono text-2xs font-bold text-ink">
                  <span className="w-5 h-5 rounded bg-surface border border-border flex items-center justify-center">
                    {bIdx}
                  </span>
                  <span>Bucket[{bIdx}]</span>
                </div>

                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {chain.length === 0 ? (
                    <span className="text-3xs text-ink-muted italic font-mono">NULL (empty bucket)</span>
                  ) : (
                    chain.map((item, itemIdx) => (
                      <React.Fragment key={item.key}>
                        <div className="px-2.5 py-1.5 rounded bg-surface border border-border shadow-xs text-xs">
                          <span className="font-mono text-3xs text-accent font-semibold block">{item.key}</span>
                          <span className="text-2xs font-medium text-ink clamp-1 max-w-[140px] book-title">{item.title}</span>
                        </div>
                        {itemIdx < chain.length - 1 && (
                          <span className="text-ink-muted font-mono text-xs">→</span>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagnostics */}
      <div className="card p-3 bg-surface-2 text-xs flex items-center gap-2 font-mono">
        <span className="w-2 h-2 rounded-full bg-accent" />
        <span className="text-ink">{log}</span>
      </div>
    </div>
  );
}
