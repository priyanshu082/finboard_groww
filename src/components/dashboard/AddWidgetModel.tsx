'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useWidgetStore, WidgetTheme } from '@/store/widgetStore';
import { ConfigureTab } from './tabs/ConfigureTab';
import { ThemeTab } from './tabs/ThemeTab';
import { FieldsTab } from './tabs/FieldsTab';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddWidgetModal({ isOpen, onClose }: AddWidgetModalProps) {
  const addWidget = useWidgetStore((state) => state.addWidget);
  
  // Form state
  const [widgetName, setWidgetName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState<'card' | 'table' | 'chart'>('card');
  const [selectedTheme, setSelectedTheme] = useState<WidgetTheme>('default');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('configure');
  const [apiTestResult, setApiTestResult] = useState<any>(null);

  const handleSubmit = () => {
    if (!widgetName || !apiUrl || selectedFields.length === 0) return;

    addWidget({
      name: widgetName,
      type: displayMode,
      apiUrl,
      selectedFields,
      refreshInterval,
      theme: selectedTheme
    });

    // Reset form
    setWidgetName('');
    setApiUrl('');
    setRefreshInterval(30);
    setDisplayMode('card');
    setSelectedTheme('default');
    setSelectedFields([]);
    setCurrentTab('configure');
    setApiTestResult(null);
    
    onClose();
  };

  const canProceed = widgetName && apiUrl && apiTestResult?.success;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Widget
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="configure" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              Configure
            </TabsTrigger>
            <TabsTrigger 
              value="theme" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              disabled={!canProceed}
            >
              Theme
            </TabsTrigger>
            <TabsTrigger 
              value="fields" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              disabled={!canProceed}
            >
              Fields
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="mt-6">
            <ConfigureTab
              widgetName={widgetName}
              setWidgetName={setWidgetName}
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
              refreshInterval={refreshInterval}
              setRefreshInterval={setRefreshInterval}
              displayMode={displayMode}
              setDisplayMode={setDisplayMode}
              apiTestResult={apiTestResult}
              setApiTestResult={setApiTestResult}
              setCurrentTab={setCurrentTab}
            />
          </TabsContent>

          <TabsContent value="theme" className="mt-6">
            <ThemeTab
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
            />
          </TabsContent>

          <TabsContent value="fields" className="mt-6">
            <FieldsTab
              apiTestResult={apiTestResult}
              selectedFields={selectedFields}
              setSelectedFields={setSelectedFields}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!canProceed || selectedFields.length === 0}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
