'use client';

interface FraudDetectionAlertProps {
  riskLevel: 'low' | 'medium' | 'high' | string;
  reasons: string[];
  orderId: string;
}

const STYLES: Record<string, { box: string; badge: string; icon: string; label: string }> = {
  high: {
    box: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: 'ri-error-warning-fill text-red-600',
    label: 'High risk',
  },
  medium: {
    box: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    icon: 'ri-alert-fill text-amber-600',
    label: 'Medium risk',
  },
  low: {
    box: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-700',
    icon: 'ri-information-line text-gray-500',
    label: 'Low risk',
  },
};

export default function FraudDetectionAlert({
  riskLevel,
  reasons,
  orderId,
}: FraudDetectionAlertProps) {
  const style = STYLES[riskLevel] ?? STYLES.medium;

  return (
    <div className={`rounded-xl border p-5 ${style.box}`}>
      <div className="flex items-start gap-3">
        <i className={`${style.icon} text-2xl mt-0.5`} aria-hidden />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">Fraud check</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
              {style.label}
            </span>
          </div>
          {reasons?.length > 0 ? (
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700">
              {reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-700">
              This order was flagged for manual review.
            </p>
          )}
          <p className="mt-3 text-xs text-gray-500">Order ref: {orderId}</p>
        </div>
      </div>
    </div>
  );
}
