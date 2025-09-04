'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { extractFields } from '@/lib/dataUtils';

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

interface ConfigureTabProps {
  widgetName: string;
  setWidgetName: (name: string) => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
  displayMode: 'card' | 'table' | 'chart';
  setDisplayMode: (mode: 'card' | 'table' | 'chart') => void;
  apiTestResult: ApiTestResult | null;
  setApiTestResult: (result: ApiTestResult | null) => void;
  setCurrentTab: (tab: string) => void;
}

export function ConfigureTab({
  widgetName,
  setWidgetName,
  apiUrl,
  setApiUrl,
  refreshInterval,
  setRefreshInterval,
  displayMode,
  setDisplayMode,
  apiTestResult,
  setApiTestResult,
  setCurrentTab
}: ConfigureTabProps) {
  const [isTestingApi, setIsTestingApi] = useState(false);

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
      const response = await apiClient.fetch({ url: apiUrl });
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
      
      setCurrentTab('theme');
      
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

  return (
    <div className="space-y-6">
      {/* Widget Name & Display Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="widget-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Widget Name</Label>
          <Input
            id="widget-name"
            placeholder="e.g., Bitcoin Price, Stock Portfolio"
            value={widgetName}
            onChange={(e) => setWidgetName(e.target.value)}
            className="h-12 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Display Mode</Label>
          <div className="flex space-x-2">
            {(['card', 'table', 'chart'] as const).map((mode) => (
              <Button
                key={mode}
                variant={displayMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode(mode)}
                className={`capitalize flex-1 h-12 ${
                  displayMode === mode 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* API URL */}
      <div className="space-y-3">
        <Label htmlFor="api-url" className="text-sm font-semibold text-gray-700 dark:text-gray-300">API URL</Label>
        <div className="flex space-x-3">
          <Input
            id="api-url"
            placeholder="https://api.example.com/data"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="flex-1 h-12 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
          />
          <Button 
            onClick={handleTestApi} 
            disabled={!apiUrl || isTestingApi}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 h-12 font-semibold"
          >
            {isTestingApi ? 'Testing...' : 'Test API'}
          </Button>
        </div>
        
        {/* API Test Result */}
        {apiTestResult && (
          <Card className={`p-4 border-2 ${
            apiTestResult.success 
              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
          }`}>
            <div className="flex items-start space-x-3">
              {apiTestResult.success ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${
                  apiTestResult.success ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {apiTestResult.success ? 'API Connection Successful!' : 'Connection Failed'}
                </p>
                <p className={`text-sm ${
                  apiTestResult.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {apiTestResult.message}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Refresh Interval */}
      <div className="space-y-3">
        <Label htmlFor="refresh-interval" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Refresh Interval (seconds)</Label>
        <Input
          id="refresh-interval"
          type="number"
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          min="10"
          max="3600"
          className="w-32 h-12 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      {/* Sample APIs */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Start (Sample APIs)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleApis.map((api, index) => (
            <Card
              key={index}
              className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-600 border-gray-200 dark:border-gray-700"
              onClick={() => {
                setApiUrl(api.url);
                setDisplayMode(api.type as 'card' | 'table' | 'chart');
                setWidgetName(api.name);
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{api.name}</h4>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 capitalize text-xs">
                    {api.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{api.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
