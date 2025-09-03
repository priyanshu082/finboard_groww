"use client";

import { useState } from 'react';
import { BarChart3, Plus, Settings, Moon, Sun, Menu, X, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useDashboardStore } from '@/lib/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  onAddWidget?: () => void;
}

export function Navbar({ onAddWidget }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { widgets, config } = useDashboardStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const exportDashboard = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config,
      widgets,
      layouts: []
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finboard-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importDashboard = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            console.log('Dashboard import:', data);
            // Here you would implement the import logic
          } catch (error) {
            console.error('Failed to import dashboard:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            <div>
              <span className="text-xl font-bold">FinBoard</span>
              <div className="text-xs text-muted-foreground">
                Finance Dashboard
              </div>
            </div>
          </div>

          {/* Center - Dashboard Stats (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {widgets.length} Widget{widgets.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="text-green-600">
                {config.autoRefresh ? 'Live' : 'Paused'}
              </Badge>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {onAddWidget && (
                <Button onClick={onAddWidget} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Widget
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportDashboard}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={importDashboard}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline">
                {widgets.length} Widget{widgets.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="text-green-600">
                {config.autoRefresh ? 'Live' : 'Paused'}
              </Badge>
            </div>
            
            {onAddWidget && (
              <Button onClick={onAddWidget} className="w-full mb-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            )}
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex-1"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                Theme
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
