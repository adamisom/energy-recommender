'use client';

import { useAuth } from '@/lib/auth/context';
import { safeGetItem, safeSetItem, STORAGE_KEYS } from '@/lib/utils/storage';
import { UserPreferences } from '@/types';
import { useEffect, useState, useCallback } from 'react';

/**
 * Hybrid storage hook - uses database for logged-in users, sessionStorage for anonymous
 */
export function useUsageData() {
  const { user } = useAuth();
  const [usageData, setUsageDataState] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      if (user) {
        // Logged in: fetch from database
        try {
          const response = await fetch('/api/user/usage');
          if (response.ok) {
            const { data } = await response.json();
            if (data) {
              setUsageDataState(data.monthlyKwh as number[]);
            }
          }
        } catch (error) {
          console.error('Failed to load usage data from DB:', error);
          // Fallback to sessionStorage
          const localData = safeGetItem(STORAGE_KEYS.USAGE_DATA, null);
          setUsageDataState(localData);
        }
      } else {
        // Anonymous: use sessionStorage
        const localData = safeGetItem(STORAGE_KEYS.USAGE_DATA, null);
        setUsageDataState(localData);
      }
      setLoading(false);
    }

    loadData();
  }, [user]);

  // Save data function
  const setUsageData = async (data: number[], state?: string) => {
    setUsageDataState(data);

    if (user) {
      // Logged in: save to database
      try {
        await fetch('/api/user/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monthlyKwh: data, state }),
        });
      } catch (error) {
        console.error('Failed to save usage data to DB:', error);
        // Fallback to sessionStorage
        safeSetItem(STORAGE_KEYS.USAGE_DATA, data);
      }
    } else {
      // Anonymous: use sessionStorage
      safeSetItem(STORAGE_KEYS.USAGE_DATA, data);
    }
  };

  return {
    usageData,
    setUsageData,
    loading,
    isAuthenticated: !!user,
  };
}

/**
 * Hook for preferences (similar pattern)
 */
export function usePreferences() {
  const { user } = useAuth();

  const getPreferences = (): UserPreferences | null => {
    return safeGetItem<UserPreferences | null>(STORAGE_KEYS.PREFERENCES, null);
  };

  const setPreferences = (prefs: UserPreferences) => {
    safeSetItem(STORAGE_KEYS.PREFERENCES, prefs);
    // Could save to DB here if we add a preferences table
  };

  return {
    preferences: getPreferences(),
    setPreferences,
    isAuthenticated: !!user,
  };
}

/**
 * Hook to save recommendation history (DB only for logged-in users)
 */
export function useSaveRecommendation() {
  const { user } = useAuth();

  const saveRecommendation = useCallback(async (
    recommendations: unknown,
    monthlyUsageKwh: number[],
    preferences: UserPreferences,
    state: string
  ) => {
    if (!user) {
      // Anonymous users don't save history
      return { success: false, reason: 'not_authenticated' };
    }

    try {
      const response = await fetch('/api/user/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendations,
          monthlyUsageKwh,
          preferences,
          state,
        }),
      });

      if (response.ok) {
        return { success: true };
      }

      return { success: false, reason: 'api_error' };
    } catch (error) {
      console.error('Failed to save recommendation:', error);
      return { success: false, reason: 'network_error' };
    }
  }, [user]);

  return {
    saveRecommendation,
    canSave: !!user,
  };
}

