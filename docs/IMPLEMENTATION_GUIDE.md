# Implementation Guide: Post-MVP Features

This document provides a comprehensive implementation guide for features that were skipped during initial development. Each section includes implementation steps, code examples, and testing considerations.

---

## Table of Contents

1. [WCAG 2.1 Accessibility Compliance](#1-wcag-21-accessibility-compliance)
2. [Public APIs for Energy Data](#2-public-apis-for-energy-data)
3. [AWS Migration (Conditional)](#3-aws-migration-conditional)
4. [Current Plan Ingestion & Cost Comparison](#4-current-plan-ingestion--cost-comparison)
5. [Highlighting Data Uncertainty](#5-highlighting-data-uncertainty)
6. [Mobile Responsiveness Testing](#6-mobile-responsiveness-testing)
7. [Recommendation Rating System](#7-recommendation-rating-system)

---

## 1. WCAG 2.1 Accessibility Compliance

### Overview
Ensure the application meets WCAG 2.1 Level AA standards for accessibility, making it usable by people with disabilities.

### Implementation Steps

#### 1.1 Audit Current State
**Tools:**
- Lighthouse (Chrome DevTools)
- axe DevTools extension
- WAVE browser extension
- Keyboard navigation testing

**Command:**
```bash
# Run Lighthouse audit
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:3000
```

#### 1.2 Semantic HTML & ARIA Labels
**Files to Update:**
- `app/page.tsx`
- `app/recommendations/page.tsx`
- `app/usage/page.tsx`
- `app/preferences/page.tsx`
- All component files in `components/`

**Example Implementation:**

```typescript
// Before
<button onClick={handleSubmit}>Submit</button>

// After
<button 
  onClick={handleSubmit}
  aria-label="Submit usage data and proceed to preferences"
  type="button"
>
  Submit
</button>
```

**Key Areas:**
1. **Form Labels**: Ensure all inputs have associated labels
   ```tsx
   <label htmlFor="monthly-usage" className="sr-only">
     Monthly Usage (kWh)
   </label>
   <Input
     id="monthly-usage"
     type="number"
     aria-describedby="usage-help"
   />
   <span id="usage-help" className="text-sm text-slate-500">
     Enter your monthly energy usage in kilowatt-hours
   </span>
   ```

2. **Landmark Regions**: Add ARIA landmarks
   ```tsx
   <main role="main" aria-label="Energy plan recommendations">
     {/* Content */}
   </main>
   <nav role="navigation" aria-label="Main navigation">
     {/* Navigation */}
   </nav>
   ```

3. **Live Regions**: For dynamic content updates
   ```tsx
   <div 
     role="status" 
     aria-live="polite" 
     aria-atomic="true"
     className="sr-only"
   >
     {loadingMessage}
   </div>
   ```

#### 1.3 Keyboard Navigation
**Implementation Checklist:**
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible (4:1 contrast ratio)
- [ ] Tab order is logical
- [ ] Skip links for main content
- [ ] Modal dialogs trap focus

**Example: Focus Management in Modals**
```typescript
// components/shared/sign-up-modal.tsx
useEffect(() => {
  if (open) {
    // Trap focus in modal
    const firstFocusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }
}, [open]);
```

#### 1.4 Color Contrast
**Requirements:**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Tools:**
- WebAIM Contrast Checker
- Chrome DevTools Color Contrast

**Update Tailwind Config:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Ensure all colors meet contrast requirements
        'slate-600': '#475569', // 4.5:1 on white
        'blue-600': '#2563eb',  // 4.5:1 on white
      }
    }
  }
}
```

#### 1.5 Screen Reader Support
**Implementation:**
1. Add `sr-only` utility for visually hidden text
2. Use `aria-describedby` for form help text
3. Provide alternative text for icons
4. Use `aria-expanded` for collapsible content

**Example:**
```tsx
<button
  aria-expanded={isOpen}
  aria-controls="recommendations-list"
  aria-label="Toggle recommendations filter"
>
  <FilterIcon aria-hidden="true" />
  <span className="sr-only">Filter recommendations</span>
</button>
```

#### 1.6 Testing Checklist
- [ ] Run Lighthouse accessibility audit (target: 90+)
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Keyboard-only navigation test
- [ ] Color contrast validation
- [ ] Form validation error announcements
- [ ] Dynamic content updates announced

**Test Script:**
```bash
# Add to package.json
"test:a11y": "lhci autorun --collect.url=http://localhost:3000 --assert.assertions.offline=false"
```

---

## 2. Public APIs for Energy Data

### Overview
Identify and integrate publicly available APIs for energy supplier data and customer usage data to reduce manual data entry and improve accuracy.

### Research Phase

#### 2.1 Energy Supplier Data APIs
**Potential Sources:**

1. **Energy Information Administration (EIA) API**
   - URL: `https://api.eia.gov/`
   - Free tier available
   - Provides energy data, prices, and supplier information
   - Documentation: https://www.eia.gov/opendata/

2. **Power to Choose (Texas)**
   - URL: `https://www.powertochoose.org/`
   - Public data available via scraping (check ToS)
   - Texas-specific energy plans

3. **State Public Utility Commissions**
   - Each state has PUC data
   - May require web scraping or manual data collection
   - Examples:
     - Texas: PUCT
     - Pennsylvania: PUC
     - Ohio: PUCO

4. **EnergyBot API** (if available)
   - Commercial API for energy plan data
   - May require subscription

#### 2.2 Customer Usage Data APIs
**Potential Sources:**

1. **Utility Company APIs**
   - Many utilities offer APIs for customer data
   - Examples: PG&E, ConEd, etc.
   - Requires OAuth authentication
   - User must grant access

2. **Green Button API**
   - Standard for energy usage data
   - Many utilities support Green Button Connect
   - Documentation: https://www.greenbuttondata.org/

3. **Smart Meter APIs**
   - Utility-specific APIs
   - Real-time usage data
   - Requires user authentication

### Implementation Plan

#### Phase 1: Research & Selection (1-2 weeks)
1. **Evaluate APIs:**
   ```typescript
   // Create research document
   // docs/api-research.md
   ```
   - Check API availability and reliability
   - Review rate limits and pricing
   - Assess data quality and coverage
   - Verify legal/compliance requirements

2. **Test API Access:**
   ```typescript
   // scripts/test-energy-apis.ts
   import fetch from 'node-fetch';

   async function testEIAAPI() {
     const apiKey = process.env.EIA_API_KEY;
     const url = `https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=${apiKey}`;
     
     try {
       const response = await fetch(url);
       const data = await response.json();
       console.log('EIA API Test:', data);
     } catch (error) {
       console.error('EIA API Error:', error);
     }
   }
   ```

#### Phase 2: API Integration (2-3 weeks)

**Create API Client:**
```typescript
// lib/api/energy-data-client.ts
interface EnergyAPIConfig {
  eiaApiKey?: string;
  enableGreenButton?: boolean;
}

export class EnergyDataClient {
  private config: EnergyAPIConfig;

  constructor(config: EnergyAPIConfig) {
    this.config = config;
  }

  /**
   * Fetch energy plans from EIA API
   */
  async fetchEnergyPlans(state: string): Promise<Plan[]> {
    // Implementation
  }

  /**
   * Fetch usage data via Green Button API
   */
  async fetchUsageData(utilityId: string, accessToken: string): Promise<number[]> {
    // Implementation
  }
}
```

**Update Plan Seeding:**
```typescript
// scripts/sync-plans-from-api.ts
import { EnergyDataClient } from '@/lib/api/energy-data-client';
import { prisma } from '@/lib/database/client';

async function syncPlansFromAPI() {
  const client = new EnergyDataClient({
    eiaApiKey: process.env.EIA_API_KEY,
  });

  const states = ['TX', 'PA', 'OH', 'IL'];
  
  for (const state of states) {
    const plans = await client.fetchEnergyPlans(state);
    
    for (const plan of plans) {
      await prisma.plan.upsert({
        where: { planId: plan.planId },
        update: plan,
        create: plan,
      });
    }
  }
}
```

**Add Scheduled Job:**
```typescript
// lib/jobs/sync-energy-data.ts
// Use Vercel Cron or similar for scheduled updates
export async function syncEnergyData() {
  // Run daily/weekly to keep plan data fresh
}
```

#### Phase 3: User Usage Data Integration (2-3 weeks)

**Green Button OAuth Flow:**
```typescript
// app/api/auth/green-button/route.ts
export async function GET(request: NextRequest) {
  // OAuth flow for Green Button
  const authUrl = buildGreenButtonAuthUrl();
  return NextResponse.redirect(authUrl);
}

// app/api/auth/green-button/callback/route.ts
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const accessToken = await exchangeCodeForToken(code);
  
  // Store token securely
  // Fetch usage data
  const usageData = await fetchUsageData(accessToken);
  
  return NextResponse.json({ usageData });
}
```

**Update Usage Page:**
```tsx
// app/usage/page.tsx
<Button
  onClick={handleConnectUtility}
  variant="outline"
>
  🔌 Connect Your Utility Account
</Button>
```

### Implementation Checklist
- [ ] Research and select primary API(s)
- [ ] Set up API keys and authentication
- [ ] Create API client wrapper
- [ ] Implement plan data sync
- [ ] Add scheduled sync job
- [ ] Implement Green Button OAuth (if applicable)
- [ ] Add error handling and fallbacks
- [ ] Update documentation

### Notes
- **Rate Limits**: Implement caching and rate limit handling
- **Data Quality**: Validate and sanitize API data before storing
- **Fallback**: Keep manual data entry as fallback option
- **Legal**: Ensure compliance with API terms of service

---

## 3. AWS Migration (Conditional)

### Overview
Evaluate whether migration to AWS is necessary based on scalability requirements. If current architecture (Vercel + Supabase) can handle thousands of concurrent users, migration may not be justified.

### Current Architecture Analysis

#### Current Stack:
- **Frontend/Backend**: Vercel (Next.js)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Anthropic API (external)

#### Scalability Assessment:

**Vercel Limits:**
- Hobby: 100GB bandwidth/month
- Pro: 1TB bandwidth/month, unlimited requests
- Enterprise: Custom limits

**Supabase Limits:**
- Free: 500MB database, 2GB bandwidth
- Pro: 8GB database, 50GB bandwidth, 2 CPU cores
- Team: 32GB database, 250GB bandwidth, 4 CPU cores

**Capacity Calculation:**
```
Assumptions:
- Average request: 50KB response
- 1000 concurrent users
- Each user makes 5 requests per session
- Session duration: 5 minutes

Bandwidth per session: 5 * 50KB = 250KB
Bandwidth per hour: 1000 users * 12 sessions/hour * 250KB = 3GB/hour
Bandwidth per month: 3GB * 24 * 30 = 2.16TB/month
```

### Decision Framework

**Stay on Current Architecture IF:**
- ✅ Expected traffic < 10,000 concurrent users
- ✅ Monthly bandwidth < 1TB
- ✅ Database size < 32GB
- ✅ Response times acceptable (< 2s)
- ✅ Cost is reasonable

**Migrate to AWS IF:**
- ❌ Need > 10,000 concurrent users
- ❌ Need > 1TB bandwidth/month
- ❌ Need custom infrastructure
- ❌ Need multi-region deployment
- ❌ Need advanced monitoring/analytics

### If Migration is Justified: AWS Architecture

#### 3.1 Target Architecture
```
┌─────────────────┐
│   CloudFront    │ (CDN)
└────────┬────────┘
         │
┌────────▼────────┐
│  Application    │
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌───▼───┐
│  ECS  │ │  ECS  │ (Fargate containers)
│ Task  │ │ Task  │
└───┬───┘ └───┬───┘
    │         │
┌───▼─────────▼───┐
│   RDS          │ (PostgreSQL)
│   (Multi-AZ)   │
└────────────────┘
```

#### 3.2 Migration Steps

**Step 1: Set Up AWS Infrastructure**
```bash
# Use Terraform or AWS CDK
# infrastructure/aws/main.tf
```

**Step 2: Database Migration**
```bash
# Export from Supabase
pg_dump $SUPABASE_URL > backup.sql

# Import to RDS
psql $RDS_URL < backup.sql
```

**Step 3: Update Environment Variables**
```typescript
// lib/config.ts
export const config = {
  database: {
    url: process.env.DATABASE_URL, // Now points to RDS
  },
  // ...
};
```

**Step 4: Deploy to ECS/Fargate**
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

**Step 5: Set Up CI/CD**
```yaml
# .github/workflows/deploy-aws.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push to ECR
      - name: Deploy to ECS
```

### Cost Comparison

**Current (Vercel Pro + Supabase Pro):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- **Total: ~$45/month**

**AWS (estimated for 1000 concurrent users):**
- ECS Fargate: ~$50/month
- RDS (db.t3.medium): ~$75/month
- ALB: ~$20/month
- CloudFront: ~$10/month
- **Total: ~$155/month**

### Recommendation
**Stay on current architecture** unless you have specific requirements that justify the 3x cost increase. Vercel + Supabase can handle thousands of concurrent users with proper optimization.

### If Staying: Optimization Checklist
- [ ] Enable Vercel Edge Caching
- [ ] Implement database connection pooling
- [ ] Add Redis caching layer (Upstash)
- [ ] Optimize API responses (compression, pagination)
- [ ] Implement CDN for static assets
- [ ] Monitor performance metrics

---

## 4. Current Plan Ingestion & Cost Comparison

### Overview
Allow users to input their current plan details and show cost savings when switching to recommended plans. Highlight when savings are minimal or non-existent.

### Implementation Steps

#### 4.1 Database Schema Updates
**Update Prisma Schema:**
```prisma
// prisma/schema.prisma
model UserCurrentPlan {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Plan identification
  planId            String?  // If plan exists in our database
  supplierName      String
  planName          String
  
  // Rate details
  ratePerKwh        Float
  rateType          String   // 'fixed', 'variable', 'tou'
  onPeakRate        Float?
  offPeakRate       Float?
  monthlyFee        Float    @default(0)
  
  // Contract details
  contractStartDate DateTime
  contractEndDate   DateTime?
  contractLengthMonths Int?
  earlyTerminationFee Float  @default(0)
  
  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([userId])
  @@index([userId])
}
```

**Run Migration:**
```bash
npx prisma migrate dev --name add_user_current_plan
```

#### 4.2 Create Current Plan Input Form
**New Component:**
```typescript
// components/forms/current-plan-form.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

interface CurrentPlanFormProps {
  onSubmit: (plan: CurrentPlanData) => void;
  onSkip: () => void;
}

export function CurrentPlanForm({ onSubmit, onSkip }: CurrentPlanFormProps) {
  const [formData, setFormData] = useState({
    supplierName: '',
    planName: '',
    ratePerKwh: '',
    rateType: 'fixed',
    monthlyFee: '0',
    contractEndDate: '',
    earlyTerminationFee: '0',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      ratePerKwh: parseFloat(formData.ratePerKwh),
      monthlyFee: parseFloat(formData.monthlyFee),
      earlyTerminationFee: parseFloat(formData.earlyTerminationFee),
      contractEndDate: formData.contractEndDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      <div className="flex gap-4">
        <Button type="submit">Save Current Plan</Button>
        <Button type="button" variant="outline" onClick={onSkip}>
          Skip
        </Button>
      </div>
    </form>
  );
}
```

#### 4.3 Update Preferences Page
**Add Current Plan Section:**
```tsx
// app/preferences/page.tsx
import { CurrentPlanForm } from '@/components/forms/current-plan-form';

export default function PreferencesPage() {
  const [showCurrentPlanForm, setShowCurrentPlanForm] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlanData | null>(null);

  return (
    <div>
      {/* Existing preferences form */}
      
      {/* Current Plan Section */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle>💡 Add Your Current Plan (Optional)</CardTitle>
          <CardDescription>
            Get personalized cost savings analysis by adding your current energy plan.
            We'll show you exactly how much you could save by switching.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan ? (
            <div>
              <p>Current Plan: {currentPlan.planName}</p>
              <Button onClick={() => setShowCurrentPlanForm(true)}>
                Edit Plan
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowCurrentPlanForm(true)}>
              Add Current Plan
            </Button>
          )}
          
          {showCurrentPlanForm && (
            <CurrentPlanForm
              onSubmit={(plan) => {
                setCurrentPlan(plan);
                setShowCurrentPlanForm(false);
                // Save to storage/API
              }}
              onSkip={() => setShowCurrentPlanForm(false)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 4.4 Update Recommendations API
**Enhance Cost Calculation:**
```typescript
// lib/scoring/cost-calculator.ts
export function calculatePlanCost(
  plan: Plan,
  monthlyUsageKwh: number[],
  currentPlanEarlyTerminationFee: number = 0,
  currentPlanCost?: number // Add current plan cost for comparison
): CostBreakdown {
  // Existing calculation...
  
  // Add savings calculation if current plan provided
  const savings = currentPlanCost 
    ? currentPlanCost - firstYearTotal 
    : 0;
  
  return {
    energyCharges,
    monthlyFees,
    firstYearTotal,
    switchingCost: currentPlanEarlyTerminationFee,
    savings, // Add savings field
  };
}
```

#### 4.5 Update Recommendations Page
**Show Cost Comparison:**
```tsx
// app/recommendations/page.tsx
{rec.annualSavings !== 0 && (
  <div className={`text-lg font-semibold ${
    rec.annualSavings > 0 
      ? 'text-green-600' 
      : rec.annualSavings > -50 
        ? 'text-yellow-600' 
        : 'text-red-600'
  }`}>
    {rec.annualSavings > 0 ? (
      <>💰 Save ${Math.abs(rec.annualSavings).toFixed(0)}/year</>
    ) : rec.annualSavings > -50 ? (
      <>⚠️ Similar cost (${Math.abs(rec.annualSavings).toFixed(0)} difference)</>
    ) : (
      <>📈 ${Math.abs(rec.annualSavings).toFixed(0)} more expensive</>
    )}
  </div>
)}
```

**Add Prominent Call-to-Action:**
```tsx
// At top of recommendations page
{!currentPlan && (
  <Card className="mb-6 border-2 border-blue-500 bg-blue-50">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-blue-900">
            💰 Get Cost Savings Analysis
          </h3>
          <p className="text-blue-700">
            Add your current plan to see exactly how much you could save by switching!
          </p>
        </div>
        <Button 
          onClick={() => router.push('/preferences')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Current Plan
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

#### 4.6 Update AI Explanations
**Include Savings Context:**
```typescript
// lib/anthropic/explanations.ts
export async function generateExplanation(
  plan: Plan,
  usageAnalysis: UsageAnalysis,
  preferences: UserPreferences,
  currentPlanCost?: number,
  annualSavings?: number
): Promise<string> {
  const prompt = `
    ${currentPlanCost ? `
    The user's current plan costs $${currentPlanCost.toFixed(2)}/year.
    This recommended plan would ${annualSavings && annualSavings > 0 ? 'save' : 'cost'} them $${Math.abs(annualSavings || 0).toFixed(2)}/year.
    ` : ''}
    
    ${annualSavings && annualSavings < 50 && annualSavings > -50 ? `
    Note: The cost difference is minimal. The user may want to consider other factors like renewable energy percentage or contract flexibility.
    ` : ''}
    
    ${annualSavings && annualSavings < 0 ? `
    Warning: This plan is more expensive than their current plan. Only recommend if there are significant other benefits (e.g., much higher renewable energy).
    ` : ''}
    
    Generate a personalized explanation...
  `;
  
  // Rest of explanation generation
}
```

### Implementation Checklist
- [ ] Update database schema
- [ ] Create current plan form component
- [ ] Add form to preferences page
- [ ] Update API to handle current plan
- [ ] Enhance cost calculator with savings
- [ ] Update recommendations UI to show savings
- [ ] Add prominent CTA on recommendations page
- [ ] Update AI explanations to mention savings
- [ ] Add visual indicators for minimal savings
- [ ] Test with various scenarios

---

## 5. Highlighting Data Uncertainty

### Overview
Clearly communicate to users when recommendations have low confidence due to insufficient or incomplete data.

### Implementation Steps

#### 5.1 Enhance Confidence Calculation
**Update Confidence Logic:**
```typescript
// app/api/recommendations/route.ts
function determineConfidence(
  topFive: ScoredPlan[],
  usageData: number[],
  usageAnalysis: UsageAnalysis
): 'high' | 'medium' | 'low' {
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  
  // Check data completeness
  const missingMonths = usageData.filter(v => v === 0 || !v).length;
  if (missingMonths > 3) {
    confidence = 'low';
  }
  
  // Check usage pattern clarity
  if (usageAnalysis.pattern === 'variable') {
    confidence = confidence === 'low' ? 'low' : 'medium';
  }
  
  // Check score spread
  if (topFive.length < 5) {
    confidence = 'low';
  } else {
    const scores = topFive.map(p => p.score.finalScore);
    const scoreDiff = scores[0] - scores[4];
    
    if (scoreDiff < 5) {
      confidence = 'low'; // Very close scores = uncertain
    } else if (scoreDiff < 15) {
      confidence = confidence === 'low' ? 'low' : 'medium';
    }
  }
  
  // Check if we have enough plans to compare
  if (topFive.length < 3) {
    confidence = 'low';
  }
  
  return confidence;
}
```

#### 5.2 Create Uncertainty Indicator Component
```typescript
// components/recommendations/uncertainty-banner.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UncertaintyBannerProps {
  confidence: 'high' | 'medium' | 'low';
  reasons?: string[];
}

export function UncertaintyBanner({ confidence, reasons = [] }: UncertaintyBannerProps) {
  if (confidence === 'high') {
    return null; // Don't show banner for high confidence
  }

  const config = {
    low: {
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-900',
      icon: '⚠️',
      title: 'Low Confidence Recommendations',
      message: 'These recommendations have lower confidence due to limited data.',
    },
    medium: {
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-900',
      icon: 'ℹ️',
      title: 'Moderate Confidence',
      message: 'Recommendations are based on available data, but more information could improve accuracy.',
    },
  };

  const style = config[confidence];

  return (
    <Card className={`${style.color} border-2 mb-6`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{style.icon}</span>
          <div className="flex-1">
            <h3 className={`font-bold ${style.textColor} mb-2`}>
              {style.title}
            </h3>
            <p className={`${style.textColor} mb-3`}>
              {style.message}
            </p>
            {reasons.length > 0 && (
              <ul className={`list-disc list-inside ${style.textColor} text-sm space-y-1`}>
                {reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Badge variant="outline" className={style.textColor}>
                Confidence: {confidence.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 5.3 Add Data Quality Indicators
**Usage Analysis Component:**
```typescript
// components/usage/data-quality-indicator.tsx
interface DataQualityIndicatorProps {
  monthlyUsage: number[];
}

export function DataQualityIndicator({ monthlyUsage }: DataQualityIndicatorProps) {
  const missingMonths = monthlyUsage.filter(v => !v || v === 0).length;
  const quality = missingMonths === 0 ? 'excellent' : 
                  missingMonths <= 2 ? 'good' : 
                  missingMonths <= 4 ? 'fair' : 'poor';

  if (quality === 'excellent') return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <p className="text-sm text-yellow-800">
        <strong>⚠️ Incomplete Data:</strong> You have {missingMonths} month{missingMonths > 1 ? 's' : ''} of missing usage data.
        {missingMonths > 4 && (
          <span className="block mt-1">
            Recommendations will have lower confidence. Consider adding more complete usage history.
          </span>
        )}
      </p>
    </div>
  );
}
```

#### 5.4 Update Recommendations Page
```tsx
// app/recommendations/page.tsx
import { UncertaintyBanner } from '@/components/recommendations/uncertainty-banner';

export default function RecommendationsPage() {
  // ... existing code ...
  
  const uncertaintyReasons: string[] = [];
  
  // Check for low confidence reasons
  if (results.metadata.confidence === 'low') {
    const missingMonths = monthlyUsageKwh.filter(v => !v || v === 0).length;
    if (missingMonths > 3) {
      uncertaintyReasons.push(`${missingMonths} months of usage data are missing`);
    }
    if (results.recommendations.length < 5) {
      uncertaintyReasons.push('Limited number of matching plans available');
    }
    if (results.metadata.usagePattern === 'variable') {
      uncertaintyReasons.push('Usage pattern is highly variable, making predictions less reliable');
    }
  }

  return (
    <div>
      {/* Header */}
      
      {/* Uncertainty Banner */}
      <UncertaintyBanner 
        confidence={results.metadata.confidence}
        reasons={uncertaintyReasons}
      />
      
      {/* Rest of recommendations */}
    </div>
  );
}
```

#### 5.5 Add Tooltips for Uncertainty
```tsx
// Add to each recommendation card
{results.metadata.confidence === 'low' && (
  <div className="text-xs text-slate-500 mt-2">
    <span className="inline-flex items-center gap-1">
      <InfoIcon className="w-3 h-3" />
      Lower confidence due to limited data
    </span>
  </div>
)}
```

### Implementation Checklist
- [ ] Enhance confidence calculation algorithm
- [ ] Create uncertainty banner component
- [ ] Add data quality indicators
- [ ] Update recommendations page to show uncertainty
- [ ] Add tooltips and help text
- [ ] Test with various data quality scenarios
- [ ] Update AI explanations to mention uncertainty

---

## 6. Mobile Responsiveness Testing

### Overview
Ensure the application is fully responsive and provides an excellent experience on mobile devices.

### Implementation Steps

#### 6.1 Manual Testing Checklist
**Devices to Test:**
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Various screen sizes (320px - 768px)

**Test Scenarios:**
1. **Navigation**
   - [ ] Hamburger menu works
   - [ ] All links are tappable (44x44px minimum)
   - [ ] Back button works correctly
   - [ ] No horizontal scrolling

2. **Forms**
   - [ ] Input fields are properly sized
   - [ ] Number inputs show numeric keypad
   - [ ] Date pickers work on mobile
   - [ ] Form validation messages are visible
   - [ ] Submit buttons are easily tappable

3. **Recommendations Page**
   - [ ] Cards stack vertically
   - [ ] Text is readable without zooming
   - [ ] Buttons are large enough to tap
   - [ ] Compare dialog works on mobile
   - [ ] Search/filter controls are accessible

4. **Performance**
   - [ ] Page loads in < 3 seconds on 3G
   - [ ] Images are optimized
   - [ ] No layout shifts (CLS)
   - [ ] Smooth scrolling

#### 6.2 Responsive Design Fixes
**Update Tailwind Classes:**
```tsx
// Ensure proper responsive breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// Mobile-first approach
<Button className="w-full md:w-auto">
  Submit
</Button>
```

**Touch Target Sizes:**
```tsx
// Ensure minimum 44x44px touch targets
<Button className="min-h-[44px] min-w-[44px]">
  <Icon className="w-6 h-6" />
</Button>
```

**Text Sizing:**
```tsx
// Use responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Title
</h1>
```

#### 6.3 Mobile-Specific Components
**Mobile Navigation:**
```tsx
// components/navigation/mobile-nav.tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        className="min-h-[44px] min-w-[44px]"
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
      
      {isOpen && (
        <nav className="absolute top-full left-0 right-0 bg-white shadow-lg">
          {/* Navigation items */}
        </nav>
      )}
    </div>
  );
}
```

#### 6.4 Testing Tools
**Browser DevTools:**
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- Safari Responsive Design Mode

**Online Tools:**
- BrowserStack
- LambdaTest
- Responsive Design Checker

**Automated Testing:**
```typescript
// __tests__/mobile.test.tsx
import { render, screen } from '@testing-library/react';
import { RecommendationsPage } from '@/app/recommendations/page';

describe('Mobile Responsiveness', () => {
  it('renders correctly on mobile viewport', () => {
    // Mock mobile viewport
    window.innerWidth = 375;
    window.innerHeight = 667;
    
    render(<RecommendationsPage />);
    
    // Check that mobile layout is used
    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveClass('w-full'); // Stacked on mobile
  });
});
```

#### 6.5 Common Mobile Issues & Fixes

**Issue: Horizontal Scrolling**
```css
/* Add to globals.css */
* {
  max-width: 100%;
  box-sizing: border-box;
}

body {
  overflow-x: hidden;
}
```

**Issue: Text Too Small**
```tsx
// Use minimum font sizes
<p className="text-base md:text-lg">
  Content
</p>
```

**Issue: Buttons Too Small**
```tsx
<Button className="min-h-[44px] px-6">
  Tap Me
</Button>
```

**Issue: Forms Not Mobile-Friendly**
```tsx
<Input
  type="tel" // Shows numeric keypad
  inputMode="numeric"
  className="text-base" // Prevents zoom on iOS
/>
```

### Implementation Checklist
- [ ] Test on real devices (iPhone, Android)
- [ ] Fix horizontal scrolling issues
- [ ] Ensure touch targets are 44x44px minimum
- [ ] Test form inputs on mobile
- [ ] Verify navigation works on mobile
- [ ] Check text readability
- [ ] Test performance on 3G connection
- [ ] Fix any layout shifts
- [ ] Document mobile-specific behaviors

---

## 7. Recommendation Rating System

### Overview
Allow users to rate recommendations (thumbs up/down or star rating) to collect feedback for iterative improvements. Store ratings for future analysis by admins.

### Implementation Steps

#### 7.1 Database Schema
**Update Prisma Schema:**
```prisma
// prisma/schema.prisma
model RecommendationRating {
  id              String   @id @default(cuid())
  
  // User identification (anonymous or authenticated)
  userId          String?  // null for anonymous users
  sessionId       String?  // For anonymous users
  
  // Recommendation details
  recommendationId String  // ID of the recommendation
  planId          String   // Plan that was rated
  rank            Int      // Rank of the recommendation (1-5)
  
  // Rating
  rating          Int      // 1-5 stars, or -1 (thumbs down), 1 (thumbs up)
  ratingType      String   // 'star' | 'thumbs'
  
  // Optional feedback
  feedback        String?  // Optional text feedback
  helpful         Boolean? // Was this recommendation helpful?
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([planId])
  @@index([userId])
  @@index([sessionId])
  @@index([createdAt])
}
```

**Run Migration:**
```bash
npx prisma migrate dev --name add_recommendation_ratings
```

#### 7.2 Create Rating Component
```typescript
// components/recommendations/rating-widget.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';

interface RatingWidgetProps {
  planId: string;
  rank: number;
  onRatingSubmit?: (rating: number) => void;
}

export function RatingWidget({ planId, rank, onRatingSubmit }: RatingWidgetProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleThumbsUp = async () => {
    await submitRating(1);
  };

  const handleThumbsDown = async () => {
    setShowFeedback(true);
    await submitRating(-1);
  };

  const handleStarClick = async (stars: number) => {
    await submitRating(stars);
  };

  const submitRating = async (value: number) => {
    try {
      const response = await fetch('/api/recommendations/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          rank,
          rating: value,
          ratingType: value === 1 || value === -1 ? 'thumbs' : 'star',
          feedback: showFeedback ? feedback : undefined,
        }),
      });

      if (response.ok) {
        setRating(value);
        setSubmitted(true);
        onRatingSubmit?.(value);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  if (submitted) {
    return (
      <div className="text-sm text-green-600 flex items-center gap-2">
        <span>✓ Thank you for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Was this helpful?</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleThumbsUp}
          className="min-h-[36px] min-w-[36px]"
          aria-label="Thumbs up"
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleThumbsDown}
          className="min-h-[36px] min-w-[36px]"
          aria-label="Thumbs down"
        >
          <ThumbsDown className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-sm text-slate-600 mr-2">Rate:</span>
        {[1, 2, 3, 4, 5].map((stars) => (
          <button
            key={stars}
            onClick={() => handleStarClick(stars)}
            className="p-1 hover:scale-110 transition-transform"
            aria-label={`Rate ${stars} stars`}
          >
            <Star
              className={`w-5 h-5 ${
                rating && rating >= stars
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className="mt-2">
          <textarea
            placeholder="What could be improved? (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
```

#### 7.3 Create Rating API Endpoint
```typescript
// app/api/recommendations/rate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/client';
import { getClientIp } from '@/lib/rate-limit';
import { useAuth } from '@/lib/auth/context';

const ratingSchema = z.object({
  planId: z.string(),
  rank: z.number().int().min(1).max(5),
  rating: z.number().int().min(-1).max(5),
  ratingType: z.enum(['star', 'thumbs']),
  feedback: z.string().optional(),
  helpful: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ratingSchema.parse(body);

    // Get user ID (authenticated or anonymous)
    const userId = request.headers.get('x-user-id') || null;
    const sessionId = request.headers.get('x-session-id') || getClientIp(request);

    // Store rating
    await prisma.recommendationRating.create({
      data: {
        userId,
        sessionId: userId ? null : sessionId,
        planId: validated.planId,
        rank: validated.rank,
        rating: validated.rating,
        ratingType: validated.ratingType,
        feedback: validated.feedback,
        helpful: validated.helpful,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving rating:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}
```

#### 7.4 Update Recommendations Page
```tsx
// app/recommendations/page.tsx
import { RatingWidget } from '@/components/recommendations/rating-widget';

// Inside recommendation card
<CardContent>
  {/* Existing content */}
  
  {/* Rating Widget */}
  <div className="mt-4 pt-4 border-t">
    <RatingWidget
      planId={rec.plan.id}
      rank={rec.rank}
    />
  </div>
</CardContent>
```

#### 7.5 Analytics Query (For Future Admin Use)
```typescript
// lib/analytics/rating-analytics.ts
export async function getRatingAnalytics(planId?: string) {
  const where = planId ? { planId } : {};

  const ratings = await prisma.recommendationRating.groupBy({
    by: ['rating', 'ratingType'],
    where,
    _count: true,
  });

  const averageRating = await prisma.recommendationRating.aggregate({
    where: { ...where, rating: { gte: 1 } },
    _avg: { rating: true },
  });

  const helpfulCount = await prisma.recommendationRating.count({
    where: { ...where, helpful: true },
  });

  return {
    ratings,
    averageRating: averageRating._avg.rating || 0,
    helpfulCount,
    totalRatings: ratings.reduce((sum, r) => sum + r._count, 0),
  };
}
```

#### 7.6 Optional: Display Aggregate Ratings
```tsx
// Show average rating on plan cards (if enough ratings)
{planAverageRating > 0 && (
  <div className="flex items-center gap-1 text-sm text-slate-600">
    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    <span>{planAverageRating.toFixed(1)}</span>
    <span className="text-slate-400">({ratingCount})</span>
  </div>
)}
```

### Implementation Checklist
- [ ] Update database schema
- [ ] Create rating widget component
- [ ] Create rating API endpoint
- [ ] Add rating widget to recommendations page
- [ ] Handle anonymous vs authenticated users
- [ ] Add rate limiting for ratings
- [ ] Create analytics query functions
- [ ] Test rating submission
- [ ] Test with anonymous users
- [ ] Test with authenticated users
- [ ] Document rating data structure for future admin use

### Future Admin Features (Not in Scope)
- Dashboard to view rating analytics
- Filter ratings by plan, date, user type
- Export rating data
- A/B testing based on ratings
- Machine learning to improve recommendations based on ratings

---

## Summary

This implementation guide covers seven major areas for post-MVP development:

1. **WCAG 2.1 Compliance**: Comprehensive accessibility improvements
2. **Public APIs**: Integration with energy data APIs
3. **AWS Migration**: Conditional migration based on scalability needs
4. **Current Plan & Cost Comparison**: Enhanced cost savings analysis
5. **Data Uncertainty**: Clear communication of recommendation confidence
6. **Mobile Responsiveness**: Manual testing and fixes
7. **Rating System**: User feedback collection for iterative improvements

Each section includes:
- Implementation steps
- Code examples
- Testing checklists
- Best practices

**Estimated Total Implementation Time**: 8-12 weeks (depending on team size and priorities)

**Recommended Implementation Order**:
1. Mobile Responsiveness Testing (Quick win, 1 week)
2. Current Plan & Cost Comparison (High value, 2 weeks)
3. WCAG 2.1 Compliance (Important, 2 weeks)
4. Data Uncertainty Indicators (Medium effort, 1 week)
5. Rating System (Medium effort, 1 week)
6. Public APIs (Complex, 3-4 weeks)
7. AWS Migration (Only if justified, 2-3 weeks)

