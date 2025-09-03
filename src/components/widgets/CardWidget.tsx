'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, X, TrendingUp, Wifi, WifiOff, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useWidgetStore } from '@/store/widgetStore';
import { getFieldValue, formatValue } from '@/lib/dataUtils';

interface CardWidgetProps {
  widget: any;
}

export function CardWidget({ widget }: CardWidgetProps) {
  const { removeWidget, refreshWidget } = useWidgetStore();

  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1">{widget.name}</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${widget.error ? 'bg-red-500' : 'bg-emerald-500'} ${!widget.error && 'animate-pulse'}`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {widget.error ? 'Connection failed' : 'Live data'}
                </span>
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

        {/* Content */}
        <div className="overflow-x-auto">
          {widget.error ? (
            <div className="py-6 min-w-[250px]">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
                <p className="text-red-700 dark:text-red-300 text-sm">{widget.error}</p>
              </div>
            </div>
          ) : widget.isLoading && !widget.data ? (
            <div className="flex items-center justify-center py-8 min-w-[250px]">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          ) : widget.data ? (
            <div className="space-y-4 min-w-[250px]">
              {widget.selectedFields.map((fieldPath: string, index: number) => {
                const value = getFieldValue(widget.data, fieldPath);
                const fieldName = fieldPath.split('.').pop() || fieldPath;
                
                return (
                  <div 
                    key={fieldPath}
                    className={`${index === 0 ? 'pb-4 mb-4 border-b border-gray-100 dark:border-gray-700' : ''}`}
                  >
                    {index === 0 ? (
                      // Primary value - large display
                      <div className="text-center space-y-2">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatValue(value, fieldName)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {fieldName.replace(/[_-]/g, ' ')}
                        </div>
                      </div>
                    ) : (
                      // Secondary values - compact display
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                          {fieldName.replace(/[_-]/g, ' ')}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatValue(value, fieldName)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Trend indicator for primary value */}
              {widget.selectedFields.length > 0 && (
                <div className="flex items-center justify-center gap-1 pt-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Updated just now
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 min-w-[250px]">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <TrendingUp className="h-8 w-8 mx-auto opacity-50" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
            </div>
          )}
        </div>
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