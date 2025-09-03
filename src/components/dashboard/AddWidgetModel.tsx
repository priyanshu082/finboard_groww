'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, Plus, X, Search } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { extractFields } from '@/lib/dataUtils';
import { useWidgetStore } from '@/store/widgetStore';

interface AddWidgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FieldInfo {
  path: string;
  type: string;
  value: any;
}

export function AddWidgetModal({ open, onOpenChange }: AddWidgetModalProps) {
  const { addWidget } = useWidgetStore();
  
  const [widgetName, setWidgetName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState<'card' | 'table' | 'chart'>('card');
  
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{
    success: boolean;
    message: string;
    fields: FieldInfo[];
    rawData?: any;
  } | null>(null);
  
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fieldSearch, setFieldSearch] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  const [currentTab, setCurrentTab] = useState('configure');

  // Sample APIs for quick testing
  const sampleApis = [
    {
      name: 'Coinbase Exchange Rates',
      url: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
      type: 'card',
      description: 'Bitcoin exchange rates in multiple currencies'
    },
    {
      name: 'CoinGecko Crypto Market',
      url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1',
      type: 'table',
      description: 'Top 10 cryptocurrencies by market cap'
    },
    {
      name: 'JSONPlaceholder Users',
      url: 'https://jsonplaceholder.typicode.com/users',
      type: 'table',
      description: 'Sample user data for testing'
    },
    {
      name: 'Alpha Vantage Stock Quote',
      url: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo',
      type: 'card',
      description: 'IBM stock quote (demo data)'
    }
  ];

  const handleTestApi = async () => {
    if (!apiUrl) return;
    
    setIsTestingApi(true);
    setApiTestResult(null);
    
    try {
      const response = await apiClient.fetch({
        url: apiUrl
      });
      console.log(response.data)
      const fields = extractFields(response.data);
      
      setApiTestResult({
        success: true,
        message: `API connection successful! ${fields.length} fields found.`,
        fields: fields.map(field => ({
          path: field.path,
          type: field.type,
          value: field.value
        })),
        rawData: response.data
      });
      
      // Switch to field selection tab
      setCurrentTab('fields');
      
    } catch (error) {
      setApiTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to API',
        fields: []
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const toggleFieldSelection = (fieldPath: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldPath) 
        ? prev.filter(f => f !== fieldPath)
        : [...prev, fieldPath]
    );
  };

  const removeSelectedField = (fieldPath: string) => {
    setSelectedFields(prev => prev.filter(f => f !== fieldPath));
  };

  const handleSubmit = () => {
    if (!widgetName || !apiUrl || selectedFields.length === 0) return;
    
    addWidget({
      name: widgetName,
      type: displayMode,
      apiUrl: apiUrl,
      selectedFields,
      refreshInterval,
      data: null,
      isLoading: false
    });
    
    // Reset form
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setWidgetName('');
    setApiUrl('');
    setSelectedFields([]);
    setApiTestResult(null);
    setFieldSearch('');
    setCurrentTab('configure');
  };

  const filteredFields = apiTestResult?.fields.filter(field => {
    const matchesSearch = !fieldSearch || field.path.toLowerCase().includes(fieldSearch.toLowerCase());
    const matchesArrayFilter = !showArraysOnly || field.type === 'array';
    return matchesSearch && matchesArrayFilter;
  }) || [];

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Widget
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh] pr-2">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="configure" className="text-sm font-medium">
                Configure Widget
              </TabsTrigger>
              <TabsTrigger value="fields" disabled={!apiTestResult?.success} className="text-sm font-medium">
                Select Fields ({selectedFields.length})
              </TabsTrigger>
            </TabsList>

            {/* Configuration Tab */}
            <TabsContent value="configure" className="space-y-6 mt-0">
              {/* Widget Name & Display Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="widget-name" className="text-sm font-semibold">Widget Name</Label>
                  <Input
                    id="widget-name"
                    placeholder="e.g., Bitcoin Price, Stock Portfolio"
                    value={widgetName}
                    onChange={(e) => setWidgetName(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Display Mode</Label>
                  <div className="flex space-x-2">
                    {(['card', 'table', 'chart'] as const).map((mode) => (
                      <Button
                        key={mode}
                        variant={displayMode === mode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDisplayMode(mode)}
                        className="capitalize flex-1"
                      >
                        {mode}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* API URL */}
              <div className="space-y-2">
                <Label htmlFor="api-url" className="text-sm font-semibold">API URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="api-url"
                    placeholder="https://api.example.com/data"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="flex-1 h-11"
                  />
                  <Button 
                    onClick={handleTestApi} 
                    disabled={!apiUrl || isTestingApi}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6"
                  >
                    {isTestingApi ? 'Testing...' : 'Test API'}
                  </Button>
                </div>
                
                {/* API Test Result */}
                {apiTestResult && (
                  <Card className={`p-4 ${
                    apiTestResult.success 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                      : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {apiTestResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          apiTestResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                        }`}>
                          {apiTestResult.success ? 'API Connection Successful!' : 'Connection Failed'}
                        </p>
                        <p className={`text-sm ${
                          apiTestResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                        }`}>
                          {apiTestResult.message}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Refresh Interval */}
              <div className="space-y-2">
                <Label htmlFor="refresh-interval" className="text-sm font-semibold">Refresh Interval (seconds)</Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  min="10"
                  max="3600"
                  className="w-32 h-11"
                />
              </div>

              {/* Sample APIs */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Quick Start (Sample APIs)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sampleApis.map((api, index) => (
                    <Card
                      key={index}
                      className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                      onClick={() => {
                        setApiUrl(api.url);
                        setDisplayMode(api.type as any);
                        setWidgetName(api.name);
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{api.name}</h4>
                          <Badge variant="secondary" className="capitalize text-xs">
                            {api.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{api.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Field Selection Tab */}
            <TabsContent value="fields" className="space-y-6 mt-0">
              {/* Search Fields */}
              <div className="space-y-3">
                <Label htmlFor="field-search" className="text-sm font-semibold">Search Fields</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="field-search"
                    placeholder="Search for fields..."
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="arrays-only"
                    checked={showArraysOnly}
                    onCheckedChange={(checked) => setShowArraysOnly(Boolean(checked))}
                  />
                  <Label htmlFor="arrays-only" className="text-sm">
                    Show arrays only (recommended for table widgets)
                  </Label>
                </div>
              </div>

              {/* Available Fields */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Available Fields ({filteredFields.length})
                </Label>
                <Card className="max-h-64 overflow-y-auto border">
                  {filteredFields.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <div className="text-muted-foreground">
                        {apiTestResult?.fields.length === 0 
                          ? 'No fields found in API response' 
                          : 'No fields match your search criteria'
                        }
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredFields.map((field) => (
                        <div
                          key={field.path}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => toggleFieldSelection(field.path)}
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                              {field.path}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <Badge variant="outline" className="mr-2 text-xs">
                                {field.type}
                              </Badge>
                              {String(field.value).substring(0, 60)}
                              {String(field.value).length > 60 && '...'}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 ml-2"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Selected Fields */}
              {selectedFields.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    Selected Fields ({selectedFields.length})
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedFields.map((fieldPath) => (
                      <Card key={fieldPath} className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm font-medium text-blue-700 dark:text-blue-300">
                              {fieldPath}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {fieldPath.split('.').pop()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSelectedField(fieldPath);
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={handleClose} className="px-6">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={
              !widgetName || 
              !apiUrl || 
              !apiTestResult?.success || 
              selectedFields.length === 0
            }
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
          >
            Add Widget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
