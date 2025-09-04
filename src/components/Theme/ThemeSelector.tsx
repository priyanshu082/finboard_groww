'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { WidgetTheme } from '@/store/widgetStore';
import { Palette, Sparkles, Zap } from 'lucide-react';

interface ThemeSelectorProps {
  selectedTheme: WidgetTheme;
  onThemeChange: (theme: WidgetTheme) => void;
}

const themes = [
  {
    id: 'default' as WidgetTheme,
    name: 'Classic',
    icon: Palette,
  },
  {
    id: 'minimal' as WidgetTheme,
    name: 'Minimal',
    icon: Sparkles,
  },
  {
    id: 'glass' as WidgetTheme,
    name: 'Glass',
    icon: Zap,
  }
];

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {themes.map((theme) => (
        <Card
          key={theme.id}
          className={`p-5 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedTheme === theme.id
              ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950'
              : 'hover:border-emerald-300 dark:hover:border-emerald-600'
          } border-gray-200 dark:border-gray-700`}
          onClick={() => onThemeChange(theme.id)}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <theme.icon className="h-6 w-6 text-emerald-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{theme.name}</h3>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
