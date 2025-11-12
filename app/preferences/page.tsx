'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { safeGetItem, safeSetItem, STORAGE_KEYS } from '@/lib/utils/storage';
import { SUPPORTED_STATES, STATE_NAMES, DEFAULT_PREFERENCES } from '@/lib/constants';
import { CurrentPlanForm, CurrentPlanData } from '@/components/forms/current-plan-form';
import { useAuth } from '@/lib/auth/context';

export default function PreferencesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<string>('TX');
  const [priority, setPriority] = useState<string>(DEFAULT_PREFERENCES.priority);
  const [minRenewable, setMinRenewable] = useState<number>(DEFAULT_PREFERENCES.minRenewablePct);
  const [maxContract, setMaxContract] = useState<number>(DEFAULT_PREFERENCES.maxContractMonths);
  const [minRating, setMinRating] = useState<number>(DEFAULT_PREFERENCES.minSupplierRating);
  // Initialize current plan from storage
  const [currentPlan, setCurrentPlan] = useState<CurrentPlanData | null>(() => 
    safeGetItem<CurrentPlanData | null>(STORAGE_KEYS.CURRENT_PLAN, null)
  );
  const [showCurrentPlanForm, setShowCurrentPlanForm] = useState(false);

  useEffect(() => {
    // Check if usage data exists
    const usageData = safeGetItem(STORAGE_KEYS.USAGE_DATA, null);
    if (!usageData) {
      router.push('/usage');
      return;
    }

    // If user is logged in, try to fetch current plan from database
    if (user) {
      fetch('/api/user/current-plan')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.data) {
            setCurrentPlan(data.data);
          }
        })
        .catch(() => {
          // Silently fail - user can still add manually
        });
    }
  }, [router, user]);

  const handleCurrentPlanSubmit = async (plan: CurrentPlanData) => {
    setCurrentPlan(plan);
    setShowCurrentPlanForm(false);
    
    // Save to sessionStorage
    safeSetItem(STORAGE_KEYS.CURRENT_PLAN, plan);

    // Save to database if user is logged in
    if (user) {
      try {
        await fetch('/api/user/current-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plan),
        });
      } catch (error) {
        console.error('Failed to save current plan to database:', error);
        // Don't block - continue with sessionStorage
      }
    }
  };

  const handleSubmit = () => {
    // Save preferences to sessionStorage
    const preferences = {
      priority,
      minRenewablePct: minRenewable,
      maxContractMonths: maxContract,
      minSupplierRating: minRating,
    };

    safeSetItem(STORAGE_KEYS.PREFERENCES, preferences);
    safeSetItem(STORAGE_KEYS.STATE, state);
    if (currentPlan) {
      safeSetItem(STORAGE_KEYS.CURRENT_PLAN, currentPlan);
    }
    router.push('/recommendations');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Set Your Preferences
          </h1>
          <p className="text-slate-600">
            Tell us what matters most to you so we can find the perfect energy plan
          </p>
        </div>

        <div className="space-y-6">
          {/* State Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Your State</CardTitle>
              <CardDescription>
                Select where you receive electricity service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_STATES.map(s => (
                    <SelectItem key={s} value={s}>
                      {STATE_NAMES[s]} ({s})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Priority Selection */}
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s Most Important to You?</CardTitle>
              <CardDescription>
                    We&apos;ll prioritize plans based on your selection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={priority} onValueChange={setPriority}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="cost" id="cost" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="cost" className="font-semibold cursor-pointer">
                        💰 Lowest Cost
                      </Label>
                      <p className="text-sm text-slate-600">
                        Find the cheapest plans to minimize your electricity bill
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="renewable" id="renewable" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="renewable" className="font-semibold cursor-pointer">
                        🌱 Renewable Energy
                      </Label>
                      <p className="text-sm text-slate-600">
                        Prioritize plans with high renewable energy content
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="flexibility" id="flexibility" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="flexibility" className="font-semibold cursor-pointer">
                        🔄 Contract Flexibility
                      </Label>
                      <p className="text-sm text-slate-600">
                        Prefer month-to-month or short-term contracts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="balanced" id="balanced" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="balanced" className="font-semibold cursor-pointer">
                        ⚖️ Balanced
                      </Label>
                      <p className="text-sm text-slate-600">
                        Find a good balance of cost, renewables, and flexibility
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Advanced Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Filters</CardTitle>
              <CardDescription>
                Set additional requirements for your energy plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Renewable Percentage */}
              <div className="space-y-2">
                <Label>Minimum Renewable Energy: {minRenewable}%</Label>
                <Slider
                  value={[minRenewable]}
                  onValueChange={(value) => setMinRenewable(value[0])}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <p className="text-sm text-slate-600">
                  Only show plans with at least this percentage of renewable energy
                </p>
              </div>

              {/* Max Contract Length */}
              <div className="space-y-2">
                <Label>Maximum Contract Length: {maxContract} months</Label>
                <Slider
                  value={[maxContract]}
                  onValueChange={(value) => setMaxContract(value[0])}
                  min={1}
                  max={36}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-slate-600">
                  Exclude plans with contracts longer than this
                </p>
              </div>

              {/* Min Supplier Rating */}
              <div className="space-y-2">
                <Label>Minimum Supplier Rating: {minRating.toFixed(1)}/5.0</Label>
                <Slider
                  value={[minRating]}
                  onValueChange={(value) => setMinRating(value[0])}
                  min={1.0}
                  max={5.0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-sm text-slate-600">
                  Only show highly-rated suppliers
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan (Optional) */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">💡 Add Your Current Plan (Optional)</CardTitle>
              <CardDescription className="text-blue-700">
                Get personalized cost savings analysis by adding your current energy plan.
                We&apos;ll show you exactly how much you could save by switching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentPlan ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-900 mb-2">
                      Current Plan: {currentPlan.planName}
                    </p>
                    <p className="text-sm text-blue-700">
                      Supplier: {currentPlan.supplierName} | 
                      Rate: ${currentPlan.ratePerKwh.toFixed(4)}/kWh | 
                      Monthly Fee: ${currentPlan.monthlyFee.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowCurrentPlanForm(true)}
                      variant="outline"
                      className="min-h-[44px] text-base"
                    >
                      Edit Plan
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentPlan(null);
                        safeSetItem(STORAGE_KEYS.CURRENT_PLAN, null);
                        setShowCurrentPlanForm(false);
                      }}
                      variant="outline"
                      className="min-h-[44px] text-base"
                    >
                      Remove Plan
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowCurrentPlanForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] text-base"
                >
                  Add Current Plan
                </Button>
              )}
              
              {showCurrentPlanForm && (
                <div className="mt-4">
                  <CurrentPlanForm
                    onSubmit={handleCurrentPlanSubmit}
                    onSkip={() => setShowCurrentPlanForm(false)}
                    initialData={currentPlan || undefined}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 min-h-[44px] text-base"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              size="lg"
              className="flex-1 min-h-[44px] text-base"
            >
              Get Recommendations
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

