import { createBrowserClient } from '@supabase/ssr';
import { config } from '@/lib/config';

/**
 * Client-side Supabase client for authentication
 * Safe to use in browser/client components
 */
export function createClient() {
  const supabaseUrl = config.supabase.url();
  const supabaseAnonKey = config.supabase.anonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return null if Supabase not configured (allows anonymous usage)
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton instance
let clientInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

