'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SignUpModal } from '@/components/shared/sign-up-modal';
import { ComparePlansDialog } from '@/components/recommendations/compare-plans-dialog';
import { safeGetItem, safeClear, STORAGE_KEYS, getViewedPlans, addViewedPlan, getFavoritePlans, addFavoritePlan, removeFavoritePlan, isFavoritePlan } from '@/lib/utils/storage';
import { useSaveRecommendation } from '@/lib/hooks/use-hybrid-storage';
import { useAuth } from '@/lib/auth/context';
import { analyzeUsage } from '@/lib/scoring/usage-analysis';
import { searchRecommendations, filterViewedPlans } from '@/lib/utils/recommendations';
import { PlanRecommendation, RecommendationResponse } from '@/types';

export default function RecommendationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('This may take a few seconds');
  const [isShowingSaved, setIsShowingSaved] = useState(false);
  const { saveRecommendation, canSave } = useSaveRecommendation();
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [hideViewed, setHideViewed] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null);
  
  // Load favorites on mount
  useEffect(() => {
    setFavorites(getFavoritePlans());
  }, []);
  
  // Track viewed plans when clicking "View Details"
  const handleViewDetails = (planId: string) => {
    addViewedPlan(planId);
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = (planId: string) => {
    if (isFavoritePlan(planId)) {
      removeFavoritePlan(planId);
      setFavorites(getFavoritePlans());
      setFavoriteMessage('Removed from favorites');
    } else {
      const result = addFavoritePlan(planId);
      if (result.success) {
        setFavorites(getFavoritePlans());
        setFavoriteMessage('Added to favorites');
      } else {
        setFavoriteMessage(result.message || 'Failed to add favorite');
      }
    }
    setTimeout(() => setFavoriteMessage(null), 3000);
  };
  
  // Handle compare selection
  const handleToggleCompare = (planId: string) => {
    const newSelected = new Set(selectedForCompare);
    if (newSelected.has(planId)) {
      newSelected.delete(planId);
      setShowCompareDialog(false);
    } else {
      if (newSelected.size >= 2) {
        setFavoriteMessage('You can compare up to 2 plans at a time. Please deselect one first.');
        setTimeout(() => setFavoriteMessage(null), 3000);
        return;
      }
      newSelected.add(planId);
      // Auto-open dialog when 2nd plan is selected
      if (newSelected.size === 2) {
        setShowCompareDialog(true);
      }
    }
    setSelectedForCompare(newSelected);
  };
  
  // Filter and search recommendations
  const displayedRecommendations = useMemo(() => {
    if (!results) return [];
    
    let filtered = [...results.recommendations];
    
    // Apply search
    filtered = searchRecommendations(filtered, searchQuery);
    
    // Apply hide viewed filter
    const viewedPlanIds = getViewedPlans();
    filtered = filterViewedPlans(filtered, viewedPlanIds, hideViewed);
    
    return filtered;
  }, [results, searchQuery, hideViewed]);
  
  // Get plans selected for comparison
  const plansToCompare = useMemo(() => {
    if (!results) return [];
    return results.recommendations.filter(rec => selectedForCompare.has(rec.plan.id));
  }, [results, selectedForCompare]);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        // If user is logged in, try to fetch saved recommendations first
        if (user) {
          const savedResponse = await fetch('/api/user/recommendations');
          if (savedResponse.ok) {
            const savedData = await savedResponse.json();
            if (savedData.data && savedData.data.length > 0) {
              // Use the most recent saved recommendation
              const mostRecent = savedData.data[0];
              
              // The saved recommendations field contains either:
              // 1. The array of recommendations directly (current structure)
              // 2. The full RecommendationResponse object (if we change saving logic)
              const savedRecs = mostRecent.recommendations;
              
              // Check if it's an array (current structure) or has recommendations property (full response)
              let recommendationsArray: PlanRecommendation[];
              let metadata: RecommendationResponse['metadata'];
              
              if (Array.isArray(savedRecs)) {
                // Current structure: recommendations is the array directly
                recommendationsArray = savedRecs as PlanRecommendation[];
                
                // Reconstruct metadata from saved data
                const monthlyUsageKwh = mostRecent.monthlyUsageKwh as number[];
                const usageAnalysis = analyzeUsage(monthlyUsageKwh);
                
                metadata = {
                  totalAnnualUsageKwh: usageAnalysis.totalAnnualKwh,
                  usagePattern: usageAnalysis.pattern,
                  generatedAt: typeof mostRecent.createdAt === 'string' 
                    ? mostRecent.createdAt 
                    : new Date(mostRecent.createdAt).toISOString(),
                  confidence: 'medium' as const, // Default since we don't have original confidence
                };
              } else if (savedRecs && typeof savedRecs === 'object' && 'recommendations' in savedRecs) {
                // Full RecommendationResponse structure
                const fullResponse = savedRecs as RecommendationResponse;
                recommendationsArray = fullResponse.recommendations;
                metadata = fullResponse.metadata;
              } else {
                // Unexpected structure - show error instead of redirecting
                setError('Unable to load saved recommendations. Please try generating new ones.');
                setLoading(false);
                return;
              }
              
              // Construct the full RecommendationResponse
              const recommendationResponse: RecommendationResponse = {
                recommendations: recommendationsArray,
                metadata,
              };
              
              setResults(recommendationResponse);
              setIsShowingSaved(true);
              setLoading(false);
              return;
            }
          }
        }

        // No saved recommendations or not logged in - generate new ones
        setIsShowingSaved(false);
        
        // Get data from sessionStorage
        const monthlyUsageKwh = safeGetItem(STORAGE_KEYS.USAGE_DATA, null);
        const preferences = safeGetItem(STORAGE_KEYS.PREFERENCES, null);
        const state = safeGetItem(STORAGE_KEYS.STATE, null);

        if (!monthlyUsageKwh || !preferences) {
          router.push('/usage');
          return;
        }

        // Build request
        const requestBody = {
          userId: 'anonymous-user',
          state: state || undefined,
          monthlyUsageKwh,
          preferences,
        };

        // Call API
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment and try again.');
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get recommendations');
        }

        const data = await response.json();
        setResults(data);

        // Auto-save recommendation for logged-in users
        if (canSave && state) {
          await saveRecommendation(
            data.recommendations,
            monthlyUsageKwh,
            preferences,
            state
          );
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [router, saveRecommendation, canSave, user]);

  // Update loading message after 3.5 seconds
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingMessage('Still thinking... (just a few more seconds)');
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      // Reset message when loading completes
      setLoadingMessage('This may take a few seconds');
    }
  }, [loading]);

  const handleStartOver = () => {
    safeClear();
    router.push('/usage');
  };

  const handleGenerateFresh = async () => {
    setIsShowingSaved(false);
    setLoading(true);
    setError(null);

    try {
      // Get data from sessionStorage
      const monthlyUsageKwh = safeGetItem(STORAGE_KEYS.USAGE_DATA, null);
      const preferences = safeGetItem(STORAGE_KEYS.PREFERENCES, null);
      const state = safeGetItem(STORAGE_KEYS.STATE, null);

      if (!monthlyUsageKwh || !preferences) {
        router.push('/usage');
        return;
      }

      // Build request
      const requestBody = {
        userId: 'anonymous-user',
        state: state || undefined,
        monthlyUsageKwh,
        preferences,
      };

      // Call API to generate fresh recommendations
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await response.json();
      setResults(data);

      // Auto-save recommendation for logged-in users
      if (canSave && state) {
        await saveRecommendation(
          data.recommendations,
          monthlyUsageKwh,
          preferences,
          state
        );
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Finding your perfect energy plans...</p>
          <p className="text-sm text-slate-500 mt-2">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Error</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={() => router.back()} variant="outline">
                  Go Back
                </Button>
                <Button onClick={handleStartOver}>
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-4 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Your Personalized Recommendations
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 justify-center">
            <span>
              📊 Annual Usage: {results.metadata.totalAnnualUsageKwh.toLocaleString()} kWh
            </span>
            <span>
              📈 Pattern: {results.metadata.usagePattern.replace('_', ' ')}
            </span>
            <span>
              🎯 Confidence: {results.metadata.confidence}
            </span>
          </div>
        </div>

        {/* Saved Recommendations Notice */}
        {isShowingSaved && (
          <div className="mt-2 mb-4 flex justify-center">
            <Card className="border-blue-200 bg-blue-50 w-fit">
              <CardContent className="px-6 py-1">
                <div className="space-y-4">
                  <p className="font-semibold text-blue-900">
                    📋 Showing Your Saved Recommendations
                  </p>
                  <div className="flex justify-center">
                    <Button
                      onClick={handleGenerateFresh}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Generate Fresh Recommendations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mb-3 p-4 bg-slate-100 rounded-lg text-sm text-slate-600">
          <p>
            <strong>Disclaimer:</strong> These recommendations are based on your provided usage data and preferences. 
            Actual costs may vary. Please verify all details with the supplier before signing up.
          </p>
        </div>

        {/* Actions */}
        <div className="mb-2 flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/preferences')}
            className="flex-1 text-base py-6 font-semibold border-2 hover:bg-slate-50"
            size="lg"
          >
            🔄 Try Different Preferences
          </Button>
          <Button
            variant="outline"
            onClick={handleStartOver}
            className="flex-1 text-base py-6 font-semibold border-2 hover:bg-slate-50"
            size="lg"
          >
            🗑️ Start Over
          </Button>
          <Link href="/recommendations/history">
            <Button
              variant="outline"
              className="text-base py-6 font-semibold border-2 hover:bg-slate-50"
              size="lg"
            >
              📜 View History
            </Button>
          </Link>
        </div>

        {/* Search, Sort, and Filter Controls */}
        <Card className="mb-6">
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Search */}
              <div>
                <Input
                  type="text"
                  placeholder="Search plans by name or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Hide Viewed Toggle */}
              <div className="flex items-center gap-2 pl-4 md:pl-0">
                <input
                  type="checkbox"
                  id="hide-viewed"
                  checked={hideViewed}
                  onChange={(e) => setHideViewed(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="hide-viewed" className="text-sm text-slate-700 cursor-pointer">
                  Hide plans you've clicked View Details on
                </label>
              </div>
              
              {/* Favorites Link */}
              {favorites.length > 0 && (
                <div>
                  <Link href="/recommendations/favorites">
                    <Button variant="outline" className="w-full">
                      ⭐ View Bookmarks
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Compare Button */}
            {selectedForCompare.size > 0 && (
              <div className="mt-4 flex items-center gap-4">
                <Button
                  onClick={() => setShowCompareDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  📊 Compare {selectedForCompare.size} Plan{selectedForCompare.size > 1 ? 's' : ''}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedForCompare(new Set());
                    setShowCompareDialog(false);
                  }}
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            )}
            
            {/* Favorite Message */}
            {favoriteMessage && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                favoriteMessage.includes('You can only') || favoriteMessage.includes('You can compare')
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}>
                {favoriteMessage}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div className="space-y-6 mb-8">
          {displayedRecommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-slate-600">
                <p>No plans match your search and filter criteria.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setHideViewed(false);
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
              </CardContent>
            </Card>
          ) : (
            displayedRecommendations.map((rec) => (
            <Card key={rec.rank} className={rec.rank === 1 ? 'border-2 border-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {rec.rank === 1 && (
                        <Badge className="bg-blue-600">Best Match</Badge>
                      )}
                      <Badge variant="outline">Rank #{rec.rank}</Badge>
                    </div>
                    <CardTitle className="text-2xl">
                      {rec.plan.planName}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {rec.plan.supplierName}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900">
                      ${rec.projectedAnnualCost.toFixed(0)}/yr
                    </div>
                    {rec.annualSavings !== 0 && (
                      <div className={`text-lg font-semibold ${rec.annualSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {rec.annualSavings > 0 ? '+' : ''}${rec.annualSavings.toFixed(0)}/yr savings
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🤖</span>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">AI Insight</p>
                      <p className="text-blue-800">{rec.explanation}</p>
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Rate Type</p>
                    <p className="font-semibold capitalize">{rec.plan.rateType}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Rate per kWh</p>
                    <p className="font-semibold">${rec.plan.ratePerKwh.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Contract</p>
                    <p className="font-semibold">
                      {rec.plan.contractLengthMonths || 'Month-to-month'}
                      {rec.plan.contractLengthMonths && ' months'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Renewable</p>
                    <p className="font-semibold">{rec.plan.renewablePct}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Monthly Fee</p>
                    <p className="font-semibold">${rec.plan.monthlyFee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Rating</p>
                    <p className="font-semibold">{rec.plan.supplierRating.toFixed(1)}/5.0</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Early Term Fee</p>
                    <p className="font-semibold">${rec.plan.earlyTerminationFee}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Match Score</p>
                    <p className="font-semibold">{rec.score.toFixed(0)}/100</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <div className="flex gap-3">
                    <Link href={`/plan/${rec.plan.id}`} className="flex-1" onClick={() => handleViewDetails(rec.plan.id)}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    
                    <SignUpModal
                      planName={rec.plan.planName}
                      supplierName={rec.plan.supplierName}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Favorite Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFavorite(rec.plan.id)}
                      className={isFavoritePlan(rec.plan.id) ? 'bg-yellow-50 border-yellow-300' : ''}
                    >
                      {isFavoritePlan(rec.plan.id) ? '⭐ Favorited' : '☆ Favorite'}
                    </Button>
                    
                    {/* Compare Checkbox */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCompare(rec.plan.id)}
                      className={selectedForCompare.has(rec.plan.id) ? 'bg-blue-50 border-blue-300' : ''}
                    >
                      {selectedForCompare.has(rec.plan.id) ? '✓ Selected' : 'Compare'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
        
        {/* Compare Plans Dialog */}
        <ComparePlansDialog
          open={showCompareDialog}
          onOpenChange={setShowCompareDialog}
          plans={plansToCompare}
        />
      </div>
    </div>
  );
}

