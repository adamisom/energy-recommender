import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/database/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SignUpModal } from '@/components/shared/sign-up-modal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // Try to find by Prisma id (CUID) first, then by planId (e.g., "TX-001")
  let plan = await prisma.plan.findUnique({
    where: { id },
  });

  // If not found by id, try planId (for saved recommendations that only have planId)
  if (!plan) {
    plan = await prisma.plan.findUnique({
      where: { planId: id },
    });
  }

  if (!plan) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/recommendations" className="inline-block mb-6">
          <Button variant="outline">
            ← Back to Recommendations
          </Button>
        </Link>

        {/* Plan Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{plan.planName}</CardTitle>
                <CardDescription className="text-xl">{plan.supplierName}</CardDescription>
                <div className="flex gap-2 mt-3">
                  <Badge>{plan.state}</Badge>
                  <Badge variant="outline" className="capitalize">{plan.rateType}</Badge>
                  {plan.renewablePct > 0 && (
                    <Badge className="bg-green-600">{plan.renewablePct}% Renewable</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Pricing Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pricing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Rate Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rate Type:</span>
                    <span className="font-semibold capitalize">{plan.rateType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rate per kWh:</span>
                    <span className="font-semibold">${plan.ratePerKwh.toFixed(4)}</span>
                  </div>
                  {plan.rateType === 'tou' && plan.onPeakRate && plan.offPeakRate && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">On-Peak Rate:</span>
                        <span className="font-semibold">${plan.onPeakRate.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Off-Peak Rate:</span>
                        <span className="font-semibold">${plan.offPeakRate.toFixed(4)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly Fee:</span>
                    <span className="font-semibold">${plan.monthlyFee.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Contract Terms</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Contract Length:</span>
                    <span className="font-semibold">
                      {plan.contractLengthMonths ? `${plan.contractLengthMonths} months` : 'Month-to-month'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Early Term Fee:</span>
                    <span className="font-semibold">
                      {plan.earlyTerminationFee > 0 ? `$${plan.earlyTerminationFee}` : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy & Environmental */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Energy & Environmental</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Renewable Energy:</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${plan.renewablePct}%` }}
                    />
                  </div>
                  <span className="font-semibold">{plan.renewablePct}%</span>
                </div>
              </div>
              {plan.renewablePct === 100 && (
                <p className="text-sm text-green-700 bg-green-50 p-3 rounded">
                  🌱 This plan is 100% carbon-neutral, powered entirely by renewable sources
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Supplier Name:</span>
                <span className="font-semibold">{plan.supplierName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Customer Rating:</span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < Math.round(plan.supplierRating) ? 'text-yellow-500' : 'text-slate-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold">{plan.supplierRating.toFixed(1)}/5.0</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Service Area:</span>
                <span className="font-semibold">{plan.state}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimated Cost Calculator */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Example Cost Estimate</CardTitle>
            <CardDescription>
              Based on 1,000 kWh monthly usage (typical household)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Energy Charges (1,000 kWh × ${plan.ratePerKwh.toFixed(4)}):</span>
                <span className="font-semibold">${(1000 * plan.ratePerKwh).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Monthly Fee:</span>
                <span className="font-semibold">${plan.monthlyFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-semibold">Estimated Monthly Cost:</span>
                <span className="font-bold">${(1000 * plan.ratePerKwh + plan.monthlyFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Annual Cost:</span>
                <span className="font-semibold">${((1000 * plan.ratePerKwh + plan.monthlyFee) * 12).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/recommendations" className="flex-1">
            <Button variant="outline" className="w-full">
              Back to Recommendations
            </Button>
          </Link>
          
          <SignUpModal
            planName={plan.planName}
            supplierName={plan.supplierName}
            triggerText="Sign Up for This Plan"
            triggerVariant="default"
          />
        </div>
      </div>
    </div>
  );
}

