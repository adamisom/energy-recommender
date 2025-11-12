'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <Card className={`${style.color} border-2 mb-6`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">{style.icon}</span>
          <div className="flex-1">
            <h3 className={`font-bold ${style.textColor} mb-2`}>
              {style.title}
            </h3>
            <p className={`${style.textColor} mb-3`}>
              {style.message}
            </p>
            {reasons.length > 0 && (
              <ul className={`list-disc list-inside ${style.textColor} text-sm space-y-1`}>
                {reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Badge variant="outline" className={style.textColor}>
                Confidence: {confidence.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

