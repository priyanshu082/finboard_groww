'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, X, MoreVertical, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { useWidgetStore } from '@/store/widgetStore';
import { getFieldValue, formatValue } from '@/lib/dataUtils';

interface CardWidgetProps {
  widget: {
    id: string;
    name: string;
    type: 'card' | 'table' | 'chart';
    apiUrl: string;
    selectedFields: string[];
    refreshInterval: number;
    data?: unknown;
    error?: string;
    isLoading?: boolean;
    lastUpdated: number;
    position: number;
  };
}

export function CardWidget({ widget }: CardWidgetProps) {
  const { removeWidget, refreshWidget } = useWidgetStore();

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-emerald-500" />;
    if (value < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  if (widget.isLoading && !widget.data) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (widget.error) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1">{widget.name}</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Connection failed</span>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => refreshWidget(widget.id)} className="text-sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => removeWidget(widget.id)}
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="py-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
              <p className="text-red-700 dark:text-red-300 text-sm">{widget.error}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Updated {new Date(widget.lastUpdated).toLocaleTimeString()}</span>
            <span>Every {widget.refreshInterval}s</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1">{widget.name}</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Live data</span>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => refreshWidget(widget.id)} className="text-sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => removeWidget(widget.id)}
                className="text-sm text-red-600 dark:text-red-400"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {widget.data && widget.selectedFields.length > 0 ? (
          <div className="space-y-4">
            {widget.selectedFields.map((fieldPath, index) => {
              const value = getFieldValue(widget.data, fieldPath);
              const formattedValue = formatValue(value, fieldPath);

              // Try to determine if this is a numeric value for trend calculation
              const numericValue = typeof value === 'number' ? value :
                typeof value === 'string' ? parseFloat(value) : 0;

              return (
                <div
                  key={`${fieldPath}-${index}`}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate mb-1">
                      {fieldPath.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || fieldPath}
                    </div>
                     <div className="text-xsm font-bold text-gray-900 dark:text-white leading-tight">
                      {formattedValue}
                    </div>
                  </div>
                  {/* Trend indicator for numeric values */}
                  {!isNaN(numericValue) && numericValue !== 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium">
                      {getTrendIcon(numericValue)}
                      <span className={getTrendColor(numericValue)}>
                        {Math.abs(numericValue).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Updated indicator */}
            <div className="flex items-center justify-center gap-1 pt-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Updated just now
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <Activity className="h-8 w-8 mx-auto opacity-50" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Connect data source to see metrics</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Updated {new Date(widget.lastUpdated).toLocaleTimeString()}</span>
          <span>Every {widget.refreshInterval}s</span>
        </div>
      </div>
    </Card>
  );
}