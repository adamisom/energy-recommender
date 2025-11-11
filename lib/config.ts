/**
 * Environment configuration
 * Centralizes all environment variable access
 */

function getEnvVar(key: string, required: boolean = false): string | undefined {
  const value = process.env[key];
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

export const config = {
  // Anthropic API
  anthropic: {
    apiKey: () => getEnvVar('ANTHROPIC_API_KEY', true)!,
  },

  // Supabase
  supabase: {
    url: () => getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: () => getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  },

  // Database
  database: {
    url: () => getEnvVar('DATABASE_URL', true)!,
  },

  // Feature flags
  features: {
    seasonalScoring: () => getEnvVar('ENABLE_SEASONAL_SCORING') === 'true',
  },

  // Runtime environment
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
} as const;

