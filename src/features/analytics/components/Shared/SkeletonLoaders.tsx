/**
 * Skeleton Loader Components
 * Reusable placeholder animations while content loads
 * 
 * Components:
 * - SkeletonLoader: Generic loading bar
 * - KPICardSkeleton: KPI placeholder
 * - ChartSkeleton: Chart area placeholder
 * - GridSkeleton: Table/grid placeholder
 */

import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function SkeletonLoader({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200',
        'dark:from-slate-700 dark:via-slate-600 dark:to-slate-700',
        className
      )}
    />
  );
}

export function KPICardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-700">
      <div className="space-y-4">
        <SkeletonLoader className="h-4 w-24" />
        <SkeletonLoader className="h-8 w-32" />
        <SkeletonLoader className="h-3 w-16" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-700">
      <SkeletonLoader className="mb-4 h-4 w-40" />
      <SkeletonLoader className="h-64 w-full" />
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-6 dark:border-slate-700">
      <SkeletonLoader className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonLoader key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
      <SkeletonLoader className="h-8 w-24 rounded-full" />
      <SkeletonLoader className="h-8 w-32 rounded-full" />
      <SkeletonLoader className="ml-auto h-10 w-36" />
    </div>
  );
}
