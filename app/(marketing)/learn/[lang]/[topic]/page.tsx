import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClerkLoaded, SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FAQSchema } from "@/components/seo/faq-schema";
import { getTopicBySlug, getAllTopicParams } from "@/lib/seo/topics";

interface PageProps {
  params: { lang: string; topic: string };
}

export function generateStaticParams() {
  return getAllTopicParams();
}

export function generateMetadata({ params }: PageProps): Metadata {
  const topic = getTopicBySlug(params.lang, params.topic);
  if (!topic) return {};

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yiya.app";

  return {
    title: topic.metaTitle,
    description: topic.metaDescription,
    keywords: topic.keywords,
    openGraph: {
      title: topic.metaTitle,
      description: topic.metaDescription,
      url: `${BASE_URL}/learn/${topic.languageSlug}/${topic.slug}`,
      type: "website",
      siteName: "Yiya",
      images: [{ url: "/api/og", width: 1200, height: 630, alt: "Yiya" }],
    },
    twitter: {
      card: "summary_large_image",
      title: topic.metaTitle,
      description: topic.metaDescription,
      images: ["/api/og"],
    },
    alternates: {
      canonical: `${BASE_URL}/learn/${topic.languageSlug}/${topic.slug}`,
    },
  };
}

export default function TopicPage({ params }: PageProps) {
  const topic = getTopicBySlug(params.lang, params.topic);
  if (!topic) notFound();

  return (
    <div className="w-full">
      <FAQSchema faqs={topic.faqs} />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto w-full max-w-screen-lg px-4 pt-4"
      >
        <ol className="flex items-center gap-1 text-sm text-neutral-500">
          <li>
            <Link href="/" className="hover:text-neutral-700 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3" />
          </li>
          <li>
            <Link
              href={`/learn/${topic.languageSlug}`}
              className="hover:text-neutral-700 transition-colors"
            >
              Learn {topic.languageName}
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3" />
          </li>
          <li className="font-medium text-neutral-900">{topic.title}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-green-50 via-white to-white" />
        <div className="mx-auto w-full max-w-screen-lg px-4">
          <div className="flex flex-col items-center py-8 text-center lg:py-16">
            <h1 className="text-balance text-3xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              {topic.heroTitle}.
              <span className="text-green-600">
                {" "}
                {topic.heroHighlight}
              </span>
            </h1>

            <p className="mt-4 max-w-[60ch] text-pretty text-base leading-relaxed text-neutral-600 sm:text-lg">
              {topic.heroDescription}
            </p>

            <div className="mt-6 w-full max-w-[360px]">
              <ClerkLoaded>
                <SignedOut>
                  <SignUpButton
                    mode="modal"
                    afterSignInUrl="/learn"
                    afterSignUpUrl="/onboarding"
                  >
                    <Button
                      size="lg"
                      variant="secondary"
                      className="h-12 w-full rounded-2xl text-base normal-case tracking-normal"
                    >
                      Start Learning Free
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 w-full rounded-2xl text-base normal-case tracking-normal"
                    asChild
                  >
                    <Link href="/learn">Continue Learning</Link>
                  </Button>
                </SignedIn>
              </ClerkLoaded>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12">
          <div className="mx-auto max-w-2xl">
            {topic.content.map((section) => (
              <div key={section.heading} className="mb-10 last:mb-0">
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                  {section.heading}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-neutral-600">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full bg-neutral-50">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Frequently Asked Questions
          </h2>

          <div className="mx-auto mt-8 max-w-2xl">
            <div className="flex flex-col gap-4">
              {topic.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl bg-white p-5 ring-1 ring-black/5"
                >
                  <h3 className="text-base font-bold text-neutral-900">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-green-600">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to Start Learning?
          </h2>
          <p className="mx-auto mt-3 max-w-[50ch] text-sm leading-relaxed text-green-100 sm:text-base">
            Free interactive lessons with AI explanations and spaced repetition. No credit card needed.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <ClerkLoaded>
              <SignedOut>
                <SignUpButton
                  mode="modal"
                  afterSignInUrl="/learn"
                  afterSignUpUrl="/onboarding"
                >
                  <Button
                    size="lg"
                    variant="default"
                    className="h-12 rounded-2xl bg-white text-base font-bold normal-case tracking-normal text-green-600 hover:bg-green-50 border-0"
                  >
                    Get Started Free
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button
                  size="lg"
                  variant="default"
                  className="h-12 rounded-2xl bg-white text-base font-bold normal-case tracking-normal text-green-600 hover:bg-green-50 border-0"
                  asChild
                >
                  <Link href="/learn">Continue Learning</Link>
                </Button>
              </SignedIn>
            </ClerkLoaded>
            <Link
              href={`/learn/${topic.languageSlug}`}
              className="text-sm font-medium text-green-100 hover:text-white transition-colors"
            >
              Back to Learn {topic.languageName}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
