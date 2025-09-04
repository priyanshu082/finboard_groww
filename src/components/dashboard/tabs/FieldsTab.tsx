'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Search } from 'lucide-react';

interface FieldInfo {
  path: string;
  type: string;
  value: unknown;
}

interface ApiTestResult {
  success: boolean;
  message: string;
  fields: FieldInfo[];
  rawData?: unknown;
}

interface FieldsTabProps {
  apiTestResult: ApiTestResult | null;
  selectedFields: string[];
  setSelectedFields: (fields: string[]) => void;
}

function getUniqueKey(field: FieldInfo, idx: number) {
  return `${field.path}__${field.type}__${idx}`;
}

export function FieldsTab({ apiTestResult, selectedFields, setSelectedFields }: FieldsTabProps) {
  const [fieldSearch, setFieldSearch] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);

  const toggleFieldSelection = (fieldPath: string) => {
    if (selectedFields.includes(fieldPath)) {
      setSelectedFields(selectedFields.filter((f) => f !== fieldPath));
    } else {
      setSelectedFields([...selectedFields, fieldPath]);
    }
  };

  const removeSelectedField = (fieldPath: string) => {
    setSelectedFields(selectedFields.filter((f) => f !== fieldPath));
  };

  const filteredFields = apiTestResult?.fields?.filter((field: FieldInfo) => {
    const matchesSearch = !fieldSearch || field.path.toLowerCase().includes(fieldSearch.toLowerCase());
    const matchesArrayFilter = !showArraysOnly || field.type === 'array';
    return matchesSearch && matchesArrayFilter;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Search Fields */}
      <div className="space-y-4">
        <Label htmlFor="field-search" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search Fields</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="field-search"
            placeholder="Search for fields..."
            value={fieldSearch}
            onChange={(e) => setFieldSearch(e.target.value)}
            className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="arrays-only"
            checked={showArraysOnly}
            onCheckedChange={(checked) => setShowArraysOnly(Boolean(checked))}
            className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <Label htmlFor="arrays-only" className="text-sm text-gray-700 dark:text-gray-300">
            Show arrays only (recommended for table widgets)
          </Label>
        </div>
      </div>

      {/* Available Fields */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Available Fields ({filteredFields.length})
        </Label>
        <Card className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700">
          {filteredFields.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="text-gray-500 dark:text-gray-400">
                {apiTestResult?.fields?.length === 0 
                  ? 'No fields found in API response' 
                  : 'No fields match your search criteria'
                }
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredFields.map((field: FieldInfo, idx: number) => (
                <div
                  key={getUniqueKey(field, idx)}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => toggleFieldSelection(field.path)}
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {field.path}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <Badge variant="outline" className="mr-2 text-xs border-gray-300 dark:border-gray-600">
                        {field.type}
                      </Badge>
                      {String(field.value).substring(0, 60)}
                      {String(field.value).length > 60 && '...'}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 ml-2 text-emerald-600 hover:text-emerald-700"
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
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Selected Fields ({selectedFields.length})
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedFields.map((fieldPath, idx) => (
              <Card key={`${fieldPath}__${idx}`} className="p-4 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      {fieldPath}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
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
    </div>
  );
}