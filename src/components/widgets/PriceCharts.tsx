"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  widgetId: string;
  title: string;
  apiEndpoint: string;
  onRemove: (id: string) => void;
}

export function PriceChart({ widgetId, title, apiEndpoint, onRemove }: PriceChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('1D');

  // Generate mock price data
  const generateMockData = () => {
    const data = [];
    const basePrice = 150;
    let currentPrice = basePrice;
    
    for (let i = 0; i < 24; i++) {
      const change = (Math.random() - 0.5) * 5;
      currentPrice += change;
      
      data.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        price: Math.max(currentPrice, 0),
        volume: Math.floor(Math.random() * 1000000),
      });
    }
    return data;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockData();
      setData(mockData);
    } catch (err) {
      setError('Failed to fetch chart data');
      setData(generateMockData()); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiEndpoint, timeframe]);

  const currentPrice = data.length > 0 ? data[data.length - 1]?.price : 0;
  const previousPrice = data.length > 1 ? data[data.length - 2]?.price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          {data.length > 0 && (
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-2xl font-bold">
                ${currentPrice.toFixed(2)}
              </span>
              <div className={`flex items-center space-x-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1D">1D</SelectItem>
              <SelectItem value="1W">1W</SelectItem>
              <SelectItem value="1M">1M</SelectItem>
              <SelectItem value="1Y">1Y</SelectItem>
            </SelectContent>
          </Select>
          
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

      {/* Chart */}
      <div className="h-64">
        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        ) : error && data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip 
                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                labelStyle={{ color: '#000' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? '#10b981' : '#ef4444'} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
