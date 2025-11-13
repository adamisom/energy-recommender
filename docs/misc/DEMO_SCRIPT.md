# Demo Script Outline

**Duration:** ~5-7 minutes  
**Audience:** Product demo / investor pitch / user onboarding

---

## Opening (30 seconds)

**Dialogue:**
> "Let me show you how we help people find the perfect energy plan in under 2 minutes."

**Action:**
- Navigate to `localhost:3000` (or production URL)
- Point out clean, simple interface
- "No signup required - you can use it anonymously"

---

## 1. Enter Usage Data (1 minute)

**Dialogue:**
> "First, we need to understand your energy usage patterns."

**Actions:**
1. Click "Get Started" or navigate to `/usage`
2. **Option A - Manual Entry:**
   - Enter 12 months of usage data
   - Show how it auto-calculates totals
3. **Option B - CSV Upload:**
   - Click "Download example CSV" (dev mode only)
   - Upload CSV file
   - Show success message and green checkmark
   - Point out "Data loaded successfully!" badge

**Highlight:**
- "Your data is stored securely and never sent to third parties"
- Data validation (must be 12 months)

---

## 2. Set Preferences (30 seconds)

**Dialogue:**
> "Now tell us what matters most to you."

**Actions:**
1. Select state (e.g., Texas)
2. Choose priority:
   - 💰 Lowest Cost
   - 🌱 Most Renewable
   - 🤸‍♂️ Most Flexible
   - ⚖️ Balanced
3. Adjust filters:
   - Minimum renewable percentage
   - Maximum contract length
   - Minimum supplier rating

**Highlight:**
- "These preferences shape your recommendations"

---

## 3. Get AI-Powered Recommendations (1 minute)

**Dialogue:**
> "Our AI analyzes thousands of plans and gives you the top 5 matches."

**Actions:**
1. Click "Get Recommendations"
2. Show loading state: "Finding your perfect energy plans..."
3. After 3.5 seconds, message changes to "Still thinking... (just a few more seconds)"
4. Results appear with top 5 plans

**Highlight:**
- Point out AI insights (blue boxes with 🤖 icon)
- Show cost savings calculations
- "Each explanation is personalized by Claude 3.5 Sonnet"

**How AI Insight Works:**
- **Personalized for each plan:** Each of the top 5 plans gets a unique AI-generated explanation
- **Uses your data:** AI considers your usage pattern (summer peak, winter peak, flat, etc.), annual usage, and preferences
- **Context-aware:** Explains why THIS plan is ranked #1, #2, etc. based on your priority (cost, renewable, flexibility, or balanced)
- **Specific numbers:** Mentions actual dollar amounts, percentages, and savings
- **Fast & cached:** First time takes 1-2 seconds per plan, but explanations are cached for instant results on repeat requests
- **Fallback protection:** If AI fails, uses smart template-based explanations so you always get insights

---

## 4. Search & Filter Features (1 minute)

**Dialogue:**
> "Let's say you want to find a specific plan or supplier."

**Actions:**
1. **Search:**
   - Type in search bar: "Rhythm" or "Green"
   - Show real-time filtering
2. **Hide Viewed Plans:**
   - Check "Hide plans you've clicked View Details on"
   - Click "View Details" on a plan
   - Return to recommendations
   - Check the box - that plan is now hidden
3. **View Bookmarks:**
   - Click "☆ Favorite" on a plan
   - Show "⭐ View Bookmarks" button appears
   - Click it to see favorites page

**Highlight:**
- "You can save up to 5 favorite plans"
- "Search works by plan name or supplier"

---

## 5. Compare Plans (1 minute)

**Dialogue:**
> "Want to compare two plans side-by-side?"

**Actions:**
1. Click "Compare" button on first plan
2. Click "Compare" on second plan
3. Modal automatically opens showing side-by-side comparison
4. Point out:
   - Annual costs
   - Rate details
   - Contract terms
   - AI insights for both
5. Close modal

**Highlight:**
- "Compare up to 2 plans at once"
- "All key details in one view"

---

## 6. Authentication & History (1 minute)

**Dialogue:**
> "Sign up to save your recommendations and access them anytime."

**Actions:**
1. Click "Sign In" in header
2. Click "Sign up" tab
3. Enter email and password
4. Show smooth signup (no page reload)
5. Click "📜 View History" button
6. Show history page with saved recommendations
7. Point out:
   - Last 5 recommendation sets
   - Preferences used
   - Top 3 plans from each set
   - Timestamps

**Highlight:**
- "Your recommendations are automatically saved"
- "Compare how recommendations change over time"

---

## 7. Plan Details (30 seconds)

**Dialogue:**
> "Let's dive deeper into a specific plan."

**Actions:**
1. Click "View Details" on any recommendation
2. Show plan details page:
   - Full cost breakdown
   - All plan attributes
   - Supplier information
   - Contract terms

**Highlight:**
- "Complete transparency before you sign up"

---

## 8. Anonymous User Experience (30 seconds)

**Dialogue:**
> "What if someone doesn't want to sign up?"

**Actions:**
1. Sign out
2. Show that "View History" button is still visible
3. Click it
4. Show "Sign In Required" message
5. "They can use everything else without an account"

**Highlight:**
- "Fully functional for anonymous users"
- "History requires signup - that's the only limitation"

---

## Closing (30 seconds)

**Dialogue:**
> "That's it - from usage data to personalized recommendations in under 2 minutes."

**Key Points to Emphasize:**
- ✅ AI-powered insights (Claude 3.5 Sonnet)
- ✅ Top 5 recommendations (not just 3)
- ✅ Search, filter, compare, favorites
- ✅ Works anonymously or with account
- ✅ Fast (1-2 second recommendations)
- ✅ Secure (data never shared with third parties)

**Call to Action:**
- "Try it yourself at [URL]"
- "No signup required to get started"

---

## Quick Reference: Feature Checklist

- [ ] CSV upload with validation
- [ ] Manual data entry
- [ ] Preference selection (4 priorities + filters)
- [ ] AI-powered recommendations (top 5)
- [ ] AI insights (blue boxes)
- [ ] Search by name/supplier
- [ ] Hide viewed plans
- [ ] Favorites/bookmarks (max 5)
- [ ] Compare plans (2 at once, auto-opens)
- [ ] View plan details
- [ ] Sign up / Sign in
- [ ] Recommendation history (logged-in only)
- [ ] Anonymous mode (full functionality)
- [ ] Responsive design (mobile-friendly)

---

## Tips for Demo

1. **Use real data:** Enter actual usage numbers for authenticity
2. **Show edge cases:** Try searching for non-existent plans
3. **Emphasize speed:** Point out how fast recommendations appear
4. **Highlight AI:** Read an AI insight out loud to show personalization
5. **Mobile view:** If possible, show responsive design on phone/tablet
6. **Error handling:** Show graceful error messages if time permits

---

**Last Updated:** December 2024

