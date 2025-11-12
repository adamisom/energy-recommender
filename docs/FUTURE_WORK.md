# Future Work & Post-MVP Enhancements

**Last Updated:** November 11, 2025  
**Status:** MVP Complete - These are non-blocking improvements for future iterations

This document consolidates all post-MVP enhancements, known limitations, and future work items across the project.

---

## 🚨 High Priority (Technical Debt)

### 1. ✅ Usage Data Persistence - COMPLETED

**Status:** Implemented Option A with enhanced UX (Nov 11, 2025)

**Implementation:**
- ✅ Usage data auto-fetched when logged-in user visits `/usage` page
- ✅ Blue notification card with user controls:
  - Download CSV button (generates `my-usage-data.csv`)
  - Pre-fill form button (populates all 12 inputs)
- ✅ Auto-save to database when user continues to preferences
- ✅ All infrastructure now actively used

**Files Modified:**
- `app/usage/page.tsx` (+90 lines - fetch, download, pre-fill, save logic)

**User Experience:**
- Anonymous: Works as before (sessionStorage only)  
- Logged-in (first visit): Data saved automatically
- Logged-in (returning): See saved data card with download/pre-fill options

---

## 🔧 Production Readiness

### 2. ✅ Rate Limiting - In-Memory Store Limitation - COMPLETED

**Status:** Implemented Vercel KV for distributed rate limiting (Nov 11, 2025)

**Implementation:**
- ✅ Updated `lib/rate-limit.ts` to use Vercel KV for production
- ✅ Falls back to in-memory store for local development (when KV not configured)
- ✅ Updated API route to use async rate limiting
- ✅ Updated tests to handle async and mock Vercel KV
- ✅ Added Vercel KV setup instructions to `DEPLOYMENT_PLAN.md`

**How it works:**
- Production (Vercel): Uses Vercel KV for distributed rate limiting across serverless instances
- Local Development: Falls back to in-memory Map when KV environment variables are not set
- Automatic detection: Checks for `KV_URL` or `KV_REST_API_URL` + `KV_REST_API_TOKEN`

**Setup Required:**
1. Create Vercel KV database in Vercel dashboard
2. Environment variables are automatically added by Vercel
3. Rate limiting works seamlessly across all serverless instances

**Files Modified:**
- `lib/rate-limit.ts` - Added Vercel KV support with fallback
- `app/api/recommendations/route.ts` - Updated to await async rate limit check
- `__tests__/utils/rate-limit.test.ts` - Updated tests for async, added KV mock
- `docs/DEPLOYMENT_PLAN.md` - Added Vercel KV setup instructions
- `package.json` - Added `@vercel/kv` dependency

---

### 3. ✅ Explanation Cache - No LRU Eviction - COMPLETED

**Status:** Implemented LRU cache and verified LLM explanation feature (Nov 11, 2025)

**Implementation:**
- ✅ Reduced cache size from 1000 to 100 entries for MVP
- ✅ Replaced Map with `lru-cache` library for proper LRU eviction
- ✅ Added comments explaining cache size and purpose
- ✅ Fixed LLM explanation validation (AI was generating explanations that were too long)
- ✅ Updated prompt to request explanations under 400 characters
- ✅ Created test script (`npm run test:explanations`) to verify LLM feature works

**How it works:**
- LRU cache automatically evicts least recently used entries when max size (100) is reached
- Each cache entry = one plan recommendation explanation (plan + rank + priority combination)
- Cache key format: `{state}-{planId}-{rank}-{priority}`

**Files Modified:**
- `lib/constants.ts` - Reduced cache size to 100, added comments
- `lib/anthropic/explanations.ts` - Implemented LRU cache, fixed validation, improved prompt
- `package.json` - Added `lru-cache` dependency and `test:explanations` script
- `scripts/test-explanations.ts` - New test script to verify LLM feature

---

## 📊 Data Quality Improvements

### 4. ✅ CSV Parser - Basic Implementation - COMPLETED

**Status:** Implemented papaparse for robust CSV parsing (Nov 11, 2025)

**Implementation:**
- ✅ Replaced simple split-based parser with papaparse library
- ✅ Handles quoted fields automatically
- ✅ Auto-detects delimiters (comma, tab, etc.)
- ✅ Skips empty lines
- ✅ Better error messages with specific counts
- ✅ Handles CSV files with headers (filters out non-numeric header values)
- ✅ Added comprehensive test suite (12 tests covering edge cases)

