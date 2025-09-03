'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart3, RefreshCw, X, MoreVertical, TrendingUp, Activity, PieChart } from 'lucide-react';
import { useWidgetStore } from '@/store/widgetStore';
import { normalizeToRows, getFieldValue } from '@/lib/dataUtils';

export function ChartWidget({ widget }: { widget: any }) {
  const { removeWidget, refreshWidget } = useWidgetStore();
  
  // Process chart data
  const chartData = useMemo(() => {
    const rows = normalizeToRows(widget.data).slice(0, 8); // Limit to 8 items for cleaner display
    
    return rows.map((item, index) => {
      const numericField = widget.selectedFields.find((field: string) => {
        const value = getFieldValue(item, field);
        return typeof value === 'number';
      });
      
      const labelField = widget.selectedFields.find((field: string) => {
        const value = getFieldValue(item, field);
        return typeof value === 'string';
      });
      
      const value = numericField ? getFieldValue(item, numericField) : Math.random() * 100;
      const label = labelField ? getFieldValue(item, labelField) : `Item ${index + 1}`;
      
      // Groww-style color palette
      const colors = [
        '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', 
        '#ef4444', '#06b6d4', '#84cc16', '#f97316'
      ];
      
      return {
        label: String(label).slice(0, 20),
        value: Number(value) || 0,
        color: colors[index % colors.length]
      };
    });
  }, [widget.data, widget.selectedFields]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const avgValue = totalValue / chartData.length || 0;

  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1">{widget.name}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${widget.error ? 'bg-red-500' : 'bg-emerald-500'} ${!widget.error && 'animate-pulse'}`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {widget.error ? 'Connection failed' : `${chartData.length} data points`}
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

        {/* Summary Stats */}
        {!widget.error && chartData.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-100 dark:border-emerald-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Total</p>
                  <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                    {totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">Average</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {Math.round(avgValue).toLocaleString()}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Content */}
      {widget.error ? (
        <div className="px-5 pb-5">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
            <p className="text-red-700 dark:text-red-300 text-sm">{widget.error}</p>
          </div>
        </div>
      ) : widget.isLoading && !widget.data ? (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading chart data...</span>
          </div>
        </div>
      ) : chartData.length > 0 ? (
        <div className="px-5 pb-5">
          <div className="space-y-3">
            {chartData.map((item, index) => {
              const percentage = (item.value / maxValue) * 100;
              const sharePercentage = (item.value / totalValue) * 100;
              
              return (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-sm text-gray-700 dark:text-gray-300 truncate">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">
                        {item.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {sharePercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative mb-1">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 px-5">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <PieChart className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">No chart data</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Connect an API with numeric data to see visualizations</p>
        </div>
      )}

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