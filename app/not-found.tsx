import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-extrabold text-green-500">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-neutral-700 dark:text-neutral-200">
        Page not found
      </h2>
      <p className="mt-2 max-w-sm text-base text-neutral-500 dark:text-neutral-400">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
        It may have been moved or no longer exists.
      </p>
      <Link
        href="/learn"
        className="mt-8 inline-flex items-center rounded-xl border-b-4 border-green-600 bg-green-500 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-green-600 active:border-b-0"
      >
        Back to Learn
      </Link>
    </div>
  );
}
