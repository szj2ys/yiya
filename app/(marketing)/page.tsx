import Link from "next/link";
import Image from "next/image";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { BookOpenCheck, Flame, Globe2, Loader, Sparkles, TrendingUp, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InteractiveSample } from "@/components/seo/interactive-sample";
import { getGlobalStats } from "@/db/queries";
import { StickyCta } from "./sticky-cta";

const LANGUAGES = [
  { code: "en", name: "English", seoSlug: "english" },
  { code: "cn", name: "Chinese", seoSlug: "chinese" },
  { code: "es", name: "Spanish", seoSlug: "spanish" },
  { code: "fr", name: "French", seoSlug: "french" },
  { code: "it", name: "Italian", seoSlug: "italian" },
  { code: "jp", name: "Japanese", seoSlug: "japanese" },
] as const;

const STATS = [
  {
    icon: Globe2,
    title: "6 languages",
    description: "English, Chinese, Spanish, French, Italian, Japanese.",
  },
  {
    icon: BookOpenCheck,
    title: "Interactive lessons",
    description: "Learn by doing, not just reading.",
  },
  {
    icon: TrendingUp,
    title: "Track progress",
    description: "Build a streak and see growth over time.",
  },
  {
    icon: Sparkles,
    title: "Free to start",
    description: "Start learning in minutes.",
  },
] as const;

const SOCIAL_PROOF_CARDS = [
  {
    icon: BookOpenCheck,
    key: "totalLessonsCompleted" as const,
    label: "Lessons Completed",
  },
  {
    icon: Users,
    key: "activeLearnersCount" as const,
    label: "Active Learners",
  },
  {
    icon: Flame,
    key: "totalStreakDays" as const,
    label: "Streak Days",
  },
] as const;

const LanguageCardContent = ({ name, code }: { name: string; code: string }) => (
  <>
    <div className="relative h-9 w-12 overflow-hidden rounded-lg ring-1 ring-black/10">
      <Image
        src={`/${code}.svg`}
        alt={`${name} flag`}
        fill
        className="object-cover"
      />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-neutral-900">
        {name}
      </span>
      <span className="text-xs text-neutral-500 group-hover:text-green-600 transition-colors">
        Start learning
      </span>
    </div>
  </>
);

export default async function Home() {
  const globalStats = await getGlobalStats();
  const hasStats =
    globalStats.totalLessonsCompleted > 0 ||
    globalStats.activeLearnersCount > 0 ||
    globalStats.totalStreakDays > 0;

  return (
    <div className="w-full">
      <div id="hero-sentinel" />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-green-50 via-white to-white" />

        <div className="mx-auto w-full max-w-screen-lg px-4">
          <div className="flex flex-col items-center gap-10 py-8 lg:flex-row lg:items-center lg:justify-between lg:py-16">
            <div className="flex w-full flex-col items-center text-center lg:max-w-[520px] lg:items-start lg:text-left">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-neutral-600 ring-1 ring-black/5 backdrop-blur">
                <Sparkles className="h-4 w-4 text-green-600" />
                Learn languages the fun way
              </p>

              <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl">
                Speak confidently.
                <span className="text-green-600"> One lesson at a time.</span>
              </h1>

              <p className="mt-4 max-w-[42ch] text-pretty text-base leading-relaxed text-neutral-600 sm:text-lg">
                Yiya turns daily practice into bite‑size interactive lessons so you can build real vocabulary and keep your streak alive.
              </p>

              <div className="mt-6 w-full max-w-[360px]">
                <ClerkLoading>
                  <div className="flex w-full justify-center lg:justify-start">
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                  </div>
                </ClerkLoading>
                <ClerkLoaded>
                  <SignedOut>
                    <div className="flex flex-col gap-3">
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
                          Get Started Free
                        </Button>
                      </SignUpButton>

                      <SignInButton
                        mode="modal"
                        afterSignInUrl="/learn"
                        afterSignUpUrl="/onboarding"
                      >
                        <Button
                          size="lg"
                          variant="ghost"
                          className="h-12 w-full rounded-2xl text-base normal-case tracking-normal"
                        >
                          I have an account
                        </Button>
                      </SignInButton>
                    </div>
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

              <p className="mt-4 text-xs text-neutral-500">
                Free to start. No credit card needed.
              </p>
            </div>

            <div className="relative w-full max-w-[420px]">
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-green-200/40 via-transparent to-transparent blur-2xl" />
              <div className="relative aspect-square w-full overflow-hidden rounded-[28px] bg-white/60 ring-1 ring-black/5 backdrop-blur">
                <Image
                  src="/hero.svg"
                  fill
                  alt="Yiya mascot"
                  className="object-contain p-6"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Counters */}
      {hasStats && (
        <section className="w-full bg-white" data-testid="social-proof-stats">
          <div className="mx-auto w-full max-w-screen-lg px-4 py-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {SOCIAL_PROOF_CARDS.map((card) => {
                const Icon = card.icon;
                const value = globalStats[card.key];

                return (
                  <div
                    key={card.key}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 text-center ring-1 ring-black/5"
                  >
                    <Icon className="h-6 w-6 text-green-600" />
                    <p className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                      {value.toLocaleString()}+
                    </p>
                    <p className="text-sm font-medium text-neutral-600">
                      {card.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Try a Quick Quiz */}
      <section className="w-full bg-neutral-50">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Try a quick quiz
            </h2>
            <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-neutral-600 sm:text-base">
              See what learning with Yiya feels like. No signup required.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-md">
            <InteractiveSample languageName="Spanish" />
          </div>
        </div>
      </section>

      {/* Features / Stats */}
      <section className="w-full border-y border-black/5 bg-white">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-10">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-black/5"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-neutral-900">{stat.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">{stat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Language showcase */}
      <section className="w-full bg-neutral-50">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Pick a language and start today
            </h2>
            <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-neutral-600 sm:text-base">
              Choose from six languages and jump into a lesson right away.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {LANGUAGES.map((language) => (
              <div key={language.code} className="flex flex-col gap-1.5">
                <ClerkLoaded>
                  <SignedOut>
                    <SignUpButton
                      mode="modal"
                      afterSignInUrl="/learn"
                      afterSignUpUrl="/onboarding"
                    >
                      <button
                        className="group flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5 transition-all hover:bg-neutral-50 hover:ring-green-200 active:scale-[0.97]"
                      >
                        <LanguageCardContent name={language.name} code={language.code} />
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      href="/onboarding"
                      className="group flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5 transition-all hover:bg-neutral-50 hover:ring-green-200 active:scale-[0.97]"
                    >
                      <LanguageCardContent name={language.name} code={language.code} />
                    </Link>
                  </SignedIn>
                </ClerkLoaded>
                <Link
                  href={`/learn/${language.seoSlug}`}
                  className="text-center text-xs text-neutral-400 hover:text-green-600 transition-colors"
                >
                  Learn more
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StickyCta />
    </div>
  )
}
