'use client';

import React, { useMemo } from 'react';
import { WidgetWrapper } from '../Theme/WidgetWrapper';
import { Activity } from 'lucide-react';
import { Widget } from '@/store/widgetStore';
import { normalizeToRows, getFieldValue } from '@/lib/dataUtils';

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
            formatter={(value: unknown) => [String(value), 'Value']}
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

export function ChartWidget({ widget }: { widget: Widget }) {
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

  return (
    <WidgetWrapper 
      widget={widget}
      showTrend={chartData.length > 1}
      trendValue={changePercent}
      primaryValue={currentValue.toLocaleString()}
      primaryLabel="Current Value"
    >
      {chartData.length > 1 ? (
        <div className="space-y-4">
          <SimpleLineChart data={chartData} />
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <Activity className="h-8 w-8 mx-auto opacity-50" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Connect data source to see chart</p>
        </div>
      )}
    </WidgetWrapper>
  );
}