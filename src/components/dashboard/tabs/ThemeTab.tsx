'use client';

import React from 'react';
import { WidgetTheme } from '@/store/widgetStore';
import { ThemeSelector } from '@/components/Theme/ThemeSelector';

interface ThemeTabProps {
  selectedTheme: WidgetTheme;
  setSelectedTheme: (theme: WidgetTheme) => void;
}

export function ThemeTab({ selectedTheme, setSelectedTheme }: ThemeTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Widget Theme
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select a visual theme that matches your dashboard style
        </p>
      </div>
      
      <div className="max-w-2xl">
        <ThemeSelector 
          selectedTheme={selectedTheme}
          onThemeChange={setSelectedTheme}
        />
      </div>
    </div>
  );
}
