import type { FAQ } from "@/lib/seo/languages";

interface FAQSchemaProps {
  faqs: FAQ[];
}

/**
 * Renders FAQ structured data as JSON-LD for search engine rich results.
 * Content is static config data, not user input, so injection risk is absent.
 */
export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
