'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFavoritePlans, removeFavoritePlan } from '@/lib/utils/storage';
import type { Plan } from '@/types';

export default function FavoritesPage() {
  const [favoritePlans, setFavoritePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getFavoritePlans();
    
    // Fetch plan details from database
    async function fetchFavoritePlans() {
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/plans');
        if (response.ok) {
          const { plans } = await response.json();
          // Filter to only favorite plans
          const favorites = plans.filter((plan: Plan) => ids.includes(plan.id));
          setFavoritePlans(favorites);
        }
      } catch (error) {
        console.error('Failed to fetch favorite plans:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFavoritePlans();
  }, []);

  const handleRemoveFavorite = (planId: string) => {
    removeFavoritePlan(planId);
    setFavoritePlans(favorites => favorites.filter(p => p.id !== planId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-4 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <Link href="/recommendations">
            <Button variant="outline">← Back to Recommendations</Button>
          </Link>
        </div>
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            ⭐ My Favorite Plans
          </h1>
          <p className="text-slate-600">
            {favoritePlans.length} saved favorite{favoritePlans.length !== 1 ? 's' : ''}
          </p>
        </div>

        {favoritePlans.length === 0 ? (
          <Card className="border-slate-200 bg-white text-center p-8">
            <CardTitle className="text-slate-800 mb-2">No Favorites Yet!</CardTitle>
            <p className="text-slate-600 mb-4">
              You haven&apos;t saved any plans as favorites yet. Go to recommendations and click the &quot;☆ Favorite&quot; button on any plan.
            </p>
            <Link href="/recommendations">
              <Button className="bg-blue-600 hover:bg-blue-700">View Recommendations</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {favoritePlans.map((plan) => (
              <Card key={plan.id} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{plan.planName}</CardTitle>
                      <CardDescription className="text-lg">{plan.supplierName}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFavorite(plan.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Rate Type</p>
                      <p className="font-semibold capitalize">{plan.rateType}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Rate per kWh</p>
                      <p className="font-semibold">${plan.ratePerKwh.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Contract</p>
                      <p className="font-semibold">
                        {plan.contractLengthMonths || 'Month-to-month'}
                        {plan.contractLengthMonths && ' months'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Renewable</p>
                      <p className="font-semibold">{plan.renewablePct}%</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Rating</p>
                      <p className="font-semibold">{plan.supplierRating.toFixed(1)}/5.0</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Monthly Fee</p>
                      <p className="font-semibold">${plan.monthlyFee.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">State</p>
                      <p className="font-semibold">{plan.state}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/plan/${plan.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
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

