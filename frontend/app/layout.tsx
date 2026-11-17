import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
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
      <body className="min-h-dvh bg-background text-foreground">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}