# 🧪 Manual Testing Guide - Energy Plan Recommender

**Last Updated:** November 11, 2025  
**Build:** v1.0.0

---

## 🚨 SMOKE TEST (5 Minutes - Start Here!)

**Purpose:** Quick verification that core functionality works

### Prerequisites
```bash
# Make sure these are set in .env.local
ANTHROPIC_API_KEY=sk-ant-xxxxx
DATABASE_URL=postgresql://...

# Run these commands first
npx prisma db push
npm run seed
npm run dev
```

### Quick Test Steps

**Step 1: Landing Page (30 seconds)**
- [ ] Visit http://localhost:3000
- [ ] Page loads without errors
- [ ] "Get Started" button is visible
- [ ] Click "Get Started" → redirects to `/usage`

**Step 2: Usage Input (1 minute)**
- [ ] Enter these values in manual entry:
  ```
  Jan: 850    Jul: 1650
  Feb: 820    Aug: 1580
  Mar: 780    Sep: 1100
  Apr: 750    Oct: 870
  May: 920    Nov: 800
  Jun: 1450   Dec: 840
  ```
- [ ] Click "Continue to Preferences"
- [ ] Redirects to `/preferences`

**Step 3: Preferences (30 seconds)**
- [ ] State dropdown shows: Texas, Pennsylvania, Ohio, Illinois
- [ ] Select "Texas (TX)"
- [ ] Select priority: "💰 Lowest Cost"
- [ ] Sliders are adjustable
- [ ] Click "Get Recommendations"
- [ ] Redirects to `/recommendations`

**Step 4: View Recommendations (2 minutes)**
- [ ] Loading spinner appears
- [ ] Page loads in < 5 seconds
- [ ] **3 plan cards** appear
- [ ] Each card shows:
  - [ ] Plan name and supplier
  - [ ] Annual cost (e.g., "$1,234/yr")
  - [ ] Savings amount (green if positive, red if negative)
  - [ ] 🤖 AI Insight section with explanation
  - [ ] Plan details (rate, contract, renewable %)
  - [ ] "View Details" and "Sign Up" buttons
- [ ] Click "View Details" on first plan

**Step 5: Plan Details (1 minute)**
- [ ] Plan details page loads
- [ ] All plan information visible
- [ ] Pricing breakdown shown
- [ ] "Back to Recommendations" button works
- [ ] Click back, verify recommendations still there

✅ **SMOKE TEST COMPLETE** - If all checkboxes pass, core functionality works!

---

## 📋 Comprehensive Testing Guide

### Section 1: Usage Input Page Testing

#### Test 1.1: Manual Entry
**Path:** `/usage`

**Test Case: Valid Entry**
- [ ] Enter 12 positive numbers (e.g., all 1000)
- [ ] All fields accept numbers
- [ ] No validation errors appear
- [ ] "Continue" button becomes enabled
- [ ] Click continue → navigates to preferences

**Test Case: CSV Upload**
- [ ] Click "Upload CSV" tab
- [ ] Create a CSV file with: `850,820,780,750,920,1450,1650,1580,1100,870,800,840`
- [ ] Upload the file
- [ ] "Loaded Data" section appears showing all 12 values
- [ ] Values match what you uploaded
- [ ] Click continue → navigates to preferences

**Test Case: Validation Errors**
- [ ] Leave some fields empty → Error: "Please enter usage for all 12 months"
- [ ] Enter -100 in one field → Error: "All usage values must be positive"
- [ ] Enter 15000 in one field → Error: "Usage values seem unusually high"
- [ ] Continue button disabled until errors fixed

**Test Case: CSV Upload Errors**
- [ ] Upload CSV with only 6 values → Error: "must contain at least 12 numeric values"
- [ ] Upload CSV with text → Parses numeric values only
- [ ] Upload empty file → Error message appears

---

### Section 2: Preferences Page Testing

#### Test 2.1: State Selection
**Path:** `/preferences`

- [ ] State dropdown shows all 4 states
- [ ] Select Texas (TX) → works
- [ ] Select Pennsylvania (PA) → works
- [ ] Select Ohio (OH) → works
- [ ] Select Illinois (IL) → works
- [ ] Back button returns to usage page

