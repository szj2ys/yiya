import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner";
import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { PostHogProvider } from "@/components/posthog-provider";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

const font = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yiya",
  description: "Learn, practice, and master new languages with Yiya",
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
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})();`,
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
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
