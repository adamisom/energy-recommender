/**
 * Environment configuration
 * Centralizes all environment variable access
 * 
 * NOTE: NEXT_PUBLIC_* variables MUST be referenced directly (not via process.env[key])
 * because Next.js webpack replaces them at build time using static analysis.
 */

export const config = {
  // Anthropic API (server-side only)
  anthropic: {
    apiKey: () => {
      const value = process.env.ANTHROPIC_API_KEY;
      if (!value) {
        throw new Error('Missing required environment variable: ANTHROPIC_API_KEY');
      }
      return value;
    },
  },

  // Supabase (client-side safe)
  supabase: {
    // Direct references required for webpack replacement
    url: () => process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Database (server-side only)
  database: {
    url: () => {
      const value = process.env.DATABASE_URL;
      if (!value) {
        throw new Error('Missing required environment variable: DATABASE_URL');
      }
      return value;
    },
  },

  // Feature flags
  features: {
    seasonalScoring: () => process.env.ENABLE_SEASONAL_SCORING === 'true',
  },

  // Runtime environment
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
} as const;

