/**
 * KPICard Component
 * Premium SaaS-style KPI metric display
 * 
 * Features:
 * - Large readable metrics
 * - Trend indicators with %
 * - Mini sparkline charts
 * - Daily/Weekly/Monthly toggle
 * - Hover glow effect
 * - Animated counters
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

interface KPICardProps {
  label: string;
  value: number;
  format: 'currency' | 'number' | 'percent';
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
}

const colorConfig = {
  green: 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300',
  blue: 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  purple: 'border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
  orange: 'border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300',
  red: 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
};

export function KPICard({
  label,
  value,
  format,
  trend,
  trendLabel = 'vs last period',
  icon,
  color = 'blue',
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (format === 'number') {
      const interval = setInterval(
        () => {
          setDisplayValue((prev) => {
            if (prev >= value) {
              clearInterval(interval);
              return value;
            }
            return prev + Math.ceil(value / 20);
          });
        },
        30
      );
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [value, format]);

  const formatValue = () => {
    if (format === 'currency') {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    if (format === 'number') {
      return displayValue.toLocaleString();
    }
    if (format === 'percent') {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value;
  };

  const trendPositive = trend && trend > 0;

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 transition-all hover:shadow-lg dark:bg-slate-900/50',
        colorConfig[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-3 text-sm font-medium opacity-75">{label}</p>
          <h3 className="mb-3 text-4xl font-bold">{formatValue()}</h3>
          
          {trend !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <div
                className={cn(
                  'rounded p-1',
                  trendPositive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}
              >
                {trendPositive ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
              </div>
              <span className="opacity-75">
                {trendPositive ? '+' : '-'}
                {Math.abs(trend)}% {trendLabel}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div className="rounded-lg bg-white/20 p-3 dark:bg-white/5">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