#### Test 2.2: Priority Selection
- [ ] 4 radio options visible (Cost, Renewable, Flexibility, Balanced)
- [ ] Click "💰 Lowest Cost" → selected
- [ ] Click "🌱 Renewable Energy" → selected
- [ ] Click "🔄 Contract Flexibility" → selected
- [ ] Click "⚖️ Balanced" → selected
- [ ] Only one can be selected at a time

#### Test 2.3: Advanced Filters
**Renewable Slider:**
- [ ] Starts at 0%
- [ ] Drag to 50% → label updates to "50%"
- [ ] Drag to 100% → label updates to "100%"

**Contract Length Slider:**
- [ ] Starts at 24 months
- [ ] Drag to 6 → label updates to "6 months"
- [ ] Drag to 36 → label updates to "36 months"

**Supplier Rating Slider:**
- [ ] Starts at 3.0
- [ ] Drag to 4.5 → label updates to "4.5/5.0"
- [ ] Drag to 1.0 → label updates to "1.0/5.0"

#### Test 2.4: Navigation
- [ ] Clicking preferences without usage data → Redirects to `/usage`
- [ ] "Back" button → Returns to `/usage`
- [ ] "Get Recommendations" → Goes to `/recommendations`

---

### Section 3: Recommendations Page Testing

#### Test 3.1: Loading State
- [ ] Shows loading spinner immediately
- [ ] Shows message "Finding your perfect energy plans..."
- [ ] Takes 1-5 seconds (first time may be slower due to AI)

#### Test 3.2: Results Display
**Expected: 3 recommendation cards**

