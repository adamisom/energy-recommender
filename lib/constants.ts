/**
 * Application-wide constants
 */

// US States supported
export const SUPPORTED_STATES = ['TX', 'PA', 'OH', 'IL'] as const;
export type SupportedState = typeof SUPPORTED_STATES[number];

export const STATE_NAMES: Record<SupportedState, string> = {
  TX: 'Texas',
  PA: 'Pennsylvania',
  OH: 'Ohio',
  IL: 'Illinois',
};

// Month names
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const MONTH_ABBREVIATIONS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

// Rate limiting
export const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  WINDOW_MS: 60 * 1000, // 1 minute
} as const;

// Cache settings
export const CACHE_SETTINGS = {
  MAX_EXPLANATION_CACHE_SIZE: 1000,
} as const;

// AI settings
export const AI_SETTINGS = {
  MODEL: 'claude-3-5-sonnet-20241022',
  MAX_TOKENS: 300,
  TIMEOUT_MS: 10000,
  MIN_EXPLANATION_LENGTH: 50,
  MAX_EXPLANATION_LENGTH: 500,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  MIN_USAGE_KWH: 0,
  MAX_USAGE_KWH: 10000,
  MONTHS_REQUIRED: 12,
  MIN_RENEWABLE_PCT: 0,
  MAX_RENEWABLE_PCT: 100,
  MIN_CONTRACT_MONTHS: 1,
  MAX_CONTRACT_MONTHS: 36,
  MIN_SUPPLIER_RATING: 1.0,
  MAX_SUPPLIER_RATING: 5.0,
} as const;

// User priorities
export const PRIORITIES = {
  COST: 'cost',
  RENEWABLE: 'renewable',
  FLEXIBILITY: 'flexibility',
  BALANCED: 'balanced',
} as const;

// Default user preferences
export const DEFAULT_PREFERENCES = {
  priority: PRIORITIES.BALANCED,
  minRenewablePct: 0,
  maxContractMonths: 24,
  minSupplierRating: 3.0,
} as const;

