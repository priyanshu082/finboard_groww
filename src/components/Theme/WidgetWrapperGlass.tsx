'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWidgetStore, Widget } from '@/store/widgetStore';

interface WidgetWrapperGlassProps {
  widget: Widget;
  children: React.ReactNode;
  showTrend?: boolean;
  trendValue?: number;
  primaryValue?: string | number;
  primaryLabel?: string;
}

export function WidgetWrapperGlass({ 
  widget, 
  children, 
  showTrend = false, 
  trendValue = 0,
  primaryValue,
  primaryLabel
}: WidgetWrapperGlassProps) {
  const { removeWidget, refreshWidget } = useWidgetStore();
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = (id: string) => {
    setIsRotating(true);
    Promise.resolve(refreshWidget(id)).finally(() => {
      setTimeout(() => setIsRotating(false), 800);
    });
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-blue-600 dark:text-cyan-400" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-blue-700 dark:text-cyan-300';
    if (value < 0) return 'text-orange-700 dark:text-orange-300';
    return 'text-slate-500';
  };

  if (widget.isLoading && !widget.data) {
    return (
      <Card className="bg-gradient-to-br from-blue-50/80 via-white/90 to-indigo-50/80 dark:from-slate-800/90 dark:via-slate-700/90 dark:to-blue-900/90 backdrop-blur-md border border-blue-200/50 dark:border-slate-600/50 transition-all duration-500 rounded-2xl">
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="flex-1">
              <div className="w-40 h-6 bg-gradient-to-r from-blue-200/60 to-indigo-200/60 dark:from-slate-600/60 dark:to-slate-500/60 rounded-xl animate-pulse mb-3"></div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-4 bg-gradient-to-r from-blue-200/60 to-indigo-200/60 dark:from-slate-600/60 dark:to-slate-500/60 rounded-xl animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-start">
              <div className="h-9 w-9 bg-gradient-to-r from-blue-200/60 to-indigo-200/60 dark:from-slate-600/60 dark:to-slate-500/60 rounded-xl animate-pulse"></div>
              <div className="h-9 w-9 bg-gradient-to-r from-blue-200/60 to-indigo-200/60 dark:from-slate-600/60 dark:to-slate-500/60 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-32 h-6 bg-gradient-to-r from-blue-200/60 to-indigo-200/60 dark:from-slate-600/60 dark:to-slate-500/60 rounded-xl animate-pulse"></div>
                <div className="w-20 h-6 bg-gradient-to-r from-blue-200/60 to-indigo-200/60 dark:from-slate-600/60 dark:to-slate-500/60 rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50/80 via-white/90 to-indigo-50/80 dark:from-slate-800/90 dark:via-slate-700/90 dark:to-blue-900/90 backdrop-blur-md border border-blue-200/50 dark:border-slate-600/50 transition-all duration-500 rounded-2xl overflow-hidden">
      {/* Decorative gradient line */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
      
      {/* Header */}
      <div className="relative px-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-2 leading-tight">{widget.name}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${widget.error ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {widget.error ? 'Connection failed' : 'Live data'}
                </span>
              </div>
              {showTrend && !widget.error && (
                <div className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm ${getTrendColor(trendValue)}`}>
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
              className="h-9 w-9 p-0 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-cyan-400 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-all duration-200 backdrop-blur-sm"
              onClick={() => handleRefresh(widget.id)}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200 backdrop-blur-sm"
              onClick={() => removeWidget(widget.id)}
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Primary Value Display */}
        {primaryValue && !widget.error && (
          <div className="text-center sm:text-left space-y-3 pb-5 mb-5 border-b border-blue-100/50 dark:border-slate-700/50">
            <div className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {primaryValue}
            </div>
            {primaryLabel && (
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {primaryLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {widget.error ? (
          <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 rounded-xl border border-rose-200 dark:border-rose-800/50 backdrop-blur-sm">
            <p className="text-rose-700 dark:text-rose-300 text-sm font-medium">{widget.error}</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-indigo-50/30 dark:from-transparent dark:via-slate-800/30 dark:to-blue-900/30 rounded-xl -m-2"></div>
            <div className="relative">
              {children}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-50/80 via-white/80 to-indigo-50/80 dark:from-slate-800/80 dark:via-slate-700/80 dark:to-blue-900/80 border-t border-blue-100/50 dark:border-slate-700/50 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
          <span>Updated {new Date(widget.lastUpdated).toLocaleTimeString()}</span>
          <span className="px-3 py-1 bg-white/60 dark:bg-slate-800/60 rounded-full text-xs backdrop-blur-sm">Every {widget.refreshInterval}s</span>
        </div>
      </div>
    </Card>
  );
}
