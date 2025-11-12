import { anthropic, MODEL_NAME } from './client';
import { Plan, UsageAnalysis, CostBreakdown, UserPreferences } from '@/types';
import { CACHE_SETTINGS, AI_SETTINGS } from '@/lib/constants';
import { LRUCache } from 'lru-cache';

// LRU cache for explanations (automatically evicts least recently used entries)
// MVP: Cache size reduced to 100 entries (each entry = one plan recommendation explanation)
const explanationCache = new LRUCache<string, string>({
  max: CACHE_SETTINGS.MAX_EXPLANATION_CACHE_SIZE,
});

interface ExplanationContext {
  plan: Plan;
  rank: number;
  usageAnalysis: UsageAnalysis;
  cost: CostBreakdown;
  preferences: UserPreferences;
  currentPlanCost?: number;
}

/**
 * Generate AI explanation for why a plan was recommended
 * Includes caching and fallback to template-based explanation
 */
export async function generateExplanation(
  context: ExplanationContext
): Promise<string> {
  // Build cache key
  const cacheKey = buildCacheKey(context);

  // Check cache first (LRU automatically tracks access)
  const cached = explanationCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    // Try AI generation with timeout
    const explanation = await generateWithTimeout(context, AI_SETTINGS.TIMEOUT_MS);
    
    // Validate explanation
    if (validateExplanation(explanation)) {
      // Cache result
      cacheExplanation(cacheKey, explanation);
      return explanation;
    } else {
      console.warn('AI explanation failed validation, using fallback');
      return generateFallbackExplanation(context);
    }
  } catch (error) {
    console.error('Error generating AI explanation:', error);
    return generateFallbackExplanation(context);
  }
}

/**
 * Generate explanation with timeout protection
 */
