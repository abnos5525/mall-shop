export default function AdminHomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-8 shadow-sm">
        <p className="text-sm text-[color:var(--color-muted)]">DropClub Admin · Phase 1 shell</p>
        <h1 className="mt-2 text-3xl font-semibold">Admin access is not enabled yet</h1>
        <p className="mt-4 leading-7 text-[color:var(--color-muted)]">
          This app runs on a separate origin and will receive passkey/TOTP admin authentication,
          RBAC, and audit logging in Phase 3. There is no fake login form here by design.
        </p>
      </div>
    </main>
  );
}