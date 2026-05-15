/**
 * InsightSummaryCards Component
 * Displays 6 animated KPI cards from report summary
 *
 * Cards:
 * 1. Total Revenue
 * 2. Gross Profit
 * 3. Margin %
 * 4. Updated Records
 * 5. New Products
 * 6. Duplicate Rows
 *
 * Features:
 * - Gradient backgrounds
 * - Animated number counters
 * - Trend indicators
 * - Hover effects
 */

import { TrendingUp, Zap, RefreshCw, FileCheck, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import type { ReportSummary } from '../../types/reports';

interface InsightSummaryCardsProps {
  summary: ReportSummary;
}

interface KPICardProps {
  label: string;
  value: number | string;
  format: 'currency' | 'number' | 'percent';
  icon: React.ReactNode;
  gradient: string;
  trend?: number;
  subtitle?: string;
}

function KPICard({ label, value, format, icon, gradient, trend, subtitle }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (format === 'number' && typeof value === 'number') {
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
        50
      );
      return () => clearInterval(interval);
    }
  }, [value, format]);

  const formatDisplay = () => {
    if (format === 'currency' && typeof value === 'number') {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    if (format === 'number') {
      return displayValue.toLocaleString();
    }
    if (format === 'percent' && typeof value === 'number') {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value;
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 text-white shadow-md transition-all hover:shadow-xl hover:scale-105',
        gradient
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-lg bg-white/20 p-2">{icon}</div>
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp size={14} />
            <span>+{trend}%</span>
          </div>
        )}
      </div>
      <p className="mb-2 text-sm opacity-90">{label}</p>
      <h3 className="mb-1 text-3xl font-bold">{formatDisplay()}</h3>
      {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
    </div>
  );
}

export function InsightSummaryCards({ summary }: InsightSummaryCardsProps) {
  const cards: KPICardProps[] = [
    {
      label: 'Total Revenue',
      value: summary.totalRevenue,
      format: 'currency',
      icon: <Zap size={20} />,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      trend: 12,
      subtitle: `${summary.totalRecords} records`,
    },
    {
      label: 'Gross Profit',
      value: summary.totalRevenue - summary.totalExpense,
      format: 'currency',
      icon: <TrendingUp size={20} />,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      trend: 8,
      subtitle: 'After expenses',
    },
    {
      label: 'Margin %',
      value: summary.averageMargin,
      format: 'percent',
      icon: <FileCheck size={20} />,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      trend: 5,
      subtitle: 'Average margin',
    },
    {
      label: 'Updated Records',
      value: summary.updatedRecords,
      format: 'number',
      icon: <RefreshCw size={20} />,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      subtitle: `${((summary.updatedRecords / summary.totalRecords) * 100).toFixed(1)}% of total`,
    },
    {
      label: 'New Products',
      value: summary.newProducts,
      format: 'number',
      icon: <Zap size={20} />,
      gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      subtitle: 'Added this period',
    },
    {
      label: 'Duplicate Rows',
      value: summary.duplicateRecords,
      format: 'number',
      icon: <Copy size={20} />,
      gradient: 'bg-gradient-to-br from-red-500 to-red-600',
      subtitle: `${((summary.duplicateRecords / summary.totalRecords) * 100).toFixed(1)}% of total`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
          }}
        >
          <KPICard {...card} />
        </div>
      ))}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
