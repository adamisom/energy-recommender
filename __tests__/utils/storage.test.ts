import { safeGetItem, safeSetItem, safeRemoveItem, safeClear, STORAGE_KEYS } from '@/lib/utils/storage';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('Storage Utilities', () => {
  // Suppress console.error for these tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    mockSessionStorage.clear();
  });

  describe('safeGetItem', () => {
    test('should get item from sessionStorage', () => {
      safeSetItem('testKey', { value: 123 });
      const result = safeGetItem('testKey', null);
      
      expect(result).toEqual({ value: 123 });
    });

    test('should return default value if key not found', () => {
      const result = safeGetItem('nonexistent', { default: true });
      
      expect(result).toEqual({ default: true });
    });

    test('should handle JSON parse errors gracefully', () => {
      // Manually set invalid JSON
      mockSessionStorage.setItem('badKey', 'invalid{json');
      
      const result = safeGetItem('badKey', { fallback: true });
      
      expect(result).toEqual({ fallback: true });
    });
  });

  describe('safeSetItem', () => {
    test('should set item in sessionStorage', () => {
      const success = safeSetItem('testKey', { data: [1, 2, 3] });
      
      expect(success).toBe(true);
      expect(JSON.parse(mockSessionStorage.getItem('testKey')!)).toEqual({ data: [1, 2, 3] });
    });

    test('should handle numbers', () => {
      safeSetItem('numberKey', 42);
      const result = safeGetItem('numberKey', 0);
      
      expect(result).toBe(42);
    });

    test('should handle arrays', () => {
      const arr = [100, 200, 300];
      safeSetItem('arrayKey', arr);
      const result = safeGetItem('arrayKey', []);
      
      expect(result).toEqual(arr);
    });
  });

  describe('safeRemoveItem', () => {
    test('should remove item from sessionStorage', () => {
      safeSetItem('testKey', 'value');
      const success = safeRemoveItem('testKey');
      
      expect(success).toBe(true);
      expect(mockSessionStorage.getItem('testKey')).toBeNull();
    });
  });

  describe('safeClear', () => {
    test('should clear all sessionStorage', () => {
      safeSetItem('key1', 'value1');
      safeSetItem('key2', 'value2');
      
      const success = safeClear();
      
      expect(success).toBe(true);
      expect(mockSessionStorage.getItem('key1')).toBeNull();
      expect(mockSessionStorage.getItem('key2')).toBeNull();
    });
  });

  describe('STORAGE_KEYS', () => {
    test('should have all required keys', () => {
      expect(STORAGE_KEYS.USAGE_DATA).toBe('usageData');
      expect(STORAGE_KEYS.PREFERENCES).toBe('preferences');
      expect(STORAGE_KEYS.STATE).toBe('state');
      expect(STORAGE_KEYS.CURRENT_PLAN).toBe('currentPlan');
    });
  });
});

