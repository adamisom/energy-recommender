# AI Energy Plan Recommendation Agent - Implementation PRD

## Executive Summary

The AI Energy Plan Recommendation Agent is a **full-stack Next.js web application** that analyzes individual customer usage patterns, preferences, and existing energy plans to recommend the top three optimal energy plans in deregulated energy markets. Users interact through an intuitive web interface to upload usage data, set preferences, and receive personalized recommendations with clear explanations.

Built with Next.js, this is a **single codebase** containing both frontend UI and backend API routes, dramatically simplifying development and deployment compared to traditional separate backend/frontend architectures.

**Key Value Propositions:**
- Simplifies plan selection by reducing 50+ options to top 3 personalized recommendations
- Provides clear, explainable reasoning for each recommendation  
- Targets 20% uplift in plan sign-ups through reduced decision paralysis
- Decreases support inquiries by 30% through transparent recommendation logic
- **Single-language full-stack** (TypeScript everywhere)
- **One-click deployment** to Vercel

---

## Problem Statement

Customers in deregulated energy markets face overwhelming complexity when selecting energy plans:
- 50-100+ supplier options per market with complex rate structures
- Hidden fees and confusing contract terms
- Variable pricing (fixed, variable, indexed, time-of-use)
- Unclear renewable energy options and certifications
- Difficulty projecting actual costs based on personal usage patterns

This agent provides personalized, explainable recommendations that align with customer priorities (cost savings, contract flexibility, renewable energy preference, supplier ratings).

---

## Goals & Success Metrics

### Primary Goals
- **Increase Conversion Rates**: 20% uplift in plan sign-ups
- **Enhance Customer Satisfaction**: +10 point NPS increase
- **Reduce Support Burden**: 30% decrease in plan selection inquiries
- **User Engagement**: 15% increase in tool interaction time

### Technical Goals
- **Performance**: <2 second recommendation generation
- **Accuracy**: 90%+ user satisfaction with top recommendation
- **Explainability**: 85%+ users understand why plans were recommended
- **Data Quality**: Handle incomplete data gracefully with confidence scoring

---

## Target Users & Personas

### Primary: Residential Energy Consumers
**Demographics:** Homeowners and renters in deregulated markets (TX, PA, OH, IL, etc.)

**Pain Points:**
- Overwhelmed by plan options and technical terminology
- Fear of overpaying or getting locked into bad contracts
- Confusion over renewable vs. traditional energy sources
- Uncertainty about future usage patterns (new home, seasonal changes)

**Needs:**
- Clear cost projections based on actual usage
- Simple comparison of top options
- Confidence in recommendations
- Understanding of trade-offs

### Secondary: Small Business Owners
**Demographics:** SMBs with 1-5 locations, <100 employees

**Pain Points:**
- Need predictable energy costs for budgeting
- Want to align with sustainability goals
- Lack time to research options
- Concerned about business continuity (supplier reliability)

**Needs:**
- Reliable suppliers with good business customer support
- Clear understanding of demand charges and business-specific fees
- Alignment with corporate sustainability goals

---

## Technical Architecture

### Tech Stack Decisions (Optimized for Speed)

#### Framework: Next.js 14+ with App Router
**Rationale:**
- **Full-stack in one codebase** (UI + API routes)
- **TypeScript everywhere** (type safety, better DX)
- **Built-in API routes** (no separate backend needed)
- **Server Components** (faster page loads)
- **Vercel deployment** (one-click, automatic HTTPS)
- **Excellent AI agent support** (tons of training data)

**Quick Start:**
```bash
npx create-next-app@latest energy-recommender --typescript --tailwind --app
```

**Alternatives Considered:**
- Python/FastAPI + React: Rejected due to complexity (2 languages, 2 deploys, CORS issues)
- MERN stack: Rejected due to lack of modern features (no RSC, no built-in API)
- Remix: Good alternative but less AI training data

#### UI Framework: Tailwind CSS + shadcn/ui
**Rationale:**
- **Tailwind**: Utility-first CSS, rapid styling
- **shadcn/ui**: Beautiful, accessible components (copy-paste, not installed)
- **No component library lock-in** (you own the code)
- **Excellent with AI agents** (AI knows Tailwind patterns well)

**Alternatives Considered:**
- Chakra UI: Rejected due to larger bundle size
- Material UI: Rejected due to opinionated design
- Plain CSS: Rejected due to slower development

#### Database: Supabase (PostgreSQL)
**Rationale:**
- **Managed PostgreSQL** (no server management)
- **Generous free tier** (500MB database, 2GB file storage)
- **Built-in auth** (if needed later)
- **Real-time subscriptions** (for future features)
- **TypeScript client** (fully typed)
- **Edge Functions** (serverless compute if needed)

**Alternatives Considered:**
- PlanetScale: Good but MySQL (we want PostgreSQL)
- Neon: Good alternative, slightly less mature
- Self-hosted PostgreSQL: Rejected due to ops burden

#### ORM: Prisma
**Rationale:**
- **Type-safe database client** (autocomplete everything)
- **Schema-first** (define models in schema.prisma)
- **Migrations** (version controlled schema changes)
- **Prisma Studio** (visual database browser)
- **Excellent DX** (AI agents understand Prisma well)

#### LLM Integration: Anthropic Claude API
**Rationale:**
- Superior explanation generation capabilities
- Structured output support for recommendation reasoning
- Cost-effective for production scale ($3/$15 per million tokens)
- Extended context window for complex plan comparisons

#### Deployment: Vercel
**Rationale:**
- **Zero-config deployment** (push to deploy)
- **Automatic HTTPS** (free SSL)
- **CDN + Edge Network** (fast globally)
- **Preview deployments** (every git branch)
- **Web Analytics** built-in
- **Free hobby tier** (perfect for MVP)

#### Data Source: EIA RECS 2020 Monthly Supplement
**Rationale:**
- 18,500 real US households with 12 months of usage data
- First official EIA monthly residential data release
- Covers all 50 states with demographic information
- FREE government data with no licensing restrictions
- Perfect for testing recommendation logic with authentic patterns

**Data Access:**
- Download: https://www.eia.gov/consumption/residential/
- Location: Monthly C&E tables (Consumption & Expenditure)
- Format: CSV files with household ID + 12 monthly kWh readings

