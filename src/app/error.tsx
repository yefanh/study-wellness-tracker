'use client';

// Error boundary for the page: if the Server Component throws (e.g. the database is down),
// the user sees this instead of a blank screen. Must be a Client Component so the button works.
export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Something went wrong</h1>
      <p role="alert" className="mt-2 text-slate-700">
        We couldn&apos;t load your dashboard. Your data is safe; please try again.
      </p>
      <button type="button" onClick={reset} className="mt-6 rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white">
        Try again
      </button>
    </main>
  );
}
