import type { NextConfig } from "next";
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

// Explicitly load .env.local
const myEnv = config({ path: '.env.local' });
expand(myEnv);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
