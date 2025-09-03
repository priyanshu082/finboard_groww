"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

const API_PROVIDERS = [
  {
    id: 'alphavantage',
    name: 'Alpha Vantage',
    needsKey: true,
    baseUrl: 'https://www.alphavantage.co/query',
    description: 'Stock quotes, time series data'
  },
  {
    id: 'finnhub', 
    name: 'Finnhub',
    needsKey: true,
    baseUrl: 'https://finnhub.io/api/v1/quote',
    description: 'Real-time stock data'
  },
  {
    id: 'demo',
    name: 'Demo API (Free)',
    needsKey: false,
    baseUrl: 'https://api.twelvedata.com/price',
    description: 'Free tier available'
  }
];

interface ApiSelectorProps {
  onApiSelect: (config: {
    provider: string;
    apiKey?: string;
    symbol: string;
    endpoint: string;
  }) => void;
}

export function ApiSelector({ onApiSelect }: ApiSelectorProps) {
  const [provider, setProvider] = useState('demo');
  const [apiKey, setApiKey] = useState('');
  const [symbol, setSymbol] = useState('AAPL');
  const [customUrl, setCustomUrl] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const selectedProvider = API_PROVIDERS.find(p => p.id === provider);

  const buildEndpoint = () => {
    if (useCustom) return customUrl;
    
    if (!selectedProvider) return '';
    
    let endpoint = selectedProvider.baseUrl;
    
    if (provider === 'alphavantage') {
      endpoint += `?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
    } else if (provider === 'finnhub') {
      endpoint += `?symbol=${symbol}&token=${apiKey}`;
    } else if (provider === 'demo') {
      endpoint += `?symbol=${symbol}&apikey=demo`;
    }
    
    return endpoint;
  };

  const testConnection = async () => {
    const endpoint = buildEndpoint();
    if (!endpoint) return;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok && data) {
        setTestResult({
          success: true,
          message: 'Connection successful! Data received.'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Connection failed. Please check your configuration.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Network error. Please try again.'
      });
    }
  };

  const handleSubmit = () => {
    const endpoint = buildEndpoint();
    if (!endpoint) return;
    
    onApiSelect({
      provider: useCustom ? 'Custom API' : selectedProvider?.name || '',
      apiKey,
      symbol,
      endpoint
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold mb-4">API Configuration</h3>
      
      {/* Custom URL Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="use-custom"
          checked={useCustom}
          onChange={(e) => setUseCustom(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="use-custom" className="text-sm">
          Use custom API endpoint
        </label>
      </div>

      {useCustom ? (
        /* Custom URL Input */
        <div>
          <label className="text-sm font-medium">Custom API URL</label>
          <Input
            placeholder="https://api.example.com/data"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
        </div>
      ) : (
        /* Provider Selection */
        <div>
          <label className="text-sm font-medium">Choose API Provider</label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {API_PROVIDERS.map((api) => (
                <SelectItem key={api.id} value={api.id}>
                  <div className="flex items-center space-x-2">
                    <span>{api.name}</span>
                    {!api.needsKey && <Badge variant="outline" className="text-xs">Free</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProvider && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedProvider.description}
            </p>
          )}
        </div>
      )}

      {/* Symbol Input (only for non-custom APIs) */}
      {!useCustom && (
        <div>
          <label className="text-sm font-medium">Stock Symbol</label>
          <Input
            placeholder="e.g., AAPL, TSLA"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          />
        </div>
      )}

      {/* API Key (if needed) */}
      {((selectedProvider?.needsKey && !useCustom) || useCustom) && (
        <div>
          <label className="text-sm font-medium">API Key (Optional)</label>
          <Input
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
      )}

      {/* Test Connection */}
      <div className="space-y-2">
        <Button 
          onClick={testConnection}
          variant="outline"
          className="w-full"
          disabled={!buildEndpoint()}
        >
          Test Connection
        </Button>

        {testResult && (
          <div className={`flex items-center space-x-2 text-sm p-2 rounded ${
            testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={!buildEndpoint() || (selectedProvider?.needsKey && !useCustom && !apiKey)}
      >
        Use This API
      </Button>
    </Card>
  );
}
