'use client';

type StatusBannerProps = {
  message: string;
  variant?: 'success' | 'error' | 'info';
};

const variantStyles: Record<NonNullable<StatusBannerProps['variant']>, string> = {
  success: 'border-green-200 bg-green-50 text-green-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700'
};

export function StatusBanner({ message, variant = 'info' }: StatusBannerProps) {
  return (
    <div className={`rounded-3xl border px-4 py-3 text-sm ${variantStyles[variant]}`}>
      {message}
    </div>
  );
}
