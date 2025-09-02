"use client";

import { BarChart3, Plus, Settings, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">FinBoard</span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
