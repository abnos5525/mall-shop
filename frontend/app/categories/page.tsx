import Link from 'next/link';
import { fetchCategories } from '@/lib/api/catalog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof fetchCategories>> = [];
  let error: string | null = null;
  try {
    categories = await fetchCategories();
  } catch (cause) {
    error = cause instanceof Error ? cause.message : 'خطا';
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <Link href="/" className="text-sm text-accent">
          ← خانه
        </Link>
        <h1 className="text-2xl font-semibold">دسته‌بندی‌ها</h1>
      </header>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <ul className="flex flex-col gap-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={`/offers?category=${category.id}`}>
              <Card>
                <CardHeader>
                  <CardTitle>{category.nameFa}</CardTitle>
                  {category.description ? (
                    <CardDescription>{category.description}</CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-accent">مشاهده پیشنهادها</span>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}