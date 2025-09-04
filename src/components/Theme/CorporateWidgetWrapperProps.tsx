'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWidgetStore, Widget } from '@/store/widgetStore';

interface CorporateWidgetWrapperProps {
  widget: Widget;
  children: React.ReactNode;
  showTrend?: boolean;
  trendValue?: number;
  primaryValue?: string | number;
  primaryLabel?: string;
}

export function CorporateWidgetWrapper({ 
  widget, 
  children, 
  showTrend = false, 
  trendValue = 0,
  primaryValue,
  primaryLabel
}: CorporateWidgetWrapperProps) {
  const { removeWidget, refreshWidget } = useWidgetStore();
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = (id: string) => {
    setIsRotating(true);
    Promise.resolve(refreshWidget(id)).finally(() => {
      setTimeout(() => setIsRotating(false), 800);
    });
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />;
    if (value < 0) return <TrendingDown className="h-3.5 w-3.5 text-red-600" />;
    return <Minus className="h-3.5 w-3.5 text-gray-500" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-emerald-700 dark:text-emerald-400';
    if (value < 0) return 'text-red-700 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (widget.isLoading && !widget.data) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 shadow-lg rounded-none">
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/2"></div>
            <div className="flex gap-2">
              <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 shadow-lg rounded-none overflow-hidden">
      {/* Header Bar */}
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
              {widget.name}
            </h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                widget.error ? 'bg-red-500' : 'bg-green-500'
              }`}></div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {widget.error ? 'ERROR' : 'ONLINE'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => handleRefresh(widget.id)}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
              onClick={() => removeWidget(widget.id)}
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Value Section */}
      {primaryValue && !widget.error && (
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                {primaryValue}
              </div>
              {primaryLabel && (
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">
                  {primaryLabel}
                </div>
              )}
            </div>
            {showTrend && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor(trendValue)}`}>
                {getTrendIcon(trendValue)}
                <span className="tabular-nums">
                  {Math.abs(trendValue).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {widget.error ? (
          <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10 p-3">
            <div className="flex">
              <div className="text-xs font-semibold text-red-800 dark:text-red-400 uppercase tracking-wide mb-1">
                System Error
              </div>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm">{widget.error}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {children}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800/30 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
            UPDATED: {new Date(widget.lastUpdated).toLocaleTimeString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
            REFRESH: {widget.refreshInterval}s
          </div>
        </div>
      </div>
    </Card>
  );
}
