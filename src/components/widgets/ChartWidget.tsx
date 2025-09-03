'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  BarChart,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  Bar,
  Area,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { BarChart3, LineChart as LineIcon, AreaChart as AreaIcon, MoreVertical, RefreshCw, X, TrendingUp, Activity } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useWidgetStore } from '@/store/widgetStore';

// Helper functions
function normalizeToRows(data: any): any[] {
  if (!data) return [];
  
  // Handle Yahoo Finance format
  if (data.chart?.result?.[0]) {
    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    
    return timestamps.map((timestamp: number, index: number) => ({
      timestamp: timestamp * 1000, // Convert to milliseconds
      date: new Date(timestamp * 1000).toISOString(),
      open: quotes.open?.[index],
      high: quotes.high?.[index],
      low: quotes.low?.[index],
      close: quotes.close?.[index],
      volume: quotes.volume?.[index],
      'indicators.quote[0].close': quotes.close?.[index],
      'indicators.quote[0].open': quotes.open?.[index],
      'indicators.quote[0].high': quotes.high?.[index],
      'indicators.quote[0].low': quotes.low?.[index]
    }));
  }
  
  // Handle CoinGecko price format
  if (data.prices && Array.isArray(data.prices)) {
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      date: new Date(timestamp).toISOString(),
      price,
      'prices.1': price,
      'prices.0': timestamp
    }));
  }
  
  // Regular array
  if (Array.isArray(data)) return data;
  
  // Look for arrays in object
  const arrayProp = Object.values(data).find(v => Array.isArray(v));
  if (arrayProp) return arrayProp as any[];
  
  return [data];
}

function getFieldValue(obj: any, path: string): any {
  if (!path || !obj) return null;
  
  // Handle array notation like prices[0]
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
  const keys = normalizedPath.split('.');
  
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return null;
    current = current[key];
  }
  
  return current;
}

function formatDateValue(value: any): string {
  if (!value) return '';
  
  // Handle timestamps
  if (typeof value === 'number') {
    const date = new Date(value > 9999999999 ? value : value * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }
  
  // Handle date strings
  if (typeof value === 'string') {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (e) {
      // Fall through to return original string
    }
  }
  
  return String(value);
}

function formatTooltipValue(value: any, name: string): [string, string] {
  if (typeof value === 'number') {
    // Format as currency if it looks like a price
    if (name.toLowerCase().includes('price') || name.toLowerCase().includes('close') || value > 0.01) {
      return [value.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }), name];
    }
    
    return [value.toLocaleString(), name];
  }
  
  return [String(value), name];
}

type ChartType = 'line' | 'bar' | 'area';

interface ChartWidgetProps {
  widget: {
    id: string;
    name: string;
    data: any;
    selectedFields: string[];
    chartConfig?: {
      xAxisField: string;
      yAxisField: string;
    };
    error?: string;
    isLoading?: boolean;
    lastUpdated: number;
    refreshInterval: number;
  };
}