#### Plan Catalog Data Source
**MVP Approach (Manual):**
- For MVP, plan data is manually collected from [PowerToChoose.org](https://www.powertochoose.org) (Texas) and similar state-specific sites
- Manually enter 20+ plans into database via seed script
- Focus: ~15-17 plans from Texas, 1-2 plans each from PA, OH, IL
- **Note:** This manual approach saves costs but is not scalable

**Post-MVP (Recommended):**
- Integrate with energy plan API providers (e.g., EnergyBot, ChooseEnergy, or direct supplier APIs)
- Automated plan data updates (daily/weekly)
- Real-time pricing and availability
- Multi-state coverage at scale

**MVP Scraper Plan (Optional Efficiency Tool):**
To reduce manual data entry time, a simple scraper can be built to extract plan data from PowerToChoose.org:

**Scraper Implementation:**
```typescript
// scripts/scrape-powertochoose.ts
// Purpose: Extract plan data from PowerToChoose.org for faster seed data creation
// Usage: Run locally, output CSV/JSON for manual review before seeding

// Key data points to extract:
// - Supplier name
// - Plan name
// - Rate per kWh
// - Monthly fee
// - Contract length
// - Early termination fee
// - Renewable percentage
// - Supplier rating (if available)

// Tools: Puppeteer or Cheerio for scraping
// Note: Respect robots.txt, add delays between requests, use for MVP only
```

**Scraper Requirements:**
- Extract plan details from PowerToChoose.org search results
- Output structured JSON/CSV for review
- Include manual review step before database insertion
- **Not for production use** - manual verification required for MVP accuracy

---

## Implementation Phases

### Phase 0: Project Setup (30-45 minutes) - EFFORT: Low

**Objective:** Create Next.js project and configure development environment

#### Tasks Checklist

##### 0.1: Create Next.js Project
```bash
npx create-next-app@latest energy-recommender --typescript --tailwind --app
```

**Answer prompts:**
- ✅ TypeScript
- ✅ ESLint  
- ✅ Tailwind CSS
- ❌ `src/` directory (keep it simple)
- ✅ App Router (NOT Pages Router)
- ✅ Import alias `@/*`

##### 0.2: Install Core Dependencies
```bash
cd energy-recommender
npm install @anthropic-ai/sdk @supabase/supabase-js zod react-hook-form @hookform/resolvers
npm install -D prisma
npx prisma init
```

**Dependencies explained:**
- `@anthropic-ai/sdk`: Claude API client
- `@supabase/supabase-js`: Supabase client (includes auth)
- `zod`: TypeScript-first schema validation
- `react-hook-form` + `@hookform/resolvers`: Type-safe forms
- `prisma`: Database ORM

**Note:** Supabase Auth is included in `@supabase/supabase-js` - no additional auth library needed!

##### 0.3: Install shadcn/ui Components
```bash
npx shadcn-ui@latest init
```

**Answer prompts:**
- Style: Default
- Base color: Slate
- CSS variables: Yes

**Then add components you'll need:**
```bash
npx shadcn-ui@latest add button card input label select table badge dialog slider radio-group tabs
```

##### 0.4: Configure Environment Variables
Create `.env.local`:
```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Feature Flags (optional)
ENABLE_SEASONAL_SCORING=false
```

**Get Supabase credentials:**
1. Create account at https://supabase.com
2. Create new project
3. Copy URL and anon key from Settings → API

##### 0.5: Project Structure Setup
```bash
# Create directory structure
mkdir -p app/api/recommendations
mkdir -p lib/{actions,scoring,database}
mkdir -p components/{ui,forms,recommendations}
mkdir -p types
```

**Final structure:**
```
energy-recommender/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── usage/page.tsx             # Usage input page
│   ├── preferences/page.tsx       # Preferences page
│   ├── recommendations/page.tsx   # Results page
│   ├── plan/[id]/page.tsx        # Plan details
│   └── api/
│       └── recommendations/
│           └── route.ts           # API endpoint
├── components/
│   ├── ui/                        # shadcn components
│   ├── forms/                     # Form components
│   └── recommendations/           # Results components
├── lib/
│   ├── actions/                   # Server actions
│   ├── scoring/                   # Business logic
│   └── database/                  # Database client
├── types/
│   └── index.ts                   # TypeScript types
├── prisma/
│   └── schema.prisma              # Database schema
└── package.json
```

##### 0.6: Configure Prisma Schema
Edit `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Plan {
  id                    String   @id @default(cuid())
  planId                String   @unique
  state                 String   // 'TX', 'PA', 'OH', 'IL', etc.
  supplierName          String
  planName              String
  rateType              String   // 'fixed', 'variable', or 'time_of_use'
  ratePerKwh            Float
  monthlyFee            Float    @default(0)
  contractLengthMonths  Int?
  earlyTerminationFee   Float    @default(0)
  renewablePct          Int
  supplierRating        Float
  planDetails           Json?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([state])
  @@index([renewablePct])
  @@index([ratePerKwh])
  @@index([supplierName])
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed via Supabase Auth
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

##### 0.7: Push Schema to Supabase
```bash
npx prisma db push
npx prisma generate
```

##### 0.8: Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: Energy Plan Recommender"
```

#### Completion Tests
- [ ] `npm run dev` starts on http://localhost:3000
- [ ] Can access Next.js welcome page
- [ ] `npx prisma studio` opens database browser
- [ ] `.env.local` exists (and is in `.gitignore`)
- [ ] All shadcn components imported successfully
- [ ] No TypeScript errors in project

#### Pitfalls to Avoid
- ❌ Using Pages Router instead of App Router (old pattern)
- ❌ Forgetting `.env.local` (Next.js specific, different from `.env`)
- ❌ Not running `npx prisma generate` after schema changes
- ❌ Installing shadcn as npm package (it's copy-paste, not installed)
- ❌ Using Node.js < 18 (Next.js 14 requires 18+)

**Critical Note:** `.env.local` is automatically git-ignored by Next.js. Never commit API keys!

---

### Phase 1: Data Models & Database Setup (3-4 hours) - EFFORT: Medium

**Objective:** Define data structures and load initial plan catalog

#### Tasks Checklist

##### 1.1: Define TypeScript Types
Create `types/index.ts`:
```typescript
// User input types
export interface MonthlyUsage {
  month: number;
  kwh: number;
}

export interface UserPreferences {
  priority: 'cost' | 'renewable' | 'flexibility' | 'balanced';
  minRenewablePct: number;
  maxContractMonths: number;
  minSupplierRating: number;
}

export interface CurrentPlan {
  planId: string;
  startDate?: Date; // Optional for MVP
  contractEndDate?: Date;
}

export interface RecommendationRequest {
  userId: string;
  state?: string; // 'TX', 'PA', 'OH', 'IL'
  monthlyUsageKwh: number[];
  currentPlan?: CurrentPlan;
  preferences: UserPreferences;
}

// Plan types
export interface Plan {
  id: string;
  planId: string;
  state: string; // 'TX', 'PA', 'OH', 'IL', etc.
  supplierName: string;
  planName: string;
  rateType: 'fixed' | 'variable' | 'time_of_use';
  ratePerKwh: number;
  monthlyFee: number;
  contractLengthMonths: number | null;
  earlyTerminationFee: number;
  renewablePct: number;
  supplierRating: number;
  planDetails?: Record<string, any>;
}

// Recommendation types
export interface PlanRecommendation {
  rank: number;
  plan: Plan;
  projectedAnnualCost: number;
  annualSavings: number;
  explanation: string;
  score: number;
  breakdown: {
    costScore: number;
    flexibilityScore: number;
    renewableScore: number;
    ratingScore: number;
    seasonalScore: number;
    finalScore: number;
  };
}

export interface RecommendationResponse {
  recommendations: PlanRecommendation[];
  metadata: {
    totalAnnualUsageKwh: number;
    usagePattern: 'summer_peak' | 'winter_peak' | 'flat';
    currentPlanAnnualCost?: number;
    generatedAt: Date;
    confidence: 'high' | 'medium' | 'low';
  };
}
```

##### 1.2: Create Database Client
Create `lib/database/client.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

##### 1.3: Create Sample Plan Data
Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const samplePlans = [
  // Texas plans (15-17 plans)
  {
    planId: 'txpower_green100_12m',
    state: 'TX',
    supplierName: 'Texas GreenPower',
    planName: '100% Green 12-Month',
    rateType: 'fixed',
    ratePerKwh: 0.1199,
    monthlyFee: 9.95,
    contractLengthMonths: 12,
    earlyTerminationFee: 150,
    renewablePct: 100,
    supplierRating: 4.3,
    planDetails: {
      rateGuarantee: '12 months',
      autopayDiscount: 0.005,
      source: 'wind_solar_mix'
    }
  },
  {
    planId: 'citypower_basic_variable',
    state: 'TX',
    supplierName: 'City Power Co',
    planName: 'Basic Variable Month-to-Month',
    rateType: 'variable',
    ratePerKwh: 0.1150,
    monthlyFee: 0,
    contractLengthMonths: null,
    earlyTerminationFee: 0,
    renewablePct: 15,
    supplierRating: 3.9,
    planDetails: {
      rateAdjustment: 'monthly',
      rateCap: 0.1500,
      rateFloor: 0.0800
    }
  },
  {
    planId: 'megawatt_tou_summer',
    state: 'TX',
    supplierName: 'Megawatt Energy',
    planName: 'Time-of-Use Summer Saver',
    rateType: 'time_of_use',
    ratePerKwh: 0.0950,
    monthlyFee: 4.95,
    contractLengthMonths: 6,
    earlyTerminationFee: 75,
    renewablePct: 50,
    supplierRating: 4.1,
    planDetails: {
      onPeakRate: 0.1800,
      offPeakRate: 0.0650,
      onPeakHours: '14:00-20:00 weekdays'
    }
  },
  // Add 12-14 more Texas plans here...
  
  // Pennsylvania (1-2 plans)
  {
    planId: 'pa_energy_standard_12m',
    state: 'PA',
    supplierName: 'Pennsylvania Energy Co',
    planName: 'Standard 12-Month Fixed',
    rateType: 'fixed',
    ratePerKwh: 0.1085,
    monthlyFee: 5.00,
    contractLengthMonths: 12,
    earlyTerminationFee: 100,
    renewablePct: 25,
    supplierRating: 4.0,
    planDetails: {}
  },
  
  // Ohio (1-2 plans)
  {
    planId: 'oh_power_choice_24m',
    state: 'OH',
    supplierName: 'Ohio Power Choice',
    planName: '24-Month Fixed Rate',
    rateType: 'fixed',
    ratePerKwh: 0.1120,
    monthlyFee: 0,
    contractLengthMonths: 24,
    earlyTerminationFee: 200,
    renewablePct: 30,
    supplierRating: 3.8,
    planDetails: {}
  },
  
  // Illinois (1-2 plans)
  {
    planId: 'il_clean_energy_6m',
    state: 'IL',
    supplierName: 'Illinois Clean Energy',
    planName: '6-Month Green Plan',
    rateType: 'fixed',
    ratePerKwh: 0.1200,
    monthlyFee: 9.99,
    contractLengthMonths: 6,
    earlyTerminationFee: 50,
    renewablePct: 100,
    supplierRating: 4.2,
    planDetails: {}
  }
]

async function main() {
  console.log('Seeding database...')
  
  for (const plan of samplePlans) {
    await prisma.plan.upsert({
      where: { planId: plan.planId },
      update: plan,
      create: plan,
    })
  }
  
  console.log('✅ Seeded', samplePlans.length, 'plans')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

##### 1.4: Add Seed Script to package.json
```json
{
  "scripts": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Install tsx:
```bash
npm install -D tsx
```

##### 1.5: Seed the Database
```bash
npm run seed
```

##### 1.6: Download RECS Data
```bash
# Create data directory
mkdir -p data/recs

# Download from https://www.eia.gov/consumption/residential/data/2020/
# Save monthly consumption CSV to data/recs/
```

##### 1.7: Create RECS Parser
Create `lib/database/recs-parser.ts`:
```typescript
import fs from 'fs'
import path from 'path'

interface RECSHousehold {
  householdId: string;
  monthlyUsageKwh: number[];
  state: string;
  buildingType: string;
}

export function parseRECSData(filePath: string): RECSHousehold[] {
  const csvData = fs.readFileSync(filePath, 'utf-8')
  const lines = csvData.split('\n').slice(1) // Skip header
  
  return lines
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',')
      return {
        householdId: values[0],
        monthlyUsageKwh: values.slice(1, 13).map(Number),
        state: values[13],
        buildingType: values[14]
      }
    })
    .filter(household => {
      // Filter out incomplete data
      return household.monthlyUsageKwh.length === 12 &&
             household.monthlyUsageKwh.every(v => v > 0 && v < 10000)
    })
}

export function getTestHouseholds(count: number = 10): RECSHousehold[] {
  const filePath = path.join(process.cwd(), 'data/recs/monthly_consumption.csv')
  const allHouseholds = parseRECSData(filePath)
  
  // Return diverse sample
  return allHouseholds.slice(0, count)
}
```

#### Completion Tests
- [ ] `npx prisma studio` shows seeded plans in database
- [ ] Can query plans: `await prisma.plan.findMany()`
- [ ] TypeScript types are all defined in `types/index.ts`
- [ ] RECS data downloads and parses successfully
- [ ] Test households have 12 months of valid usage data
- [ ] Database has at least 20 supplier plans

#### Pitfalls to Avoid
- ❌ Not including indexes on frequently filtered fields
- ❌ Hard-coding plan data instead of making it easily updatable
- ❌ Not validating RECS data (some records have missing months)
- ❌ Using unrealistic plan data (check actual market rates)
- ❌ Forgetting to run `npx prisma generate` after schema changes

---

### Phase 2: Core Recommendation Logic (6-8 hours) - EFFORT: High

**Objective:** Implement plan scoring, ranking, and cost calculation algorithms

#### Tasks Checklist

##### 2.1: Usage Analysis Service
Create `lib/scoring/usage-analysis.ts`:
```typescript
export interface UsagePattern {
  totalAnnualKwh: number;
  monthlyAverage: number;
  monthlyMedian: number;
  summerAverage: number; // Jun-Aug
  winterAverage: number; // Dec-Feb
  pattern: 'summer_peak' | 'winter_peak' | 'flat';
  peakMonths: number[];
}

export function analyzeUsage(monthlyUsageKwh: number[]): UsagePattern {
  if (monthlyUsageKwh.length !== 12) {
    throw new Error('Must provide exactly 12 months of usage data')
  }

  const totalAnnualKwh = monthlyUsageKwh.reduce((sum, kwh) => sum + kwh, 0)
  const monthlyAverage = totalAnnualKwh / 12
  
  // Calculate median
  const sorted = [...monthlyUsageKwh].sort((a, b) => a - b)
  const monthlyMedian = (sorted[5] + sorted[6]) / 2

  // Summer average (months 5, 6, 7 = Jun, Jul, Aug)
  const summerAverage = (monthlyUsageKwh[5] + monthlyUsageKwh[6] + monthlyUsageKwh[7]) / 3
  
  // Winter average (months 0, 1, 11 = Jan, Feb, Dec)
  const winterAverage = (monthlyUsageKwh[0] + monthlyUsageKwh[1] + monthlyUsageKwh[11]) / 3

  // Determine pattern
  let pattern: UsagePattern['pattern'] = 'flat'
  if (summerAverage > monthlyAverage * 1.2) {
    pattern = 'summer_peak'
  } else if (winterAverage > monthlyAverage * 1.2) {
    pattern = 'winter_peak'
  }

  // Find peak months (>1.5 std dev above mean)
  const stdDev = Math.sqrt(
    monthlyUsageKwh.reduce((sum, kwh) => sum + Math.pow(kwh - monthlyAverage, 2), 0) / 12
  )
  const peakMonths = monthlyUsageKwh
    .map((kwh, index) => ({ kwh, index }))
    .filter(({ kwh }) => kwh > monthlyAverage + 1.5 * stdDev)
    .map(({ index }) => index)

  return {
    totalAnnualKwh,
    monthlyAverage,
    monthlyMedian,
    summerAverage,
    winterAverage,
    pattern,
    peakMonths
  }
}
```

##### 2.2: Cost Calculation Engine
Create `lib/scoring/cost-calculator.ts`:
```typescript
import { Plan } from '@/types'

export interface CostBreakdown {
  energyCharges: number;
  monthlyFees: number;
  switchingCost: number;
  firstYearTotal: number;
  ongoingAnnualCost: number;
}

export function calculatePlanCost(
  plan: Plan,
  monthlyUsageKwh: number[],
  currentPlanEndDate?: Date,
  currentPlanEarlyTerminationFee: number = 0
): CostBreakdown {
  const totalAnnualKwh = monthlyUsageKwh.reduce((sum, kwh) => sum + kwh, 0)

  let energyCharges = 0

  switch (plan.rateType) {
    case 'fixed':
      energyCharges = totalAnnualKwh * plan.ratePerKwh
      break
    
    case 'variable':
      // Use current rate as estimate (in reality, this fluctuates monthly)
      // Note: Variable rates can change, so this is an approximation
      // Consider adding a disclaimer in the UI about rate volatility
      energyCharges = totalAnnualKwh * plan.ratePerKwh
      break
    
    case 'time_of_use':
      // Assume 40% on-peak, 60% off-peak (without hourly data)
      // Note: This is an estimate - actual usage patterns may differ
      const onPeakRate = plan.planDetails?.onPeakRate || plan.ratePerKwh * 1.5
      const offPeakRate = plan.planDetails?.offPeakRate || plan.ratePerKwh * 0.7
      energyCharges = (totalAnnualKwh * 0.4 * onPeakRate) + (totalAnnualKwh * 0.6 * offPeakRate)
      break
    
    default:
      // Unknown rate type - log warning and use base rate
      console.warn(`Unknown rate type: ${plan.rateType}, using base rate`)
      energyCharges = totalAnnualKwh * plan.ratePerKwh
      break
  }

  const monthlyFees = plan.monthlyFee * 12

  // Calculate switching cost (early termination fee if applicable)
  let switchingCost = 0
  if (currentPlanEndDate && new Date() < currentPlanEndDate) {
    // Would need to break current contract - use CURRENT plan's ETF, not new plan's
    switchingCost = currentPlanEarlyTerminationFee
  }

  const ongoingAnnualCost = energyCharges + monthlyFees
  const firstYearTotal = ongoingAnnualCost + switchingCost

  return {
    energyCharges,
    monthlyFees,
    switchingCost,
    firstYearTotal,
    ongoingAnnualCost
  }
}
```

##### 2.3: Plan Scoring Algorithm
Create `lib/scoring/plan-scorer.ts`:
```typescript
import { Plan, UserPreferences } from '@/types'
import { CostBreakdown } from './cost-calculator'
import { UsagePattern } from './usage-analysis'

export interface ScoreBreakdown {
  costScore: number;
  flexibilityScore: number;
  renewableScore: number;
  ratingScore: number;
  seasonalScore: number;
  finalScore: number;
}

export interface ScoredPlan {
  plan: Plan;
  cost: CostBreakdown;
  score: ScoreBreakdown;
}

export function scorePlan(
  plan: Plan,
  cost: CostBreakdown,
  preferences: UserPreferences,
  allCosts: CostBreakdown[],
  usagePattern?: UsagePattern
): ScoreBreakdown {
  // Get max cost for normalization
  const maxCost = Math.max(...allCosts.map(c => c.firstYearTotal))
  
  // Handle edge case: all plans have same cost
  const costScore = maxCost > 0 
    ? 100 * (1 - (cost.firstYearTotal / maxCost))
    : 50 // Neutral score if all costs are equal

  // Flexibility score (0-100): Shorter contract = higher score
  let flexibilityScore = 100
  if (plan.contractLengthMonths === null) {
    flexibilityScore = 100 // Month-to-month
  } else if (plan.contractLengthMonths <= 6) {
    flexibilityScore = 70
  } else if (plan.contractLengthMonths <= 12) {
    flexibilityScore = 50
  } else if (plan.contractLengthMonths <= 24) {
    flexibilityScore = 30
  } else {
    flexibilityScore = 10
  }

  // Renewable score (0-100): Direct percentage
  const renewableScore = plan.renewablePct

  // Supplier rating score (0-100)
  const ratingScore = (plan.supplierRating / 5.0) * 100

  // Seasonal fit score (0-100): Feature-flagged implementation
  const seasonalScore = calculateSeasonalScore(plan, usagePattern, preferences)

  // Apply user preference weights
  const weights = getPreferenceWeights(preferences.priority)
  
  const finalScore = 
    (costScore * weights.cost) +
    (flexibilityScore * weights.flexibility) +
    (renewableScore * weights.renewable) +
    (ratingScore * weights.rating) +
    (seasonalScore * weights.seasonal)

  return {
    costScore,
    flexibilityScore,
    renewableScore,
    ratingScore,
    seasonalScore,
    finalScore
  }
}

// Feature flag for seasonal scoring
const ENABLE_SEASONAL_SCORING = process.env.ENABLE_SEASONAL_SCORING === 'true'

function calculateSeasonalScore(
  plan: Plan,
  usagePattern?: UsagePattern,
  preferences?: UserPreferences
): number {
  // If feature flag is off or no usage pattern, return neutral score
  if (!ENABLE_SEASONAL_SCORING || !usagePattern) {
    return 50
  }

  // Use switch statement to avoid overwriting scores
  switch (plan.rateType) {
    case 'time_of_use':
      // TOU plans favor summer-peak users (lower off-peak rates)
      if (usagePattern.pattern === 'summer_peak') {
        return 75
      } else if (usagePattern.pattern === 'winter_peak') {
        return 40
      }
      return 50 // Flat pattern
    
    case 'fixed':
      // Fixed-rate plans are predictable for all patterns
      return 60
    
    case 'variable':
      // Variable plans are riskier for peak users (price volatility)
      if (usagePattern.pattern !== 'flat') {
        return 40 // Risky during peak months
      }
      return 55 // OK for flat usage
    
    default:
      return 50 // Unknown rate type
  }
}

function getPreferenceWeights(priority: UserPreferences['priority']) {
  switch (priority) {
    case 'cost':
      return { cost: 0.60, flexibility: 0.10, renewable: 0.10, rating: 0.10, seasonal: 0.10 }
    case 'renewable':
      return { cost: 0.30, flexibility: 0.10, renewable: 0.50, rating: 0.05, seasonal: 0.05 }
    case 'flexibility':
      return { cost: 0.30, flexibility: 0.50, renewable: 0.10, rating: 0.05, seasonal: 0.05 }
    case 'balanced':
    default:
      return { cost: 0.40, flexibility: 0.20, renewable: 0.20, rating: 0.10, seasonal: 0.10 }
  }
}
```

##### 2.4: Plan Filtering & Ranking
Create `lib/scoring/plan-ranker.ts`:
```typescript
import { Plan, UserPreferences, PlanRecommendation } from '@/types'
import { calculatePlanCost } from './cost-calculator'
import { scorePlan, ScoredPlan } from './plan-scorer'
import { UsagePattern } from './usage-analysis'

export function filterAndRankPlans(
  allPlans: Plan[],
  monthlyUsageKwh: number[],
  preferences: UserPreferences,
  currentPlanEndDate?: Date,
  usagePattern?: UsagePattern,
  currentPlanEarlyTerminationFee: number = 0
): ScoredPlan[] {
  // Filter plans based on user constraints
  let filteredPlans = allPlans.filter(plan => {
    // Renewable percentage minimum
    if (plan.renewablePct < preferences.minRenewablePct) return false
    
    // Contract length maximum
    if (plan.contractLengthMonths !== null && 
        plan.contractLengthMonths > preferences.maxContractMonths) return false
    
    // Supplier rating minimum
    if (plan.supplierRating < preferences.minSupplierRating) return false
    
    return true
  })

  // If too few plans, progressively relax constraints
  if (filteredPlans.length < 3) {
    console.warn(`Only ${filteredPlans.length} plans match strict criteria, relaxing constraints...`)
    
    // Relax supplier rating first
    filteredPlans = allPlans.filter(plan => {
      if (plan.renewablePct < preferences.minRenewablePct) return false
      if (plan.contractLengthMonths !== null && 
          plan.contractLengthMonths > preferences.maxContractMonths) return false
      if (plan.supplierRating < preferences.minSupplierRating - 0.5) return false
      return true
    })
  }

  if (filteredPlans.length < 3) {
    // Relax contract length
    filteredPlans = allPlans.filter(plan => {
      if (plan.renewablePct < preferences.minRenewablePct) return false
      if (plan.supplierRating < preferences.minSupplierRating - 0.5) return false
      return true
    })
  }

  // Calculate costs for all filtered plans
  const costsAndPlans = filteredPlans.map(plan => ({
    plan,
    cost: calculatePlanCost(plan, monthlyUsageKwh, currentPlanEndDate, currentPlanEarlyTerminationFee)
  }))

  // Score all plans
  const allCosts = costsAndPlans.map(cp => cp.cost)
  const scoredPlans: ScoredPlan[] = costsAndPlans.map(({ plan, cost }) => ({
    plan,
    cost,
    score: scorePlan(plan, cost, preferences, allCosts, usagePattern)
  }))

  // Sort by final score (descending)
  scoredPlans.sort((a, b) => b.score.finalScore - a.score.finalScore)

  return scoredPlans
}

export function getTopRecommendations(
  scoredPlans: ScoredPlan[],
  count: number = 3
): ScoredPlan[] {
  return scoredPlans.slice(0, count)
}
```

#### Completion Tests
- [ ] Test cost calculation with fixed-rate plan: matches manual calculation
- [ ] Test cost calculation with time-of-use plan: applies on-peak/off-peak split
- [ ] Test usage analysis: correctly identifies summer peak pattern
- [ ] Test plan scoring: cost-priority user gets cheapest plan ranked #1
- [ ] Test plan scoring: renewable-priority user gets highest % renewable #1
- [ ] Test plan filtering: restrictive criteria returns <3 plans, triggers relaxation
- [ ] Test early termination fee: included in first-year cost when applicable
- [ ] Test with RECS data: 10 different households get sensible recommendations
- [ ] Test seasonal scoring: feature flag off returns neutral score (50)
- [ ] Test seasonal scoring: feature flag on, summer-peak user gets higher TOU score
- [ ] Test seasonal scoring: feature flag on, variable plan gets lower score for peak users

#### Pitfalls to Avoid
- ❌ Not normalizing scores to 0-100 range (makes weighted sum unreliable)
- ❌ Ignoring early termination fees (major cost factor!)
- ❌ Using hard-coded weights instead of user preference-based weights
- ❌ Not handling edge case: 0 plans match criteria
- ❌ Not testing with realistic RECS usage data

**Critical Implementation Notes:**
- Document scoring algorithm thoroughly - this is core IP
- Keep weights configurable as constants (easy A/B testing)
- Log intermediate scores for debugging
- Consider caching plan cost calculations

---

### Phase 3: LLM Explanation Generation (3-4 hours) - EFFORT: Medium

**Objective:** Generate natural language explanations using Claude API

#### Tasks Checklist

##### 3.1: Configure Anthropic Client
Create `lib/anthropic/client.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const MODEL = 'claude-3-5-sonnet-20241022' // Update to latest available model
```

##### 3.2: Create Explanation Generator
Create `lib/anthropic/explanations.ts`:
```typescript
import { anthropic, MODEL } from './client'
import { Plan, PlanRecommendation, UserPreferences } from '@/types'
import { UsagePattern } from '../scoring/usage-analysis'
import { CostBreakdown } from '../scoring/cost-calculator'

interface ExplanationContext {
  plan: Plan;
  rank: number;
  cost: CostBreakdown;
  savings: number;
  usagePattern: UsagePattern;
  preferences: UserPreferences;
  currentPlanCost?: number;
}

export async function generateExplanation(
  context: ExplanationContext
): Promise<string> {
  const prompt = buildPrompt(context)

  try {
    // Add timeout to prevent hanging requests (10 seconds)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: prompt
      }],
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    const explanation = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    // Validate explanation
    if (!isValidExplanation(explanation, context)) {
      console.warn('Generated explanation failed validation, using fallback')
      return generateFallbackExplanation(context)
    }

    return explanation
  } catch (error) {
    console.error('Error generating explanation:', error)
    // Handle timeout specifically
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('LLM request timed out, using fallback explanation')
    }
    return generateFallbackExplanation(context)
  }
}

function buildPrompt(context: ExplanationContext): string {
  const {
    plan,
    rank,
    cost,
    savings,
    usagePattern,
    preferences,
    currentPlanCost
  } = context

  return `You are an expert energy plan advisor. Explain why this plan was recommended in 2-3 clear, specific sentences.

User Profile:
- Annual usage: ${usagePattern.totalAnnualKwh.toLocaleString()} kWh (${usagePattern.monthlyAverage.toFixed(0)} kWh/month average)
- Usage pattern: ${usagePattern.pattern.replace('_', ' ')}
- Current annual cost: ${currentPlanCost ? `$${currentPlanCost.toFixed(2)}` : 'Unknown'}
- Priorities: ${preferences.priority} (renewable: ${preferences.minRenewablePct}%+, max contract: ${preferences.maxContractMonths} months)

Recommended Plan (Rank #${rank}):
- Supplier: ${plan.supplierName}
- Plan: ${plan.planName}
- Rate: $${plan.ratePerKwh.toFixed(4)}/kWh
- Monthly fee: $${plan.monthlyFee.toFixed(2)}
- Contract: ${plan.contractLengthMonths ? `${plan.contractLengthMonths} months` : 'month-to-month'}
- Renewable: ${plan.renewablePct}%
- Supplier rating: ${plan.supplierRating}/5.0
- Projected annual cost: $${cost.ongoingAnnualCost.toFixed(2)}
- First-year cost: $${cost.firstYearTotal.toFixed(2)}
${cost.switchingCost > 0 ? `- Switching cost: $${cost.switchingCost.toFixed(2)}` : ''}
- Savings: ${savings >= 0 ? `$${savings.toFixed(2)}/year` : `$${Math.abs(savings).toFixed(2)}/year more expensive`}

Why is this plan ranked #${rank}? Focus on what matters most to this user based on their priorities. Be specific with numbers. Mention one trade-off if relevant.

Requirements:
- 2-3 sentences maximum
- Include specific dollar amounts
- Mention renewable % if relevant to user
- Mention contract length if relevant to user
- Use "you" and "your" (direct address)
- No marketing fluff, just facts`
}

function isValidExplanation(explanation: string, context: ExplanationContext): boolean {
  // Validation rules
  if (explanation.length < 50 || explanation.length > 500) return false
  
  // Should mention at least one number
  if (!/\d/.test(explanation)) return false
  
  // Should not be generic
  if (explanation.includes('great option') && explanation.length < 100) return false
  
  return true
}

function generateFallbackExplanation(context: ExplanationContext): string {
  const { plan, cost, savings, preferences } = context
  
  const savingsText = savings >= 0 
    ? `save you $${savings.toFixed(2)}/year`
    : `cost $${Math.abs(savings).toFixed(2)}/year more`

  const contractText = plan.contractLengthMonths 
    ? `${plan.contractLengthMonths}-month contract`
    : 'no contract commitment'

  let focus = ''
  if (preferences.priority === 'cost') {
    focus = `the lowest cost option at $${cost.ongoingAnnualCost.toFixed(2)}/year`
  } else if (preferences.priority === 'renewable') {
    focus = `${plan.renewablePct}% renewable energy`
  } else if (preferences.priority === 'flexibility') {
    focus = `a ${contractText} for maximum flexibility`
  }

  return `This plan can ${savingsText} compared to your current plan. It offers ${focus} with a ${plan.supplierRating}/5.0 supplier rating.`
}

// Simple in-memory cache (for MVP)
// Note: This cache grows indefinitely - acceptable for MVP, but post-MVP should use LRU cache
const explanationCache = new Map<string, string>()
const MAX_CACHE_SIZE = 1000 // Prevent unbounded growth

function evictOldestCacheEntry() {
  if (explanationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = explanationCache.keys().next().value
    if (firstKey) {
      explanationCache.delete(firstKey)
    }
  }
}

export async function generateExplanationWithCache(
  context: ExplanationContext
): Promise<string> {
  // Include state in cache key to avoid cross-state explanation conflicts
  const cacheKey = `${context.plan.state}-${context.plan.planId}-${context.rank}-${context.preferences.priority}`
  
  if (explanationCache.has(cacheKey)) {
    return explanationCache.get(cacheKey)!
  }

  const explanation = await generateExplanation(context)
  
  // Evict oldest entry if cache is full
  evictOldestCacheEntry()
  explanationCache.set(cacheKey, explanation)
  
  return explanation
}
```

##### 3.3: Batch Explanation Generation
Create `lib/anthropic/batch-explanations.ts`:
```typescript
import { ScoredPlan } from '../scoring/plan-scorer'
import { UsagePattern } from '../scoring/usage-analysis'
import { UserPreferences } from '@/types'
import { generateExplanationWithCache } from './explanations'

export async function generateAllExplanations(
  topPlans: ScoredPlan[],
  usagePattern: UsagePattern,
  preferences: UserPreferences,
  currentPlanCost?: number
): Promise<string[]> {
  const explanationPromises = topPlans.map((scoredPlan, index) =>
    generateExplanationWithCache({
      plan: scoredPlan.plan,
      rank: index + 1,
      cost: scoredPlan.cost,
      savings: currentPlanCost ? currentPlanCost - scoredPlan.cost.ongoingAnnualCost : 0,
      usagePattern,
      preferences,
      currentPlanCost
    })
  )

  return await Promise.all(explanationPromises)
}
```

#### Completion Tests
- [ ] Generate explanation for high-savings plan: mentions specific $ savings
- [ ] Generate explanation for renewable plan: mentions renewable %
- [ ] Generate explanation for flexible plan: mentions contract benefits
- [ ] Test with API error: gracefully falls back to template explanation
- [ ] Test explanation validation: rejects generic "great option" text
- [ ] Verify caching works: second identical request returns cached result

#### Pitfalls to Avoid
- ❌ Not handling Claude API errors gracefully
- ❌ Generating overly technical explanations
- ❌ Not including specific numbers (vague "significant savings")
- ❌ Exceeding token budgets (keep prompts concise)
- ❌ Not caching results (expensive + slow)

**Critical Implementation Notes:**
- Always provide fallback template explanations if LLM fails
- Log LLM costs per request (monitor burn rate)
- Cache aggressively - same plan + rank + priority = same explanation
- Consider using Claude Haiku for cost optimization

---

### Phase 4: API Routes (2-3 hours) - EFFORT: Low-Medium

**Objective:** Build Next.js API routes for recommendations

#### Tasks Checklist

##### 4.0: Create Rate Limiting Utility
Create `lib/rate-limit.ts`:
```typescript
// Simple in-memory rate limiter for MVP (development only)
// NOTE: This won't work in production on Vercel (serverless functions are stateless)
// For production, use Vercel's built-in rate limiting or Upstash Redis

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  }
}

const store: RateLimitStore = {}

// Clean up old entries (only works in long-running processes, not serverless)
// In production, entries will expire naturally based on resetAt
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    const now = Date.now()
    Object.keys(store).forEach(key => {
      if (store[key].resetAt < now) {
        delete store[key]
      }
    })
  }, 5 * 60 * 1000)
}

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000 // 1 minute
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const key = identifier

  if (!store[key] || store[key].resetAt < now) {
    // New window
    store[key] = {
      count: 1,
      resetAt: now + windowMs
    }
    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt: store[key].resetAt
    }
  }

  // Existing window
  if (store[key].count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: store[key].resetAt
    }
  }

  store[key].count++
  return {
    success: true,
    remaining: maxRequests - store[key].count,
    resetAt: store[key].resetAt
  }
}

// Helper for API routes
export function getRateLimitIdentifier(request: Request): string {
  // Use IP address for MVP (no auth yet)
  // Note: In serverless, IP may not be reliable - consider using user ID when auth is added
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return `api:${ip}`
}
```

**Rate Limit Configuration:**
- **MVP Limits:** 10 requests per minute per IP
- **Rationale:** Low volume MVP, prevents abuse without blocking legitimate users
- **Development:** In-memory store works fine for local testing
- **Production:** This approach won't work on Vercel serverless. Options:
  1. Use Vercel's built-in rate limiting (recommended)
  2. Use Upstash Redis (free tier available)
  3. Use Vercel KV (key-value store)
- **Post-MVP:** Implement proper distributed rate limiting

##### 4.1: Create Recommendations API Route
Create `app/api/recommendations/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/client'
import { analyzeUsage } from '@/lib/scoring/usage-analysis'
import { filterAndRankPlans, getTopRecommendations } from '@/lib/scoring/plan-ranker'
import { generateAllExplanations } from '@/lib/anthropic/batch-explanations'
import { RecommendationRequest, RecommendationResponse, PlanRecommendation } from '@/types'
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { ScoredPlan } from '@/lib/scoring/plan-scorer'
import { z } from 'zod'

// Request validation schema
const requestSchema = z.object({
  userId: z.string(),
  state: z.enum(['TX', 'PA', 'OH', 'IL']).optional(), // Filter by state
  monthlyUsageKwh: z.array(z.number().min(0).max(10000)).length(12),
  currentPlan: z.object({
    planId: z.string(),
    startDate: z.string().optional(), // Optional for MVP
    contractEndDate: z.string().optional()
  }).optional(),
  preferences: z.object({
    priority: z.enum(['cost', 'renewable', 'flexibility', 'balanced']),
    minRenewablePct: z.number().min(0).max(100).default(0),
    maxContractMonths: z.number().min(1).max(36).default(24),
    minSupplierRating: z.number().min(1).max(5).default(3.0)
  })
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(getRateLimitIdentifier(request), 10, 60 * 1000)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString()
          }
        }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const validatedData = requestSchema.parse(body)

    // Fetch plans from database (filter by state if provided)
    const where: any = {}
    if (validatedData.state) {
      where.state = validatedData.state
    }
    const allPlans = await prisma.plan.findMany({ where })

    if (allPlans.length === 0) {
      const stateMsg = validatedData.state 
        ? `No plans available for ${validatedData.state}. Try selecting a different state.`
        : 'No plans available in catalog'
      return NextResponse.json(
        { error: stateMsg },
        { status: 503 }
      )
    }

    // Analyze usage patterns
    const usagePattern = analyzeUsage(validatedData.monthlyUsageKwh)

    // Get current plan cost (if provided)
    let currentPlanCost: number | undefined
    let currentPlanETF: number = 0
    if (validatedData.currentPlan) {
      const currentPlan = allPlans.find(p => p.planId === validatedData.currentPlan!.planId)
      if (currentPlan) {
        const { calculatePlanCost } = await import('@/lib/scoring/cost-calculator')
        currentPlanETF = currentPlan.earlyTerminationFee
        const cost = calculatePlanCost(
          currentPlan,
          validatedData.monthlyUsageKwh,
          validatedData.currentPlan.contractEndDate 
            ? new Date(validatedData.currentPlan.contractEndDate)
            : undefined,
          0 // Current plan doesn't have switching cost to itself
        )
        currentPlanCost = cost.ongoingAnnualCost
      } else {
        console.warn(`Current plan ${validatedData.currentPlan.planId} not found in database`)
      }
    }

    // Filter and rank plans (passing current plan ETF for switching cost calculation)
    // For MVP, we'll pass the ETF via the cost calculator
    // Note: This requires updating filterAndRankPlans signature
    const scoredPlans = filterAndRankPlans(
      allPlans,
      validatedData.monthlyUsageKwh,
      validatedData.preferences,
      validatedData.currentPlan?.contractEndDate 
        ? new Date(validatedData.currentPlan.contractEndDate)
        : undefined,
      usagePattern,
      currentPlanETF
    )

    // Get top 3
    const topThree = getTopRecommendations(scoredPlans, 3)

    if (topThree.length === 0) {
      return NextResponse.json(
        { error: 'No plans match your criteria. Try relaxing your filters.' },
        { status: 400 }
      )
    }

    // Generate explanations
    const explanations = await generateAllExplanations(
      topThree,
      usagePattern,
      validatedData.preferences,
      currentPlanCost
    )

    // Build response
    const recommendations: PlanRecommendation[] = topThree.map((scored, index) => ({
      rank: index + 1,
      plan: scored.plan,
      projectedAnnualCost: scored.cost.ongoingAnnualCost,
      annualSavings: currentPlanCost ? currentPlanCost - scored.cost.ongoingAnnualCost : 0,
      explanation: explanations[index],
      score: scored.score.finalScore,
      breakdown: scored.score
    }))

    const response: RecommendationResponse = {
      recommendations,
      metadata: {
        totalAnnualUsageKwh: usagePattern.totalAnnualKwh,
        usagePattern: usagePattern.pattern,
        currentPlanAnnualCost: currentPlanCost,
        generatedAt: new Date(),
        confidence: determineConfidence(topThree, usagePattern)
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error generating recommendations:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

function determineConfidence(
  topThree: ScoredPlan[],
  usagePattern: UsagePattern
): 'high' | 'medium' | 'low' {
  if (topThree.length === 0) return 'low'
  if (topThree.length === 1) return 'medium'
  
  const scoreDiff = topThree[0].score.finalScore - topThree[1].score.finalScore
  
  // High confidence: Clear winner (score difference > 10)
  if (scoreDiff > 10) {
    return 'high'
  }
  
  // Low confidence: Scores very close (difference < 5)
  if (scoreDiff < 5) {
    return 'low'
  }
  
  return 'medium'
}
```

##### 4.2: Create Plans API Route
Create `app/api/plans/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parse query parameters
    const state = searchParams.get('state')
    const minRenewable = searchParams.get('minRenewable')
    const maxContract = searchParams.get('maxContract')
    const minRating = searchParams.get('minRating')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}
    
    if (state) {
      where.state = state
    }
    
    if (minRenewable) {
      where.renewablePct = { gte: parseInt(minRenewable) }
    }
    
    if (maxContract) {
      where.contractLengthMonths = { lte: parseInt(maxContract) }
    }
    
    if (minRating) {
      where.supplierRating = { gte: parseFloat(minRating) }
    }
    
    if (search) {
      where.OR = [
        { planName: { contains: search, mode: 'insensitive' } },
        { supplierName: { contains: search, mode: 'insensitive' } }
      ]
    }

    const plans = await prisma.plan.findMany({
      where,
      orderBy: { supplierRating: 'desc' }
    })

    return NextResponse.json({ plans, count: plans.length })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}
```

##### 4.3: Create Plan Details API Route
Create `app/api/plans/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: params.id }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error fetching plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    )
  }
}
```

#### Completion Tests
- [ ] POST `/api/recommendations` with valid data: returns 3 recommendations in <2s
- [ ] POST `/api/recommendations` with invalid data: returns 400 error
- [ ] POST `/api/recommendations` with 13 months: returns 400 error with clear message
- [ ] GET `/api/plans`: returns paginated plan list
- [ ] GET `/api/plans?minRenewable=75`: only returns plans ≥75% renewable
- [ ] GET `/api/plans/[id]`: returns specific plan details
- [ ] GET `/api/plans/invalid-id`: returns 404

#### Pitfalls to Avoid
- ❌ Not validating input (use Zod!)
- ❌ Returning 500 for validation errors (should be 400)
- ❌ Not logging errors properly
- ❌ Blocking the API with synchronous LLM calls (use Promise.all)
- ❌ Not handling database connection errors

---

### Phase 5: Frontend Pages & Components (10-14 hours) - EFFORT: High

**Objective:** Build complete user interface with all pages

#### Overview

Build 5 main pages:
1. Landing Page - Value proposition and CTA
2. Usage Input - CSV upload or manual entry
3. Preferences - Priority selection and filters
4. Results - Top 3 recommendations display
5. Plan Details - Individual plan information

#### Tasks Checklist

##### 5.1: Landing Page
Create `app/page.tsx`:
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect Energy Plan in Minutes
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Compare 20+ energy plans and save hundreds on your energy bill with AI-powered recommendations
          </p>
          <Link href="/usage">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started →
            </Button>
          </Link>
        </div>

        {/* How It Works */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Card className="p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">1. Upload Your Usage</h3>
            <p className="text-gray-600">
              Upload a CSV or manually enter 12 months of electricity usage
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold mb-2">2. Set Your Priorities</h3>
            <p className="text-gray-600">
              Tell us what matters: cost savings, renewable energy, or flexibility
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">3. Get Recommendations</h3>
            <p className="text-gray-600">
              Receive your top 3 personalized plan recommendations with clear explanations
            </p>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex justify-center gap-12 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>🤖</span>
            <span>Powered by AI</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🆓</span>
            <span>100% Free</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📈</span>
            <span>Real Pricing Data</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

##### 5.2: Usage Input Page
Create `app/usage/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function UsagePage() {
  const router = useRouter()
  const [usageData, setUsageData] = useState<number[]>(Array(12).fill(0))
  const [errors, setErrors] = useState<string[]>([])

  const handleManualChange = (index: number, value: string) => {
    const kwh = parseFloat(value) || 0
    const newData = [...usageData]
    newData[index] = kwh
    setUsageData(newData)
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      
      // Simple CSV parser (assumes format: month,kwh or just kwh values)
      // For MVP: Basic parsing is sufficient
      // Post-MVP: Consider using papaparse library for robust CSV handling
      const parsedData = lines.slice(1).map(line => {
        // Handle quoted fields and different delimiters
        const cleaned = line.replace(/"/g, '')
        const parts = cleaned.split(',')
        // Try to find kWh value (usually last column or second column)
        const kwh = parseFloat(parts[parts.length - 1]) || parseFloat(parts[1]) || parseFloat(parts[0]) || 0
        return kwh
      }).filter(kwh => kwh > 0) // Remove invalid entries

      if (parsedData.length !== 12) {
        setErrors([`CSV must contain exactly 12 months of data. Found ${parsedData.length} valid entries.`])
        return
      }

      setUsageData(parsedData)
      setErrors([])
    } catch (error) {
      setErrors(['Failed to parse CSV file. Please ensure format is: month,kwh (one row per month)'])
    }
  }

  const handleSubmit = () => {
    // Validation
    const newErrors: string[] = []
    
    if (usageData.some(kwh => kwh <= 0)) {
      newErrors.push('All months must have positive usage values')
    }
    
    if (usageData.some(kwh => kwh > 10000)) {
      newErrors.push('Usage values seem unreasonably high (>10,000 kWh/month)')
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    // Store in session storage
    sessionStorage.setItem('usageData', JSON.stringify(usageData))
    router.push('/preferences')
  }

  const totalAnnual = usageData.reduce((sum, kwh) => sum + kwh, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Enter Your Usage Data</h1>
          <p className="text-gray-600">Step 1 of 3</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="manual">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="csv">Upload CSV</TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {MONTHS.map((month, index) => (
                  <div key={month}>
                    <Label htmlFor={`month-${index}`}>{month}</Label>
                    <Input
                      id={`month-${index}`}
                      type="number"
                      min="0"
                      max="10000"
                      placeholder="850"
                      value={usageData[index] || ''}
                      onChange={(e) => handleManualChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="csv">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-lg mb-2">Drop CSV file here or click to browse</p>
                  <p className="text-sm text-gray-500">
                    Format: month,kwh (12 rows)
                  </p>
                </label>
              </div>
            </TabsContent>
          </Tabs>

          {/* Total Display */}
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Total Annual Usage</p>
            <p className="text-2xl font-bold">
              {totalAnnual.toLocaleString()} kWh
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              {errors.map((error, i) => (
                <p key={i} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => router.push('/')}>
              ← Back
            </Button>
            <Button onClick={handleSubmit} disabled={totalAnnual === 0}>
              Next: Preferences →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
```

##### 5.3: Preferences Page
Create `app/preferences/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPreferences } from '@/types'

export default function PreferencesPage() {
  const router = useRouter()
  const [state, setState] = useState<string>('TX')
  const [currentPlan, setCurrentPlan] = useState<string>('')
  const [preferences, setPreferences] = useState<UserPreferences>({
    priority: 'balanced',
    minRenewablePct: 0,
    maxContractMonths: 24,
    minSupplierRating: 3.0
  })

  const handleSubmit = async () => {
    // Get usage data from session storage
    const usageData = JSON.parse(sessionStorage.getItem('usageData') || '[]')
    
    if (usageData.length !== 12) {
      router.push('/usage')
      return
    }

    // Store preferences and state
    sessionStorage.setItem('preferences', JSON.stringify(preferences))
    sessionStorage.setItem('state', state)
    if (currentPlan) {
      sessionStorage.setItem('currentPlan', currentPlan)
    }

    // Navigate to loading state
    router.push('/recommendations')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Set Your Preferences</h1>
          <p className="text-gray-600">Step 2 of 3</p>
        </div>

        <Card className="p-6">
          {/* State Selection */}
          <div className="mb-6">
            <Label className="text-lg mb-2 block">Select Your State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="PA">Pennsylvania</SelectItem>
                <SelectItem value="OH">Ohio</SelectItem>
                <SelectItem value="IL">Illinois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Plan Selection (Optional) */}
          <div className="mb-6">
            <Label className="text-lg mb-2 block">Current Plan (Optional)</Label>
            <Select value={currentPlan} onValueChange={setCurrentPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Select your current plan or skip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">I don't have a current plan</SelectItem>
                <SelectItem value="manual">I'll enter details manually</SelectItem>
                {/* Note: For MVP, fetching plans dynamically is optional.
                    Users can skip this or enter manually. */}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-2">
              Knowing your current plan helps us calculate potential savings
            </p>
          </div>

          {/* Priority Selection */}
          <div className="mb-8">
            <Label className="text-lg mb-4 block">What matters most to you?</Label>
            <RadioGroup
              value={preferences.priority}
              onValueChange={(value: any) => 
                setPreferences({ ...preferences, priority: value })
              }
            >
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="cost" id="cost" />
                  <div>
                    <Label htmlFor="cost" className="font-semibold cursor-pointer">
                      💰 Cost Savings
                    </Label>
                    <p className="text-sm text-gray-500">Find the cheapest option</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="renewable" id="renewable" />
                  <div>
                    <Label htmlFor="renewable" className="font-semibold cursor-pointer">
                      🌱 Renewable Energy
                    </Label>
                    <p className="text-sm text-gray-500">Prioritize green power</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="flexibility" id="flexibility" />
                  <div>
                    <Label htmlFor="flexibility" className="font-semibold cursor-pointer">
                      🔄 Flexibility
                    </Label>
                    <p className="text-sm text-gray-500">Avoid long contracts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <div>
                    <Label htmlFor="balanced" className="font-semibold cursor-pointer">
                      ⚖️ Balanced
                    </Label>
                    <p className="text-sm text-gray-500">Consider all factors equally</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Advanced Filters */}
          <details className="mb-6">
            <summary className="cursor-pointer text-sm text-gray-600 mb-4">
              ▼ Advanced Filters (optional)
            </summary>
            
            <div className="space-y-6 pl-4">
              {/* Renewable % */}
              <div>
                <Label>Minimum Renewable Energy: {preferences.minRenewablePct}%</Label>
                <Slider
                  value={[preferences.minRenewablePct]}
                  onValueChange={([value]) => 
                    setPreferences({ ...preferences, minRenewablePct: value })
                  }
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              {/* Contract Length */}
              <div>
                <Label>Maximum Contract Length: {preferences.maxContractMonths} months</Label>
                <Slider
                  value={[preferences.maxContractMonths]}
                  onValueChange={([value]) => 
                    setPreferences({ ...preferences, maxContractMonths: value })
                  }
                  min={1}
                  max={36}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Supplier Rating */}
              <div>
                <Label>Minimum Supplier Rating: {preferences.minSupplierRating.toFixed(1)}/5.0</Label>
                <Slider
                  value={[preferences.minSupplierRating]}
                  onValueChange={([value]) => 
                    setPreferences({ ...preferences, minSupplierRating: value })
                  }
                  min={1}
                  max={5}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>
          </details>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/usage')}>
              ← Back
            </Button>
            <Button onClick={handleSubmit}>
              Get Recommendations →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
```

##### 5.4: Recommendations Page
Create `app/recommendations/page.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RecommendationResponse } from '@/types'

// Sign Up Button Component with MVP Modal
function SignUpButton({ planName }: { planName: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Sign Up →</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Up for {planName}</DialogTitle>
          <DialogDescription>
            In this MVP version, we don't yet link directly to supplier sign-up pages.
            To sign up for this plan, please visit the supplier's website directly or
            contact them using the information provided in the plan details.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <strong>Coming soon:</strong> Direct sign-up links and streamlined enrollment process.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function RecommendationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const usageData = JSON.parse(sessionStorage.getItem('usageData') || '[]')
      const preferences = JSON.parse(sessionStorage.getItem('preferences') || '{}')

      if (usageData.length !== 12) {
        router.push('/usage')
        return
      }

      const state = sessionStorage.getItem('state') || 'TX'
      const currentPlan = sessionStorage.getItem('currentPlan')

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123', // TODO: Get from auth session
          state,
          monthlyUsageKwh: usageData,
          currentPlan: currentPlan ? { planId: currentPlan } : undefined,
          preferences
        })
      })

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('X-RateLimit-Reset')
          throw new Error(`Too many requests. Please wait a moment and try again.`)
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations. Please try again.'
      setError(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Finding your perfect energy plan...</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p>✓ Analyzing your usage patterns</p>
            <p>✓ Comparing energy plans in your state</p>
            <p className="text-green-600">⟳ Generating explanations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !recommendations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/preferences')}>
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  const rankBadges = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Personalized Recommendations</h1>
          <p className="text-gray-600">
            Based on {recommendations.metadata.totalAnnualUsageKwh.toLocaleString()} kWh annual usage
            ({recommendations.metadata.usagePattern.replace('_', ' ')} pattern)
          </p>
        </div>

        <div className="space-y-6">
          {recommendations.recommendations.map((rec, index) => (
            <Card key={rec.plan.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{rankBadges[index]}</span>
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      #{rec.rank} {index === 0 ? 'BEST MATCH' : 'RUNNER-UP'}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold">{rec.plan.planName}</h2>
                  <p className="text-gray-600">{rec.plan.supplierName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Annual Cost</p>
                  <p className="text-2xl font-bold">${rec.projectedAnnualCost.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Savings</p>
                  <p className={`text-2xl font-bold ${rec.annualSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {rec.annualSavings >= 0 ? '+' : ''}{rec.annualSavings.toFixed(0)}/yr
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Renewable</p>
                  <p className="text-xl font-semibold">🌱 {rec.plan.renewablePct}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contract</p>
                  <p className="text-xl font-semibold">
                    ⏱️ {rec.plan.contractLengthMonths || 'No'} {rec.plan.contractLengthMonths ? 'mo' : 'contract'}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <p className="text-gray-800">{rec.explanation}</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => router.push(`/plan/${rec.plan.id}`)}>
                  View Details
                </Button>
                <SignUpButton planName={rec.plan.planName} />
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => {
            sessionStorage.clear()
            router.push('/usage')
          }}>
            Start Over
          </Button>
          <Button variant="outline" onClick={() => router.push('/preferences')}>
            Try Different Preferences
          </Button>
        </div>
      </div>
    </div>
  )
}
```

##### 5.5: Plan Details Page
Create `app/plan/[id]/page.tsx`:
```typescript
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/database/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'

// Sign Up Button Component with MVP Modal
function SignUpButton({ planName }: { planName: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">Sign Up for This Plan →</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Up for {planName}</DialogTitle>
          <DialogDescription>
            In this MVP version, we don't yet link directly to supplier sign-up pages.
            To sign up for this plan, please visit the supplier's website directly or
            contact them using the information provided in the plan details.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <strong>Coming soon:</strong> Direct sign-up links and streamlined enrollment process.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default async function PlanDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const plan = await prisma.plan.findUnique({
    where: { id: params.id }
  })

  if (!plan) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Link href="/recommendations">
          <Button variant="ghost" className="mb-4">← Back to Results</Button>
        </Link>

        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{plan.planName}</h1>
            <p className="text-xl text-gray-600">{plan.supplierName}</p>
            <div className="flex items-center gap-2 mt-2">
              <span>⭐</span>
              <span className="font-semibold">{plan.supplierRating}/5.0</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Rate per kWh:</span>
                <span className="font-semibold">${plan.ratePerKwh.toFixed(4)}/kWh</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Fee:</span>
                <span className="font-semibold">${plan.monthlyFee.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Contract Terms */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Contract Terms</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Length:</span>
                <span className="font-semibold">
                  {plan.contractLengthMonths ? `${plan.contractLengthMonths} months` : 'Month-to-month'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Early Termination Fee:</span>
                <span className="font-semibold">${plan.earlyTerminationFee.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Energy Source */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Energy Source</h2>
            <div className="flex items-center gap-2">
              <Badge variant={plan.renewablePct >= 50 ? 'default' : 'secondary'}>
                {plan.renewablePct}% Renewable
              </Badge>
              <span className="text-sm text-gray-600">
                {plan.renewablePct === 100 ? '100% clean energy!' : `${100 - plan.renewablePct}% traditional sources`}
              </span>
            </div>
          </div>

          <SignUpButton planName={plan.planName} />
        </Card>
      </div>
    </div>
  )
}
```

#### Completion Tests
- [ ] Landing page loads and CTA button works
- [ ] Usage input: CSV upload parses correctly
- [ ] Usage input: Manual entry validates (requires all 12 months)
- [ ] Usage input: "Next" button disabled until valid data
- [ ] Preferences: All 4 priority options selectable
- [ ] Preferences: Advanced filters adjust correctly
- [ ] Recommendations: Loading state shows for 2-5 seconds
- [ ] Recommendations: Top 3 plans display with all data
- [ ] Recommendations: Explanations are clear and specific
- [ ] Plan details: Shows complete plan information
- [ ] Mobile: All pages work on phone viewport
- [ ] Navigation: Can go back/forward through flow

#### Pitfalls to Avoid
- ❌ Not showing loading states (users think app is frozen)
- ❌ Not validating input on client side (bad UX)
- ❌ Losing user data on page refresh (use sessionStorage)
- ❌ Not handling API errors gracefully
- ❌ Poor mobile experience (test on actual devices!)
- ❌ Unclear error messages

---

### Phase 6: Testing (4-5 hours) - EFFORT: Medium

**Objective:** Comprehensive testing of full application

#### Tasks Checklist

##### 6.1: Unit Tests (Backend Logic)
Create `__tests__/scoring/usage-analysis.test.ts`:
```typescript
import { analyzeUsage } from '@/lib/scoring/usage-analysis'

describe('Usage Analysis', () => {
  test('identifies summer peak pattern', () => {
    const usage = [800, 850, 900, 950, 1000, 1400, 1500, 1450, 1100, 950, 900, 850]
    const result = analyzeUsage(usage)
    
    expect(result.pattern).toBe('summer_peak')
    expect(result.totalAnnualKwh).toBe(12650)
  })

  test('calculates correct averages', () => {
    const usage = Array(12).fill(1000)
    const result = analyzeUsage(usage)
    
    expect(result.monthlyAverage).toBe(1000)
    expect(result.totalAnnualKwh).toBe(12000)
  })

  test('throws error for invalid data', () => {
    expect(() => analyzeUsage([1, 2, 3])).toThrow()
  })
})
```

##### 6.2: API Route Tests
Create `__tests__/api/recommendations.test.ts`:
```typescript
import { POST } from '@/app/api/recommendations/route'
import { NextRequest } from 'next/server'

describe('Recommendations API', () => {
  test('returns 400 for invalid request', async () => {
    const request = new NextRequest('http://localhost:3000/api/recommendations', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' })
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  test('returns recommendations for valid request', async () => {
    const request = new NextRequest('http://localhost:3000/api/recommendations', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'test',
        monthlyUsageKwh: Array(12).fill(1000),
        preferences: {
          priority: 'balanced',
          minRenewablePct: 0,
          maxContractMonths: 24,
          minSupplierRating: 3.0
        }
      })
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.recommendations).toHaveLength(3)
  })
})
```

##### 6.3: E2E Tests (Playwright)
Install Playwright:
```bash
npm install -D @playwright/test
npx playwright install
```

Create `tests/e2e/happy-path.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test('complete recommendation flow', async ({ page }) => {
  // Landing page
  await page.goto('http://localhost:3000')
  await expect(page.getByRole('heading', { name: /Find Your Perfect Energy Plan/i })).toBeVisible()
  await page.getByRole('link', { name: /Get Started/i }).click()

  // Usage input
  await expect(page).toHaveURL('/usage')
  
  // Fill in manual entry
  for (let i = 0; i < 12; i++) {
    await page.fill(`input[id="month-${i}"]`, '1000')
  }
  
  await page.getByRole('button', { name: /Next: Preferences/i }).click()

  // Preferences
  await expect(page).toHaveURL('/preferences')
  await page.getByRole('radio', { name: /Cost Savings/i }).check()
  await page.getByRole('button', { name: /Get Recommendations/i }).click()

  // Recommendations
  await expect(page).toHaveURL('/recommendations')
  
  // Wait for loading to finish
  await expect(page.getByText(/Finding your perfect energy plan/i)).toBeVisible()
  await expect(page.getByText(/Your Personalized Recommendations/i)).toBeVisible({ timeout: 10000 })

  // Verify recommendations
  await expect(page.getByText(/BEST MATCH/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /View Details/i }).first()).toBeVisible()
})
```

##### 6.4: Accessibility Testing
Run Lighthouse:
```bash
npm install -D @lighthouse/cli
npx lighthouse http://localhost:3000 --view
```

Check for:
- [ ] Lighthouse Accessibility score ≥90
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA

##### 6.5: Performance Testing
- [ ] Initial page load: <3 seconds
- [ ] Time to Interactive: <5 seconds
- [ ] Recommendations API: <2 seconds (P95)
- [ ] No console errors in production build

#### Completion Tests
- [ ] All unit tests pass: `npm test`
- [ ] E2E tests pass: `npx playwright test`
- [ ] Mobile flow works on actual device
- [ ] Lighthouse score ≥90 on all pages
- [ ] No TypeScript errors: `npm run build`

#### Pitfalls to Avoid
- ❌ Skipping mobile testing
- ❌ Not testing error states
- ❌ Ignoring accessibility
- ❌ Only testing happy path

---

### Phase 7: Deployment (2-3 hours) - EFFORT: Low

**Objective:** Deploy to Vercel and Supabase production

#### Tasks Checklist

##### 7.1: Prepare for Production
```bash
# Ensure production build works
npm run build

# Test production build locally
npm start
```

##### 7.2: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Or via GitHub:**
1. Push code to GitHub
2. Go to vercel.com
3. Import GitHub repository
4. Vercel auto-deploys on every push!

##### 7.3: Configure Environment Variables in Vercel
In Vercel dashboard:
- `ANTHROPIC_API_KEY` = your-key
- `NEXT_PUBLIC_SUPABASE_URL` = your-url
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your-key
- `DATABASE_URL` = your-connection-string
- `ENABLE_SEASONAL_SCORING` = false (or true to enable)

##### 7.4: Set up Production Database
In Supabase dashboard:
1. Ensure production database is separate from dev
2. Run: `npx prisma db push` with production DATABASE_URL
3. Wait 5-10 seconds for schema to fully apply
4. Run: `npm run seed` to load plan data

**Note on Migrations:**
- MVP uses `prisma db push` (prototyping tool, no migration files)
- Post-MVP: Switch to `prisma migrate dev` and `prisma migrate deploy` for proper version control
- Rollback strategy: Vercel allows instant rollback to previous deployment from dashboard

##### 7.5: Configure Custom Domain (Optional)
1. Add domain in Vercel
2. Update DNS records
3. Automatic HTTPS via Let's Encrypt

##### 7.6: Set up Monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry optional)
- [ ] Configure uptime monitoring

#### Completion Tests
- [ ] Production site accessible via HTTPS
- [ ] Can complete full user flow in production
- [ ] API endpoints work
- [ ] Database queries succeed
- [ ] No console errors
- [ ] Environment variables configured

#### Pitfalls to Avoid
- ❌ Forgetting to set environment variables
- ❌ Using dev database in production
- ❌ Not testing in production before announcing
- ❌ Exposing API keys in client-side code

---

## Development Timeline Estimate

| Phase | Effort Level | Estimated Hours | Key Deliverable |
|-------|-------------|-----------------|------------------|
| Phase 0: Setup | Low | 0.5-0.75 | Next.js project initialized |
| Phase 1: Data Models | Medium | 3-4 | Database schema + seed data |
| Phase 2: Core Logic | High | 6-8 | Working scoring algorithm |
| Phase 3: LLM Explanations | Medium | 3-4 | AI-generated explanations |
| Phase 4: API Routes | Low-Medium | 2-3 | REST API endpoints |
| Phase 5: Frontend | High | 10-14 | Complete web UI |
| Phase 6: Testing | Medium | 4-5 | E2E tests passing |
| Phase 7: Deployment | Low | 2-3 | Live production site |
| **TOTAL** | - | **31-44 hours** | Full-stack web app deployed |

**Recommended Approach:**
- **Days 1-2 (12-16 hours)**: Backend (Phases 0-4)
  - Set up project, build recommendation engine, test API
- **Days 3-4 (12-16 hours)**: Frontend (Phase 5)
  - Build all pages, integrate with API
- **Day 5 (7-12 hours)**: Testing & Deployment (Phases 6-7)
  - E2E tests, deploy to production

---

## Major Implementation Pitfalls

### Next.js Specific Pitfalls

#### Pitfall 1: Using Pages Router Instead of App Router
**Problem:** Pages Router is old pattern, lacks modern features.
**Solution:** Always use `app/` directory (App Router). Check during `create-next-app`.

#### Pitfall 2: Client vs Server Components Confusion
**Problem:** Using `'use client'` everywhere or hooks in Server Components.
**Solution:**
- Server Components by default (database queries, async)
- Client Components only when needed (useState, onClick, etc.)

#### Pitfall 3: Environment Variable Exposure
**Problem:** Putting secrets in `NEXT_PUBLIC_*` variables.
**Solution:**
- `NEXT_PUBLIC_*` = public (visible in browser)
- Regular env vars = server-only (safe for API keys)

#### Pitfall 4: Not Using `.env.local`
**Problem:** Using `.env` instead of `.env.local` for local secrets.
**Solution:** Next.js convention is `.env.local` for local development secrets.

### Data Processing Pitfalls

#### Pitfall 5: Over-engineering Without Pandas
**Problem:** Thinking JavaScript can't handle data processing.
**Solution:** Array methods (map, filter, reduce) are sufficient for this project.

Example:
```typescript
// You DON'T need Pandas for this!
const summerAvg = usage.slice(5, 8).reduce((sum, kwh) => sum + kwh, 0) / 3
const pattern = summerAvg > winterAvg * 1.2 ? 'summer_peak' : 'flat'
```

#### Pitfall 6: Ignoring Early Termination Fees
**Problem:** Recommending "cheaper" plan that requires $200 ETF.
**Solution:** Always include switching costs in first-year calculations.

### Frontend Pitfalls

#### Pitfall 7: Not Persisting State Between Pages
**Problem:** User loses data when navigating back/forward.
**Solution:** Use `sessionStorage` to persist form data across navigation.

#### Pitfall 8: Poor Loading States
**Problem:** Users think app is broken during API calls.
**Solution:** Always show loading spinners for operations >500ms.

#### Pitfall 9: Not Testing on Mobile
**Problem:** 50%+ users on mobile, but design only works on desktop.
**Solution:** Test on actual devices throughout development. Use Tailwind's responsive classes.

### API Pitfalls

#### Pitfall 10: Not Validating Input
**Problem:** Invalid data causes crashes.
**Solution:** Use Zod for type-safe validation on all API routes.

#### Pitfall 11: Synchronous LLM Calls
**Problem:** Blocking API response waiting for 3 sequential LLM calls.
**Solution:** Use `Promise.all()` to parallelize explanation generation.

### Database Pitfalls

#### Pitfall 12: Not Using Prisma Client Singleton
**Problem:** Creating multiple Prisma clients in development causes connection issues.
**Solution:** Use singleton pattern (see Phase 1 database client).

#### Pitfall 13: Forgetting Indexes
**Problem:** Slow queries as plan catalog grows.
**Solution:** Add indexes on filtered fields (renewable_pct, rate_per_kwh, supplier_name).

#### Pitfall 14: Hard-coding Business Rules
**Problem:** Scoring weights buried in code, can't adjust without code changes.
**Solution:** Extract all weights and thresholds to constants.

---

## Success Criteria

### MVP Launch Criteria

#### Backend
- [ ] API returns top 3 recommendations in <2 seconds
- [ ] Cost calculations verified (10+ test cases)
- [ ] Scoring algorithm respects user preferences
- [ ] Database has 20+ sample plans
- [ ] Prisma migrations work in production

#### Frontend
- [ ] Complete user flow works end-to-end
- [ ] Mobile-responsive (iPhone, Android tested)
- [ ] Loading states show during API calls
- [ ] Error messages are user-friendly
- [ ] CSV upload and manual entry both work
- [ ] Works in Chrome, Firefox, Safari

#### Integration
- [ ] Frontend successfully calls backend API
- [ ] E2E tests pass (Playwright)
- [ ] Deployed to production (HTTPS)
- [ ] All environment variables configured

### Technical Success Metrics
- Page load time: <3 seconds (First Contentful Paint)
- Time to Interactive: <5 seconds
- API response time: <2 seconds (P95)
- Lighthouse score: ≥90
- Error rate: <0.5% of sessions
- Mobile usage: 50%+ of traffic

---

## Final Notes

This implementation PRD enables rapid **Next.js full-stack development** with:

1. **Single codebase** (UI + API in one repo)
2. **One language** (TypeScript everywhere)
3. **Type safety** (Prisma + Zod)
4. **Simple deployment** (one Vercel deploy)
5. **Excellent AI support** (Next.js has tons of training data)

**Key Success Factors:**

**Simplicity:**
- No separate backend/frontend repos
- No CORS issues
- No language context switching
- One deployment instead of two

**Speed:**
- TypeScript autocomplete everywhere
- shadcn/ui components (copy-paste, not installed)
- Tailwind for rapid styling
- Vercel for instant deployment

**Quality:**
- Type safety catches errors at compile time
- Prisma prevents SQL injection
- Zod validates all input
- Next.js optimizes automatically

**Remember:** This is a 3/10 complexity project. Don't over-engineer. Focus on:
1. Accurate cost calculations
2. Sensible plan rankings  
3. Clear, honest explanations
4. Intuitive user experience

**Development Strategy:**
- Days 1-2: Backend (API + logic)
- Days 3-4: Frontend (all pages)
- Day 5: Testing + Deployment
- Total: 31-44 hours

**Tools That Save Time:**
- Next.js (full-stack in one)
- Prisma (type-safe database)
- shadcn/ui (beautiful components)
- Vercel (zero-config deployment)
- RECS 2020 data (realistic test cases)

---

## Quick Start

```bash
# 1. Create project (1 minute)
npx create-next-app@latest energy-recommender --typescript --tailwind --app
cd energy-recommender

# 2. Install dependencies (2 minutes)
npm install @anthropic-ai/sdk @supabase/supabase-js zod react-hook-form @hookform/resolvers prisma

# 3. Initialize Prisma (1 minute)
npx prisma init

# 4. Add shadcn/ui (2 minutes)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select table badge

# 5. Start development (instant)
npm run dev
```

**Visit:** http://localhost:3000 - you're ready to code! 🚀

---

**Document Version:** 3.2 (Next.js Edition - Final Review)  
**Last Updated:** November 11, 2025  
**Next Review:** After Phase 5 completion (frontend fully integrated)

**Changes in v3.2 (Final Review Pass):**
- Fixed CurrentPlan type mismatch (startDate now optional)
- Fixed early termination fee logic (use current plan's ETF, not new plan's)
- Added state field to RecommendationRequest interface
- Fixed cost calculator to handle current plan ETF properly
- Updated filterAndRankPlans signature to accept currentPlanETF
- Added default case to cost calculator switch statement
- Fixed savings display color (green for positive, red for negative)
- Changed landing page copy from "100+ plans" to "20+ plans" for MVP accuracy
- Added state filter to plans API route
- Fixed duplicate import in recommendations route
- Added finalScore to PlanRecommendation breakdown type
- Added ENABLE_SEASONAL_SCORING to Vercel env vars list
- Added "Start Over" button to recommendations page
- Improved error handling to show specific error messages
- Added cache size limit (1000 entries) to prevent memory leak
- Added explicit warnings for TOU and variable rate estimates
- Clarified current plan feature is simplified for MVP

**Changes in v3.1:**
- Fixed seasonal scoring logic bug (switch statement instead of multiple ifs)
- Added `state` field to Plan interface
- Fixed LLM cache key to include state
- Updated Claude model name to correct version
- Fixed rate limiter documentation (serverless limitations)
- Added timeout handling for LLM calls
- Improved CSV parser with better error handling
- Added 429 error handling in frontend
- Fixed cost score normalization edge case
- Clarified auth as optional for MVP
- Added ENABLE_SEASONAL_SCORING to env vars
- Improved state validation error messages

**Known Limitations (Documented for Implementation):**
1. Rate limiter in-memory store won't work in production serverless (use Vercel's rate limiting)
2. Anthropic SDK may not support AbortController signal (use Promise.race as fallback)
3. Current plan feature is simplified - only stores planId, not full details
4. CSV parser is basic - post-MVP should use papaparse
5. Explanation cache has max size (1000) but no LRU eviction
6. TOU and variable rate costs are estimates (40/60 split assumed)
7. Auth is optional for MVP - can be fully implemented post-MVP
8. No pagination on plans API (fine for 20-50 plans)

---

## Implementation Notes & Gotchas

### Critical: Anthropic SDK Timeout Handling

The PRD includes AbortController for timeout handling:
```typescript
signal: controller.signal
```

**If this doesn't work** (Anthropic SDK may not support signals), use this alternative:

```typescript
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 10000)
)

const message = await Promise.race([
  anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  }),
  timeoutPromise
]) as Anthropic.Message
```

### Scraper Implementation (Optional Efficiency Tool)

To populate the 12-14 additional Texas plans, you can either:

**Option A: Manual Entry** (15-30 minutes)
- Visit https://www.powertochoose.org
- Filter for plans with good ratings
- Manually add to `prisma/seed.ts`

**Option B: Simple Scraper** (1-2 hours to build)

Create `scripts/scrape-powertochoose.ts`:
```typescript
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

async function scrapePowerToChoose() {
  // Note: PowerToChoose.org structure as of Nov 2025
  // This may break if site changes
  
  const url = 'https://www.powertochoose.org/...' // Add actual search URL
  
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)
  
  const plans: any[] = []
  
  $('.plan-row').each((i, elem) => {
    plans.push({
      planId: $(elem).find('.plan-id').text().trim(),
      state: 'TX',
      supplierName: $(elem).find('.supplier-name').text().trim(),
      planName: $(elem).find('.plan-name').text().trim(),
      rateType: 'fixed', // Determine from plan details
      ratePerKwh: parseFloat($(elem).find('.rate').text()),
      monthlyFee: parseFloat($(elem).find('.monthly-fee').text()),
      contractLengthMonths: parseInt($(elem).find('.contract-length').text()),
      earlyTerminationFee: parseFloat($(elem).find('.etf').text()),
      renewablePct: parseInt($(elem).find('.renewable-pct').text()),
      supplierRating: 4.0, // Default or scrape from reviews
      planDetails: {}
    })
  })
  
  // Output to JSON for manual review
  console.log(JSON.stringify(plans, null, 2))
}
```

**Requirements:**
```bash
npm install cheerio node-fetch @types/node-fetch
```

**Important:** Always manually review scraped data before seeding database!

### Additional Recommended Files

**1. Add Custom 404 Page**
Create `app/not-found.tsx`:
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
```

