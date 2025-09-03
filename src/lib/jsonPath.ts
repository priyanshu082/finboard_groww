export type FieldInfo = { path: string; type: string; value: any; selected: boolean };

export function parseApiResponse(obj: any, prefix = ''): FieldInfo[] {
  const fields: FieldInfo[] = [];
  
  const traverse = (current: any, path: string) => {
    if (current === null || current === undefined) return;
    
    if (typeof current === 'object' && !Array.isArray(current)) {
      Object.keys(current).forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        traverse(current[key], newPath);
      });
    } else if (Array.isArray(current)) {
      if (current.length > 0) {
        traverse(current[0], `${path}[0]`);
      }
    } else {
      fields.push({
        path: path,
        type: typeof current,
        value: current,
        selected: false
      });
    }
  };
  
  traverse(obj, prefix);
  return fields;
}
