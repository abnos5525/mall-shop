import { AdminLoginForm } from '@/components/admin-login-form';

export default function AdminHomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <AdminLoginForm />
    </main>
  );
}