async function generateWithTimeout(
  context: ExplanationContext,
  timeoutMs: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Build prompt
    const prompt = buildPrompt(context);

    // Call Claude API with Promise.race for timeout
    const apiCallPromise = anthropic.messages.create({
      model: MODEL_NAME,
      max_tokens: AI_SETTINGS.MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timeout')), timeoutMs);
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]);

    clearTimeout(timeoutId);

    // Extract text from response
    const textContent = response.content.find(c => c.type === 'text');
    if (textContent && 'text' in textContent) {
      return textContent.text.trim();
    }

    throw new Error('No text content in AI response');
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Build prompt for AI explanation
 */
function buildPrompt(context: ExplanationContext): string {
  const {
    plan,
    rank,
    usageAnalysis,
    cost,
    preferences,
    currentPlanCost,
  } = context;

  const savings = currentPlanCost
    ? currentPlanCost - cost.firstYearTotal
    : null;

  return `You are an expert energy plan advisor. Explain why this plan was recommended in 2-3 clear, specific sentences. Keep your response under 400 characters.

User Profile:
- Annual usage: ${usageAnalysis.totalAnnualKwh.toLocaleString()} kWh (${Math.round(usageAnalysis.averageMonthlyKwh).toLocaleString()} kWh/month average)
- Usage pattern: ${usageAnalysis.pattern.replace('_', ' ')}
${currentPlanCost ? `- Current annual cost: $${currentPlanCost.toFixed(2)}` : ''}
- Priorities: ${preferences.priority} (renewable: ${preferences.minRenewablePct}%+, max contract: ${preferences.maxContractMonths} months, min rating: ${preferences.minSupplierRating}/5.0)

Recommended Plan (Rank #${rank}):
- Supplier: ${plan.supplierName}
- Plan: ${plan.planName}
- Rate: $${plan.ratePerKwh.toFixed(4)}/kWh ${plan.rateType === 'tou' ? '(time-of-use)' : ''}
- Monthly fee: $${plan.monthlyFee.toFixed(2)}
- Contract: ${plan.contractLengthMonths ? `${plan.contractLengthMonths} months` : 'month-to-month'}
- Renewable: ${plan.renewablePct}%
- Supplier rating: ${plan.supplierRating.toFixed(1)}/5.0
- Projected annual cost: $${cost.firstYearTotal.toFixed(2)}
${savings !== null ? `- Savings: ${savings >= 0 ? '+' : ''}$${savings.toFixed(2)}/year` : ''}

Why is this plan ranked #${rank}? Focus on what matters most based on their ${preferences.priority} priority. Be specific with numbers. Mention one trade-off if applicable.`;
}

/**
 * Validate AI-generated explanation
 */
function validateExplanation(explanation: string): boolean {
  // Check length
  if (explanation.length < AI_SETTINGS.MIN_EXPLANATION_LENGTH || 
      explanation.length > AI_SETTINGS.MAX_EXPLANATION_LENGTH) {
    return false;
  }

  // Check if it contains numbers (should reference specific costs, percentages, etc.)
  if (!/\d/.test(explanation)) {
    return false;
  }

  // Check if it's not too generic
  const genericPhrases = [
    'great option',
    'good choice',
    'excellent plan',
    'perfect for you',
  ];
  const lowerExplanation = explanation.toLowerCase();
  // If explanation contains any generic phrase, it's invalid
  const containsGenericPhrase = genericPhrases.some(phrase => lowerExplanation.includes(phrase));
  
  return !containsGenericPhrase; // Valid if it doesn't contain generic phrases
}

/**
 * Generate fallback template-based explanation
 */
function generateFallbackExplanation(context: ExplanationContext): string {
  const { plan, usageAnalysis, cost, preferences, currentPlanCost } = context;
  
  const savings = currentPlanCost ? currentPlanCost - cost.firstYearTotal : 0;
  
  let explanation = `This ${plan.supplierName} plan offers `;

  // Focus on user priority
  if (preferences.priority === 'cost') {
    explanation += `competitive pricing at $${cost.firstYearTotal.toFixed(2)}/year for your ${Math.round(usageAnalysis.totalAnnualKwh).toLocaleString()} kWh annual usage`;
    if (savings > 0) {
      explanation += `, saving you $${savings.toFixed(2)} annually`;
    }
  } else if (preferences.priority === 'renewable') {
    explanation += `${plan.renewablePct}% renewable energy`;
    if (plan.renewablePct === 100) {
      explanation += `, making it carbon-neutral`;
    }
  } else if (preferences.priority === 'flexibility') {
    if (plan.contractLengthMonths === null) {
      explanation += `month-to-month flexibility with no long-term commitment`;
    } else {
      explanation += `a ${plan.contractLengthMonths}-month contract`;
    }
  } else {
    explanation += `a balanced combination of affordability ($${cost.firstYearTotal.toFixed(2)}/year), ${plan.renewablePct}% renewable energy, and a ${plan.supplierRating.toFixed(1)}/5.0 supplier rating`;
  }

  explanation += `. The ${plan.rateType} rate structure`;
  if (plan.rateType === 'fixed') {
    explanation += ` provides cost certainty`;
  } else if (plan.rateType === 'tou') {
    explanation += ` can lower costs if you shift usage to off-peak hours`;
  }

  explanation += ` with their ${plan.supplierRating.toFixed(1)}/5.0 rated service.`;

  return explanation;
}

/**
 * Build cache key from context
 */
function buildCacheKey(context: ExplanationContext): string {
  return `${context.plan.state}-${context.plan.planId}-${context.rank}-${context.preferences.priority}`;
}

/**
 * Cache explanation using LRU (Least Recently Used) eviction
 * LRU cache automatically evicts least recently used entries when max size is reached
 */
function cacheExplanation(key: string, explanation: string): void {
  // LRU cache automatically handles eviction when max size is reached
  // No manual size checking needed - just set and LRU handles the rest
  explanationCache.set(key, explanation);
}

/**
 * Clear the cache (useful for testing)
 */
export function clearExplanationCache(): void {
  explanationCache.clear(); // LRUCache has clear() method
}

