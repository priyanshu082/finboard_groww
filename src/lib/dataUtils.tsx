export interface FieldInfo {
  path: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
}

// Extract all field paths from data
export function extractFields(data: any, prefix = '', depth = 0): FieldInfo[] {
  if (depth > 3 || !data || typeof data !== 'object') return [];
  
  const fields: FieldInfo[] = [];
  
  if (Array.isArray(data)) {
    if (data.length > 0) {
      return extractFields(data[0], prefix + '[0]', depth + 1);
    }
    return [];
  }
  
  Object.entries(data).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const type = Array.isArray(value) ? 'array' : typeof value;
    
    fields.push({
      path,
      value,
      type: type as any
    });
    
    if (depth < 2 && value && typeof value === 'object') {
      fields.push(...extractFields(value, path, depth + 1));
    }
  });
  
  return fields;
}

// Get value by field path
export function getFieldValue(data: any, path: string): any {
  if (!path || !data) return null;
  
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = data;
  
  for (const key of keys) {
    if (current === null || current === undefined) return null;
    current = current[key];
  }
  
  return current;
}

// Convert data to table rows
export function normalizeToRows(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  
  // Look for arrays in object
  if (typeof data === 'object') {
    const arrays = Object.values(data).filter(v => Array.isArray(v));
    if (arrays.length > 0) {
      return arrays[0] as any[];
    }
  }
  
  return [data];
}

// Format value for display
export function formatValue(value: any, fieldName?: string): string {
  if (value === null || value === undefined) return 'N/A';
  
  if (typeof value === 'number') {
    const lower = fieldName?.toLowerCase() || '';
    
    if (lower.includes('price') || lower.includes('cost')) {
      return `$${value.toFixed(2)}`;
    }
    if (lower.includes('percent') || lower.includes('%')) {
      return `${value.toFixed(2)}%`;
    }
    if (lower.includes('volume')) {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    }
    
    return value.toLocaleString();
  }
  
  return String(value);
}
