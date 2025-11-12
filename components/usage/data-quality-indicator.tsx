'use client';

interface DataQualityIndicatorProps {
  monthlyUsage: (number | string)[];
}

export function DataQualityIndicator({ monthlyUsage }: DataQualityIndicatorProps) {
  const missingMonths = monthlyUsage.filter(v => !v || v === 0 || v === '').length;
  const quality = missingMonths === 0 ? 'excellent' : 
                  missingMonths <= 2 ? 'good' : 
                  missingMonths <= 4 ? 'fair' : 'poor';

  if (quality === 'excellent') return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <p className="text-sm text-yellow-800">
        <strong>⚠️ Incomplete Data:</strong> You have {missingMonths} month{missingMonths > 1 ? 's' : ''} of missing usage data.
        {missingMonths > 4 && (
          <span className="block mt-1">
            Recommendations will have lower confidence. Consider adding more complete usage history.
          </span>
        )}
      </p>
    </div>
  );
}

