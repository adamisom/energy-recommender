import { createBrowserClient } from '@supabase/ssr';
import { config } from '@/lib/config';

/**
 * Client-side Supabase client for authentication
 * Safe to use in browser/client components
 */
export function createClient() {
  const supabaseUrl = config.supabase.url();
  const supabaseAnonKey = config.supabase.anonKey();

  // Debug logging
  console.log('🔍 Supabase URL:', supabaseUrl ? 'SET ✓' : 'MISSING ✗');
  console.log('🔍 Supabase Anon Key:', supabaseAnonKey ? 'SET ✓' : 'MISSING ✗');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase not configured - check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    // Return null if Supabase not configured (allows anonymous usage)
    return null;
  }

  console.log('✅ Supabase client created successfully');
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

