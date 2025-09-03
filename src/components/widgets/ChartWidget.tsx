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
import { BarChart as BarIcon, LineChart as LineIcon, AreaChart as AreaIcon, MoreVertical, RefreshCw, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useWidgetStore } from '@/store/widgetStore';

// Helper functions
function normalizeToRows(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  
  // Handle nested objects
  const values = Object.values(data);
  const arrayProp = values.find(v => Array.isArray(v));
  if (arrayProp) return arrayProp as any[];
  
  return [data];
}

function getFieldValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function isDateLike(value: any): boolean {
  if (typeof value === 'number') {
    // Check if it's a timestamp (assume timestamps > year 2000)
    return value > 946684800000 || (value > 946684800 && value < 9999999999);
  }
  if (typeof value === 'string') {
    // Check various date formats
    return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value) || 
           /^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(value) ||
           !isNaN(Date.parse(value));
  }
  return false;
}

function formatDateValue(value: any): string {
  if (typeof value === 'number') {
    // Handle timestamp
    const date = new Date(value > 9999999999 ? value : value * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (typeof value === 'string') {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      // Return original string if can't parse
    }
  }
  return String(value);
}

type ChartType = 'line' | 'bar' | 'area';

export function ChartWidget({ widget }: { widget: any }) {
  const { theme } = useTheme();
  const { removeWidget, refreshWidget } = useWidgetStore();
  const [chartType, setChartType] = useState<ChartType>('line');

  // Process and analyze data
  const { chartData, debugInfo, hasValidData } = useMemo(() => {
    console.log('🔍 Chart Widget Debug - Raw data:', widget.data);
    console.log('🔍 Selected fields:', widget.selectedFields);

    const rows = normalizeToRows(widget.data);
    console.log('🔍 Normalized rows:', rows.slice(0, 3)); // Show first 3 rows

    if (!rows.length || !widget.selectedFields?.length) {
      return { 
        chartData: [], 
        debugInfo: 'No data or selected fields', 
        hasValidData: false 
      };
    }

    // Analyze each selected field
    const fieldAnalysis = widget.selectedFields.map((field: string) => {
      const sampleValue = getFieldValue(rows[0], field);
      const isDate = isDateLike(sampleValue);
      const isNumeric = typeof sampleValue === 'number' && !isNaN(sampleValue);
      
      return {
        field,
        sampleValue,
        type: typeof sampleValue,
        isDate,
        isNumeric,
        valuesCount: rows.filter(row => getFieldValue(row, field) != null).length
      };
    });

    console.log('🔍 Field analysis:', fieldAnalysis);

    // Find best date and numeric fields
    const dateField = fieldAnalysis.find((f: { isDate: any; }) => f.isDate);
    const numericField = fieldAnalysis.find((f: { isNumeric: any; }) => f.isNumeric);

    console.log('🔍 Selected date field:', dateField);
    console.log('🔍 Selected numeric field:', numericField);

    if (!numericField) {
      return { 
        chartData: [], 
        debugInfo: `No numeric field found. Available fields: ${fieldAnalysis.map((f: { field: any; type: any; }) => `${f.field}(${f.type})`).join(', ')}`, 
        hasValidData: false 
      };
    }

    // Build chart data
    const chartData = rows
      .map((row, index) => {
        const numericValue = getFieldValue(row, numericField.field);
        const dateValue = dateField ? getFieldValue(row, dateField.field) : index;
        
        return {
          date: dateField ? formatDateValue(dateValue) : `Point ${index + 1}`,
          [numericField.field]: numericValue,
          originalIndex: index
        };
      })
      .filter(item => item[numericField.field] != null)
      .slice(0, 50); // Limit to 50 points

    console.log('🔍 Final chart data (first 5):', chartData.slice(0, 5));

    return {
      chartData,
      debugInfo: `Found ${chartData.length} data points using ${numericField.field}${dateField ? ` vs ${dateField.field}` : ''}`,
      hasValidData: chartData.length > 0,
      numericField: numericField.field,
      dateField: dateField?.field
    };
  }, [widget.data, widget.selectedFields]);

  const renderChart = () => {
    if (!hasValidData) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <BarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No chart data available</p>
            <p className="text-sm">{debugInfo}</p>
            <div className="mt-4 text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded max-w-md mx-auto">
              <p className="font-medium mb-2">Debugging Info:</p>
              <p>Selected Fields: {widget.selectedFields?.join(', ') || 'None'}</p>
              <p>Data Type: {Array.isArray(widget.data) ? 'Array' : typeof widget.data}</p>
              <p>Data Length: {Array.isArray(widget.data) ? widget.data.length : 'N/A'}</p>
            </div>
          </div>
        </div>
      );
    }

    const numericKey = Object.keys(chartData[0]).find(key => key !== 'date' && key !== 'originalIndex');
    
    const commonProps = {
      data: chartData,
      children: [
        <CartesianGrid key="grid" strokeDasharray="3 3" stroke={theme === 'dark' ? '#444' : '#ccc'} />,
        <XAxis key="xaxis" dataKey="date" tick={{ fill: theme === 'dark' ? '#ddd' : '#444', fontSize: 12 }} />,
        <YAxis key="yaxis" tick={{ fill: theme === 'dark' ? '#ddd' : '#444', fontSize: 12 }} />,
        <Tooltip key="tooltip" />
      ]
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {commonProps.children}
            <Line 
              type="monotone" 
              dataKey={numericKey} 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {commonProps.children}
            <Bar dataKey={numericKey} fill="#3b82f6" />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {commonProps.children}
            {numericKey && (
              <Area 
                type="monotone" 
                dataKey={numericKey} 
                stroke="#3b82f6" 
                fill="#dbeafe" 
              />
            )}
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
              <BarIcon className="h-5 w-5 text-white" />
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
                  {chartType === 'bar' && <BarIcon className="mr-2 w-4 h-4" />}
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
                  <BarIcon className="mr-2 w-4 h-4" /> Bar Chart
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
          <ResponsiveContainer width="100%" height={300}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Last updated: {new Date(widget.lastUpdated).toLocaleString()}</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span>Auto-refresh: {widget.refreshInterval}s</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
