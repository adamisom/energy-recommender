'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/context';

interface PlanRecommendation {
  rank: number;
  plan: {
    planId: string;
    planName: string;
    supplierName: string;
    rateType: string;
    ratePerKwh: number;
    monthlyFee: number;
    contractLengthMonths: number | null;
    renewablePct: number;
    supplierRating: number;
  };
  projectedAnnualCost: number;
  annualSavings: number;
  explanation: string;
}

interface SavedRecommendation {
  id: string;
  recommendations: PlanRecommendation[];
  preferences: {
    priority: string;
    minRenewablePct: number;
    maxContractMonths: number;
    minSupplierRating: number;
  };
  state: string;
  monthlyUsageKwh: number[];
  createdAt: string;
}

export default function RecommendationsHistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<SavedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Don't redirect - show message that they need to register
      setLoading(false);
      return;
    }

    fetchHistory();
  }, [user, authLoading, router]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/recommendations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendation history');
      }

      const { data } = await response.json();
      // Take only the last 5
      setHistory(data.slice(0, 5));
      setError(null);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      cost: '💰 Lowest Cost',
      renewable: '🌱 Most Renewable',
      flexibility: '🔓 Most Flexible',
      balanced: '⚖️ Balanced',
    };
    return labels[priority] || priority;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading recommendation history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Error</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/recommendations')}>
                Back to Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Recommendation History</h1>
            <p className="text-slate-600">
              Your last 5 recommendation sets with preferences and top 3 plans
            </p>
          </div>
          <Button onClick={() => router.push('/recommendations')} variant="outline">
            ← Back to Recommendations
          </Button>
        </div>

        {!user ? (
          <Card className="border-slate-200 bg-white text-center p-8">
            <CardTitle className="text-slate-800 mb-2">Sign In Required</CardTitle>
            <p className="text-slate-600 mb-4">
              You need to create an account to view your recommendation history. Sign up to save and track your recommendations across sessions.
            </p>
            <Button onClick={() => router.push('/recommendations')} className="bg-blue-600 hover:bg-blue-700">
              Go Back
            </Button>
          </Card>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">No recommendation history yet.</p>
              <Button onClick={() => router.push('/recommendations')}>
                Generate Recommendations
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {history.map((item, index) => (
              <Card key={item.id} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        Recommendation Set #{history.length - index}
                      </CardTitle>
                      <CardDescription>
                        Generated on {formatDate(item.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {item.state}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Preferences */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Preferences Used</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Priority</p>
                        <p className="font-semibold">{getPriorityLabel(item.preferences.priority)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Min Renewable</p>
                        <p className="font-semibold">{item.preferences.minRenewablePct}%</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Max Contract</p>
                        <p className="font-semibold">
                          {item.preferences.maxContractMonths === 36 ? 'Any' : `${item.preferences.maxContractMonths} months`}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Min Rating</p>
                        <p className="font-semibold">{item.preferences.minSupplierRating.toFixed(1)}/5.0</p>
                      </div>
                    </div>
                  </div>

                  {/* Top 3 Recommendations */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Top 3 Recommendations</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      {item.recommendations.slice(0, 3).map((rec) => (
                        <Card key={rec.rank} className="border-blue-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <Badge variant="secondary" className="text-xs">
                                #{rec.rank}
                              </Badge>
                              {rec.rank === 1 && (
                                <Badge className="bg-blue-600 text-xs">Best Match</Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg mt-2">{rec.plan.planName}</CardTitle>
                            <CardDescription className="text-sm">
                              {rec.plan.supplierName}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-2xl font-bold text-slate-900">
                                ${rec.projectedAnnualCost.toFixed(0)}/yr
                              </p>
                              {rec.annualSavings !== 0 && (
                                <p className={`text-sm ${rec.annualSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {rec.annualSavings > 0 ? '+' : ''}${rec.annualSavings.toFixed(0)}/yr
                                </p>
                              )}
                            </div>

                            {/* AI Explanation */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <span className="text-sm">🤖</span>
                                <div>
                                  <p className="font-semibold text-blue-900 text-xs mb-1">AI Insight</p>
                                  <p className="text-blue-800 text-xs">{rec.explanation}</p>
                                </div>
                              </div>
                            </div>

                            {/* Plan Details */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-slate-600">Rate</p>
                                <p className="font-semibold">${rec.plan.ratePerKwh.toFixed(4)}/kWh</p>
                              </div>
                              <div>
                                <p className="text-slate-600">Renewable</p>
                                <p className="font-semibold">{rec.plan.renewablePct}%</p>
                              </div>
                              <div>
                                <p className="text-slate-600">Contract</p>
                                <p className="font-semibold">
                                  {rec.plan.contractLengthMonths || 'Month-to-month'}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-600">Rating</p>
                                <p className="font-semibold">{rec.plan.supplierRating.toFixed(1)}/5.0</p>
                              </div>
                            </div>

                            <Link href={`/plan/${rec.plan.planId}`}>
                              <Button variant="outline" size="sm" className="w-full">
                                View Details
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

