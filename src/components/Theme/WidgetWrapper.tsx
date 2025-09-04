'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWidgetStore, Widget } from '@/store/widgetStore';

interface WidgetWrapperProps {
  widget: Widget;
  children: React.ReactNode;
  showTrend?: boolean;
  trendValue?: number;
  primaryValue?: string | number;
  primaryLabel?: string;
}

export function WidgetWrapper({ 
  widget, 
  children, 
  showTrend = false, 
  trendValue = 0,
  primaryValue,
  primaryLabel
}: WidgetWrapperProps) {
  const { removeWidget, refreshWidget } = useWidgetStore();
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = (id: string) => {
    setIsRotating(true);
    Promise.resolve(refreshWidget(id)).finally(() => {
      setTimeout(() => setIsRotating(false), 800);
    });
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-emerald-700 dark:text-emerald-300';
    if (value < 0) return 'text-red-700 dark:text-red-300';
    return 'text-gray-500 dark:text-gray-400';
  };

  if (widget.isLoading && !widget.data) {
    return (
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-900 dark:to-gray-800 border border-emerald-200 dark:border-gray-700 transition-all duration-200 rounded-xl">
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="flex-1">
              <div className="w-40 h-6 bg-emerald-200 dark:bg-gray-700 rounded-lg animate-pulse mb-3"></div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-4 bg-emerald-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-start">
              <div className="h-9 w-9 bg-emerald-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-9 w-9 bg-emerald-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-32 h-6 bg-emerald-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="w-20 h-6 bg-emerald-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-900 dark:to-gray-800 border border-emerald-200 dark:border-gray-700 transition-all duration-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-emerald-900 dark:text-white mb-3 leading-tight">{widget.name}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${widget.error ? 'bg-red-500' : 'bg-emerald-500'} ${!widget.error && 'animate-pulse'}`}></div>
                <span className="text-sm text-emerald-700 dark:text-gray-400 font-medium">
                  {widget.error ? 'Connection failed' : 'Live data'}
                </span>
              </div>
              {showTrend && !widget.error && (
                <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md bg-emerald-100/70 dark:bg-gray-800 ${getTrendColor(trendValue)}`}>
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
              className="h-9 w-9 p-0 text-emerald-600 hover:text-emerald-700 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-emerald-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => handleRefresh(widget.id)}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-emerald-600 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              onClick={() => removeWidget(widget.id)}
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Primary Value Display */}
        {primaryValue && !widget.error && (
          <div className="text-center sm:text-left space-y-3 pb-5 mb-5 border-b border-emerald-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-emerald-900 dark:text-white">
              {primaryValue}
            </div>
            {primaryLabel && (
              <div className="text-sm text-emerald-700 dark:text-gray-400">
                {primaryLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {widget.error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">{widget.error}</p>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-emerald-100/50 dark:bg-gray-800/50 border-t border-emerald-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-emerald-700 dark:text-gray-400">
          <span className="font-medium">Updated {new Date(widget.lastUpdated).toLocaleTimeString()}</span>
          <span className="font-mono bg-emerald-200 dark:bg-gray-700 px-3 py-1 rounded text-xs">Every {widget.refreshInterval}s</span>
        </div>
      </div>
    </Card>
  );
}
