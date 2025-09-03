export interface FieldInfo {
  path: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  isNumeric?: boolean;
  isDateLike?: boolean;
  priority?: number; // Higher priority = more likely to be useful
}

/**
 * Smart field extraction with limited depth and prioritization
 * Focuses on practical, usable fields rather than deep nesting
 */
export function extractFields(data: unknown, prefix = '', depth = 0): FieldInfo[] {
  // Stricter depth limit
  if (depth > 3 || data === null || data === undefined) return [];

  const fields: FieldInfo[] = [];

  // Special handling for known API structures
  if (depth === 0) {
    // Yahoo Finance Chart API
    if (data && typeof data === 'object' && 'chart' in data) {
      const chartData = data as { chart?: { result?: unknown[] } };
      if (chartData.chart?.result?.[0]) {
        return extractYahooFinanceFields(data);
      }
    }
    
    // CoinGecko Price History
    if (data && typeof data === 'object' && 'prices' in data) {
      const priceData = data as { prices?: unknown };
      if (Array.isArray(priceData.prices)) {
        return extractCoinGeckoFields(data);
      }
    }

    // CoinGecko Market Data
    if (Array.isArray(data) && data[0] && typeof data[0] === 'object' && 'market_cap' in data[0]) {
      return extractCoinGeckoMarketFields(data);
    }
  }

  if (Array.isArray(data)) {
    // Add the array itself as a field (high priority)
    fields.push({
      path: prefix,
      value: data,
      type: 'array',
      priority: 8
    });

    // For arrays, only extract from first element if it's an object
    if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      // Only go one level deep into array elements to avoid complexity
      if (depth < 2) {
        fields.push(...extractFields(data[0], prefix ? `${prefix}[0]` : '[0]', depth + 1));
      }
    } else if (data.length > 0) {
      // For primitive arrays, show first few elements
      for (let i = 0; i < Math.min(data.length, 3); i++) {
        fields.push({
          path: `${prefix}[${i}]`,
          value: data[i],
          type: (typeof data[i]) as FieldInfo['type'],
          isNumeric: typeof data[i] === 'number',
          isDateLike: isDateLike(data[i]),
          priority: 6 - i // First element has higher priority
        });
      }
    }
    return fields;
  }

  if (typeof data === 'object' && data !== null) {
    const objData = data as Record<string, unknown>;
    // Sort object keys to prioritize common field names
    const sortedKeys = Object.keys(objData).sort((a, b) => {
      const aPriority = getFieldPriority(a);
      const bPriority = getFieldPriority(b);
      return bPriority - aPriority;
    });

    // Limit number of fields to prevent overwhelming UI
    const maxFields = depth === 0 ? 20 : 10;
    
    sortedKeys.slice(0, maxFields).forEach(key => {
      const value = objData[key];
      const path = prefix ? `${prefix}.${key}` : key;
      
      let type: FieldInfo['type'];
      if (Array.isArray(value)) {
        type = 'array';
      } else if (value === null) {
        type = 'string';
      } else {
        type = typeof value as FieldInfo['type'];
      }

      const fieldInfo: FieldInfo = {
        path,
        value,
        type,
        isNumeric: type === 'number',
        isDateLike: isDateLike(value),
        priority: getFieldPriority(key) + (5 - depth) // Shallower fields get higher priority
      };

      fields.push(fieldInfo);

      // Only recurse into objects and non-empty arrays, with depth limit
      if (depth < 2 && value !== null && 
          ((type === 'object') || (type === 'array' && Array.isArray(value) && value.length > 0))) {
        fields.push(...extractFields(value, path, depth + 1));
      }
    });
  }

  return fields;
}

/**
 * Specialized extraction for Yahoo Finance Chart API
 */
