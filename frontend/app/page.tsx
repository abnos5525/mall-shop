import { ApiHealthPanel } from '@/components/api-health-panel';
import { AuthPanel } from '@/components/auth-panel';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <header className="space-y-2">
        <p className="text-sm text-muted">DropClub · فاز ۲</p>
        <h1 className="text-2xl font-semibold leading-tight">باشگاه پیشنهادهای منتخب</h1>
        <p className="text-sm text-muted">
          پوسته مینی‌اپ تلگرام با تمرکز فارسی و RTL. ورود با initData فعال است؛ پیشنهادها در فازهای
          بعدی اضافه می‌شوند.
        </p>
      </header>

      <AuthPanel />
      <ApiHealthPanel />

      <footer className="text-center text-xs text-muted">
        لینک‌های وابسته در فاز ۵ با برچسب شفاف نمایش داده می‌شوند.
      </footer>
    </main>
  );
}