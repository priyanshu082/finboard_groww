export const env = {
    ALPHA_VANTAGE_KEY: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || '',
  } as const;

if (!env.ALPHA_VANTAGE_KEY) {
    throw new Error('NEXT_PUBLIC_ALPHA_VANTAGE_KEY is required');
  }