function extractYahooFinanceFields(data: unknown): FieldInfo[] {
  const fields: FieldInfo[] = [];
  
  if (!data || typeof data !== 'object') return fields;
  
  const chartData = data as {
    chart?: {
      result?: Array<{
        timestamp?: number[];
        indicators?: {
          quote?: Array<{
            close?: number[];
            open?: number[];
            high?: number[];
            low?: number[];
            volume?: number[];
          }>;
          adjclose?: Array<{
            adjclose?: number[];
          }>;
        };
        meta?: {
          symbol?: string;
          currency?: string;
          regularMarketPrice?: number;
        };
      }>;
    };
  };
  
  const result = chartData.chart?.result?.[0];
  if (!result) return fields;

  // Add timestamp (X-axis candidate)
  if (result.timestamp) {
    fields.push({
      path: 'chart.result[0].timestamp',
      value: result.timestamp,
      type: 'array',
      isDateLike: true,
      priority: 10
    });
  }

  // Add OHLCV data (Y-axis candidates)
  if (result.indicators?.quote?.[0]) {
    const quote = result.indicators.quote[0];
    ['close', 'open', 'high', 'low', 'volume'].forEach((field, index) => {
      if (quote[field as keyof typeof quote]) {
        fields.push({
          path: `chart.result[0].indicators.quote[0].${field}`,
          value: quote[field as keyof typeof quote],
          type: 'array',
          isNumeric: field !== 'volume', // Volume is numeric but different scale
          priority: 9 - index // Close has highest priority
        });
      }
    });
  }

  // Add adjusted close if available
  if (result.indicators?.adjclose?.[0]?.adjclose) {
    fields.push({
      path: 'chart.result[0].indicators.adjclose[0].adjclose',
      value: result.indicators.adjclose[0].adjclose,
      type: 'array',
      isNumeric: true,
      priority: 8
    });
  }

  // Add metadata
  if (result.meta) {
    ['symbol', 'currency', 'regularMarketPrice'].forEach(field => {
      const metaValue = result.meta?.[field as keyof typeof result.meta];
      if (metaValue !== undefined) {
        fields.push({
          path: `chart.result[0].meta.${field}`,
          value: metaValue,
          type: typeof metaValue as FieldInfo['type'],
          isNumeric: typeof metaValue === 'number',
          priority: 5
        });
      }
    });
  }

  return fields;
}

/**
 * Specialized extraction for CoinGecko Price History
 */
function extractCoinGeckoFields(data: unknown): FieldInfo[] {
  const fields: FieldInfo[] = [];

  if (!data || typeof data !== 'object') return fields;
  
  const priceData = data as {
    prices?: Array<[number, number]>;
    market_caps?: Array<[number, number]>;
    total_volumes?: Array<[number, number]>;
  };

  if (priceData.prices && Array.isArray(priceData.prices)) {
    fields.push(
      {
        path: 'prices',
        value: priceData.prices,
        type: 'array',
        priority: 10
      },
      {
        path: 'prices[0]',
        value: priceData.prices[0]?.[0],
        type: 'number',
        isDateLike: true,
        priority: 9
      },
      {
        path: 'prices[1]',
        value: priceData.prices[0]?.[1],
        type: 'number',
        isNumeric: true,
        priority: 9
      }
    );
  }

  ['market_caps', 'total_volumes'].forEach((field, index) => {
    const fieldValue = priceData[field as keyof typeof priceData];
    if (fieldValue) {
      fields.push({
        path: field,
        value: fieldValue,
        type: 'array',
        isNumeric: true,
        priority: 7 - index
      });
    }
  });

  return fields;
}

/**
 * Specialized extraction for CoinGecko Market Data
 */
function extractCoinGeckoMarketFields(data: unknown[]): FieldInfo[] {
  if (!data || !data[0] || typeof data[0] !== 'object') return [];
  
  const sample = data[0] as Record<string, unknown>;
  const fields: FieldInfo[] = [];
  
  // High priority fields for crypto market data
  const priorityFields = [
    'symbol', 'name', 'current_price', 'price_change_24h', 
    'price_change_percentage_24h', 'market_cap', 'total_volume'
  ];

  priorityFields.forEach((field, index) => {
    const value = sample[field];
    if (value !== undefined) {
      fields.push({
        path: field,
        value: value,
        type: typeof value as FieldInfo['type'],
        isNumeric: typeof value === 'number',
        priority: 10 - index
      });
    }
  });

  // Add other available fields with lower priority
  Object.keys(sample)
    .filter(key => !priorityFields.includes(key))
    .slice(0, 10) // Limit additional fields
    .forEach(key => {
      const value = sample[key];
      fields.push({
        path: key,
        value: value,
        type: typeof value as FieldInfo['type'],
        isNumeric: typeof value === 'number',
        isDateLike: isDateLike(value),
        priority: 3
      });
    });

  return fields;
}

/**
 * Assign priority to field names based on common patterns
 */
function getFieldPriority(fieldName: string): number {
  const name = fieldName.toLowerCase();
  
  // High priority - likely to be useful for charts/tables
  if (['price', 'close', 'value', 'amount', 'total'].some(term => name.includes(term))) {
    return 10;
  }
  
  // Date/time fields
  if (['date', 'time', 'timestamp', 'created', 'updated'].some(term => name.includes(term))) {
    return 9;
  }
  
  // Identifiers
  if (['id', 'symbol', 'name', 'title', 'label'].some(term => name.includes(term))) {
    return 8;
  }
  
  // Financial data
  if (['open', 'high', 'low', 'volume', 'change', 'percent'].some(term => name.includes(term))) {
    return 7;
  }
  
  // Common business fields
  if (['status', 'type', 'category', 'description'].some(term => name.includes(term))) {
    return 5;
  }
  
  // Technical/metadata fields (lower priority)
  if (['meta', 'config', 'settings', 'debug'].some(term => name.includes(term))) {
    return 2;
  }
  
  return 4; // Default priority
}

