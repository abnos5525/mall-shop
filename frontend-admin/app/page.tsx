import { AdminLoginForm } from '@/components/admin-login-form';
import { AdminOffersPanel } from '@/components/admin-offers-panel';
import { AdminDemandPanel } from '@/components/admin-demand-panel';

export default function AdminHomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-8 px-6 py-10">
      <AdminLoginForm />
      <AdminOffersPanel />
      <AdminDemandPanel />
    </main>
  );
}