**Benefits:**
- More robust parsing (handles quoted fields, various delimiters)
- Better error messages (shows how many values were found)
- Handles edge cases (whitespace, decimals, extra values)
- No performance impact for small files (12 values)

**Files Modified:**
- `app/usage/page.tsx` - Updated CSV parsing to use papaparse
- `__tests__/utils/csv-parser.test.ts` - New comprehensive test suite
- `package.json` - Added papaparse and @types/papaparse dependencies

---

### 5. Plan Catalog Expansion - WILL REVISIT

**Current State:** 23 manually seeded plans (mostly Texas)

**Status:** Will revisit post-MVP. Current plan count is sufficient for MVP testing and demonstration.

**Post-MVP Options:**

**Option A: Manual Curation** (Recommended for accuracy)
- Continue adding plans manually
- Target: 50+ plans across all 4 states
- Ensures data quality

**Option B: Build Scraper**
- Create `scripts/scrape-powertochoose.ts`
- Automate plan data extraction from PowerToChoose.org
- Requires manual review before seeding
- **Warning:** Scraping may violate ToS - verify first

**Reference:** Implementation PRD Section 3093-3175 (Scraper implementation guide)

---

## 🔐 Authentication Enhancements

### 6. Recommendation History UI

**Current State:**
- Recommendations are auto-saved for logged-in users ✅
- API endpoint exists: `GET /api/user/recommendations` ✅
- No UI to view recommendation history ❌

**Post-MVP:**
- Create `/recommendations/history` page
- Show last 10 recommendations
- Allow filtering by date, state
- Compare recommendations side-by-side

**Value:** Helps users track how recommendations change over time

---

### 7. User Profile & Preferences Persistence

**Current State:**
- Preferences only saved in sessionStorage
- Lost when browser closes

**Post-MVP:**
- Save user preferences to database (new `UserPreferences` table)
- Remember favorite filters
- Default state selection based on past usage
- "My saved plans" feature

---

## ⚡ Performance & Scaling

### 8. Cost Calculation - TOU/Variable Estimates

**Issue:** Time-of-Use (TOU) and variable rate cost calculations use simplified estimates.

**Current Assumption:**
```typescript
// lib/scoring/cost-calculator.ts
// TOU: 40% on-peak, 60% off-peak split (rough estimate)
// Variable: Uses current rate + 10% buffer
```

**Post-MVP Improvement:**
- Use actual hour-by-hour usage data (if available)
- Better seasonal modeling for variable rates
- Historical rate data for more accurate projections

