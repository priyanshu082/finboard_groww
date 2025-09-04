'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWidgetStore, Widget } from '@/store/widgetStore';

interface ContemporaryWidgetWrapperProps {
  widget: Widget;
  children: React.ReactNode;
  showTrend?: boolean;
  trendValue?: number;
  primaryValue?: string | number;
  primaryLabel?: string;
}

export function ContemporaryWidgetWrapper({ 
  widget, 
  children, 
  showTrend = false, 
  trendValue = 0,
  primaryValue,
  primaryLabel
}: ContemporaryWidgetWrapperProps) {
  const { removeWidget, refreshWidget } = useWidgetStore();
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = (id: string) => {
    setIsRotating(true);
    Promise.resolve(refreshWidget(id)).finally(() => {
      setTimeout(() => setIsRotating(false), 800);
    });
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/20';
    if (value < 0) return 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/20';
    return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
  };

  if (widget.isLoading && !widget.data) {
    return (
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-lg"></div>
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 pt-1">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse w-2/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-lg"></div>
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 pt-1 overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-1">{widget.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
                  widget.error 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    widget.error ? 'bg-red-600' : 'bg-green-600 animate-pulse'
                  }`}></div>
                  {widget.error ? 'Disconnected' : 'Connected'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-full transition-all duration-200"
                onClick={() => handleRefresh(widget.id)}
                aria-label="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
                onClick={() => removeWidget(widget.id)}
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Trend Display */}
          {showTrend && !widget.error && (
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getTrendColor(trendValue)}`}>
              {getTrendIcon(trendValue)}
              <span>{Math.abs(trendValue).toFixed(1)}% change</span>
            </div>
          )}
        </div>

        {/* Primary Value Display */}
        {primaryValue && !widget.error && (
          <div className="px-5 pb-4">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-violet-100 dark:border-violet-800/30">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400">
                {primaryValue}
              </div>
              {primaryLabel && (
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {primaryLabel}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-5 pb-5">
          {widget.error ? (
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border border-red-200 dark:border-red-800/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-semibold text-red-700 dark:text-red-300">Error Detected</span>
              </div>
              <p className="text-red-600 dark:text-red-400 text-sm">{widget.error}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {children}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
              <span>Updated {new Date(widget.lastUpdated).toLocaleTimeString()}</span>
            </div>
            <div className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-mono text-slate-600 dark:text-slate-400">
              {widget.refreshInterval}s interval
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
