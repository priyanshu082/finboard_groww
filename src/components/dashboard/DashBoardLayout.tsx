"use client";

import { useState } from 'react';
import { useDashboardStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/common/Navbar';
import { AddWidgetDialog } from './AddWidgetDialog';
import { WidgetGrid } from './WidgetGrid';

export function DashboardLayout() {
  const { widgets, error, clearError } = useDashboardStore();
  const [AddWidgetOpen, setAddWidgetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
        <Navbar onAddWidget={() => setAddWidgetOpen(true)} />

      <main className="container py-6">
        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-destructive">Error: {error}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearError}
                  className="text-destructive hover:text-destructive"
                >
                  ✕
                </Button>
              </div>
            </div>
          </Card>
        )}

        <WidgetGrid  />
      </main>

      <AddWidgetDialog 
        open={AddWidgetOpen} 
        onOpenChange={setAddWidgetOpen} 
      />
    </div>
  );
}
