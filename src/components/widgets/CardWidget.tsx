'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { WidgetWrapper } from '../Theme/WidgetWrapper';
import { WidgetWrapperMinimal } from '../Theme/WidgetWrapperMinimal';
import { WidgetWrapperGlass } from '../Theme/WidgetWrapperGlass';
import { getFieldValue, formatValue } from '@/lib/dataUtils';
import { Widget } from '@/store/widgetStore';

interface CardWidgetProps {
  widget: Widget;
}

export function CardWidget({ widget }: CardWidgetProps) {
  const renderContent = () => (
    <>
      {widget.data && widget.selectedFields.length > 0 ? (
        <div className="space-y-4">
          {widget.selectedFields.map((fieldPath, index) => {
            const value = getFieldValue(widget.data, fieldPath);
            const formattedValue = formatValue(value, fieldPath);

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
                  <div className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                    {formattedValue}
                  </div>
                </div>
                {!isNaN(numericValue) && numericValue !== 0 && (
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {numericValue > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{Math.abs(numericValue).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        -{Math.abs(numericValue).toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <Activity className="h-8 w-8 mx-auto opacity-50" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Connect data source to see metrics</p>
        </div>
      )}
    </>
  );

  // Render appropriate wrapper based on theme
  switch (widget.theme) {
    case 'minimal':
      return (
        <WidgetWrapperMinimal widget={widget}>
          {renderContent()}
        </WidgetWrapperMinimal>
      );
    case 'glass':
      return (
        <WidgetWrapperGlass widget={widget}>
          {renderContent()}
        </WidgetWrapperGlass>
      );
    default:
      return (
        <WidgetWrapper widget={widget}>
          {renderContent()}
        </WidgetWrapper>
      );
  }
}