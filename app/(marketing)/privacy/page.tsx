import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Yiya",
  description: "How Yiya collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-screen-md px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Last updated: February 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-700">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            What We Collect
          </h2>
          <p className="mt-2">
            When you create an account, we collect your name, email address, and
            profile image through our authentication provider (Clerk). We also
            collect usage data such as lessons completed, streaks, and XP to
            power your learning experience.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            How We Use Your Data
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>To provide and personalize your learning experience</li>
            <li>To track your progress, streaks, and achievements</li>
            <li>To display leaderboards and community features</li>
            <li>To process payments for Pro subscriptions (via Stripe)</li>
            <li>
              To improve our product through anonymized analytics (via PostHog)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Third-Party Services
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Clerk</strong> — authentication and account management
            </li>
            <li>
              <strong>Stripe</strong> — payment processing for Pro subscriptions
            </li>
            <li>
              <strong>PostHog</strong> — product analytics to improve the
              learning experience
            </li>
            <li>
              <strong>Vercel</strong> — hosting and performance analytics
            </li>
            <li>
              <strong>Sentry</strong> — error monitoring to fix bugs quickly
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">Cookies</h2>
          <p className="mt-2">
            We use essential cookies for authentication and session management.
            Our analytics tools may set additional cookies to understand how you
            use the app. You can disable non-essential cookies in your browser
            settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Data Retention
          </h2>
          <p className="mt-2">
            We retain your account data for as long as your account is active.
            You can request deletion of your account and associated data by
            contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">Contact</h2>
          <p className="mt-2">
            If you have questions about this privacy policy, please reach out
            via our GitHub repository.
          </p>
        </section>
      </div>
    </div>
  );
}
