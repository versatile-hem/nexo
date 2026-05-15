/**
 * AI Insight Panel Component
 * Displays AI-generated business insights
 * 
 * Features:
 * - Severity badges
 * - Action suggestions
 * - Metric highlights
 * - Dismissible cards
 */

import {
  AlertCircle,
  Lightbulb,
  TrendingUp,
  X,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import type { AIInsight } from '../../types/analytics';

interface AIInsightPanelProps {
  insights: AIInsight[];
}

const severityConfig = {
  low: {
    icon: Lightbulb,
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  medium: {
    icon: AlertCircle,
    bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  high: {
    icon: AlertCircle,
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
};

const typeConfig = {
  opportunity: {
    icon: TrendingUp,
    color: 'text-green-600 dark:text-green-400',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-orange-600 dark:text-orange-400',
  },
  insight: {
    icon: Lightbulb,
    color: 'text-blue-600 dark:text-blue-400',
  },
};

export function AIInsightPanel({ insights }: AIInsightPanelProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(id);
    setDismissed(newDismissed);
  };

  const visibleInsights = insights.filter((i) => !dismissed.has(i.id));

  if (visibleInsights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        🤖 AI Insights
      </h3>

      <div className="space-y-3">
        {visibleInsights.map((insight) => {
          const severityConf = severityConfig[insight.severity];
          const typeConf = typeConfig[insight.type];
          const TypeIcon = typeConf.icon;

          return (
            <div
              key={insight.id}
              className={cn(
                'rounded-lg border p-4 transition-all',
                severityConf.bg
              )}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 pt-1">
                  <TypeIcon className={cn('h-5 w-5', typeConf.color)} />
                </div>

                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {insight.title}
                    </h4>
                    <button
                      onClick={() => handleDismiss(insight.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
                    {insight.message}
                  </p>

                  {insight.value && (
                    <div className={cn('mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold', severityConf.badge)}>
                      {insight.metric}: <span className="font-bold">{insight.value}</span>
                    </div>
                  )}

                  {insight.suggestedAction && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span>💡 Suggested:</span>
                      <span className="font-medium">{insight.suggestedAction}</span>
                      <ArrowRight size={12} />
                    </div>
                  )}
                </div>

                <div className={cn('flex-shrink-0 rounded-full px-2 py-1 text-xs font-semibold', severityConf.badge)}>
                  {insight.severity}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {dismissed.size > 0 && (
        <button
          onClick={() => setDismissed(new Set())}
          className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Show {dismissed.size} dismissed insight{dismissed.size !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
