import { NextRequest, NextResponse } from 'next/server';

// Define proper types for cache and rate limiting
interface CacheEntry {
  data: unknown;
  expires: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Simple in-memory cache and rate limiting
const cache = new Map<string, CacheEntry>();
const rateLimits = new Map<string, RateLimitEntry>();

const CACHE_TTL = 30 * 1000; // 30 seconds
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // per IP per minute

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(clientIP);
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= MAX_REQUESTS) {
    return false;
  }
  
  limit.count++;
  return true;
}

function getCachedResponse(cacheKey: string): unknown | null {
  const entry = cache.get(cacheKey);
  if (!entry || Date.now() > entry.expires) {
    cache.delete(cacheKey);
    return null;
  }
  return entry.data;
}

function setCachedResponse(cacheKey: string, data: unknown): void {
  cache.set(cacheKey, {
    data,
    expires: Date.now() + CACHE_TTL
  });
}

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await req.json() as { url: string; apiKey?: string; headers?: Record<string, string> };
    const { url, apiKey, headers = {} } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    // Security: Block localhost and private IPs
    const hostname = parsedUrl.hostname;
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') || 
        hostname.startsWith('172.')) {
      return NextResponse.json(
        { error: 'Access to localhost and private networks is not allowed' },
        { status: 403 }
      );
    }
    
    // Check cache
    const cacheKey = `${url}:${JSON.stringify(headers)}`;
    const cachedData = getCachedResponse(cacheKey);
    if (cachedData) {
      return NextResponse.json({ data: cachedData, cached: true });
    }
    
    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'User-Agent': 'FinBoard/1.0',
      'Accept': 'application/json',
      ...headers
    };
    
    if (apiKey) {
      requestHeaders['Authorization'] = `Bearer ${apiKey}`;
    }
    
    // Make request
    const response = await fetch(url, {
      method: 'GET',
      headers: requestHeaders,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API request failed: ${response.status} ${response.statusText} - ${errorText.slice(0, 200)}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Cache successful response
    setCachedResponse(cacheKey, data);
    
    return NextResponse.json({ data, cached: false });
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cacheSize: cache.size,
    rateLimitEntries: rateLimits.size
  });
}