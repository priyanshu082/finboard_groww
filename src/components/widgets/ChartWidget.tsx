'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, X, MoreVertical, TrendingUp, Activity } from 'lucide-react';
import { useWidgetStore } from '@/store/widgetStore';
import { normalizeToRows, getFieldValue } from '@/lib/dataUtils';

// Import Recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

function SimpleLineChart({
  data,
  height = 200,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);

  if (!data || data.length < 2) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          <Activity className="h-8 w-8 mx-auto opacity-50" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Need at least 2 data points</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? '#374151' : '#f0f0f0'} 
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#666' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#666' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: isDark ? '#1F2937' : 'white',
              border: `1px solid ${isDark ? '#374151' : '#e0e0e0'}`,
              borderRadius: 8,
              fontSize: 13,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              color: isDark ? '#F9FAFB' : '#111827',
            }}
            formatter={(value: any) => [value, 'Value']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#00d09c"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: '#00d09c',
              stroke: isDark ? '#1F2937' : '#fff',
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChartWidget({ widget }: { widget: any }) {
  const { removeWidget, refreshWidget } = useWidgetStore();

  // Process chart data
  const chartData = useMemo(() => {
    const rows = normalizeToRows(widget.data).slice(0, 12);
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
      return {
        label: String(label).slice(0, 15),
        value: Number(value) || 0,
      };
    });
  }, [widget.data, widget.selectedFields]);

  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const previousValue = chartData[chartData.length - 2]?.value || 0;
  const changePercent = previousValue ? ((currentValue - previousValue) / previousValue * 100) : 0;
  const isPositive = changePercent >= 0;

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
              {!widget.error && chartData.length > 1 && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                }`}>
                  <TrendingUp className={`h-3 w-3 ${!isPositive && 'rotate-180'}`} />
                  {Math.abs(changePercent).toFixed(1)}%
                </div>
              )}
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

        {/* Primary Value Display */}
        {!widget.error && chartData.length > 0 && (
          <div className="text-center space-y-2 pb-4 mb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current Value
            </div>
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div className="px-5 pb-5">
        {widget.error ? (
          <div className="py-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
              <p className="text-red-700 dark:text-red-300 text-sm">{widget.error}</p>
            </div>
          </div>
        ) : widget.isLoading && !widget.data ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading chart data...</span>
            </div>
          </div>
        ) : chartData.length > 1 ? (
          <div className="space-y-4">
            <SimpleLineChart data={chartData} />
            
            {/* Trend indicator */}
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Connect data source to see chart</p>
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