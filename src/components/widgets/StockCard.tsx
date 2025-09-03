"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, X, RefreshCw } from 'lucide-react';
import { StockData } from '@/types';

interface StockCardProps {
  widgetId: string;
  title: string;
  apiEndpoint: string;
  onRemove: (id: string) => void;
}

export function StockCard({ widgetId, title, apiEndpoint, onRemove }: StockCardProps) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiEndpoint);
      const result = await response.json();
      
      // Mock data transformation (in real app, this would be dynamic)
      const stockData: StockData = {
        symbol: result.symbol || 'DEMO',
        price: result.price || 150.25,
        change: result.change || 2.50,
        changePercent: result.changePercent || 1.69,
        volume: result.volume || 1234567,
        high: result.high || 152.00,
        low: result.low || 148.50,
        timestamp: new Date().toISOString()
      };
      
      setData(stockData);
    } catch (err) {
      setError('Failed to fetch data');
      // Fallback to mock data
      setData({
        symbol: 'DEMO',
        price: 150.25,
        change: 2.50,
        changePercent: 1.69,
        volume: 1234567,
        high: 152.00,
        low: 148.50,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [apiEndpoint]);

  const isPositive = data && data.change >= 0;

  return (
    <Card className="p-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => onRemove(widgetId)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading && !data ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : error && !data ? (
        <div className="text-center py-4 text-red-500 text-sm">{error}</div>
      ) : data ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{data.symbol}</span>
            <Badge variant={isPositive ? "default" : "destructive"}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
            </Badge>
          </div>
          
          <div>
            <div className="text-2xl font-bold">${data.price.toFixed(2)}</div>
            <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}${data.change.toFixed(2)} Today
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              High: $
              {typeof data.high === 'number'
                ? data.high.toFixed(2)
                : '--'}
            </div>
            <div>
              Low: $
              {typeof data.low === 'number'
                ? data.low.toFixed(2)
                : '--'}
            </div>
            <div>
              Volume: {typeof data.volume === 'number'
                ? data.volume.toLocaleString()
                : '--'}
            </div>
            <div>
              Updated: {data.timestamp
                ? new Date(data.timestamp).toLocaleTimeString()
                : '--'}
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
