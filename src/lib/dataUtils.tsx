export interface FieldInfo {
  path: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  isNumeric?: boolean;
  isDateLike?: boolean;
  priority?: number;
}

// Field priority mapping for common patterns
const FIELD_PRIORITIES = {
  high: ['price', 'close', 'value', 'amount', 'total'],
  date: ['date', 'time', 'timestamp', 'created', 'updated'],
  identifier: ['id', 'symbol', 'name', 'title', 'label'],
  financial: ['open', 'high', 'low', 'volume', 'change', 'percent'],
  business: ['status', 'type', 'category', 'description'],
  meta: ['meta', 'config', 'settings', 'debug']
};

/**
 * Get field priority based on name patterns
 */
function getFieldPriority(fieldName: string): number {
  const name = fieldName.toLowerCase();
  if (FIELD_PRIORITIES.high.some(term => name.includes(term))) return 10;
  if (FIELD_PRIORITIES.date.some(term => name.includes(term))) return 9;
  if (FIELD_PRIORITIES.identifier.some(term => name.includes(term))) return 8;
  if (FIELD_PRIORITIES.financial.some(term => name.includes(term))) return 7;
  if (FIELD_PRIORITIES.business.some(term => name.includes(term))) return 5;
  if (FIELD_PRIORITIES.meta.some(term => name.includes(term))) return 2;
  return 4; // Default priority
}

/**
 * Check if value looks like a date/timestamp
 */
export function isDateLike(value: unknown): boolean {
  if (typeof value === 'number') {
    // Unix timestamp range (2000-2100)
    return (value > 946684800 && value < 4102444800) ||
           (value > 946684800000 && value < 4102444800000);
  }
  if (typeof value === 'string') {
    return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value) ||
           !isNaN(Date.parse(value));
  }
  return false;
}

/**
 * Extract fields from data with smart prioritization (depth up to 3)
 */
export function extractFields(data: unknown, prefix = '', depth = 0): FieldInfo[] {
  if (depth > 3 || data === null || data === undefined) return [];

  const fields: FieldInfo[] = [];

  // Handle arrays
  if (Array.isArray(data)) {
    fields.push({
      path: prefix,
      value: data,
      type: 'array',
      priority: 8
    });

    // Extract from first element if it's an object (up to depth 2)
    if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null && depth < 2) {
      fields.push(...extractFields(data[0], prefix ? `${prefix}[0]` : '[0]', depth + 1));
    }
    return fields;
  }

  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const objData = data as Record<string, unknown>;
    const keys = Object.keys(objData)
      .sort((a, b) => getFieldPriority(b) - getFieldPriority(a))
      .slice(0, depth === 0 ? 25 : depth === 1 ? 15 : 10); // More fields for deeper levels

    keys.forEach(key => {
      const value = objData[key];
      const path = prefix ? `${prefix}.${key}` : key;

      const fieldInfo: FieldInfo = {
        path,
        value,
        type: Array.isArray(value) ? 'array' :
              value === null ? 'string' :
              typeof value as FieldInfo['type'],
        isNumeric: typeof value === 'number',
        isDateLike: isDateLike(value),
        priority: getFieldPriority(key) + (5 - depth)
      };

      fields.push(fieldInfo);

      // Recurse into objects and arrays (up to depth 3)
      if (depth < 3 && value !== null &&
          (typeof value === 'object' || Array.isArray(value))) {
        fields.push(...extractFields(value, path, depth + 1));
      }
    });
  }

  return fields;
}

/**
 * Get value from nested object using dot notation path
 */
export function getFieldValue(data: unknown, path: string): unknown {
  if (!path || data === null || data === undefined) return null;

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
 * Normalize data to array of rows (simple version)
 */
export function normalizeToRows(data: unknown): unknown[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  // If object, try to find first array property
  if (typeof data === 'object' && data !== null) {
    const firstArray = Object.values(data as Record<string, unknown>)
      .find(v => Array.isArray(v));
    if (firstArray) return firstArray as unknown[];
  }

  // Otherwise, wrap in array
  return [data];
}

/**
 * Format values for display with smart formatting
 */
export function formatValue(value: unknown, fieldName?: string): string {
  if (value === null || value === undefined) return 'N/A';

  const name = fieldName?.toLowerCase() || '';

  // Handle non-primitive types
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === 'object') return '[object]';
  if (typeof value !== 'number') return String(value);

  // Number formatting based on field name
  const formatters = [
    {
      condition: ['price', 'cost', 'close', 'open', 'high', 'low', 'value'].some(term => name.includes(term)),
      format: (n: number) => `$${n.toFixed(4)}`
    },
    {
      condition: name.includes('percent') || name.includes('%'),
      format: (n: number) => `${n.toFixed(4)}%`
    },
    {
      condition: name.includes('volume') || name.includes('cap'),
      format: (n: number) => {
        if (n >= 1e9) return `${(n / 1e9).toFixed(4)}B`;
        if (n >= 1e6) return `${(n / 1e6).toFixed(4)}M`;
        if (n >= 1e3) return `${(n / 1e3).toFixed(4)}K`;
        return n.toLocaleString();
      }
    },
    {
      condition: (name.includes('time') || name.includes('date')) && value > 1e9,
      format: (n: number) => new Date(n > 9999999999 ? n : n * 1000).toLocaleDateString()
    }
  ];

  // Apply first matching formatter
  const formatter = formatters.find(f => f.condition);
  if (formatter) return formatter.format(value);

  // Default formatting
  if (Math.abs(value) < 1e10 && value % 1 !== 0) {
    return value.toFixed(4);
  }

  return value.toLocaleString();
}