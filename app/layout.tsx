import type { Metadata } from 'next';
import { Zen_Maru_Gothic } from 'next/font/google';
import './globals.css';

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-zen-maru',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'My Recipe Journal',
  description: 'Personal recipe manager with responsive mobile UI.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={zenMaruGothic.variable}>
      <body className="min-h-screen bg-background font-sans text-textPrimary">{children}</body>
    </html>
  );
}
