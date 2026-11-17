import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DropClub',
  description: 'باشگاه پیشنهادهای منتخب فناوری و ابزار کسب‌وکار',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-dvh bg-background text-foreground">{children}</body>
    </html>
  );
}