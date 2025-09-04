'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWidgetStore, Widget } from '@/store/widgetStore';

interface ModernWidgetWrapperProps {
  widget: Widget;
  children: React.ReactNode;
  showTrend?: boolean;
  trendValue?: number;
  primaryValue?: string | number;
  primaryLabel?: string;
}

export function ModernWidgetWrapper({ 
  widget, 
  children, 
  showTrend = false, 
  trendValue = 0,
  primaryValue,
  primaryLabel
}: ModernWidgetWrapperProps) {
  const { removeWidget, refreshWidget } = useWidgetStore();
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = (id: string) => {
    setIsRotating(true);
    Promise.resolve(refreshWidget(id)).finally(() => {
      setTimeout(() => setIsRotating(false), 800);
    });
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-700 bg-green-50 border-green-200';
    if (value < 0) return 'text-red-700 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (widget.isLoading && !widget.data) {
    return (
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{widget.name}</h3>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                widget.error 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  widget.error ? 'bg-red-500' : 'bg-blue-500 animate-pulse'
                }`}></div>
                {widget.error ? 'Offline' : 'Live'}
              </div>
            </div>
            {showTrend && !widget.error && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${getTrendColor(trendValue)}`}>
                {getTrendIcon(trendValue)}
                <span>{Math.abs(trendValue).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              onClick={() => handleRefresh(widget.id)}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              onClick={() => removeWidget(widget.id)}
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Primary Value Display */}
        {primaryValue && !widget.error && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {primaryValue}
            </div>
            {primaryLabel && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {primaryLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {widget.error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{widget.error}</p>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Last updated: {new Date(widget.lastUpdated).toLocaleTimeString()}</span>
          <span className="font-mono">↻ {widget.refreshInterval}s</span>
        </div>
      </div>
    </Card>
  );
}
