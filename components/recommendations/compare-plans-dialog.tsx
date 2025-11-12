'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XIcon } from 'lucide-react';
import { PlanRecommendation } from '@/types';

interface ComparePlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: PlanRecommendation[];
}

export function ComparePlansDialog({ open, onOpenChange, plans }: ComparePlansDialogProps) {
  if (plans.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogClose className="absolute top-4 right-4 z-50 rounded-md border-2 border-slate-300 bg-white p-2 text-slate-700 opacity-100 shadow-md transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
          <XIcon className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Compare Plans</DialogTitle>
          <DialogDescription>
            Side-by-side comparison of {plans.length} plan{plans.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {plans.map((rec) => (
            <Card key={`${rec.plan.id}-${rec.rank}`} className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {rec.rank === 1 && (
                    <Badge className="bg-blue-600">Best Match</Badge>
                  )}
                  <Badge variant="outline">Rank #{rec.rank}</Badge>
                </div>
                <CardTitle className="text-xl">{rec.plan.planName}</CardTitle>
                <CardDescription>{rec.plan.supplierName}</CardDescription>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-slate-900">
                    ${rec.projectedAnnualCost.toFixed(0)}/yr
                  </div>
                  {rec.annualSavings !== 0 && (
                    <div className={`text-sm font-semibold ${rec.annualSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {rec.annualSavings > 0 ? '+' : ''}${rec.annualSavings.toFixed(0)}/yr savings
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
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
                  <p className="text-slate-600">Rating</p>
                  <p className="font-semibold">{rec.plan.supplierRating.toFixed(1)}/5.0</p>
                </div>
                <div>
                  <p className="text-slate-600">Monthly Fee</p>
                  <p className="font-semibold">${rec.plan.monthlyFee.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Early Term Fee</p>
                  <p className="font-semibold">${rec.plan.earlyTerminationFee}</p>
                </div>
                <div>
                  <p className="text-slate-600">Match Score</p>
                  <p className="font-semibold">{rec.score.toFixed(0)}/100</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="font-semibold text-blue-900 mb-1 text-xs">AI Insight</p>
                  <p className="text-blue-800 text-xs">{rec.explanation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