/**
 * Enhanced date detection
 */
export function isDateLike(value: unknown): boolean {
  if (typeof value === 'number') {
    // Unix timestamp (seconds or milliseconds)
    return (value > 946684800 && value < 4102444800) || // 2000-2100 in seconds
           (value > 946684800000 && value < 4102444800000); // 2000-2100 in milliseconds
  }
  
  if (typeof value === 'string') {
    // Common date patterns
    return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value) || 
           /^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(value) ||
           !isNaN(Date.parse(value));
  }
  
  return false;
}


export function getFieldValue(data: unknown, path: string): unknown {
  if (!path || data === null || data === undefined) return null;

  // Handle simple array notation
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  
  let current: unknown = data;
  for (const key of keys) {
    if (current === null || current === undefined) return null;
    if (typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return null;
    }
  }
  
  return current;
}

/**
 * Smart data normalization with API-specific handling
 */
export function normalizeToRows(data: unknown): unknown[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  // Yahoo Finance Chart API
  if (data && typeof data === 'object' && 'chart' in data) {
    const chartData = data as {
      chart?: {
        result?: Array<{
          timestamp?: number[];
          indicators?: {
            quote?: Array<{
              open?: (number | null)[];
              high?: (number | null)[];
              low?: (number | null)[];
              close?: (number | null)[];
              volume?: (number | null)[];
            }>;
          };
        }>;
      };
    };
    
    const result = chartData.chart?.result?.[0];
    if (result?.timestamp && result.indicators?.quote?.[0]) {
      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];
      
      return timestamps.map((timestamp: number, i: number) => {
        const row: Record<string, unknown> = { 
          timestamp: timestamp * 1000, // Convert to milliseconds
          date: new Date(timestamp * 1000).toISOString().split('T')[0]
        };
        
        // Add OHLCV data
        ['open', 'high', 'low', 'close', 'volume'].forEach(field => {
          const fieldData = quote[field as keyof typeof quote];
          if (fieldData && fieldData[i] !== null) {
            row[field] = fieldData[i];
          }
        });
        
        return row;
      }).filter((row: Record<string, unknown>) => Object.keys(row).length > 2); // Filter out empty rows
    }
  }

  // CoinGecko price history
  if (data && typeof data === 'object' && 'prices' in data) {
    const priceData = data as { prices?: Array<[number, number]> };
    if (priceData.prices && Array.isArray(priceData.prices)) {
      return priceData.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        date: new Date(timestamp).toISOString().split('T')[0],
        price
      }));
    }
  }

  // Look for arrays in object
  if (data && typeof data === 'object') {
    const objData = data as Record<string, unknown>;
    const arrayProp = Object.values(objData).find(v => Array.isArray(v));
    if (arrayProp && Array.isArray(arrayProp)) {
      return arrayProp;
    }
  }

  return [data];
}


export function formatValue(value: unknown, fieldName?: string): string {
  if (value === null || value === undefined) return 'N/A';

  const name = fieldName?.toLowerCase() || '';

  // Handle arrays and objects
  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }
  if (typeof value === 'object') {
    return '[object]';
  }

  // Format numbers
  if (typeof value === 'number') {
    // Currency/price fields
    if (['price', 'cost', 'close', 'open', 'high', 'low', 'value'].some(term => name.includes(term))) {
      return `$${value.toFixed(4)}`;
    }
    
    // Percentage fields
    if (name.includes('percent') || name.includes('%')) {
      return `${value.toFixed(4)}%`;
    }
    
    // Volume fields
    if (name.includes('volume') || name.includes('cap')) {
      if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(4)}B`;
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(4)}M`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(4)}K`;
    }
    
    // Timestamp
    if ((name.includes('time') || name.includes('date')) && value > 1_000_000_000) {
      const date = new Date(value > 9999999999 ? value : value * 1000);
      return date.toLocaleDateString();
    }
    
    // Default: trim to 4 decimal places if not integer
    if (Math.abs(value) < 1e10 && value % 1 !== 0) {
      return value.toFixed(4);
    }
    return value.toLocaleString();
  }

  return String(value);
}
