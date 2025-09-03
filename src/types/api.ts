// Generic API response for any JSON API
export interface ApiResponse<T = unknown> {
  data: T | null;
  error?: string;
  success: boolean;
  message?: string;
}

// Field information for dynamic mapping (used in components)
export interface FieldInfo {
  path: string;
  type: string;
  value: unknown;
  selected?: boolean;
}