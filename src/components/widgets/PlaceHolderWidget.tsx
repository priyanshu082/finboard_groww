'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useWidgetStore } from '@/store/widgetStore';

export function PlaceholderWidget() {
  const { setAddModalOpen } = useWidgetStore();

  return (
    <Card className="p-8 border-dashed border-2 hover:border-primary/50 transition-colors">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <Plus className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-2">Add New Widget</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect to any financial API and create custom widgets
        </p>
        <Button onClick={() => setAddModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Widget
        </Button>
      </div>
    </Card>
  );
}
