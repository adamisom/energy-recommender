# ⚡ Energy Plan Recommender

AI-powered energy plan recommendations based on your usage patterns and preferences. Get personalized recommendations from Claude 3.5 Sonnet in under 2 seconds.

## 🚀 Features

- **🤖 AI-Powered Insights** - Personalized explanations from Claude 3.5 Sonnet
- **📊 Smart Usage Analysis** - Detects your usage patterns (summer peak, winter peak, flat)
- **💰 Cost Optimization** - Finds the cheapest plans based on your actual usage
- **🌱 Renewable Energy** - Filter by renewable energy percentage
- **🔐 Hybrid Auth** - Use anonymously or sign in to save your data
- **⚡ Lightning Fast** - Recommendations in 1-2 seconds

## 📋 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)
- Anthropic API key (for AI explanations)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd energy-recommender

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Set up database
npx prisma db push
npm run seed

# Start development server
npm run dev
```

Visit http://localhost:3000 🎉

## 🧪 Testing

```bash
# Run all tests (44 tests)
npm test

# Run lint
npm run lint

# Build for production
npm run build
```

**Current Status:** ✅ All tests passing (44/44)

## 🏗️ Tech Stack

- **Frontend:** Next.js 16, React 19, TailwindCSS 4, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** Supabase (PostgreSQL)
- **AI:** Anthropic Claude 3.5 Sonnet
- **Auth:** Supabase Auth (optional)
- **Testing:** Jest (44 unit tests)
- **Deployment:** Vercel (ready)

## 📚 Documentation

Comprehensive documentation in `/docs/`:
- `Implementation_PRD.md` - Complete implementation guide (3,333 lines)
- `Architecture.md` - System architecture & data flows
- `Implementation_Tasks.md` - Step-by-step tasks
- `PROJECT_STATUS.md` - Current status & metrics
- `IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `REFACTORING_AND_AUTH_COMPLETE.md` - Refactoring details

## 🎯 Usage Flow

1. **Enter Usage Data** - Manual entry or CSV upload (12 months)
2. **Set Preferences** - State, priority (cost/renewable/flexibility/balanced), filters
3. **Get Recommendations** - AI-powered top 3 plans with explanations
4. **View Details** - Complete plan information and cost breakdown

## 🔐 Authentication

**Anonymous Mode (Default):**
- No signup required
- Data stored in sessionStorage
- Full functionality

**Authenticated Mode (Optional):**
- Sign up with email/password
- Data persists in database
- Cross-device sync
- Recommendation history

SessionStorage automatically cleared on login/logout.

## 📊 Project Stats

- **62 files** created
- **~5,600 lines** of code
- **44 unit tests** (100% passing)
- **23 energy plans** seeded
- **5 frontend pages**
- **5 API routes**
- **0 lint/build/test errors**

## 🔧 Environment Variables

```bash
# Required for AI explanations
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Required for database
DATABASE_URL=postgresql://...

# Optional for authentication
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional feature flags
ENABLE_SEASONAL_SCORING=false
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run Jest tests (44 tests)
npm run type-check   # TypeScript validation
npm run seed         # Seed database with plans
```

## 🚀 Deployment

Ready for Vercel deployment:

```bash
vercel --prod
```

Configure environment variables in Vercel dashboard, then deploy.

## 📄 License

MIT

## 🤝 Contributing

This is an MVP implementation. See `docs/Implementation_PRD.md` for future enhancements.

---

**Status:** ✅ Production-ready with 0 errors, 44 passing tests, and hybrid authentication!
