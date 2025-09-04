'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WidgetTheme } from '@/store/widgetStore';
import { ThemeSelector } from './ThemeSelector';

interface WidgetThemeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTheme: WidgetTheme;
  onThemeChange: (theme: WidgetTheme) => void;
  widgetName: string;
}

export function WidgetThemeEditor({ 
  open, 
  onOpenChange, 
  currentTheme, 
  onThemeChange, 
  widgetName 
}: WidgetThemeEditorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Customize {widgetName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose a visual theme for your widget
            </p>
            
            <ThemeSelector 
              selectedTheme={currentTheme}
              onThemeChange={onThemeChange}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Apply Theme
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
