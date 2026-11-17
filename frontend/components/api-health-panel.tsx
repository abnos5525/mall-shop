import type { HealthResponse } from '@mall-shop/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchApiHealth } from '@/lib/api/health';

function statusLabel(status: HealthResponse['status']): string {
  if (status === 'ok') return 'سالم';
  if (status === 'degraded') return 'محدود';
  return 'خطا';
}

function statusClass(status: HealthResponse['status']): string {
  if (status === 'ok') return 'text-accent';
  if (status === 'degraded') return 'text-amber-700';
  return 'text-red-700';
}

export async function ApiHealthPanel() {
  let health: HealthResponse | null = null;
  let error: string | null = null;

  try {
    health = await fetchApiHealth();
  } catch (cause) {
    error = cause instanceof Error ? cause.message : 'خطا در دریافت وضعیت API';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>وضعیت سرویس API</CardTitle>
        <CardDescription>بررسی زنده اتصال فرانت‌اند به Business API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {health ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted">وضعیت کلی</span>
              <span className={`font-semibold ${statusClass(health.status)}`}>
                {statusLabel(health.status)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted">سرویس</span>
              <span>{health.service}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted">نسخه</span>
              <span>{health.version}</span>
            </div>
            <ul className="space-y-2 rounded-xl border border-border bg-background p-3">
              {health.checks.map((check) => (
                <li key={check.name} className="flex items-center justify-between gap-3">
                  <span>{check.name}</span>
                  <span className={statusClass(check.status)}>
                    {statusLabel(check.status)}
                    {typeof check.latencyMs === 'number' ? ` · ${check.latencyMs}ms` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <form action="" method="get">
          <Button type="submit" variant="outline" className="w-full">
            بروزرسانی
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}