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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertCircle, Plus, X, Search, BarChart3, TrendingUp, Table } from 'lucide-react';
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
  isNumeric: boolean;
  isDateLike: boolean;
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
  
  // Different field selections for different widget types
  const [selectedFields, setSelectedFields] = useState<string[]>([]); // For card/table
  const [xAxisField, setXAxisField] = useState<string>(''); // For chart
  const [yAxisField, setYAxisField] = useState<string>(''); // For chart
  
  const [fieldSearch, setFieldSearch] = useState('');
  const [currentTab, setCurrentTab] = useState('configure');

  // Sample APIs with chart-specific ones
  const sampleApis = [
    {
      name: 'Yahoo Finance - AAPL Chart',
      url: 'https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=1mo',
      type: 'chart',
      description: 'Apple stock price chart data'
    },
    {
      name: 'CoinGecko Bitcoin Chart',
      url: 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30',
      type: 'chart',
      description: 'Bitcoin price history for charts'
    },
    {
      name: 'CoinGecko Crypto Market',
      url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10',
      type: 'table',
      description: 'Top cryptocurrencies table'
    },
    {
      name: 'JSONPlaceholder Users',
      url: 'https://jsonplaceholder.typicode.com/users',
      type: 'table',
      description: 'Sample user data'
    }
  ];

  const isDateLike = (value: any): boolean => {
    if (typeof value === 'number') {
      // Timestamp check
      return value > 946684800000 || (value > 946684800 && value < 9999999999);
    }
    if (typeof value === 'string') {
      return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value) || !isNaN(Date.parse(value));
    }
    return false;
  };

  const handleTestApi = async () => {
    if (!apiUrl) return;
    
    setIsTestingApi(true);
    setApiTestResult(null);
    
    try {
      const response = await apiClient.fetch({
        url: apiUrl
      });
      
      const fields = extractFields(response.data);
      
      // Analyze each field
      const analyzedFields = fields.map(field => {
        const sampleValue = field.value;
        const isNumeric = typeof sampleValue === 'number' && !isNaN(sampleValue);
        const isDateLikeField = isDateLike(sampleValue);

        return {
          path: field.path,
          type: field.type,
          value: sampleValue,
          isNumeric,
          isDateLike
        };
      });
      
      setApiTestResult({
        success: true,
        message: `API connection successful! ${analyzedFields.length} fields found.`,
        fields: analyzedFields.map(({ isDateLike, ...rest }) => ({
          ...rest,
          isDateLike: typeof isDateLike === 'function' ? isDateLike(rest.value) : isDateLike
        })),
        rawData: response.data
      });
      
      // Auto-select fields for charts
      if (displayMode === 'chart') {
        const dateField = analyzedFields.find(f => f.isDateLike);
        const numericField = analyzedFields.find(f => f.isNumeric);
        
        if (dateField) setXAxisField(dateField.path);
        if (numericField) setYAxisField(numericField.path);
      }
      
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

  const handleSubmit = () => {
    if (!widgetName || !apiUrl) return;
    
    let finalSelectedFields: string[] = [];
    
    if (displayMode === 'chart') {
      if (!xAxisField || !yAxisField) {
        alert('Please select both X and Y axis fields for chart');
        return;
      }
      finalSelectedFields = [xAxisField, yAxisField];
    } else {
      if (selectedFields.length === 0) {
        alert('Please select at least one field');
        return;
      }
      finalSelectedFields = selectedFields;
    }
    
    addWidget({
      name: widgetName,
      type: displayMode,
      apiUrl: apiUrl,
      selectedFields: finalSelectedFields,
      refreshInterval,
      data: null,
      isLoading: false,
      // Store chart-specific fields
      ...(displayMode === 'chart' && {
        chartConfig: {
          xAxisField,
          yAxisField
        }
      })
    });
    
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setWidgetName('');
    setApiUrl('');
    setSelectedFields([]);
    setXAxisField('');
    setYAxisField('');
    setApiTestResult(null);
    setFieldSearch('');
    setCurrentTab('configure');
  };

  // Filter fields based on widget type
  const getFilteredFields = () => {
    if (!apiTestResult?.fields) return [];
    
    const fields = apiTestResult.fields.filter(field => {
      const matchesSearch = !fieldSearch || field.path.toLowerCase().includes(fieldSearch.toLowerCase());
      return matchesSearch;
    });
    
    return fields;
  };

  const getXAxisFields = () => {
    return apiTestResult?.fields.filter(f => f.isDateLike || f.type === 'string') || [];
  };

  const getYAxisFields = () => {
    return apiTestResult?.fields.filter(f => f.isNumeric) || [];
  };

  return (
    <Dialog open={open} onOpenChange={() => { resetForm(); onOpenChange(false); }}>
      <DialogContent className="min-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Widget
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh] pr-2">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="configure">Configure Widget</TabsTrigger>
              <TabsTrigger value="fields" disabled={!apiTestResult?.success}>
                {displayMode === 'chart' ? 'Select Axis' : 'Select Fields'} 
                ({displayMode === 'chart' ? (xAxisField && yAxisField ? 2 : 0) : selectedFields.length})
              </TabsTrigger>
            </TabsList>

            {/* Configuration Tab */}
            <TabsContent value="configure" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Widget Name</Label>
                  <Input
                    placeholder="e.g., Apple Stock Chart"
                    value={widgetName}
                    onChange={(e) => setWidgetName(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div>
                  <Label>Widget Type</Label>
                  <div className="flex space-x-2 mt-2">
                    {[
                      { type: 'card', icon: TrendingUp, label: 'Card' },
                      { type: 'table', icon: Table, label: 'Table' },
                      { type: 'chart', icon: BarChart3, label: 'Chart' }
                    ].map(({ type, icon: Icon, label }) => (
                      <Button
                        key={type}
                        variant={displayMode === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDisplayMode(type as any)}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>API URL</Label>
                <div className="flex space-x-2">
                  <Input
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
                
                {apiTestResult && (
                  <Card className={`mt-3 p-4 ${
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

              <div>
                <Label>Refresh Interval (seconds)</Label>
                <Input
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  min="10"
                  max="3600"
                  className="w-32 h-11"
                />
              </div>

              <div>
                <Label>Sample APIs</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
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
              {displayMode === 'chart' ? (
                /* Chart Axis Selection */
                <div className="space-y-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Chart Configuration</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Select X-axis (dates/labels) and Y-axis (numeric values)</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* X-Axis Selection */}
                    <div>
                      <Label className="text-base font-semibold">X-Axis (Labels/Dates)</Label>
                      <p className="text-sm text-muted-foreground mb-3">Choose field for horizontal axis</p>
                      <Select value={xAxisField} onValueChange={setXAxisField}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select X-axis field" />
                        </SelectTrigger>
                        <SelectContent>
                          {getXAxisFields().map(field => (
                            <SelectItem key={field.path} value={field.path}>
                              <div className="flex items-center justify-between w-full">
                                <span className="font-mono text-sm">{field.path}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {field.isDateLike ? 'Date' : field.type}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {xAxisField && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                          <p className="text-xs text-green-700 dark:text-green-300">
                            ✓ Selected: {xAxisField}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Y-Axis Selection */}
                    <div>
                      <Label className="text-base font-semibold">Y-Axis (Values)</Label>
                      <p className="text-sm text-muted-foreground mb-3">Choose numeric field for vertical axis</p>
                      <Select value={yAxisField} onValueChange={setYAxisField}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select Y-axis field" />
                        </SelectTrigger>
                        <SelectContent>
                          {getYAxisFields().map(field => (
                            <SelectItem key={field.path} value={field.path}>
                              <div className="flex items-center justify-between w-full">
                                <span className="font-mono text-sm">{field.path}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Number
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {yAxisField && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                          <p className="text-xs text-green-700 dark:text-green-300">
                            ✓ Selected: {yAxisField}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  {xAxisField && yAxisField && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                      <h4 className="font-semibold mb-2">Chart Preview Configuration</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Chart Type:</strong> Line/Bar/Area Chart</p>
                        <p><strong>X-Axis:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{xAxisField}</code></p>
                        <p><strong>Y-Axis:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{yAxisField}</code></p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Regular Field Selection for Card/Table */
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search fields..."
                      value={fieldSearch}
                      onChange={(e) => setFieldSearch(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>

                  <div>
                    <Label>Available Fields ({getFilteredFields().length})</Label>
                    <Card className="max-h-64 overflow-y-auto border mt-2">
                      {getFilteredFields().length === 0 ? (
                        <div className="text-center py-8 px-4 text-muted-foreground">
                          No fields found
                        </div>
                      ) : (
                        <div className="divide-y">
                          {getFilteredFields().map((field) => (
                            <div
                              key={field.path}
                              className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
                              onClick={() => toggleFieldSelection(field.path)}
                            >
                              <div className="flex-1 space-y-1">
                                <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                                  {field.path}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <Badge variant="outline" className="mr-2 text-xs">
                                    {field.type}
                                  </Badge>
                                  {String(field.value).substring(0, 50)}
                                  {String(field.value).length > 50 && '...'}
                                </div>
                              </div>
                              <Checkbox
                                checked={selectedFields.includes(field.path)}
                                onChange={() => {}}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>

                  {selectedFields.length > 0 && (
                    <div>
                      <Label>Selected Fields ({selectedFields.length})</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {selectedFields.map((fieldPath) => (
                          <Card key={fieldPath} className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-mono text-sm font-medium text-blue-700 dark:text-blue-300">
                                  {fieldPath}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleFieldSelection(fieldPath)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }} className="px-6">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={
              !widgetName || 
              !apiUrl || 
              !apiTestResult?.success || 
              (displayMode === 'chart' ? (!xAxisField || !yAxisField) : selectedFields.length === 0)
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
