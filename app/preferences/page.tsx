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

export default function PreferencesPage() {
  const router = useRouter();
  const [state, setState] = useState<string>('TX');
  const [priority, setPriority] = useState<string>(DEFAULT_PREFERENCES.priority);
  const [minRenewable, setMinRenewable] = useState<number>(DEFAULT_PREFERENCES.minRenewablePct);
  const [maxContract, setMaxContract] = useState<number>(DEFAULT_PREFERENCES.maxContractMonths);
  const [minRating, setMinRating] = useState<number>(DEFAULT_PREFERENCES.minSupplierRating);
  const [currentPlan] = useState<string>('');

  useEffect(() => {
    // Check if usage data exists
    const usageData = safeGetItem(STORAGE_KEYS.USAGE_DATA, null);
    if (!usageData) {
      router.push('/usage');
    }
  }, [router]);

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
          <Card>
            <CardHeader>
              <CardTitle>Current Plan (Optional)</CardTitle>
              <CardDescription>
                Help us calculate your potential savings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                  Currently, you can skip this field. We&apos;ll still show you great recommendations!
              </p>
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

