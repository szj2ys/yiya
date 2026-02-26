import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Nunito } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner";
import { PostHogProvider } from "@/components/posthog-provider";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { Analytics } from '@vercel/analytics/react';
import { UtmCapture } from "@/components/utm-capture";
import "./globals.css";

const ExitModal = dynamic(() => import("@/components/modals/exit-modal").then(m => ({ default: m.ExitModal })), { ssr: false });
const HeartsModal = dynamic(() => import("@/components/modals/hearts-modal").then(m => ({ default: m.HeartsModal })), { ssr: false });
const PracticeModal = dynamic(() => import("@/components/modals/practice-modal").then(m => ({ default: m.PracticeModal })), { ssr: false });
const InstallPrompt = dynamic(() => import("@/components/install-prompt").then(m => ({ default: m.InstallPrompt })), { ssr: false });

const font = Nunito({ subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yiya.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Yiya — Learn Languages the Fun Way",
    template: "%s | Yiya",
  },
  description:
    "Speak confidently, one lesson at a time. Interactive lessons, spaced repetition, streaks, and AI-powered explanations for 6 languages.",
  openGraph: {
    type: "website",
    siteName: "Yiya",
    title: "Yiya — Learn Languages the Fun Way",
    description:
      "Interactive lessons, spaced repetition, and AI explanations. Learn Spanish, Chinese, French, Italian, Japanese, or English — free.",
    url: BASE_URL,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Yiya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yiya — Learn Languages the Fun Way",
    description:
      "Speak confidently, one lesson at a time. Free interactive language lessons with AI-powered learning.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#22c55e" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})();`,
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    name: "Yiya",
                    url: BASE_URL,
                    logo: `${BASE_URL}/icon-512.png`,
                  },
                  {
                    "@type": "WebSite",
                    name: "Yiya",
                    url: BASE_URL,
                  },
                  {
                    "@type": "SoftwareApplication",
                    name: "Yiya",
                    applicationCategory: "EducationalApplication",
                    operatingSystem: "Web",
                    offers: {
                      "@type": "Offer",
                      price: "0",
                      priceCurrency: "USD",
                    },
                    description:
                      "Interactive language learning app with spaced repetition, streaks, and AI-powered explanations for 6 languages.",
                  },
                ],
              }),
            }}
          />
        </head>
        <body className={font.className}>
          <Toaster />
          <PostHogProvider>
            <ExitModal />
            <HeartsModal />
            <PracticeModal />
            {children}
          </PostHogProvider>
          <ServiceWorkerRegister />
          <InstallPrompt />
          <UtmCapture />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
