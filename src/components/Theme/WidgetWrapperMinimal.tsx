'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWidgetStore, Widget } from '@/store/widgetStore';

interface WidgetWrapperMinimalProps {
  widget: Widget;
  children: React.ReactNode;
  showTrend?: boolean;
  trendValue?: number;
  primaryValue?: string | number;
  primaryLabel?: string;
}

export function WidgetWrapperMinimal({ 
  widget, 
  children, 
  showTrend = false, 
  trendValue = 0,
  primaryValue,
  primaryLabel
}: WidgetWrapperMinimalProps) {
  const { removeWidget, refreshWidget } = useWidgetStore();
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = (id: string) => {
    setIsRotating(true);
    Promise.resolve(refreshWidget(id)).finally(() => {
      setTimeout(() => setIsRotating(false), 800);
    });
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />;
    if (value < 0) return <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />;
    return <Minus className="h-3 w-3 text-gray-500 dark:text-gray-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-700 dark:text-green-300';
    if (value < 0) return 'text-red-700 dark:text-red-300';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (widget.isLoading && !widget.data) {
    return (
      <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 rounded-md">
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="w-32 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={() => handleRefresh(widget.id)}
                aria-label="Refresh"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => removeWidget(widget.id)}
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-24 h-5 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="w-20 h-5 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 rounded-md">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-medium text-base text-gray-900 dark:text-white mb-2">{widget.name}</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${widget.error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {widget.error ? 'Error' : 'Live'}
                </span>
              </div>
              {showTrend && !widget.error && (
                <div className={`flex items-center gap-1 text-xs ${getTrendColor(trendValue)}`}>
                  {getTrendIcon(trendValue)}
                  <span>
                    {Math.abs(trendValue).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={() => handleRefresh(widget.id)}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => removeWidget(widget.id)}
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Primary Value Display (optional) */}
        {primaryValue && !widget.error && (
          <div className="text-center space-y-2 pb-4 mb-4 border-b border-gray-200 dark:border-slate-700">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {primaryValue}
            </div>
            {primaryLabel && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {primaryLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {widget.error ? (
          <div className="py-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800/50">
              <p className="text-red-700 dark:text-red-300 text-sm">{widget.error}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 rounded-b-md">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Updated {new Date(widget.lastUpdated).toLocaleTimeString()}</span>
          <span>Every {widget.refreshInterval}s</span>
        </div>
      </div>
    </Card>
  );
}