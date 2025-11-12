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

```bash
# 1. Clone and install
git clone <your-repo-url>
cd energy-recommender
npm install

# 2. Set up environment variables (see docs/DEVELOPER_SETUP.md for details)
# - Get Supabase database URL (via Connect button in Supabase dashboard)
# - Get Anthropic API key from console.anthropic.com
# - Add both to .env.local

# 3. Initialize database
npx prisma db push
npm run seed

# 4. Start development server
npm run dev
```

Visit http://localhost:3000 🎉

> **First time setup?** See [docs/DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md) for detailed step-by-step instructions with screenshots and troubleshooting.

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
- **`DEVELOPER_SETUP.md`** - Complete setup guide with Supabase & API credentials
- **`DEPLOYMENT_PLAN.md`** - Step-by-step Vercel deployment guide with verification checklist
- **`MANUAL_TESTING_GUIDE.md`** - Smoke tests and feature testing
- `Implementation_PRD.md` - Complete implementation guide (3,333 lines)
- `Architecture.md` - System architecture & data flows
- `Implementation_Tasks.md` - Step-by-step tasks
- `PROJECT_STATUS.md` - Current status & metrics

## 🔮 Future Work

### Data & Content
- **Plan Catalog Expansion** - Expand beyond current 23 plans to 50+ plans across all supported states
- **Provider Contact Funnel** - Create contact email/form for energy providers to submit their own plan data directly

### Technical Infrastructure
- **API Pagination** - Add pagination to `/api/plans` endpoint for better performance as catalog grows
- **Error Monitoring** - Integrate Sentry for production error tracking and alerting
- **Security Enhancements** - Add CAPTCHA on sign-up, email verification, and password reset flow
- **Accessibility** - Run Lighthouse audit, add ARIA labels, improve keyboard navigation, and verify color contrast

### Features
- **Mobile App** - React Native mobile app with push notifications and geolocation-based state detection
- **Enhanced AI Explanations** - Personalized insights based on usage patterns, "why not this plan?" explanations for lower-ranked options
- **Usage Pattern Analysis** - Usage trend visualization (12-month chart), peak usage alerts, seasonal pattern detection improvements, cost forecasting, and comparison to similar households
- **Multi-State Comparison** - "What if I move to [other state]?" analysis for users considering relocation

### Analytics & Business Intelligence
- **Recommendation Analytics** - Track which plans are recommended most frequently
- **User Behavior Tracking** - Monitor user flows, drop-off points, and feature usage
- **A/B Testing Infrastructure** - Framework for testing different recommendation algorithms and UI variations

## 🎯 Usage Flow

1. **Enter Usage Data** - Manual entry or CSV upload (12 months)
2. **Set Preferences** - State, priority (cost/renewable/flexibility/balanced), filters
3. **Get Recommendations** - AI-powered top 5 plans with explanations
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

Ready for Vercel deployment! See **[docs/DEPLOYMENT_PLAN.md](docs/DEPLOYMENT_PLAN.md)** for complete step-by-step instructions including:
- Pre-deployment checklist
- Environment variable configuration
- Deployment steps
- Post-deployment verification
- Troubleshooting guide

Quick start:
```bash
vercel --prod
```

## 📄 License

MIT

## 🤝 Contributing

This is an MVP implementation. See the [Future Work](#-future-work) section above for post-MVP enhancements.

---

**Status:** ✅ Production-ready with 0 errors, 44 passing tests, and hybrid authentication!
