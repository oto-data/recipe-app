import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Recipe Journal',
  description: 'Personal recipe manager with responsive mobile UI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background text-textPrimary">{children}</body>
    </html>
  );
}
