import {
  getFavoritePlans,
  addFavoritePlan,
  removeFavoritePlan,
  isFavoritePlan,
  STORAGE_KEYS,
} from '@/lib/utils/storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe('Favorite Plans Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('getFavoritePlans', () => {
    test('should return empty array when no favorites exist', () => {
      const favorites = getFavoritePlans();
      expect(favorites).toEqual([]);
    });

    test('should return saved favorites', () => {
      localStorageMock.setItem(STORAGE_KEYS.FAVORITE_PLANS, JSON.stringify(['plan-1', 'plan-2']));
      const favorites = getFavoritePlans();
      expect(favorites).toEqual(['plan-1', 'plan-2']);
    });

    test('should handle invalid JSON gracefully', () => {
      localStorageMock.setItem(STORAGE_KEYS.FAVORITE_PLANS, 'invalid json');
      // Should return empty array on error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const favorites = getFavoritePlans();
      expect(favorites).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('addFavoritePlan', () => {
    test('should add a favorite plan', () => {
      const result = addFavoritePlan('plan-1');
      expect(result.success).toBe(true);
      expect(getFavoritePlans()).toEqual(['plan-1']);
    });

    test('should add multiple favorite plans', () => {
      addFavoritePlan('plan-1');
      addFavoritePlan('plan-2');
      addFavoritePlan('plan-3');
      expect(getFavoritePlans()).toEqual(['plan-1', 'plan-2', 'plan-3']);
    });

    test('should not add duplicate favorites', () => {
      addFavoritePlan('plan-1');
      const result = addFavoritePlan('plan-1');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Plan is already in favorites');
      expect(getFavoritePlans()).toEqual(['plan-1']);
    });

    test('should enforce 5 plan limit', () => {
      // Add 5 plans
      for (let i = 1; i <= 5; i++) {
        addFavoritePlan(`plan-${i}`);
      }
      expect(getFavoritePlans().length).toBe(5);

      // Try to add 6th
      const result = addFavoritePlan('plan-6');
      expect(result.success).toBe(false);
      expect(result.message).toBe('You can only save up to 5 favorite plans. Please remove one first.');
      expect(getFavoritePlans().length).toBe(5);
    });

    test('should allow adding after removing one', () => {
      // Add 5 plans
      for (let i = 1; i <= 5; i++) {
        addFavoritePlan(`plan-${i}`);
      }
      
      // Remove one
      removeFavoritePlan('plan-1');
      
      // Now should be able to add a new one
      const result = addFavoritePlan('plan-6');
      expect(result.success).toBe(true);
      expect(getFavoritePlans().length).toBe(5);
      expect(getFavoritePlans()).toContain('plan-6');
      expect(getFavoritePlans()).not.toContain('plan-1');
    });
  });

  describe('removeFavoritePlan', () => {
    test('should remove a favorite plan', () => {
      addFavoritePlan('plan-1');
      addFavoritePlan('plan-2');
      
      const result = removeFavoritePlan('plan-1');
      expect(result).toBe(true);
      expect(getFavoritePlans()).toEqual(['plan-2']);
    });

    test('should handle removing non-existent plan', () => {
      addFavoritePlan('plan-1');
      const result = removeFavoritePlan('plan-2');
      expect(result).toBe(true);
      expect(getFavoritePlans()).toEqual(['plan-1']);
    });

    test('should handle removing from empty list', () => {
      const result = removeFavoritePlan('plan-1');
      expect(result).toBe(true);
      expect(getFavoritePlans()).toEqual([]);
    });
  });

  describe('isFavoritePlan', () => {
    test('should return false for non-favorite plan', () => {
      expect(isFavoritePlan('plan-1')).toBe(false);
    });

    test('should return true for favorite plan', () => {
      addFavoritePlan('plan-1');
      expect(isFavoritePlan('plan-1')).toBe(true);
    });

    test('should return false after removing favorite', () => {
      addFavoritePlan('plan-1');
      expect(isFavoritePlan('plan-1')).toBe(true);
      removeFavoritePlan('plan-1');
      expect(isFavoritePlan('plan-1')).toBe(false);
    });
  });

  describe('Integration: Full workflow', () => {
    test('should handle complete favorite workflow', () => {
      // Start empty
      expect(getFavoritePlans()).toEqual([]);
      expect(isFavoritePlan('plan-1')).toBe(false);

      // Add favorites
      addFavoritePlan('plan-1');
      addFavoritePlan('plan-2');
      addFavoritePlan('plan-3');
      expect(getFavoritePlans()).toEqual(['plan-1', 'plan-2', 'plan-3']);
      expect(isFavoritePlan('plan-1')).toBe(true);
      expect(isFavoritePlan('plan-2')).toBe(true);
      expect(isFavoritePlan('plan-3')).toBe(true);

      // Remove one
      removeFavoritePlan('plan-2');
      expect(getFavoritePlans()).toEqual(['plan-1', 'plan-3']);
      expect(isFavoritePlan('plan-2')).toBe(false);

      // Add more to reach limit
      addFavoritePlan('plan-4');
      addFavoritePlan('plan-5');
      addFavoritePlan('plan-6');
      expect(getFavoritePlans().length).toBe(5);

      // Try to add 6th (should fail)
      const result = addFavoritePlan('plan-7');
      expect(result.success).toBe(false);
      expect(getFavoritePlans().length).toBe(5);
    });
  });
});

