/**
 * Safe sessionStorage wrapper with error handling
 * Handles cases where sessionStorage is unavailable (private browsing, etc.)
 */

export function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = sessionStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to get ${key} from sessionStorage:`, error);
    return defaultValue;
  }
}

export function safeSetItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set ${key} in sessionStorage:`, error);
    return false;
  }
}

export function safeRemoveItem(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove ${key} from sessionStorage:`, error);
    return false;
  }
}

export function safeClear(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear sessionStorage:', error);
    return false;
  }
}

// Type-safe storage keys
export const STORAGE_KEYS = {
  USAGE_DATA: 'usageData',
  PREFERENCES: 'preferences',
  STATE: 'state',
  CURRENT_PLAN: 'currentPlan',
} as const;

