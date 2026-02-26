import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-screen-lg flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-500">
          © {year} Yiya. All rights reserved.
        </p>
        <nav className="flex items-center gap-6 text-sm">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-neutral-500 transition-colors hover:text-neutral-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};
