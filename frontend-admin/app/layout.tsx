import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DropClub Admin',
  description: 'Protected admin shell (authentication arrives in Phase 3)',
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}