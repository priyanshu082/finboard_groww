'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useWidgetStore, WidgetTheme } from '@/store/widgetStore';
import { ConfigureTab } from './tabs/ConfigureTab';
import { ThemeTab } from './tabs/ThemeTab';
import { FieldsTab } from './tabs/FieldsTab';
import { extractFields } from '@/lib/dataUtils';
import { cardSamples, tableSamples, chartSamples } from '@/lib/dummy';

interface ApiTestResult {
  success: boolean;
  message: string;
  fields: Array<{
    path: string;
    type: string;
    value: unknown;
  }>;
  rawData?: unknown;
}

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
  const [apiTestResult, setApiTestResult] = useState<ApiTestResult | null>(null);

  // Dummy data state
  const [dummyLoaded, setDummyLoaded] = useState(false);
  const [dummyKey, setDummyKey] = useState<string>('');
  const [dummyData, setDummyData] = useState<unknown>(null);

  const sampleKeys = {
    card: Object.keys(cardSamples),
    table: Object.keys(tableSamples),
    chart: Object.keys(chartSamples),
  } as const;

  const loadDummy = () => {
    let data: unknown;
    if (displayMode === 'card') data = (cardSamples as Record<string, unknown>)[dummyKey];
    else if (displayMode === 'table') data = (tableSamples as Record<string, unknown>)[dummyKey];
    else data = (chartSamples as Record<string, unknown>)[dummyKey];

    if (!data) return;

    const fields = extractFields(data).slice(0, 8);

    // pick reasonable defaults
    const defaults =
      displayMode === 'chart'
        ? // prefer one numeric + one label
          (() => {
            const numeric = fields.find(f => f.type === 'number')?.path;
            const label = fields.find(f => f.type === 'string')?.path;
            return [label, numeric].filter(Boolean) as string[];
          })()
        : fields.map(f => f.path).slice(0, 4);

    setDummyData(data);
    setSelectedFields(defaults);
    setApiTestResult({
      success: true,
      message: 'Dummy data loaded',
      fields: fields.map(f => ({ path: f.path, type: f.type, value: f.value })),
      rawData: data
    });
    if (!widgetName) {
      setWidgetName(`${displayMode[0].toUpperCase()}${displayMode.slice(1)} - ${dummyKey}`);
    }
    setDummyLoaded(true);
    setCurrentTab('theme');
  };

  const handleSubmit = () => {
    const canUseApi = widgetName && apiUrl && apiTestResult?.success;
    const canUseDummy = widgetName && dummyLoaded && dummyData && selectedFields.length > 0;
    if (!canUseApi && !canUseDummy) return;

    addWidget({
      name: widgetName,
      type: displayMode,
      apiUrl: canUseApi ? apiUrl : '',
      selectedFields,
      refreshInterval,
      theme: selectedTheme,
      data: canUseDummy ? dummyData : undefined,
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
    setDummyLoaded(false);
    setDummyKey('');
    setDummyData(null);
    
    onClose();
  };

  const canProceed = Boolean(widgetName) && Boolean(apiTestResult?.success || dummyLoaded);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Widget
          </DialogTitle>
        </DialogHeader>

        {/* Quick Dummy Data section */}
        <div className="mb-6 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1">
              <div className="text-sm font-semibold mb-1 text-emerald-800 dark:text-emerald-200">
                Use dummy data (no API)
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 mb-2">
                Quickly preview a {displayMode} widget with built-in sample data.
              </div>
              <div className="flex gap-2">
                <Select value={dummyKey} onValueChange={setDummyKey}>
                  <SelectTrigger className="h-10 min-w-[150px] border-emerald-200 dark:border-emerald-700 bg-white dark:bg-gray-900 text-sm">
                    <SelectValue placeholder="Select sample" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleKeys[displayMode].map(key => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={loadDummy}
                  disabled={!dummyKey}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Load Dummy
                </Button>
              </div>
              {dummyLoaded && (
                <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                  Dummy data loaded. You can now choose theme and fields.
                </div>
              )}
            </div>
          </div>
        </div>

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
              setDisplayMode={(mode) => {
                setDisplayMode(mode);
                setDummyLoaded(false);
                setDummyKey('');
                setDummyData(null);
                setApiTestResult(null);
                setSelectedFields([]);
              }}
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
            disabled={!(apiTestResult?.success || dummyLoaded) || selectedFields.length === 0 || !widgetName}
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
