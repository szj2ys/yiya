import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ClerkLoaded,
  SignedIn,
  SignedOut,
  SignUpButton,
} from "@clerk/nextjs";
import { BookOpenCheck, Brain, ChevronRight, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FAQSchema } from "@/components/seo/faq-schema";
import { InteractiveSample } from "@/components/seo/interactive-sample";
import {
  LANGUAGE_PAGES,
  getLanguageBySlug,
  getAllLanguageSlugs,
} from "@/lib/seo/languages";
import { getTopicsForLanguage } from "@/lib/seo/topics";

interface PageProps {
  params: { lang: string };
}

export function generateStaticParams() {
  return getAllLanguageSlugs().map((lang) => ({ lang }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const language = getLanguageBySlug(params.lang);
  if (!language) return {};

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yiya.app";

  return {
    title: language.metaTitle,
    description: language.metaDescription,
    keywords: language.keywords,
    openGraph: {
      title: language.metaTitle,
      description: language.metaDescription,
      url: `${BASE_URL}/learn/${language.slug}`,
      type: "website",
      siteName: "Yiya",
      images: [{ url: "/api/og", width: 1200, height: 630, alt: "Yiya" }],
    },
    twitter: {
      card: "summary_large_image",
      title: language.metaTitle,
      description: language.metaDescription,
      images: ["/api/og"],
    },
    alternates: {
      canonical: `${BASE_URL}/learn/${language.slug}`,
    },
  };
}

const DIFFERENTIATORS = [
  {
    icon: Sparkles,
    title: "AI Explanations",
    description:
      "When you get an answer wrong, AI explains why -- so you learn from every mistake, not just memorize answers.",
  },
  {
    icon: Brain,
    title: "FSRS Spaced Repetition",
    description:
      "Our scientifically-backed algorithm schedules reviews at the perfect moment, right before you would forget.",
  },
  {
    icon: Zap,
    title: "3 Challenge Types",
    description:
      "Multiple-choice, listening, and type-in challenges keep practice varied and engaging.",
  },
  {
    icon: BookOpenCheck,
    title: "Free to Start",
    description:
      "Jump right in -- no credit card, no trial period. Start learning in minutes.",
  },
];

export default function LanguagePage({ params }: PageProps) {
  const language = getLanguageBySlug(params.lang);
  if (!language) notFound();

  const topics = getTopicsForLanguage(language.slug);
  const otherLanguages = LANGUAGE_PAGES.filter((l) => l.slug !== language.slug);

  return (
    <div className="w-full">
      <FAQSchema faqs={language.faqs} />

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
          <li className="font-medium text-neutral-900">
            Learn {language.languageName}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-green-50 via-white to-white" />
        <div className="mx-auto w-full max-w-screen-lg px-4">
          <div className="flex flex-col items-center gap-10 py-8 lg:flex-row lg:items-center lg:justify-between lg:py-16">
            <div className="flex w-full flex-col items-center text-center lg:max-w-[520px] lg:items-start lg:text-left">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-neutral-600 ring-1 ring-black/5 backdrop-blur">
                <Sparkles className="h-4 w-4 text-green-600" />
                Free interactive lessons
              </p>

              <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl">
                {language.heroTitle}.
                <span className="text-green-600">
                  {" "}
                  {language.heroHighlight}
                </span>
              </h1>

              <p className="mt-4 max-w-[48ch] text-pretty text-base leading-relaxed text-neutral-600 sm:text-lg">
                {language.heroDescription}
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
                        Start Learning {language.languageName} Free
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

              <p className="mt-3 text-xs text-neutral-500">
                Free to start. No credit card needed.
              </p>
            </div>

            <div className="relative w-full max-w-[420px]">
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-green-200/40 via-transparent to-transparent blur-2xl" />
              <div className="relative aspect-square w-full overflow-hidden rounded-[28px] bg-white/60 ring-1 ring-black/5 backdrop-blur">
                <Image
                  src={`/${language.flagCode}.svg`}
                  fill
                  alt={`${language.languageName} flag`}
                  className="object-contain p-12"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Phrases */}
      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Sample {language.languageName} Phrases
          </h2>
          <p className="mx-auto mt-3 max-w-[60ch] text-center text-sm leading-relaxed text-neutral-600 sm:text-base">
            Here are some common {language.languageName} phrases you will learn with Yiya.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {language.samplePhrases.map((phrase) => (
              <div
                key={phrase.original}
                className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-black/5"
              >
                <p className="text-base font-semibold text-neutral-900">
                  {phrase.original}
                </p>
                {phrase.romanization && (
                  <p className="mt-0.5 text-xs italic text-neutral-500">
                    {phrase.romanization}
                  </p>
                )}
                <p className="mt-1 text-sm text-neutral-600">
                  {phrase.translation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Sample */}
      <section className="w-full bg-neutral-50">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Try a Quick {language.languageName} Quiz
          </h2>
          <p className="mx-auto mt-3 max-w-[60ch] text-center text-sm leading-relaxed text-neutral-600 sm:text-base">
            Test your knowledge with 3 quick questions. This is just a taste of what full Yiya lessons offer.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <InteractiveSample languageName={language.languageName} />
          </div>
        </div>
      </section>

      {/* Feature Highlights / Differentiators */}
      <section className="w-full border-y border-black/5 bg-white">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Why Learn {language.languageName} with Yiya?
          </h2>
          <p className="mx-auto mt-3 max-w-[60ch] text-center text-sm leading-relaxed text-neutral-600 sm:text-base">
            Yiya combines proven learning science with modern AI to make {language.languageName} learning effective and engaging.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIFFERENTIATORS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl bg-neutral-50 p-5 ring-1 ring-black/5"
                >
                  <Icon className="h-6 w-6 text-green-600" />
                  <h3 className="mt-3 text-sm font-bold text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Language-specific features */}
      <section className="w-full bg-neutral-50">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            What You Will Learn
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {language.features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-white p-6 ring-1 ring-black/5"
              >
                <h3 className="text-base font-bold text-neutral-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics / Long-tail pages */}
      {topics.length > 0 && (
        <section className="w-full bg-white">
          <div className="mx-auto w-full max-w-screen-lg px-4 py-12">
            <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Explore {language.languageName} Topics
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/learn/${language.slug}/${topic.slug}`}
                  className="group flex items-center justify-between rounded-2xl bg-neutral-50 p-4 ring-1 ring-black/5 transition-all hover:bg-white hover:ring-green-200"
                >
                  <span className="text-sm font-semibold text-neutral-900 group-hover:text-green-600 transition-colors">
                    {topic.title}
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-green-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="w-full bg-neutral-50">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Frequently Asked Questions
          </h2>

          <div className="mx-auto mt-8 max-w-2xl">
            <div className="flex flex-col gap-4">
              {language.faqs.map((faq) => (
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
            Ready to Start Learning {language.languageName}?
          </h2>
          <p className="mx-auto mt-3 max-w-[50ch] text-sm leading-relaxed text-green-100 sm:text-base">
            Join thousands of learners. Free interactive lessons with AI explanations and spaced repetition.
          </p>
          <div className="mt-6">
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
          </div>
        </div>
      </section>

      {/* Other Languages */}
      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12">
          <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Explore Other Languages
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {otherLanguages.map((lang) => (
              <Link
                key={lang.slug}
                href={`/learn/${lang.slug}`}
                className="group flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3 ring-1 ring-black/5 transition-all hover:bg-white hover:ring-green-200"
              >
                <div className="relative h-8 w-10 overflow-hidden rounded-lg ring-1 ring-black/10">
                  <Image
                    src={`/${lang.flagCode}.svg`}
                    alt={`${lang.languageName} flag`}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-semibold text-neutral-900 group-hover:text-green-600 transition-colors">
                  {lang.languageName}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
