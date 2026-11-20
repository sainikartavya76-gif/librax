import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circle';
  width?: string;
  height?: string;
}

export function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-2 rounded',
        variant === 'text' && 'rounded-sm h-4',
        variant === 'circle' && 'rounded-full',
        className
      )}
      {...props}
    />
  );
}

/** Skeleton for a table row */
export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3 border-b border-border">
          <Skeleton className={`h-4 ${i === 0 ? 'w-4/5' : 'w-3/5'}`} />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton for a card */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card p-4 space-y-3', className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export default Skeleton;
