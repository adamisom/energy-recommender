'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface CurrentPlanData {
  supplierName: string;
  planName: string;
  ratePerKwh: number;
  rateType: 'fixed' | 'variable' | 'tou';
  monthlyFee: number;
  contractStartDate: string;
  contractEndDate?: string;
  contractLengthMonths?: number;
  earlyTerminationFee: number;
  onPeakRate?: number;
  offPeakRate?: number;
  planId?: string;
}

interface CurrentPlanFormProps {
  onSubmit: (plan: CurrentPlanData) => void;
  onSkip: () => void;
  initialData?: Partial<CurrentPlanData>;
}

export function CurrentPlanForm({ onSubmit, onSkip, initialData }: CurrentPlanFormProps) {
  const [formData, setFormData] = useState({
    supplierName: initialData?.supplierName || '',
    planName: initialData?.planName || '',
    ratePerKwh: initialData?.ratePerKwh?.toString() || '',
    rateType: initialData?.rateType || 'fixed' as 'fixed' | 'variable' | 'tou',
    monthlyFee: initialData?.monthlyFee?.toString() || '0',
    contractStartDate: initialData?.contractStartDate || '',
    contractEndDate: initialData?.contractEndDate || '',
    contractLengthMonths: initialData?.contractLengthMonths?.toString() || '',
    earlyTerminationFee: initialData?.earlyTerminationFee?.toString() || '0',
    onPeakRate: initialData?.onPeakRate?.toString() || '',
    offPeakRate: initialData?.offPeakRate?.toString() || '',
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    // Validation
    if (!formData.supplierName.trim()) {
      newErrors.push('Supplier name is required');
    }
    if (!formData.planName.trim()) {
      newErrors.push('Plan name is required');
    }
    if (!formData.ratePerKwh || parseFloat(formData.ratePerKwh) <= 0) {
      newErrors.push('Rate per kWh must be greater than 0');
    }
    if (!formData.contractStartDate) {
      newErrors.push('Contract start date is required');
    }
    if (formData.rateType === 'tou') {
      if (!formData.onPeakRate || parseFloat(formData.onPeakRate) <= 0) {
        newErrors.push('On-peak rate is required for time-of-use plans');
      }
      if (!formData.offPeakRate || parseFloat(formData.offPeakRate) <= 0) {
        newErrors.push('Off-peak rate is required for time-of-use plans');
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);

    // Calculate contract length if end date provided
    let contractLengthMonths: number | undefined;
    if (formData.contractEndDate && formData.contractStartDate) {
      const start = new Date(formData.contractStartDate);
      const end = new Date(formData.contractEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      contractLengthMonths = Math.round(diffDays / 30);
    } else if (formData.contractLengthMonths) {
      contractLengthMonths = parseInt(formData.contractLengthMonths, 10);
    }

    onSubmit({
      supplierName: formData.supplierName.trim(),
      planName: formData.planName.trim(),
      ratePerKwh: parseFloat(formData.ratePerKwh),
      rateType: formData.rateType,
      monthlyFee: parseFloat(formData.monthlyFee) || 0,
      contractStartDate: formData.contractStartDate,
      contractEndDate: formData.contractEndDate || undefined,
      contractLengthMonths,
      earlyTerminationFee: parseFloat(formData.earlyTerminationFee) || 0,
      onPeakRate: formData.onPeakRate ? parseFloat(formData.onPeakRate) : undefined,
      offPeakRate: formData.offPeakRate ? parseFloat(formData.offPeakRate) : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Current Energy Plan</CardTitle>
        <CardDescription>
          Add your current plan details to see exact cost savings when switching
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier-name">Supplier Name *</Label>
              <Input
                id="supplier-name"
                type="text"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="text-base"
                required
                aria-label="Supplier name"
              />
            </div>

            <div>
              <Label htmlFor="plan-name">Plan Name *</Label>
              <Input
                id="plan-name"
                type="text"
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                className="text-base"
                required
                aria-label="Plan name"
              />
            </div>

            <div>
              <Label htmlFor="rate-type">Rate Type *</Label>
              <Select
                value={formData.rateType}
                onValueChange={(value: 'fixed' | 'variable' | 'tou') =>
                  setFormData({ ...formData, rateType: value })
                }
              >
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Rate</SelectItem>
                  <SelectItem value="variable">Variable Rate</SelectItem>
                  <SelectItem value="tou">Time-of-Use (TOU)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rate-per-kwh">Rate per kWh ($) *</Label>
              <Input
                id="rate-per-kwh"
                type="number"
                inputMode="decimal"
                step="0.0001"
                min="0"
                value={formData.ratePerKwh}
                onChange={(e) => setFormData({ ...formData, ratePerKwh: e.target.value })}
                className="text-base"
                required
                aria-label="Rate per kilowatt-hour"
              />
            </div>

            {formData.rateType === 'tou' && (
              <>
                <div>
                  <Label htmlFor="on-peak-rate">On-Peak Rate ($/kWh) *</Label>
                  <Input
                    id="on-peak-rate"
                    type="number"
                    inputMode="decimal"
                    step="0.0001"
                    min="0"
                    value={formData.onPeakRate}
                    onChange={(e) => setFormData({ ...formData, onPeakRate: e.target.value })}
                    className="text-base"
                    required
                    aria-label="On-peak rate"
                  />
                </div>

                <div>
                  <Label htmlFor="off-peak-rate">Off-Peak Rate ($/kWh) *</Label>
                  <Input
                    id="off-peak-rate"
                    type="number"
                    inputMode="decimal"
                    step="0.0001"
                    min="0"
                    value={formData.offPeakRate}
                    onChange={(e) => setFormData({ ...formData, offPeakRate: e.target.value })}
                    className="text-base"
                    required
                    aria-label="Off-peak rate"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="monthly-fee">Monthly Fee ($)</Label>
              <Input
                id="monthly-fee"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                className="text-base"
                aria-label="Monthly fee"
              />
            </div>

            <div>
              <Label htmlFor="contract-start">Contract Start Date *</Label>
              <Input
                id="contract-start"
                type="date"
                value={formData.contractStartDate}
                onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                className="text-base"
                required
                aria-label="Contract start date"
              />
            </div>

            <div>
              <Label htmlFor="contract-end">Contract End Date (Optional)</Label>
              <Input
                id="contract-end"
                type="date"
                value={formData.contractEndDate}
                onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                className="text-base"
                aria-label="Contract end date"
              />
            </div>

            <div>
              <Label htmlFor="contract-length">Contract Length (Months, Optional)</Label>
              <Input
                id="contract-length"
                type="number"
                inputMode="numeric"
                min="1"
                max="36"
                value={formData.contractLengthMonths}
                onChange={(e) => setFormData({ ...formData, contractLengthMonths: e.target.value })}
                className="text-base"
                aria-label="Contract length in months"
              />
            </div>

            <div>
              <Label htmlFor="early-termination-fee">Early Termination Fee ($)</Label>
              <Input
                id="early-termination-fee"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={formData.earlyTerminationFee}
                onChange={(e) => setFormData({ ...formData, earlyTerminationFee: e.target.value })}
                className="text-base"
                aria-label="Early termination fee"
              />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              {errors.map((error, index) => (
                <p key={index} className="text-red-700 text-sm">{error}</p>
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 min-h-[44px] text-base"
            >
              Save Current Plan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              className="flex-1 min-h-[44px] text-base"
            >
              Skip
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

