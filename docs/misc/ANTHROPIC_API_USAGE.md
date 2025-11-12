# Anthropic Claude API Usage

## What Information We Pass to Claude

When generating AI explanations for plan recommendations, we send the following information to Claude:

### API Configuration
- **Model:** `claude-sonnet-4-5-20250929`
- **Max Tokens:** 300
- **Timeout:** 10 seconds

### Prompt Structure

The prompt includes:

#### 1. User Profile
- Annual usage (total kWh and monthly average)
- Usage pattern (summer_peak, winter_peak, flat, variable)
- Current annual cost (if provided)

#### 2. User Preferences
- Priority (cost, renewable, flexibility, balanced)
- Minimum renewable percentage requirement
- Maximum contract length
- Minimum supplier rating

#### 3. Recommended Plan Details
- Supplier name
- Plan name
- Rate per kWh (and rate type if TOU)
- Monthly fee
- Contract length (or month-to-month)
- Renewable percentage
- Supplier rating (out of 5.0)
- Projected annual cost
- Savings amount (if current plan provided)

#### 4. Context
- Plan rank (#1, #2, or #3)
- Instruction to focus on user's priority
- Request for specific numbers and one trade-off

### Example Prompt

```
You are an expert energy plan advisor. Explain why this plan was recommended in 2-3 clear, specific sentences. Keep your response under 400 characters.

User Profile:
- Annual usage: 12,000 kWh (1,000 kWh/month average)
- Usage pattern: summer peak
- Current annual cost: $2,000.00
- Priorities: balanced (renewable: 0%+, max contract: 24 months, min rating: 3.0/5.0)

Recommended Plan (Rank #1):
- Supplier: Green Mountain Energy
- Plan: Pollution Free e-Plus 12
- Rate: $0.1169/kWh
- Monthly fee: $9.95
- Contract: 12 months
- Renewable: 100%
- Supplier rating: 4.5/5.0
- Projected annual cost: $1,736.13
- Savings: +$263.87/year

Why is this plan ranked #1? Focus on what matters most based on their balanced priority. Be specific with numbers. Mention one trade-off if applicable.
```

## How to Verify: AI vs Fallback

### AI-Generated Explanations (from Claude)

**Characteristics:**
- More conversational and natural language
- Often mentions specific percentages (e.g., "15% reduction")
- May include trade-offs or nuanced observations
- Varies in structure and wording
- Typically mentions the rank explicitly (e.g., "ranked #1")
- May use phrases like "if you shift usage" or "requires attention to"

**Example AI Explanation:**
```
This plan saves you $305/year (15% reduction) with a time-of-use rate that rewards your summer peak usage by shifting consumption to off-peak hours. The 12-month contract, 3.8/5 rating, and $0.1099/kWh rate perfectly match your balanced priorities. Trade-off: requires some attention to timing your energy use for maximum savings.
```

### Fallback Template Explanations

**Characteristics:**
- Always starts with: `"This {supplierName} plan offers "`
- Very structured and formulaic
- Follows a predictable pattern based on priority
- Always ends with: `" with their {rating}/5.0 rated service."`
- Uses phrases like "competitive pricing", "cost certainty", "can lower costs if you shift"

**Example Fallback Explanation:**
```
This Now Power plan offers a balanced combination of affordability ($1694.64/year), 0% renewable energy, and a 3.8/5.0 supplier rating. The tou rate structure can lower costs if you shift usage to off-peak hours with their 3.8/5.0 rated service.
```

### Quick Verification Methods

#### Method 1: Check the Pattern
- **AI:** Starts with various phrases, mentions rank, more natural
- **Fallback:** Always starts with "This {supplier} plan offers"

#### Method 2: Check Browser Console
When an AI explanation fails validation, you'll see:
```
AI explanation failed validation, using fallback
```

#### Method 3: Check Server Logs
In your terminal (dev server), look for:
- `AI explanation failed validation, using fallback` = Fallback used
- No warning = AI explanation succeeded

#### Method 4: Test Directly
Run the test script:
```bash
npm run test:explanations
```

This will show you:
- ✅ If AI generation succeeded
- ⚠️ If validation failed (and what the AI generated)
- The final explanation (AI or fallback)

## When Fallback is Used

The fallback template explanation is used when:

1. **AI Generation Fails:**
   - API timeout (>10 seconds)
   - API error (network, authentication, etc.)
   - API returns invalid response

2. **AI Explanation Fails Validation:**
   - Too short (<50 characters)
   - Too long (>500 characters)
   - Doesn't contain numbers
   - Contains generic phrases ("great option", "good choice", "excellent plan", "perfect for you")

## Caching

- AI explanations are cached using LRU (Least Recently Used) eviction
- Cache key: `{state}-{planId}-{rank}-{priority}`
- Cache size: 100 entries
- Cached explanations are returned instantly (no API call)

## Files

- **Prompt Building:** `lib/anthropic/explanations.ts` - `buildPrompt()` function
- **API Call:** `lib/anthropic/explanations.ts` - `generateWithTimeout()` function
- **Validation:** `lib/anthropic/explanations.ts` - `validateExplanation()` function
- **Fallback:** `lib/anthropic/explanations.ts` - `generateFallbackExplanation()` function
- **Client Config:** `lib/anthropic/client.ts`

