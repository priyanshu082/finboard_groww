'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Search, ArrowUpDown, RefreshCw, X, MoreVertical, ChevronLeft, ChevronRight, 
  Table2, Filter, SortAsc, SortDesc, Database 
} from 'lucide-react';
import { useWidgetStore } from '@/store/widgetStore';
import { normalizeToRows, getFieldValue, formatValue } from '@/lib/dataUtils';

export function TableWidget({ widget }: { widget: any }) {
  const { removeWidget, refreshWidget } = useWidgetStore();
  
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Process data
  const tableData = useMemo(() => {
    const rows = normalizeToRows(widget.data);
    if (!rows.length) return [];
    return rows.slice(0, 1000); // Limit for performance
  }, [widget.data]);

  // Filter and sort
  const processedData = useMemo(() => {
    let filtered = tableData;

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(row =>
        widget.selectedFields.some((field: string) => {
          const value = getFieldValue(row, field);
          return String(value).toLowerCase().includes(search.toLowerCase());
        })
      );
    }

    // Sort
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = getFieldValue(a, sortField);
        const bVal = getFieldValue(b, sortField);
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortDirection === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return filtered;
  }, [tableData, search, sortField, sortDirection, widget.selectedFields]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const pageData = processedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="col-span-full">
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Table2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{widget.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${widget.error ? 'bg-red-500' : 'bg-emerald-500'} ${!widget.error && 'animate-pulse'}`}></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {widget.error ? 'Connection failed' : `${processedData.length} rows • Live data`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search table data..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-800"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                    <SelectTrigger className="w-32 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 rows</SelectItem>
                      <SelectItem value="25">25 rows</SelectItem>
                      <SelectItem value="50">50 rows</SelectItem>
                      <SelectItem value="100">100 rows</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => refreshWidget(widget.id)}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => refreshWidget(widget.id)} className="text-sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => removeWidget(widget.id)}
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table Content */}
        {widget.error ? (
          <div className="p-5">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50 text-center">
              <p className="text-red-700 dark:text-red-300 text-sm">{widget.error}</p>
            </div>
          </div>
        ) : widget.isLoading && !widget.data ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading table data...</span>
            </div>
          </div>
        ) : pageData.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {widget.selectedFields.map((field: string) => {
                      const fieldName = field.split('.').pop() || field;
                      const isCurrentSort = sortField === field;
                      return (
                        <th key={field} className="text-left p-4 font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort(field)}
                            className="font-medium text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 -ml-2 h-8"
                          >
                            <span className="capitalize">
                              {fieldName.replace(/[_-]/g, ' ')}
                            </span>
                            {isCurrentSort ? (
                              sortDirection === 'asc' ? (
                                <SortAsc className="ml-1 h-3 w-3 text-emerald-600" />
                              ) : (
                                <SortDesc className="ml-1 h-3 w-3 text-emerald-600" />
                              )
                            ) : (
                              <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />
                            )}
                          </Button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((row, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      {widget.selectedFields.map((field: string, fieldIndex: number) => (
                        <td key={field} className="p-4">
                          <div className={`text-sm ${
                            fieldIndex === 0 
                              ? 'font-semibold text-gray-900 dark:text-white' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {formatValue(getFieldValue(row, field), field)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> to{' '}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.min(startIndex + pageSize, processedData.length)}
                    </span>{' '}
                    of <span className="font-medium text-gray-900 dark:text-white">{processedData.length}</span> results
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-700">
                        {page}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        of {totalPages}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 disabled:opacity-50"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">No data found</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {search ? 'Try adjusting your search criteria' : 'Connect an API to see table data'}
            </p>
            {search && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSearch('')}
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                Clear search
              </Button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Updated {new Date(widget.lastUpdated).toLocaleTimeString()}</span>
            <span>Every {widget.refreshInterval}s</span>
          </div>
        </div>
      </Card>
    </div>
  );
}