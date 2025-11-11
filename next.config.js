const { config } = require('dotenv');
const { expand } = require('dotenv-expand');

// Load .env.local first (highest priority)
const myEnv = config({ path: '.env.local' });
expand(myEnv);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;

