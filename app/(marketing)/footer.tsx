import Link from "next/link";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-screen-lg flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-500">
          © {year} Yiya. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/privacy" className="text-neutral-600 hover:text-neutral-900">
            Privacy
          </Link>
          <Link href="/terms" className="text-neutral-600 hover:text-neutral-900">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};
