# Developer Setup Guide

Complete step-by-step guide for setting up the Energy Plan Recommender development environment.

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - For version control
- **A code editor** - VS Code recommended
- **Supabase account** - [Sign up free](https://supabase.com)
- **Anthropic API account** - [Get API key](https://console.anthropic.com/)

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd energy-recommender

# Install dependencies (this will take a minute)
npm install
```

---

## Step 2: Set Up Supabase Database

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Choose your organization
5. Fill in:
   - **Name:** Energy Plan Recommender (or whatever you prefer)
   - **Database Password:** Choose a strong password **and save it!**
   - **Region:** Choose closest to you (e.g., US East)
6. Click **"Create new project"** (takes ~2 minutes to provision)

### 2.2 Get Your Database Connection String

**Important: Use Session Mode Connection Pooling**

For this project (using Prisma with Next.js), you need the **Session Mode pooler connection string**:

✅ **Why Session Mode?**
- Works for both local development (persistent) AND Vercel deployment (serverless)
- Supports both IPv4 and IPv6
- Compatible with Prisma (supports prepared statements)
- Better performance than Transaction mode for this use case

❌ **Don't use Transaction Mode** - it doesn't support prepared statements, which Prisma uses by default.

**Getting the Connection String:**

1. In your Supabase project dashboard, look for the **"Connect"** button in the top navigation bar (about 2/3 from left, near the right side)
2. Click **"Connect"**
3. Select the **"Connection String"** tab
4. Set the following dropdowns:
   - **Type:** URI
   - **Source:** Primary Database
   - **Method:** **Session Mode** (or "Pooler Session Mode")
5. Copy the connection string that appears
6. Replace `[YOUR-PASSWORD]` with your actual database password

Your **Session Mode** connection string should look like:
```
postgres://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

> **Note the port `:5432`** - Session mode uses port 5432. Transaction mode uses 6543. Direct connection also uses 5432 but without the pooler subdomain.
>
> **Reference:** [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres)

### 2.3 Get API Keys (Optional - for Auth)

If you want to enable user authentication:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** - `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key - The long JWT token (safe for client-side)

> **Note:** The app works perfectly fine **without** auth (anonymous mode). You can skip the API keys if you just want to test the recommendation engine.

### 2.4 Configure Authentication Settings (Optional - for Auth)

If you're using authentication, configure these settings in your Supabase dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`
3. Add **Redirect URLs**:
   - `http://localhost:3000/**` (for development)
   - Add your production URL when deploying (e.g., `https://yourdomain.com/**`)

**Development Tip:** For easier testing during development, you can disable email confirmation:

1. Go to **Authentication** → **Settings** → **Email Auth**
2. Toggle **"Enable email confirmations"** to **OFF**
3. This allows users to sign up and immediately sign in without checking their email

> **Note:** Keep email confirmations **ON** in production for security. Only disable for local development.

---

## Step 3: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys** (or Settings → API Keys)
4. Click **"Create Key"**
5. Name it (e.g., "Energy Recommender Dev")
6. Copy the key immediately (starts with `sk-ant-`)
7. **Save it securely** - you won't see it again!

> **Cost:** Claude 3.5 Sonnet costs ~$0.003 per recommendation (3 explanations). The free tier credits are plenty for development and testing.

---

## Step 4: Configure Environment Variables

### 4.1 Create `.env.local`

The `.env.local` file should already exist in the project root. Edit it:

```bash
# Open in your editor
code .env.local  # VS Code
# or
nano .env.local  # Terminal editor
```

### 4.2 Fill in Your Credentials

**Minimum Required (No Auth):**
```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
DATABASE_URL="postgres://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

**Full Setup (With Auth):**
```bash
# =============================================================================
# Anthropic API (REQUIRED)
# =============================================================================
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# =============================================================================
# Database (REQUIRED - Use Session Mode pooler)
# =============================================================================
DATABASE_URL="postgres://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# =============================================================================
# Supabase Authentication (OPTIONAL)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =============================================================================
# Feature Flags (OPTIONAL)
# =============================================================================
# ENABLE_SEASONAL_SCORING=true
```

> **Important:** Never commit `.env.local` to git! It's already in `.gitignore`.

---

## Step 5: Initialize Database

Now that your environment is configured, set up the database schema and seed data:

```bash
# Push the Prisma schema to your Supabase database
# This creates the tables (Plan, User, SavedUsageData, SavedRecommendation)
npx prisma db push

# Seed the database with 23 sample energy plans
npm run seed
```

Expected output:
```
✅ Database schema pushed successfully
✅ Seeded 23 energy plans
```

---

## Step 6: Start Development Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

Visit **http://localhost:3000** in your browser! 🎉

---

## Step 7: Verify Setup (Smoke Test)

Follow the smoke test in `docs/MANUAL_TESTING_GUIDE.md`:

1. **Landing page** loads (http://localhost:3000)
2. Click **"Get Started"**
3. Enter usage data or upload CSV
4. Set preferences
5. Generate recommendations
6. Verify AI explanations appear

If you see 3 recommendations with personalized explanations, you're all set! ✅

---

## Troubleshooting

### Database Connection Errors

```
Error: P1001: Can't reach database server at ...
```

**Fix:**
- Double-check your `DATABASE_URL` in `.env.local`
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Verify your Supabase project is running (green status in dashboard)
- Check for typos in the connection string

### Anthropic API Errors

```
Error: ANTHROPIC_API_KEY environment variable is required
```

**Fix:**
- Make sure `.env.local` exists in the project root
- Check that `ANTHROPIC_API_KEY` is set correctly (starts with `sk-ant-`)
- Restart your dev server after changing `.env.local`

### Prisma Errors

```
Error: P1003: Database does not exist
```

**Fix:**
- Your connection string might be pointing to a non-existent database
- Double-check you copied the full connection string from Supabase
- Try running `npx prisma db push` again

### Port Already in Use

```
Error: Port 3000 is already in use
```

**Fix:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

---

## Development Workflow

### Daily Development

```bash
# Start dev server
npm run dev

# In another terminal, run tests in watch mode (optional)
npm test -- --watch

# Run linter
npm run lint

# Type checking
npm run type-check
```

### Before Committing

```bash
# Run all checks (per memory.md workflow)
npm run lint
npm run build
npm test
```

### Database Changes

If you modify `prisma/schema.prisma`:

```bash
# Push changes to database
npx prisma db push

# Regenerate Prisma Client types
npx prisma generate

# View your data in Prisma Studio (optional)
npx prisma studio
```

---

## IDE Setup (VS Code)

### Recommended Extensions

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **Prisma** (official)
- **ESLint**
- **Prettier** (optional, project uses built-in formatting)

### Workspace Settings

Create `.vscode/settings.json` (optional):

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

---

## Environment Variables Reference

| Variable | Required | Purpose | Where to Get |
|----------|----------|---------|--------------|
| `ANTHROPIC_API_KEY` | ✅ Yes | AI explanations | [console.anthropic.com](https://console.anthropic.com/) |
| `DATABASE_URL` | ✅ Yes | Database connection | Supabase → Settings → Database |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ Optional | Auth (client-side) | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ Optional | Auth (client-side) | Supabase → Settings → API |
| `ENABLE_SEASONAL_SCORING` | ❌ Optional | Feature flag | Set to `true` to enable |

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep `ANTHROPIC_API_KEY` and `DATABASE_URL` server-side only (no prefix).

---

## Next Steps

1. **Run smoke tests** - See `docs/MANUAL_TESTING_GUIDE.md`
2. **Review architecture** - See `docs/Architecture.md`
3. **Check project status** - See `docs/PROJECT_STATUS.md`
4. **Read implementation details** - See `docs/Implementation_PRD.md`

---

## Production Deployment

When ready to deploy:

1. **Same Supabase project** - You can use the same database for production (or create a separate "prod" project)
2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```
3. **Set environment variables** in Vercel dashboard (same as `.env.local`)
4. **Test in production** before sharing publicly

See `README.md` for deployment details.

---

**Happy coding! 🚀**

If you encounter issues not covered here, check `docs/Implementation_PRD.md` or the inline code comments.

