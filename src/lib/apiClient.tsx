export interface ApiRequest {
    url: string;
    apiKey?: string;
    headers?: Record<string, string>;
  }
  
  export interface ApiResponse<T = any> {
    data: T;
    cached: boolean;
    error?: string;
  }
  
  class ApiClient {
    private baseUrl = '/api/proxy';
  
    async fetch<T = any>(request: ApiRequest): Promise<ApiResponse<T>> {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'API request failed');
        }
  
        return await response.json();
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : 'Network error'
        );
      }
    }
  }
  
  export const apiClient = new ApiClient();
  