// Generic API response for any JSON API
export interface ApiResponse<T = any> {
  data: T | null;
  error?: string;
  success: boolean;
  message?: string;
}

// Field information for dynamic mapping (used in components)
export interface FieldInfo {
  path: string;
  type: string;
  value: any;
  selected?: boolean;
}
  