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
  VIEWED_PLANS: 'viewedPlans',
  FAVORITE_PLANS: 'favoritePlans',
} as const;

// Helper functions for viewed plans (localStorage - persists across sessions)
export function getViewedPlans(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = localStorage.getItem(STORAGE_KEYS.VIEWED_PLANS);
    if (item === null) {
      return [];
    }
    return JSON.parse(item) as string[];
  } catch (error) {
    console.error('Failed to get viewed plans:', error);
    return [];
  }
}

export function addViewedPlan(planId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const viewed = getViewedPlans();
    if (!viewed.includes(planId)) {
      viewed.push(planId);
      localStorage.setItem(STORAGE_KEYS.VIEWED_PLANS, JSON.stringify(viewed));
    }
  } catch (error) {
    console.error('Failed to add viewed plan:', error);
  }
}

// Helper functions for favorite plans (localStorage - max 5)
export function getFavoritePlans(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = localStorage.getItem(STORAGE_KEYS.FAVORITE_PLANS);
    if (item === null) {
      return [];
    }
    return JSON.parse(item) as string[];
  } catch (error) {
    console.error('Failed to get favorite plans:', error);
    return [];
  }
}

export function addFavoritePlan(planId: string): { success: boolean; message?: string } {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Storage not available' };
  }
  try {
    const favorites = getFavoritePlans();
    if (favorites.includes(planId)) {
      return { success: false, message: 'Plan is already in favorites' };
    }
    if (favorites.length >= 5) {
      return { success: false, message: 'You can only save up to 5 favorite plans. Please remove one first.' };
    }
    favorites.push(planId);
    localStorage.setItem(STORAGE_KEYS.FAVORITE_PLANS, JSON.stringify(favorites));
    return { success: true };
  } catch (error) {
    console.error('Failed to add favorite plan:', error);
    return { success: false, message: 'Failed to add favorite plan' };
  }
}

export function removeFavoritePlan(planId: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const favorites = getFavoritePlans();
    const filtered = favorites.filter(id => id !== planId);
    localStorage.setItem(STORAGE_KEYS.FAVORITE_PLANS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to remove favorite plan:', error);
    return false;
  }
}

export function isFavoritePlan(planId: string): boolean {
  return getFavoritePlans().includes(planId);
}

