'use client';

import { Card, CardContent } from '@/components/ui/card';

interface UncertaintyBannerProps {
  confidence: 'high' | 'medium' | 'low';
  reasons?: string[];
}

export function UncertaintyBanner({ confidence, reasons = [] }: UncertaintyBannerProps) {
  if (confidence === 'high') {
    return null; // Don't show banner for high confidence
  }

  const config = {
    low: {
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-900',
      icon: '⚠️',
      title: 'Low Confidence Recommendations',
      message: 'These recommendations have lower confidence due to limited data.',
    },
    medium: {
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-900',
      icon: 'ℹ️',
      title: 'Moderate Confidence',
      message: 'Recommendations are based on available data, but more information could improve accuracy.',
    },
  };

  const style = config[confidence];

  return (
    <Card className={`${style.color} border mb-2`}>
      <CardContent className="py-1.5 px-4">
        <div className="flex items-center gap-3">
          <span className="text-lg" aria-hidden="true">{style.icon}</span>
          <div className="flex-1">
            <h3 className={`font-semibold ${style.textColor} text-sm`}>
              {style.title}
            </h3>
            <p className={`${style.textColor} text-xs mt-1`}>
              {style.message}
            </p>
            {reasons.length > 0 && (
              <ul className={`list-disc list-inside ${style.textColor} text-xs space-y-0.5 mt-1`}>
                {reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