**Reference:** Implementation PRD Section 3061 (Known Limitation #6)

---

### 9. Database Pagination

**Issue:** `/api/plans` endpoint returns all plans (no pagination).

**Current Impact:** Low - only 20-50 plans expected
**Future Impact:** High - if scaling to 500+ plans

**Post-MVP:**
- Add pagination query params (`?page=1&limit=20`)
- Implement cursor-based pagination
- Add total count to response

**Reference:** Implementation PRD Section 3063 (Known Limitation #8)

---

### 10. Caching Strategy

**Current State:** Only LLM responses cached (in-memory)

**Post-MVP Caching Opportunities:**

**Redis Integration:**
- Distributed rate limiting (shared across serverless instances)
- LLM response cache (shared across instances)
- Plan catalog cache (reduce DB queries)
- User session cache

**CDN/Edge Caching:**
- Static plan data
- Pre-generated recommendations for common usage patterns

**Reference:** Architecture.md Section 1742 (Post-MVP caching)

---

## 🧪 Testing & Monitoring

### 11. Comprehensive Test Coverage

**Current Coverage:**
- ✅ Unit tests for scoring logic (6 test files, 44 tests passing)
- ❌ API route tests (no tests yet)
- ❌ E2E tests (no Playwright tests)
- ❌ Integration tests

**Post-MVP Testing:**
- Add API route tests (recommendations, plans, auth)
- Playwright E2E tests for critical user flows
- Visual regression tests
- Load testing

**Reference:** 
- PROJECT_STATUS.md lines 113-114
- Implementation_Tasks.md Phase 6

---

### 12. Error Monitoring & Logging

**Current State:** Only `console.error` for logging

**Post-MVP:**
- Add Sentry for error tracking
- Structured logging (Winston/Pino)
- Performance monitoring (APM)
- User analytics (optional)

**Reference:** Planning docs mention Sentry as first future work item

---

### 13. Accessibility Testing

**Post-MVP:**
- Run Lighthouse accessibility audit (target: ≥90 score)
- Add ARIA labels where missing
- Keyboard navigation testing
- Screen reader testing
- Color contrast verification

**Reference:** Implementation_Tasks.md Task 6.4

---

## 🌍 Feature Enhancements

### 14. Advanced Filtering & Search

**Current State:** Basic filter sliders in preferences

**Post-MVP Features:**
- Search plans by name/supplier
- "Compare Plans" side-by-side view
- "Hide seen plans" option
- Custom sorting options
- Plan favorites/bookmarks

---

### 15. Enhanced AI Explanations

**Current State:** 2-3 sentence generic explanations

**Post-MVP Improvements:**
- Personalized insights based on usage patterns
- "Why not this plan?" explanations for lower-ranked plans
- Cost breakdown visualizations
- Seasonal cost projections
- Risk analysis (variable rate volatility)

---

### 16. Usage Pattern Analysis

**Post-MVP Features:**
- Usage trend visualization (chart showing 12 months)
- Peak usage alerts
- Seasonal pattern detection improvements
- Cost forecasting
- Comparison to similar households

---

### 17. Multi-State Comparison

**Post-MVP Feature:**
- Allow users to compare plans across states (moving scenarios)
- "What if I move to Texas?" analysis

---

## 📱 Mobile & UX Improvements

### 18. Mobile App

**Post-MVP:**
- React Native mobile app
- Push notifications for new plans
- Geolocation for auto-state detection

---

### 19. Email Features

**Post-MVP:**
- Email recommendations to self
- Price alert subscriptions
- New plan notifications
- Monthly usage reminders

---

## 🔒 Security Hardening

### 20. Security Enhancements

**Post-MVP:**
- Rate limiting per user (not just per IP)
- CAPTCHA on sign-up
- Email verification
- Password reset flow
- Two-factor authentication (2FA)
- API key rotation
- Secrets management audit

---

## 📈 Analytics & Business Intelligence

### 21. Analytics Dashboard

**Post-MVP:**
- Usage analytics (popular states, avg usage patterns)
- Recommendation analytics (which plans recommended most)
- User behavior tracking
- A/B testing infrastructure
- Conversion tracking (plan sign-ups)

---

## 🛠️ Developer Experience

### 22. Development Tooling

**Post-MVP:**
- Storybook for component development
- API documentation (OpenAPI/Swagger)
- Database seeding from real data sources
- Local development improvements (Docker?)
- Pre-commit hooks
- Automated dependency updates (Dependabot)

---

## 📝 Documentation

### 23. Documentation Gaps

**Post-MVP:**
- API documentation
- Component documentation
- Architecture decision records (ADRs)
- Deployment runbook
- Incident response playbook
- Contributing guide

---

## Decision Log

| Item | Decision | Date | Notes |
|------|----------|------|-------|
| Usage Data Persistence | Option A - Implemented | Nov 11, 2025 | Auto-fetch, download, pre-fill features added (#1) ✅ |
| Rate Limiting | Depends on deployment | TBD | Only needed for serverless (#2) |
| CSV Parser | Keep simple for now | Nov 11, 2025 | Good enough for MVP |

---

## Priority Matrix

### Must-Fix Before Production:
- #2 Rate limiting (only if deploying to serverless - otherwise current implementation works)
- #1 Usage data persistence (decide & implement OR delete) ✅ COMPLETED

### High Value, Low Effort:
- #6 Recommendation history UI
- #4 Better CSV parser (papaparse)
- #14 Search plans feature

### High Value, High Effort:
- #11 Comprehensive testing
- #12 Sentry integration
- #8 Better TOU/variable cost modeling

### Low Priority (Nice-to-Have):
- #18 Mobile app
- #17 Multi-state comparison
- #21 Analytics dashboard

---

## How to Use This Document

1. **Before Production:** Review "Must-Fix Before Production" section
2. **Sprint Planning:** Pull items from priority matrix based on capacity
3. **New Ideas:** Add to appropriate section with context
4. **Completed Items:** Move to PROJECT_STATUS.md or archive here

---

**Note:** This is a living document. Update as priorities change or new technical debt is discovered.

