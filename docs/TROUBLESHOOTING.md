# Troubleshooting Guide

**Last Updated:** November 11, 2025

This document covers known issues and their solutions.

---

## 🚨 CRITICAL: Next.js 16 Not Loading `NEXT_PUBLIC_*` Environment Variables

### Symptoms

- Supabase auth shows "Authentication not configured" error
- Browser console shows:
  ```
  🔍 Supabase URL: MISSING ✗
  🔍 Supabase Anon Key: MISSING ✗
  ❌ Supabase not configured - check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
  ```
- Variables ARE present in `.env.local` file
- Server-side env vars (like `DATABASE_URL`, `ANTHROPIC_API_KEY`) work fine
- Only `NEXT_PUBLIC_*` variables fail to load in the browser

### Root Cause

**Next.js 16 with TypeScript config** has a bug where `NEXT_PUBLIC_*` environment variables in `.env.local` are not being injected into the browser bundle, despite being documented as working automatically.

### What We Tried (That DIDN'T Work)

1. ❌ Clearing `.next` cache: `rm -rf .next`
2. ❌ Killing and restarting dev server
3. ❌ Hard browser refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. ❌ Adding env vars to `next.config.ts` env object
5. ❌ Installing `dotenv` and explicitly loading `.env.local` in `next.config.ts`
6. ❌ Checking for syntax errors in `.env.local` (format was correct)

### Verified Working Configuration

**File: `.env.local`**
```bash
# These work fine (server-side)
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...

# These DON'T load in browser (the bug)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**File: `next.config.ts`** (attempted fix - didn't work)
```typescript
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
```

---

## ✅ Workaround Solutions

### Option 1: Hardcode Values in next.config.ts (Quick Fix)

**TEMPORARY SOLUTION - DO NOT COMMIT TO GIT**

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // TEMPORARY: Hardcode until Next.js bug is fixed
    NEXT_PUBLIC_SUPABASE_URL: 'https://zoxagfejtajrpvlzdkwt.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpveGFnZmVqdGFqcnB2bHpka3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODM3MjMsImV4cCI6MjA3ODQ1OTcyM30.cLX47r14IbIseZdpJVbrePEyaHNnjC9RjK-nVGD_Vdg',
  },
};

export default nextConfig;
```

**WARNING:** 
- Don't commit this to git (secrets exposed)
- Add `next.config.ts` to `.gitignore` if using this approach
- Only for local development

### Option 2: Skip Auth for Now (Recommended)

Auth is **optional** for MVP. The app works perfectly without it:

**What works without auth:**
- ✅ Full recommendation flow
- ✅ Usage data (stored in sessionStorage)
- ✅ Preferences
- ✅ AI explanations
- ✅ All features

**What doesn't work without auth:**
- ❌ Cross-device sync
- ❌ Recommendation history
- ❌ Usage data persistence (just implemented in Item #1)

**To disable auth features:**
1. Don't click "Sign In" button
2. Use app anonymously
3. Test all core features (usage → preferences → recommendations)

### Option 3: Convert next.config.ts to next.config.js

Next.js may have better env var support with `.js` config:

```bash
# Backup current config
mv next.config.ts next.config.ts.backup

# Create new .js config
cat > next.config.js << 'EOF'
require('dotenv').config({ path: '.env.local' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;
EOF
```

Then:
```bash
rm -rf .next
npm run dev
```

### Option 4: Use Environment Variables at Runtime (Advanced)

Instead of build-time injection, fetch from a config endpoint:

```typescript
// app/api/config/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
```

Then fetch client-side. **Downside:** Extra network request.

---

## 🔍 Debugging Steps

### 1. Verify .env.local Exists and Is Correct

```bash
cd /Users/adamisom/Desktop/energy-recommender
cat .env.local | grep NEXT_PUBLIC_SUPABASE
```

Should show both variables (values will be hidden for security).

### 2. Check Node.js Can Read the File

```bash
node -r dotenv/config -e "console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

If this shows `undefined`, the file isn't being loaded by Node.

### 3. Check Browser Console

Open Dev Tools (F12) → Console tab, look for:
```
🔍 Supabase URL: SET ✓ or MISSING ✗
🔍 Supabase Anon Key: SET ✓ or MISSING ✗
```

### 4. Check Build-Time Injection

```bash
npm run build
# Look for NEXT_PUBLIC_ vars in output
grep -r "NEXT_PUBLIC_SUPABASE_URL" .next/static/chunks/ | head -1
```

If empty, vars aren't being injected.

---

## 📋 Checklist Before Asking for Help

- [ ] Variables are in `.env.local` (NOT `.env`)
- [ ] No syntax errors (no spaces around `=`, no quotes unless needed)
- [ ] Dev server fully stopped and restarted
- [ ] `.next` cache cleared (`rm -rf .next`)
- [ ] Browser hard-refreshed (Cmd+Shift+R / Ctrl+Shift+R)
- [ ] `dotenv` package installed (`npm install dotenv dotenv-expand`)
- [ ] Tried converting `next.config.ts` → `next.config.js`

---

## 🐛 Known Issues

### Issue: "Authentication not configured" despite correct .env.local

**Status:** OPEN  
**Affects:** Next.js 16.0.1 with TypeScript config  
**Workaround:** Use Option 2 (skip auth) or Option 3 (convert to .js)  

### Issue: Claude API 404 - Model not found

**Status:** FIXED  
**Solution:** Updated model name to `claude-sonnet-4-5-20250929`  
**Files:** `lib/anthropic/client.ts`, `lib/constants.ts`

### Issue: 429 Too Many Requests immediately on /recommendations

**Status:** FIXED  
**Root Cause:** Infinite loop - `saveRecommendation` function not memoized  
**Solution:** Wrapped in `useCallback` in `lib/hooks/use-hybrid-storage.ts`

---

## 📞 Getting Help

1. Check this troubleshooting guide first
2. Search `docs/` for related issues
3. Check browser console for errors
4. Check server logs (`npm run dev` output)
5. Try the app anonymously (without auth) to isolate the issue

---

## 🔄 Environment Variable Loading Order

Next.js loads env files in this order (later overrides earlier):

1. `.env` - All environments
2. `.env.local` - Local overrides (gitignored)
3. `.env.[mode]` - Environment-specific (e.g., `.env.production`)
4. `.env.[mode].local` - Local environment-specific

**Current Setup:**
- `.env` - Contains all vars (shouldn't be here, but works)
- `.env.local` - Contains all vars (correct location)

**Recommendation:** Move everything to `.env.local` and delete `.env`.

---

## 🔐 Security Reminders

- ✅ `.env.local` is in `.gitignore`
- ✅ Never commit API keys or secrets
- ✅ `NEXT_PUBLIC_*` vars are PUBLIC (visible in browser source)
- ⚠️ Only use `NEXT_PUBLIC_*` for truly public data (like Supabase URL)
- ⚠️ Server-side secrets (like `ANTHROPIC_API_KEY`) should NEVER have `NEXT_PUBLIC_` prefix

---

**Last Resort:** If nothing works, consider filing a Next.js bug report with:
- Next.js version: 16.0.1
- Node version: (check with `node -v`)
- OS: macOS
- Config type: TypeScript (`next.config.ts`)
- Issue: `NEXT_PUBLIC_*` env vars not injected into browser bundle

