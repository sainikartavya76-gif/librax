import React, { useState } from 'react';
import { ArrowRight, UserPlus, CheckCircle2, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

interface QueueItem {
  id: string;
  studentName: string;
  bookTitle: string;
  timestamp: string;
}

const INITIAL_QUEUE: QueueItem[] = [
  { id: '1', studentName: 'Alex Johnson', bookTitle: 'Introduction to Algorithms', timestamp: '10:05' },
  { id: '2', studentName: 'Maya Patel', bookTitle: 'Artificial Intelligence: Modern Approach', timestamp: '10:12' },
  { id: '3', studentName: 'Ethan Brooks', bookTitle: 'Operating System Concepts', timestamp: '10:19' },
  { id: '4', studentName: 'Sophia Lee', bookTitle: 'Computer Networks', timestamp: '10:25' },
];

export default function QueueVisualizer() {
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [studentName, setStudentName] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [lastServed, setLastServed] = useState<QueueItem | null>(null);

  const handleEnqueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !bookTitle) return;
    const newItem: QueueItem = {
      id: Math.random().toString(36).substring(2, 7),
      studentName,
      bookTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setQueue([...queue, newItem]);
    setStudentName('');
    setBookTitle('');
  };

  const handleDequeue = () => {
    if (queue.length === 0) return;
    const [served, ...remaining] = queue;
    setLastServed(served);
    setQueue(remaining);
  };

  const handleClear = () => {
    setQueue([]);
    setLastServed(null);
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-ink text-sm">FIFO Reservation Queue Simulator</h3>
          <p className="text-2xs text-ink-muted">Strict First-In-First-Out hold queue ensuring equitable resource scheduling.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleDequeue}
            disabled={queue.length === 0}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Serve Front (Dequeue)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleClear}
            disabled={queue.length === 0}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear Queue
          </Button>
        </div>
      </div>

      {/* Enqueue Form */}
      <form onSubmit={handleEnqueue} className="card p-4 flex flex-col sm:flex-row gap-3 items-end bg-surface-2">
        <div className="w-full sm:w-60">
          <label className="label-base">Student Name</label>
          <input
            type="text"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            placeholder="e.g. Liam Zhang"
            className="input-base text-xs h-8"
            required
          />
        </div>
        <div className="flex-1 w-full">
          <label className="label-base">Requested Book Title</label>
          <input
            type="text"
            value={bookTitle}
            onChange={e => setBookTitle(e.target.value)}
            placeholder="e.g. Compilers: Principles, Techniques, & Tools"
            className="input-base text-xs h-8"
            required
          />
        </div>
        <Button size="sm" type="submit" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
          Enqueue (Join Hold)
        </Button>
      </form>

      {/* Pipeline Visualizer */}
      <div className="card p-6 bg-surface overflow-x-auto min-h-[220px] flex flex-col justify-center">
        {queue.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg py-12 text-center text-xs text-ink-muted">
            Queue is currently empty. No students waiting for inventory.
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-max py-4 px-2">
            <div className="flex flex-col items-center mr-2">
              <span className="text-2xs font-mono font-bold text-accent uppercase">FRONT / HEAD</span>
              <span className="text-3xs text-ink-muted">(Next to receive)</span>
            </div>

            {queue.map((item, idx) => (
              <React.Fragment key={item.id}>
                <div
                  className={`w-52 p-3 rounded-lg border transition-all ${
                    idx === 0
                      ? 'border-accent bg-accent-bg shadow-sm ring-2 ring-accent'
                      : 'border-border bg-surface-2'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-mono text-2xs font-bold">
                      #{idx + 1}
                    </span>
                    <span className="text-3xs font-mono text-ink-muted">{item.timestamp}</span>
                  </div>
                  <div className="font-semibold text-xs text-ink truncate" title={item.studentName}>
                    {item.studentName}
                  </div>
                  <div className="text-2xs text-ink-2 truncate mt-0.5 book-title" title={item.bookTitle}>
                    {item.bookTitle}
                  </div>
                </div>

                {idx < queue.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-ink-muted shrink-0 opacity-40" />
                )}
              </React.Fragment>
            ))}

            <div className="flex flex-col items-center ml-2">
              <span className="text-2xs font-mono font-bold text-ink-muted uppercase">REAR / TAIL</span>
              <span className="text-3xs text-ink-muted">(Most recent hold)</span>
            </div>
          </div>
        )}
      </div>

      {/* Served Notification */}
      {lastServed && (
        <div className="card p-3 border-accent/40 bg-accent-bg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            <div>
              <span className="font-semibold text-ink">Fulfilled & Allocated: </span>
              <span className="text-ink-2">{lastServed.studentName} received "{lastServed.bookTitle}"</span>
            </div>
          </div>
          <span className="text-3xs font-mono text-ink-muted">Dequeued at {new Date().toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
}
