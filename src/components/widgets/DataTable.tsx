"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, RefreshCw, Search, ArrowUpDown } from 'lucide-react';

interface DataTableProps {
  widgetId: string;
  title: string;
  apiEndpoint: string;
  onRemove: (id: string) => void;
}

interface TableRow {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export function DataTable({ widgetId, title, apiEndpoint, onRemove }: DataTableProps) {
  const [data, setData] = useState<TableRow[]>([]);
  const [filteredData, setFilteredData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof TableRow>('symbol');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');




  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(mockData);
    } catch (error) {
      setData(mockData); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort data
  useEffect(() => {
    let filtered = data.filter(item =>
      item.symbol.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
    );

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    setFilteredData(filtered);
  }, [data, search, sortField, sortDirection]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [apiEndpoint]);

  const handleSort = (field: keyof TableRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(widgetId)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {[
                { key: 'symbol', label: 'Symbol' },
                { key: 'name', label: 'Name' },
                { key: 'price', label: 'Price' },
                { key: 'change', label: 'Change' },
                { key: 'volume', label: 'Volume' }
              ].map(({ key, label }) => (
                <th key={key} className="text-left pb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(key as keyof TableRow)}
                    className="font-medium text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
                  >
                    {label}
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  No data found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 font-mono font-semibold">{item.symbol}</td>
                  <td className="py-3 text-sm text-muted-foreground">{item.name}</td>
                  <td className="py-3 font-medium">${item.price.toFixed(2)}</td>
                  <td className={`py-3 text-sm ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? '+' : ''}${item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {(item.volume / 1000000).toFixed(1)}M
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