**2. Add Global Error Page**
Create `app/error.tsx`:
```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  )
}
```

**3. Extract SignUpButton to Shared Component**
Create `components/shared/sign-up-button.tsx`:
```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface SignUpButtonProps {
  planName: string
  variant?: 'default' | 'outline'
  className?: string
}

export function SignUpButton({ planName, variant = 'outline', className }: SignUpButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          Sign Up →
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Up for {planName}</DialogTitle>
          <DialogDescription>
            In this MVP version, we don't yet link directly to supplier sign-up pages.
            To sign up for this plan, please visit the supplier's website directly or
            contact them using the information provided in the plan details.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <strong>Coming soon:</strong> Direct sign-up links and streamlined enrollment process.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

Then import in recommendations and plan details pages:
```typescript
import { SignUpButton } from '@/components/shared/sign-up-button'
```

**4. Add Example CSV Template**
Create `public/example-usage.csv`:
```csv
Month,kWh
January,850
February,820
March,780
April,750
May,920
June,1450
July,1620
August,1580
September,1100
October,870
November,800
December,840
```

Then add download link in usage page:
```typescript
<a href="/example-usage.csv" download className="text-sm text-blue-600 hover:underline">
  Download example CSV
</a>
```

### sessionStorage Error Handling

Wrap all sessionStorage access in try/catch:

```typescript
function safeGetSessionStorage(key: string, fallback: any = null) {
  try {
    return sessionStorage.getItem(key)
  } catch (error) {
    console.error('SessionStorage not available:', error)
    return fallback
  }
}

function safeSetSessionStorage(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value)
  } catch (error) {
    console.error('Failed to save to sessionStorage:', error)
  }
}
```

### Testing Notes

**Unit Tests:**
- Use Next.js built-in Jest support (no extra config needed)
- Create `jest.setup.js` for test environment
- Mock Prisma client in tests
- Mock Anthropic API calls

**E2E Tests:**
- Mock external API calls (Anthropic)
- Use test database (separate from dev/prod)
- Clear sessionStorage between tests

**Example jest.setup.js:**
```javascript
import '@testing-library/jest-dom'

// Mock Prisma
jest.mock('@/lib/database/client', () => ({
  prisma: {
    plan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    }
  }
}))

// Mock Anthropic
jest.mock('@/lib/anthropic/client', () => ({
  anthropic: {
    messages: {
      create: jest.fn()
    }
  }
}))
```