**Card Structure:**
- [ ] Rank badge (#1, #2, #3)
- [ ] "Best Match" badge on #1
- [ ] Plan name clearly visible
- [ ] Supplier name below plan name
- [ ] Annual cost in large text (e.g., "$1,234/yr")
- [ ] Savings shown (green if positive, red if negative)

**AI Insight Section:**
- [ ] 🤖 emoji present
- [ ] "AI Insight" label
- [ ] Explanation is 2-3 sentences
- [ ] Explanation mentions specific numbers
- [ ] Explanation is relevant to the plan
- [ ] Each plan has different explanation (not generic)

**Plan Details Grid:**
- [ ] Shows: Rate Type, Rate per kWh, Contract, Renewable %
- [ ] Shows: Monthly Fee, Rating, Early Term Fee, Match Score
- [ ] All values match plan data

**Action Buttons:**
- [ ] "View Details" button present
- [ ] "Sign Up for This Plan" button present

#### Test 3.3: Interactions
- [ ] Click "View Details" on plan #1 → Opens `/plan/[id]`
- [ ] Click "Sign Up" → Modal opens
- [ ] Modal shows plan name and supplier
- [ ] Modal shows MVP message
- [ ] Close modal → Returns to recommendations

#### Test 3.4: Top Navigation
- [ ] Top navigation shows annual usage (e.g., "12,000 kWh")
- [ ] Shows usage pattern (e.g., "summer peak")
- [ ] Shows confidence level (high/medium/low)

#### Test 3.5: Bottom Actions
- [ ] "Try Different Preferences" → Goes to `/preferences`
- [ ] "Start Over" → Goes to `/usage`
- [ ] "Start Over" clears sessionStorage (verify by going to preferences - should redirect to usage)

#### Test 3.6: Error Scenarios
**Test Case: No plans for state**
- [ ] Go back to preferences
- [ ] Select a state with 0 plans (if you haven't seeded all states)
- [ ] Get recommendations
- [ ] Should show error: "No plans available for state X"

**Test Case: Rate Limiting**
- [ ] Refresh recommendations page 11 times quickly
- [ ] 11th request should show error: "Too many requests"
- [ ] Wait 60 seconds
- [ ] Should work again

---

### Section 4: Plan Details Page Testing

#### Test 4.1: Page Load
**Path:** `/plan/[id]` (click from recommendations)

- [ ] Page loads successfully
- [ ] Plan name in large heading
- [ ] Supplier name below
- [ ] State badge visible
- [ ] Rate type badge visible (fixed/variable/tou)
- [ ] Renewable badge if > 0%

#### Test 4.2: Pricing Details Card
- [ ] Shows rate type
- [ ] Shows rate per kWh
- [ ] If TOU: Shows on-peak and off-peak rates
- [ ] Shows monthly fee
- [ ] Shows contract length
- [ ] Shows early termination fee

#### Test 4.3: Energy & Environmental Card
- [ ] Shows renewable percentage
- [ ] Progress bar matches percentage
- [ ] If 100% renewable: Shows green message about carbon-neutral

#### Test 4.4: Supplier Information Card
- [ ] Supplier name
- [ ] Star rating (visual stars + number)
- [ ] Service area (state)

#### Test 4.5: Cost Estimate Calculator
- [ ] Shows example calculation for 1,000 kWh
- [ ] Energy charges calculated correctly
- [ ] Monthly fee added
- [ ] Total shown clearly
- [ ] Annual estimate = Monthly × 12

#### Test 4.6: Actions
- [ ] "Back to Recommendations" → Works
- [ ] "Sign Up" button → Opens modal
- [ ] Modal shows correct plan details

#### Test 4.7: Invalid Plan ID
- [ ] Visit `/plan/invalid-id-12345`
- [ ] Should show 404 page

---

### Section 5: Authentication Testing

#### Test 5.1: Anonymous User Experience
**Default state - No login required**

- [ ] Header shows "Sign In" button
- [ ] Can use entire app without signing in
- [ ] Data persists during session
- [ ] Close browser tab → Data lost (expected)
- [ ] Reopen → Data gone (sessionStorage cleared)

#### Test 5.2: Sign Up Flow
- [ ] Click "Sign In" in header
- [ ] Modal opens with Login/Sign Up tabs
- [ ] Click "Sign Up" tab
- [ ] Fill in:
  - Name (optional): "Test User"
  - Email: `test@example.com`
  - Password: `testpass123`
- [ ] Click "Create Account"
- [ ] Should show message: "Check your email to confirm"
- [ ] Check Supabase dashboard → User created

#### Test 5.3: Sign In Flow
- [ ] Click "Sign In" in header
- [ ] Modal opens
- [ ] On "Login" tab, enter:
  - Email: (existing user)
  - Password: (correct password)
- [ ] Click "Sign In"
- [ ] Modal closes
- [ ] Page reloads
- [ ] Header shows user email
- [ ] Header shows "Sign Out" button
- [ ] sessionStorage is empty (cleared on login)

#### Test 5.4: Authenticated User - Data Persistence
**After signing in:**

- [ ] Enter usage data
- [ ] Set preferences
- [ ] Get recommendations
- [ ] Close browser completely
- [ ] Reopen and sign in
- [ ] Data will NOT auto-load (see docs/FUTURE_WORK.md #1 - usage data persistence)

#### Test 5.5: Sign Out Flow
- [ ] While signed in, click "Sign Out"
- [ ] Page reloads
- [ ] Header shows "Sign In" button again
- [ ] sessionStorage cleared
- [ ] User state reset

#### Test 5.6: Sign In Errors
- [ ] Enter invalid email format → Should show validation error
- [ ] Enter wrong password → Error: "Invalid login credentials"
- [ ] Enter non-existent email → Error shown
- [ ] Password too short (< 6 chars) → Validation prevents submit

---

### Section 6: Cross-Feature Testing

#### Test 6.1: Complete User Journey (Anonymous)
**Happy Path - 5 minutes**

1. [ ] Start at `/`
2. [ ] Click "Get Started"
3. [ ] Enter 12 months of usage (summer peak pattern)
4. [ ] Continue to preferences
5. [ ] Select Texas, Cost priority, 0% renewable min
6. [ ] Get recommendations
7. [ ] Verify 3 plans appear
8. [ ] Verify #1 has lowest cost
9. [ ] Click "View Details" on plan #2
10. [ ] Verify details match
11. [ ] Click back
12. [ ] Click "Try Different Preferences"
13. [ ] Change to "Renewable" priority
14. [ ] Change min renewable to 100%
15. [ ] Get recommendations
16. [ ] Verify #1 has 100% renewable
17. [ ] Click "Start Over"
18. [ ] Verify redirects to usage page
19. [ ] Verify usage data is cleared

#### Test 6.2: Complete User Journey (Authenticated)
**With Login - 7 minutes**

1. [ ] Click "Sign In" → Sign up for new account
2. [ ] Confirm email (if required)
3. [ ] Sign in
4. [ ] Enter usage data
5. [ ] Set preferences
6. [ ] Get recommendations
7. [ ] Verify recommendations saved (check `/api/user/recommendations`)
8. [ ] Sign out
9. [ ] Sign back in
10. [ ] To verify recommendation history was saved, check: `/api/user/recommendations` (GET)
    - Note: Usage data won't auto-load (see docs/FUTURE_WORK.md #1)

#### Test 6.3: Browser Back/Forward
- [ ] Navigate through: landing → usage → preferences → recommendations
- [ ] Click browser back button multiple times
- [ ] Each page should load correctly
- [ ] Data should persist in sessionStorage
- [ ] Click forward → Pages load correctly

#### Test 6.4: Page Refresh Scenarios
**On Usage Page:**
- [ ] Enter data
- [ ] Refresh page
- [ ] Data lost (expected - not saved until continue)

**On Preferences Page:**
- [ ] Set preferences
- [ ] Refresh page
- [ ] If usage data in sessionStorage: Page works
- [ ] If no usage data: Redirects to `/usage`

**On Recommendations Page:**
- [ ] View recommendations
- [ ] Refresh page
- [ ] New API call made
- [ ] Recommendations regenerate (may be different order due to AI)

**On Plan Details Page:**
- [ ] View plan details
- [ ] Refresh page
- [ ] Page reloads successfully (server-side fetch)

---

### Section 7: Edge Case Testing

#### Test 7.1: Unusual Usage Patterns
**Test Case: Extremely Flat Usage**
- [ ] Enter same value for all 12 months (e.g., 1000)
- [ ] Get recommendations
- [ ] Pattern should be "flat"
- [ ] No crashes

**Test Case: Extreme Peak**
- [ ] Enter: 500 for 11 months, 5000 for 1 month
- [ ] Get recommendations
- [ ] Should detect pattern correctly
- [ ] Cost calculations should be accurate

**Test Case: Very Low Usage**
- [ ] Enter: 100 for all months
- [ ] Get recommendations
- [ ] Plans should still be recommended
- [ ] Costs should be low

**Test Case: Very High Usage**
- [ ] Enter: 3000 for all months (36,000 kWh/year)
- [ ] Get recommendations
- [ ] Plans should still be recommended
- [ ] Costs should be high

#### Test 7.2: Extreme Preferences
**Test Case: 100% Renewable + Low Rating**
- [ ] Set min renewable: 100%
- [ ] Set min rating: 1.0
- [ ] Set max contract: 36 months
- [ ] Get recommendations
- [ ] Should return only 100% renewable plans
- [ ] Should return exactly 3 (or fewer if not enough plans)

**Test Case: Very Strict Constraints**
- [ ] Set min renewable: 100%
- [ ] Set min rating: 5.0
- [ ] Set max contract: 1 month
- [ ] Get recommendations
- [ ] Should relax constraints (warning in console)
- [ ] Should still return some plans

**Test Case: No Matching Plans**
- [ ] Select Pennsylvania (only 2 plans seeded)
- [ ] Set min renewable: 100%
- [ ] Set min rating: 5.0
- [ ] Get recommendations
- [ ] Should return available plans with constraint relaxation message

#### Test 7.3: Different States
**Texas (17 plans):**
- [ ] Should return 3 recommendations easily
- [ ] Good variety of plan types

**Pennsylvania (2 plans):**
- [ ] Should return 2 plans
- [ ] Message about relaxed constraints

**Ohio (2 plans):**
- [ ] Should return 2 plans
- [ ] Constraint relaxation occurs

**Illinois (2 plans):**
- [ ] Should return 2 plans
- [ ] Works correctly with limited options

---

### Section 8: Error Scenario Testing

#### Test 8.1: Network Errors
**Simulate by disconnecting internet:**
- [ ] Disconnect WiFi
- [ ] Try to get recommendations
- [ ] Should show error message
- [ ] Error should be user-friendly
- [ ] Reconnect and retry → Works

#### Test 8.2: API Errors
**Test invalid state (if applicable):**
- [ ] Manually call API with invalid state in request body
- [ ] Should return 400 error
- [ ] Error message should be clear

#### Test 8.3: Missing sessionStorage Data
- [ ] Navigate directly to `/preferences` (no usage data)
- [ ] Should redirect to `/usage`
- [ ] Navigate directly to `/recommendations` (no preferences)
- [ ] Should redirect to `/usage`

#### Test 8.4: sessionStorage Disabled
**In private browsing mode:**
- [ ] Open site in Private/Incognito mode
- [ ] Enter usage data
- [ ] Click continue
- [ ] Should show error about sessionStorage
- [ ] OR gracefully degrade (depending on browser)

---

### Section 9: UI/UX Testing

#### Test 9.1: Responsive Design
**Desktop (1920x1080):**
- [ ] All pages look good
- [ ] Cards have proper spacing
- [ ] Text is readable
- [ ] No overflow issues

**Tablet (768px):**
- [ ] Resize browser to 768px width
- [ ] All pages adapt correctly
- [ ] Grid layouts adjust (3 cols → 2 cols)
- [ ] Navigation still accessible

**Mobile (375px - iPhone size):**
- [ ] Resize browser to 375px width
- [ ] All pages work
- [ ] Forms are usable
- [ ] Text is readable (not too small)
- [ ] Buttons are tappable (not too small)
- [ ] Grid layouts stack vertically
- [ ] No horizontal scrolling

#### Test 9.2: Loading States
- [ ] Recommendations page shows loading spinner
- [ ] Spinner is centered
- [ ] Message explains what's happening
- [ ] Loading takes reasonable time (< 5 seconds)

#### Test 9.3: Empty States
- [ ] Visit plan details with invalid ID → 404 page
- [ ] No recommendations available → Error message

#### Test 9.4: Visual Design
- [ ] Colors are consistent
- [ ] Buttons have hover states
- [ ] Cards have subtle shadows
- [ ] Typography is clear
- [ ] Spacing is consistent
- [ ] Icons are appropriate

---

### Section 10: Data Accuracy Testing

#### Test 10.1: Cost Calculations
**Manual Verification:**

Use these test values:
- Usage: 1000 kWh/month (12,000/year)
- Plan: Rate $0.10/kWh, Monthly fee $10

**Expected:**
- Energy charges: 12,000 × $0.10 = $1,200
- Monthly fees: $10 × 12 = $120
- Total: $1,320

- [ ] Verify displayed cost matches calculation
- [ ] Try different usage amounts
- [ ] Verify costs scale correctly

#### Test 10.2: Savings Calculations
**With Current Plan Cost:**
- Manually set currentPlan in sessionStorage (advanced)
- Verify savings = current cost - new cost
- Positive savings = green
- Negative savings = red

#### Test 10.3: Renewable Filtering
- [ ] Set min renewable to 100%
- [ ] Get recommendations
- [ ] ALL plans should be 100% renewable
- [ ] Check each plan's renewable percentage

#### Test 10.4: Score Ranking
**Test Case: Cost Priority**
- [ ] Select "Lowest Cost" priority
- [ ] Get recommendations
- [ ] Plan #1 should have lowest annual cost
- [ ] Plan #2 should have 2nd lowest
- [ ] Plan #3 should have 3rd lowest

**Test Case: Renewable Priority**
- [ ] Select "Renewable Energy" priority
- [ ] Get recommendations
- [ ] Plan #1 should have highest renewable %
- [ ] Or best combo of renewable + cost

---

### Section 11: AI Testing

#### Test 11.1: Explanation Quality
**Check each recommendation's AI explanation:**

- [ ] Is 2-3 sentences (not too long)
- [ ] Mentions specific dollar amounts
- [ ] Mentions specific percentages
- [ ] Addresses user's priority
- [ ] Explains WHY this plan is ranked #X
- [ ] Is not generic ("great plan")
- [ ] Uses "you" and "your"

#### Test 11.2: Explanation Uniqueness
- [ ] Get recommendations
- [ ] All 3 explanations should be different
- [ ] Each should be specific to that plan
- [ ] Rank should be mentioned (#1, #2, #3)

#### Test 11.3: AI Fallback (If API fails)
**Simulate by using invalid API key:**
- [ ] Set ANTHROPIC_API_KEY to invalid value
- [ ] Get recommendations
- [ ] Should still work (fallback to template)
- [ ] Explanations still appear (template-based)
- [ ] No crashes

#### Test 11.4: AI Caching
- [ ] Get recommendations for Texas
- [ ] Note the time taken (~1-2 seconds)
- [ ] Go back and get recommendations again (same state, same data)
- [ ] Second time should be MUCH faster (~200ms)
- [ ] Explanations should be identical (cached)

---

### Section 12: Performance Testing

#### Test 12.1: Initial Load Times
- [ ] Landing page: < 1 second
- [ ] Usage page: < 1 second
- [ ] Preferences page: < 1 second
- [ ] Recommendations (first time): < 5 seconds
- [ ] Recommendations (cached): < 1 second
- [ ] Plan details: < 1 second

#### Test 12.2: API Response Times
**Open browser DevTools → Network tab:**

- [ ] `/api/recommendations` first call: 1-3 seconds
- [ ] `/api/recommendations` cached: < 500ms
- [ ] `/api/plans`: < 200ms
- [ ] `/api/plans/[id]`: < 100ms

#### Test 12.3: Memory Usage
**Open DevTools → Performance:**
- [ ] Navigate through entire app
- [ ] Check memory usage
- [ ] Should not grow continuously
- [ ] No obvious memory leaks

---

### Section 13: Browser Compatibility Testing

#### Test 13.1: Chrome/Edge
- [ ] All features work
- [ ] No console errors
- [ ] CSS renders correctly

#### Test 13.2: Firefox
- [ ] All features work
- [ ] No console errors
- [ ] CSS renders correctly

#### Test 13.3: Safari
- [ ] All features work
- [ ] No console errors
- [ ] CSS renders correctly
- [ ] Flexbox/Grid layouts work

---

### Section 14: Database Testing

#### Test 14.1: Seed Data Verification
```bash
npx prisma studio
```

- [ ] Open Prisma Studio
- [ ] Navigate to "Plan" table
- [ ] Verify 23 plans exist
- [ ] Verify plans have all required fields
- [ ] Check Texas: Should have ~17 plans
- [ ] Check PA, OH, IL: Should have 2 each

#### Test 14.2: Database Queries
**In browser DevTools → Network:**
- [ ] Get recommendations
- [ ] Should see Prisma query in server logs
- [ ] Query should be fast (< 100ms)
- [ ] No duplicate queries

---

### Section 15: Security Testing

#### Test 15.1: Rate Limiting
- [ ] Make 10 requests to `/api/recommendations` within 1 minute
- [ ] 10th request should succeed
- [ ] 11th request should return 429
- [ ] Wait 60 seconds → Should work again

#### Test 15.2: Input Validation
**Test malicious inputs:**
- [ ] Enter `<script>alert('xss')</script>` in usage → Rejected
- [ ] Enter negative numbers → Rejected
- [ ] Enter text in number fields → Rejected
- [ ] Enter 100 months of data → Rejected (must be 12)

#### Test 15.3: API Key Security
- [ ] Check browser DevTools → Network
- [ ] ANTHROPIC_API_KEY should NEVER appear in client
- [ ] Only sent from server
- [ ] Not in page source

---

### Section 16: Accessibility Testing

#### Test 16.1: Keyboard Navigation
- [ ] Press Tab to navigate
- [ ] All interactive elements are focusable
- [ ] Focus indicator is visible
- [ ] Can submit forms with Enter key
- [ ] Can navigate without mouse

#### Test 16.2: Screen Reader (Optional)
**If you have a screen reader:**
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text
- [ ] Headings are hierarchical

---

## 🎯 Testing Checklist Summary

### Critical Tests (Must Pass) ✅
- [ ] Smoke test (5 min)
- [ ] Happy path user journey
- [ ] Cost calculation accuracy
- [ ] AI explanations generate
- [ ] All 4 states work
- [ ] Anonymous usage works

### Important Tests (Should Pass)
- [ ] All priorities work correctly
- [ ] Filters apply correctly
- [ ] Error states handled gracefully
- [ ] Rate limiting works
- [ ] Mobile responsive

### Nice to Have (Good to Test)
- [ ] Auth flows (if Supabase configured)
- [ ] Performance within targets
- [ ] Browser compatibility
- [ ] Accessibility

---

## 📊 Test Coverage Report

After completing this guide, you should have tested:

| Category | Test Cases | Status |
|----------|-----------|--------|
| **Core Features** | 25 | ⬜ |
| **Edge Cases** | 12 | ⬜ |
| **Error Handling** | 8 | ⬜ |
| **UI/UX** | 15 | ⬜ |
| **Performance** | 6 | ⬜ |
| **Security** | 5 | ⬜ |
| **Authentication** | 10 | ⬜ |
| **Cross-Browser** | 3 | ⬜ |
| **TOTAL** | ~85+ test scenarios | ⬜ |

---

## 🐛 Bug Reporting Template

If you find issues, document them like this:

```markdown
**Bug:** [Short description]
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. Go to...
2. Click...
3. Enter...

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Browser:** Chrome 120 / Firefox 121 / Safari 17
**Console Errors:** [Any errors from DevTools]
**Screenshot:** [If applicable]
```

---

## ✅ Sign-Off Checklist

Before considering testing complete:

### Automated Tests
- [x] Unit tests passing (44/44)
- [x] Lint passing (0 errors)
- [x] Build passing (0 errors)

### Manual Tests  
- [ ] Smoke test complete (5 min)
- [ ] Happy path tested
- [ ] Error scenarios tested
- [ ] Mobile responsive verified
- [ ] At least 2 browsers tested

### Ready for Production
- [ ] All critical bugs fixed
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation updated

---

## 🚀 Quick Test Commands

```bash
# Automated tests
npm run lint         # ESLint check
npm run build        # Build verification
npm test             # Jest tests (44)
npm run type-check   # TypeScript

# Start app for manual testing
npm run dev          # http://localhost:3000

# Reset database for fresh test
npx prisma db push --force-reset
npm run seed

# Check database
npx prisma studio    # Visual database browser
```

---

## 📝 Testing Notes

### Known Behaviors (Not Bugs)

1. **AI explanations may vary slightly** - Non-deterministic, but should be consistent for cached requests
2. **First API call is slower** - Cold start + AI generation (~2-3 seconds)
3. **Cached calls are fast** - < 500ms
4. **sessionStorage cleared on login/logout** - By design
5. **Anonymous users can't save history** - By design
6. **Rate limiting is per-IP** - Multiple browser tabs share limit
7. **Template fallbacks** - If AI fails, uses templates (still good quality)

### What to Watch For

**Red Flags:**
- ❌ API calls taking > 10 seconds
- ❌ Console errors during normal use
- ❌ Crashes on valid input
- ❌ Data loss when navigating
- ❌ Incorrect cost calculations
- ❌ Wrong plan ranked #1

**Expected Warnings (OK):**
- ⚠️ "Only X plans match strict criteria. Relaxing constraints."
- ⚠️ "LLM response cache hit" (informational)
- ⚠️ Prisma query logs in development mode

---

## 🎓 Testing Tips

1. **Use DevTools Console** - Watch for errors
2. **Use Network Tab** - Check API call times
3. **Test with real data** - Use your actual electricity bill
4. **Test edge cases** - Extreme values, missing data
5. **Clear cache between tests** - For consistent results
6. **Test on slow network** - DevTools → Network → Throttle to "Slow 3G"
7. **Test with ad blockers** - May affect external APIs
8. **Keep sessionStorage inspector open** - DevTools → Application → Session Storage

---

**Happy Testing! 🧪**

**Questions?** Check `/docs/` for detailed documentation.

**Found a bug?** Document it and it can be fixed!

