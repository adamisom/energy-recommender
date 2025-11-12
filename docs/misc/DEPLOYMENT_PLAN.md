# Vercel Deployment Plan

**Status:** Ready for Production Deployment  
**Target Platform:** Vercel (Serverless)

---

## 📋 Pre-Deployment Checklist

### Code Readiness
- [ ] All changes committed to git
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds locally
- [ ] No console errors in development

### Environment Variables (from `.env.local`)
**Required:**
- [ ] `ANTHROPIC_API_KEY` - Anthropic API key
- [ ] `DATABASE_URL` - Supabase PostgreSQL connection string

**Optional (if using auth):**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Only if using admin operations

**Optional:**
- [ ] `ENABLE_SEASONAL_SCORING` - Set to `true` to enable

**For Rate Limiting (Vercel KV):**
- [ ] `KV_URL` - Vercel KV connection URL (or use `KV_REST_API_URL` + `KV_REST_API_TOKEN`)
- [ ] `KV_REST_API_URL` - Vercel KV REST API URL (alternative to `KV_URL`)
- [ ] `KV_REST_API_TOKEN` - Vercel KV REST API token (required if using REST API)

### Supabase Configuration
- [ ] Database migrated (`npx prisma migrate deploy` if needed)
- [ ] Plan data seeded (`npm run seed` if needed)
- [ ] If using auth: Site URL and Redirect URLs configured in Supabase dashboard

### Git Repository
- [ ] Repository pushed to GitHub/GitLab/Bitbucket
- [ ] Main branch up to date

---

## 🚀 Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
# Or use: npx vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project (First Time Only)

```bash
vercel
```

Follow prompts:
- Set up and deploy? → **Yes**
- Link to existing project? → **No** (first time)
- Project name? → `energy-recommender`
- Directory? → `./`
- Override settings? → **No**

### 4. Configure Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click project → **Settings** → **Environment Variables**
3. Add each variable:
   - **Value:** From your `.env.local`
   - **Environment:** Production, Preview, Development (all three)
   - Click **Save**

**Required Variables:**
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `DATABASE_URL` - Supabase PostgreSQL connection string

**Required for Auth (if using):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (from Supabase dashboard → Settings → API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (from Supabase dashboard → Settings → API)

**For Rate Limiting (Vercel KV):**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click project → **Storage** → **Create Database** → **KV**
3. Choose a name (e.g., `energy-recommender-kv`)
4. Select region closest to your users
5. After creation, go to **Settings** → **Environment Variables**
6. Vercel automatically adds:
   - `KV_URL` - Connection URL
   - `KV_REST_API_URL` - REST API URL
   - `KV_REST_API_TOKEN` - REST API token
7. Verify these are set for Production, Preview, and Development environments

> **Note:** Rate limiting will fall back to in-memory (local dev) if KV is not configured. For production, Vercel KV is required for distributed rate limiting across serverless instances.

> **Critical:** After adding `NEXT_PUBLIC_*` variables, you **MUST redeploy** because they're baked into the build at build time. Run `vercel --prod` again after adding them.

### 5. Deploy to Production

```bash
vercel --prod
```

This will build and deploy, giving you a production URL.

**Deployment URLs:**
- **Inspect:** https://vercel.com/adam-isoms-projects/energy-recommender/2v8wcSeCSMusqJ3Tz8hNyfmH7icD
- **Production:** https://energy-recommender.vercel.app

### 6. Production URL

**Production URL:** https://energy-recommender.vercel.app

This is your project's default domain and is automatically available. All deployments are accessible at this URL.

**To add a custom domain:**
1. Go to Vercel dashboard → Your project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `energy-recommender.com`)
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

---

## ✅ Post-Deployment Verification

### Basic Functionality
- [ ] Homepage loads without errors
- [ ] Usage page (`/usage`) - form works, CSV upload works
- [ ] Preferences page (`/preferences`) - sliders work
- [ ] Recommendations page (`/recommendations`) - generates successfully, shows top 3 plans
- [ ] Plan detail page (`/plan/[id]`) - displays plan information

### Authentication (if enabled)
- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Saved recommendations load for logged-in users

### API Endpoints
- [ ] `/api/plans` - Returns list of plans
- [ ] `/api/recommendations` - POST succeeds, returns recommendations
- [ ] `/api/user/recommendations` - GET/POST work (if logged in)
- [ ] `/api/user/usage` - GET/POST work (if logged in)

### Error Handling
- [ ] Invalid data shows error messages
- [ ] 404 pages work
- [ ] API errors handled gracefully

### Performance
- [ ] Initial page load < 3 seconds
- [ ] Recommendations generate < 10 seconds

---

## 🔧 Troubleshooting

### Build Fails

**"Missing environment variable"**
- Ensure all required variables are set in Vercel dashboard
- Check: Settings → Environment Variables

**"Module not found"**
- Run `npm install` locally to verify dependencies

### Runtime Errors

**"Database connection failed"**
- Verify `DATABASE_URL` is correct
- Ensure using Session Mode pooler (port 5432) for serverless

**"Anthropic API key invalid"**
- Verify `ANTHROPIC_API_KEY` is set correctly

**"Supabase auth not working"**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase dashboard → Settings → API
- Verify Site URL and Redirect URLs are configured

**`NEXT_PUBLIC_*` variables not working**
- Redeploy after adding variables: `vercel --prod`

### Rate Limiting

**Note:** Current rate limiting uses in-memory storage, which won't work correctly on Vercel serverless. This is documented in `FUTURE_WORK.md` item #2. For MVP, rate limiting is best-effort.

---

## 📊 Monitoring

### View Logs
1. Vercel dashboard → Project → **Logs** tab
2. View **Build Logs** and **Function Logs** from deployment

### Continuous Deployment
- Vercel automatically deploys on every push to main branch
- Preview deployments created for pull requests

---

## 🔐 Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] `NEXT_PUBLIC_*` variables don't contain secrets
- [ ] Database connection uses Session Mode pooler
- [ ] `.env.local` is in `.gitignore`

---

## 📝 Post-Deployment Tasks

- [ ] Update `PROJECT_STATUS.md` with deployment date
- [ ] Test full user flow in production
- [ ] Check error logs after 24 hours
- [ ] Monitor API usage (Anthropic costs)

---

## 🆘 Getting Help

1. **Vercel Logs** - Dashboard → Project → Logs
2. **Build Logs** - Dashboard → Project → Deployment → Build Logs
3. **Environment Variables** - Dashboard → Settings → Environment Variables
4. **Documentation:**
   - `docs/DEVELOPER_SETUP.md` - Local setup reference
   - `docs/FUTURE_WORK.md` - Known limitations

---

**Congratulations! 🎉 Your application is now live on Vercel!**

For future deployments, push to main branch or run `vercel --prod`.
