"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useDashboardActions } from '@/lib/store';
import { parseApiResponse } from '@/lib/jsonPath';

interface FieldInfo {
  path: string;
  type: string;
  value: any;
  selected: boolean;
}

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWidgetDialog({ open, onOpenChange }: AddWidgetDialogProps) {
  const [widgetName, setWidgetName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState<'card' | 'table' | 'chart'>('card');
  const [searchFields, setSearchFields] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  
  // API Testing State
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{
    success: boolean;
    message: string;
    fields: FieldInfo[];
  } | null>(null);
  
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const { addWidget } = useDashboardActions();



  // Test API Connection
  const testApiConnection = async () => {
    if (!apiUrl) return;
    
    setIsTestingApi(true);
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const fields = parseApiResponse(data);
      
      setApiTestResult({
        success: true,
        message: `API connection successful! ${fields.length} fields found.`,
        fields
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to API. Please check the URL.';
      setApiTestResult({
        success: false,
        message: errorMessage,
        fields: []
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Filter fields based on search and array toggle
  const filteredFields = apiTestResult?.fields.filter(field => {
    const matchesSearch = field.path.toLowerCase().includes(searchFields.toLowerCase());
    const matchesArrayFilter = showArraysOnly ? field.path.includes('[') : true;
    return matchesSearch && matchesArrayFilter;
  }) || [];

  // Toggle field selection
  const toggleFieldSelection = (fieldPath: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldPath) 
        ? prev.filter(f => f !== fieldPath)
        : [...prev, fieldPath]
    );
  };

  // Remove selected field
  const removeSelectedField = (fieldPath: string) => {
    setSelectedFields(prev => prev.filter(f => f !== fieldPath));
  };

  // Create widget
  const handleAddWidget = () => {
    if (!widgetName || !apiUrl || selectedFields.length === 0) return;

    addWidget({
        type: displayMode,
        title: widgetName,
        apiEndpoint: apiUrl,
        selectedFields: selectedFields,
        position: { x: 0, y: 0 },
        size: { width: 380, height: 280 },
        config: {
            refreshInterval: refreshInterval,
            displayFormat: 'currency'
        },
        isActive: true
    });

    // Reset form
    setWidgetName('');
    setApiUrl('');
    setSelectedFields([]);
    setApiTestResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Widget</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Widget Name */}
          <div>
            <label className="text-sm font-medium">Widget Name</label>
            <Input
              placeholder="e.g., Bitcoin"
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
            />
          </div>

          {/* API URL */}
          <div>
            <label className="text-sm font-medium">API URL</label>
            <div className="flex space-x-2">
              <Input
                placeholder="https://api.example.com/data"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={testApiConnection}
                disabled={!apiUrl || isTestingApi}
                className="bg-green-600 hover:bg-green-700"
              >
                {isTestingApi ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>

          {/* API Test Result */}
          {apiTestResult && (
            <Card className={`p-3 ${apiTestResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <div className="flex items-center space-x-2">
                {apiTestResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm ${apiTestResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {apiTestResult.message}
                </span>
              </div>
            </Card>
          )}

          {/* Refresh Interval */}
          <div>
            <label className="text-sm font-medium">Refresh Interval (seconds)</label>
            <Input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              min="10"
              max="3600"
            />
          </div>

          {/* Display Mode */}
          <div>
            <label className="text-sm font-medium">Display Mode</label>
            <div className="flex space-x-2 mt-2">
              {(['card', 'table', 'chart'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={displayMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDisplayMode(mode)}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          {/* Field Selection (only show if API test successful) */}
          {apiTestResult?.success && (
            <>
              {/* Search Fields */}
              <div>
                <label className="text-sm font-medium">Search Fields</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for fields..."
                    value={searchFields}
                    onChange={(e) => setSearchFields(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="arrays-only"
                    checked={showArraysOnly}
                    onCheckedChange={(checked) => setShowArraysOnly(checked as boolean)}
                  />
                  <label htmlFor="arrays-only" className="text-sm">
                    Show arrays only (for table view)
                  </label>
                </div>
              </div>

              {/* Available Fields */}
              <div>
                <label className="text-sm font-medium">Available Fields</label>
                <Card className="max-h-48 overflow-y-auto p-2 mt-1">
                  <div className="space-y-1">
                    {filteredFields.map((field) => (
                      <div
                        key={field.path}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer"
                        onClick={() => toggleFieldSelection(field.path)}
                      >
                        <div>
                          <div className="font-mono text-sm">{field.path}</div>
                          <div className="text-xs text-muted-foreground">
                            {field.type} | {String(field.value).substring(0, 50)}...
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Selected Fields */}
              {selectedFields.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Selected Fields</label>
                  <div className="space-y-2 mt-1">
                    {selectedFields.map((fieldPath) => (
                      <Card key={fieldPath} className="p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{fieldPath}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSelectedField(fieldPath)}
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
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddWidget}
              disabled={!widgetName || !apiUrl || selectedFields.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Widget
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
