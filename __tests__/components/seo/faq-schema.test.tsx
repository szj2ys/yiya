import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FAQSchema } from "@/components/seo/faq-schema";

describe("FAQSchema", () => {
  const sampleFaqs = [
    { question: "Is it free?", answer: "Yes, it is free." },
    { question: "How does it work?", answer: "AI-powered learning." },
  ];

  it("should render valid FAQ JSON-LD schema", () => {
    const { container } = render(<FAQSchema faqs={sampleFaqs} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();

    const schema = JSON.parse(script!.textContent!);
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(2);
  });

  it("should include all FAQ questions and answers in schema", () => {
    const { container } = render(<FAQSchema faqs={sampleFaqs} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const schema = JSON.parse(script!.textContent!);

    expect(schema.mainEntity[0]["@type"]).toBe("Question");
    expect(schema.mainEntity[0].name).toBe("Is it free?");
    expect(schema.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe("Yes, it is free.");

    expect(schema.mainEntity[1].name).toBe("How does it work?");
    expect(schema.mainEntity[1].acceptedAnswer.text).toBe("AI-powered learning.");
  });

  it("should handle empty FAQ array", () => {
    const { container } = render(<FAQSchema faqs={[]} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const schema = JSON.parse(script!.textContent!);
    expect(schema.mainEntity).toHaveLength(0);
  });
});
