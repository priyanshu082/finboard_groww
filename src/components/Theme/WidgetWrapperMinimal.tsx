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
    if (value > 0) return <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Minus className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-purple-700 dark:text-purple-300';
    if (value < 0) return 'text-red-700 dark:text-red-300';
    return 'text-amber-700 dark:text-amber-300';
  };

  if (widget.isLoading && !widget.data) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900 border-l-4 border-l-purple-500 dark:border-l-purple-400 border-r-0 border-t-0 border-b-0 transition-all duration-300 rounded-r-xl rounded-l-none">
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="flex-1">
              <div className="w-40 h-6 bg-purple-200 dark:bg-gray-800 rounded-md animate-pulse mb-3"></div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-4 bg-purple-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-start">
              <div className="h-9 w-9 bg-purple-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              <div className="h-9 w-9 bg-purple-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-purple-100/50 dark:bg-gray-900 rounded-lg">
                <div className="w-32 h-4 bg-purple-200 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="w-20 h-4 bg-purple-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900 border-l-4 border-l-purple-500 dark:border-l-purple-400 border-r-0 border-t-0 border-b-0 transition-all duration-300 rounded-r-xl rounded-l-none">
      {/* Header */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-purple-900 dark:text-gray-100 mb-3 leading-tight">{widget.name}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${widget.error ? 'bg-red-500' : 'bg-purple-500 dark:bg-purple-400'} ${!widget.error && 'animate-pulse'}`}></div>
                <span className="text-sm text-purple-700 dark:text-gray-400 font-medium">
                  {widget.error ? 'Error' : 'Active'}
                </span>
              </div>
              {showTrend && !widget.error && (
                <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md bg-purple-100/70 dark:bg-gray-800 ${getTrendColor(trendValue)}`}>
                  {getTrendIcon(trendValue)}
                  <span>
                    {Math.abs(trendValue).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-start">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-purple-600 hover:text-purple-700 dark:text-gray-500 dark:hover:text-purple-400 rounded-lg hover:bg-purple-100/50 dark:hover:bg-purple-900/10 transition-all duration-200"
              onClick={() => handleRefresh(widget.id)}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-purple-600 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200"
              onClick={() => removeWidget(widget.id)}
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Primary Value Display */}
        {primaryValue && !widget.error && (
          <div className="text-left space-y-3 pb-5 mb-5 border-b-2 border-dashed border-purple-200 dark:border-gray-800">
            <div className="text-3xl font-bold text-purple-900 dark:text-gray-100">
              {primaryValue}
            </div>
            {primaryLabel && (
              <div className="text-sm text-purple-700 dark:text-gray-400 font-medium">
                {primaryLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {widget.error ? (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30 flex items-start gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">{widget.error}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {children}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-purple-100/30 dark:bg-gray-900/50 border-t border-purple-200 dark:border-gray-800 rounded-b-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-sm text-purple-700 dark:text-gray-400">
            <span className="inline-flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
              Updated {new Date(widget.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
          <div className="text-sm text-purple-700 dark:text-gray-400 font-mono bg-white dark:bg-gray-900 px-3 py-1 rounded border self-end sm:self-auto">
            {widget.refreshInterval}s
          </div>
        </div>
      </div>
    </Card>
  );
}
