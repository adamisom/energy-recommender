'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SignUpModal } from '@/components/shared/sign-up-modal';
import { safeGetItem, safeClear, STORAGE_KEYS } from '@/lib/utils/storage';
import { useSaveRecommendation } from '@/lib/hooks/use-hybrid-storage';

interface Recommendation {
  rank: number;
  plan: {
    id: string;
    planName: string;
    supplierName: string;
    rateType: string;
    ratePerKwh: number;
    monthlyFee: number;
    contractLengthMonths: number | null;
    renewablePct: number;
    supplierRating: number;
    earlyTerminationFee: number;
  };
  projectedAnnualCost: number;
  annualSavings: number;
  explanation: string;
  score: number;
  breakdown: {
    finalScore: number;
  };
}

interface RecommendationResponse {
  recommendations: Recommendation[];
  metadata: {
    totalAnnualUsageKwh: number;
    usagePattern: string;
    currentPlanAnnualCost?: number;
    generatedAt: string;
    confidence: string;
  };
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const { saveRecommendation, canSave } = useSaveRecommendation();

  useEffect(() => {
    async function fetchRecommendations() {
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
  }, [router, saveRecommendation, canSave]);

  const handleStartOver = () => {
    safeClear();
    router.push('/usage');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Finding your perfect energy plans...</p>
          <p className="text-sm text-slate-500 mt-2">This may take a few seconds</p>
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
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Your Personalized Recommendations
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
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

        {/* Recommendations */}
        <div className="space-y-6 mb-8">
          {results.recommendations.map((rec) => (
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
                <div className="flex gap-3 pt-2">
                  <Link href={`/plan/${rec.plan.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  
                  <SignUpModal
                    planName={rec.plan.planName}
                    supplierName={rec.plan.supplierName}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/preferences')}
            className="flex-1"
          >
            Try Different Preferences
          </Button>
          <Button
            variant="outline"
            onClick={handleStartOver}
            className="flex-1"
          >
            Start Over
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-slate-100 rounded-lg text-sm text-slate-600">
          <p>
            <strong>Disclaimer:</strong> These recommendations are based on your provided usage data and preferences. 
            Actual costs may vary. Please verify all details with the supplier before signing up.
          </p>
        </div>
      </div>
    </div>
  );
}