export function ChartWidget({ widget }: ChartWidgetProps) {
  const { theme } = useTheme();
  const { removeWidget, refreshWidget } = useWidgetStore();
  const [chartType, setChartType] = useState<ChartType>('line');

  // Process and analyze data
  const { chartData, debugInfo, hasValidData, xField, yField, stats } = useMemo(() => {
    console.log('🔍 Chart Widget Debug - Raw data:', widget.data);
    console.log('🔍 Selected fields:', widget.selectedFields);
    console.log('🔍 Chart config:', widget.chartConfig);

    const rows = normalizeToRows(widget.data);
    console.log('🔍 Normalized rows (first 3):', rows.slice(0, 3));

    if (!rows.length) {
      return { 
        chartData: [], 
        debugInfo: 'No data available', 
        hasValidData: false,
        xField: '',
        yField: '',
        stats: null
      };
    }

    // Get X and Y axis fields
    const xField = widget.chartConfig?.xAxisField || widget.selectedFields?.[0] || '';
    const yField = widget.chartConfig?.yAxisField || widget.selectedFields?.[1] || '';

    console.log('🔍 X-axis field:', xField);
    console.log('🔍 Y-axis field:', yField);

    if (!xField || !yField) {
      return { 
        chartData: [], 
        debugInfo: `Missing axis configuration. X: ${xField}, Y: ${yField}`, 
        hasValidData: false,
        xField,
        yField,
        stats: null
      };
    }

    // Build chart data
    const chartData = rows
      .map((row, index) => {
        const xValue = getFieldValue(row, xField);
        const yValue = getFieldValue(row, yField);
        
        return {
          date: formatDateValue(xValue) || `Point ${index + 1}`,
          [yField]: typeof yValue === 'number' ? yValue : parseFloat(yValue) || 0,
          originalIndex: index,
          rawXValue: xValue,
          rawYValue: yValue
        };
      })
      .filter(item => item[yField] != null && !isNaN(item[yField]))
      .slice(0, 100); // Limit to 100 points for performance

    // Calculate stats
    const values = chartData.map(item => item[yField]);
    const stats = values.length > 0 ? {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      total: values.reduce((a, b) => a + b, 0),
      count: values.length
    } : null;

    console.log('🔍 Final chart data (first 5):', chartData.slice(0, 5));
    console.log('🔍 Stats:', stats);

    return {
      chartData,
      debugInfo: `Found ${chartData.length} valid data points`,
      hasValidData: chartData.length > 0,
      xField,
      yField,
      stats
    };
  }, [widget.data, widget.selectedFields, widget.chartConfig]);

  const renderChart = () => {
    if (!hasValidData) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No chart data available</p>
            <p className="text-sm">{debugInfo}</p>
            
            <div className="mt-4 text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded max-w-md mx-auto">
              <p className="font-medium mb-2">Debug Info:</p>
              <p>X-Axis: {xField || 'Not set'}</p>
              <p>Y-Axis: {yField || 'Not set'}</p>
              <p>Selected Fields: {widget.selectedFields?.join(', ') || 'None'}</p>
              <p>Data Type: {Array.isArray(widget.data) ? 'Array' : typeof widget.data}</p>
            </div>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{label}</p>
            {payload.map((entry: any, index: number) => {
              const [formattedValue, name] = formatTooltipValue(entry.value, entry.dataKey);
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  {name}: <span className="font-medium">{formattedValue}</span>
                </p>
              );
            })}
          </div>
        );
      }
      return null;
    };

    const chartColor = theme === 'dark' ? '#3b82f6' : '#2563eb';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    const textColor = theme === 'dark' ? '#d1d5db' : '#374151';

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={{ stroke: textColor }}
            />
            <YAxis 
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={{ stroke: textColor }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={yField} 
              stroke={chartColor}
              strokeWidth={2}
              dot={{ fill: chartColor, strokeWidth: 1, r: 4 }}
              activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2 }}
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={{ stroke: textColor }}
            />
            <YAxis 
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={{ stroke: textColor }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={yField} 
              fill={chartColor}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={{ stroke: textColor }}
            />
            <YAxis 
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={{ stroke: textColor }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={yField} 
              stroke={chartColor}
              fill={`${chartColor}20`}
              strokeWidth={2}
            />
          </AreaChart>
        );
    }
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-slate-200 dark:ring-slate-700">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{widget.name}</h3>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {hasValidData ? `${chartData.length} data points` : 'No data'}
                </p>
                <Badge variant={widget.error ? 'destructive' : 'default'} className="text-xs">
                  {widget.error ? 'Error' : 'Live'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Chart Type Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {chartType === 'line' && <LineIcon className="mr-2 w-4 h-4" />}
                  {chartType === 'bar' && <BarChart3 className="mr-2 w-4 h-4" />}
                  {chartType === 'area' && <AreaIcon className="mr-2 w-4 h-4" />}
                  <span className="capitalize">{chartType}</span>
                  <MoreVertical className="ml-1 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setChartType('line')}>
                  <LineIcon className="mr-2 w-4 h-4" /> Line Chart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('bar')}>
                  <BarChart3 className="mr-2 w-4 h-4" /> Bar Chart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('area')}>
                  <AreaIcon className="mr-2 w-4 h-4" /> Area Chart
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={() => refreshWidget(widget.id)} disabled={widget.isLoading}>
              <RefreshCw className={`w-4 h-4 ${widget.isLoading ? 'animate-spin' : ''}`} />
            </Button>

            <Button variant="ghost" size="sm" onClick={() => removeWidget(widget.id)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {!widget.error && hasValidData && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Current</p>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                    {typeof stats.max === 'number' ? stats.max.toLocaleString() : stats.max}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-700 dark:text-green-300">Average</p>
                  <p className="text-sm font-bold text-green-900 dark:text-green-100">
                    {stats.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Activity className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Min</p>
                  <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                    {typeof stats.min === 'number' ? stats.min.toLocaleString() : stats.min}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Max</p>
                  <p className="text-sm font-bold text-orange-900 dark:text-orange-100">
                    {typeof stats.max === 'number' ? stats.max.toLocaleString() : stats.max}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Content */}
      {widget.error ? (
        <div className="p-6">
          <Card className="p-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200 text-sm">⚠️ {widget.error}</p>
          </Card>
        </div>
      ) : widget.isLoading && !widget.data ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <div className="px-6 pb-6">
          <ResponsiveContainer width="100%" height={350}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>Last updated: {new Date(widget.lastUpdated).toLocaleString()}</span>
            {hasValidData && (
              <span>
                X: <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded text-xs">{xField}</code> | 
                Y: <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded text-xs">{yField}</code>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span>Every {widget.refreshInterval}s</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
