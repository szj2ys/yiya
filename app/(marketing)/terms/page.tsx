import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Yiya",
  description: "Terms and conditions for using the Yiya language learning platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-screen-md px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Last updated: February 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-700">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Acceptance of Terms
          </h2>
          <p className="mt-2">
            By creating an account or using Yiya, you agree to these terms. If
            you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Your Account
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You must provide accurate information when creating an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>One account per person — shared accounts are not permitted</li>
            <li>
              We may suspend accounts that violate these terms or engage in
              abusive behavior
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Free &amp; Pro Plans
          </h2>
          <p className="mt-2">
            Yiya offers a free tier with limited hearts and a Pro subscription
            with unlimited hearts. Pro subscriptions are billed monthly through
            Stripe. You can cancel at any time through the billing portal, and
            your Pro access will continue until the end of the current billing
            period.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Content &amp; Intellectual Property
          </h2>
          <p className="mt-2">
            All course content, including lessons, challenges, and translations,
            is owned by Yiya. You may not reproduce, distribute, or create
            derivative works from the content without permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Acceptable Use
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Do not attempt to manipulate leaderboards or XP through automation</li>
            <li>Do not abuse the AI explanation or variant generation features</li>
            <li>Do not interfere with other users&apos; learning experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Limitation of Liability
          </h2>
          <p className="mt-2">
            Yiya is provided &ldquo;as is&rdquo; without warranty. We are not
            liable for any damages arising from your use of the service. Yiya is
            a learning tool and does not guarantee fluency or any specific
            learning outcomes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Changes to Terms
          </h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of Yiya
            after changes constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
