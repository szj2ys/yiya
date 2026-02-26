import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TopicPage, {
  generateStaticParams,
  generateMetadata,
} from "@/app/(marketing)/learn/[lang]/[topic]/page";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("Topic SEO Page", () => {
  it("should generate static params for all topic pages", () => {
    const params = generateStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(8);
    for (const param of params) {
      expect(param.lang).toBeTruthy();
      expect(param.topic).toBeTruthy();
    }
  });

  it("should render topic page with correct hero content", () => {
    render(
      <TopicPage params={{ lang: "japanese", topic: "hiragana" }} />,
    );
    // "Learn Japanese Hiragana" appears in breadcrumb and hero
    const matches = screen.getAllByText(/Learn Japanese Hiragana/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Master the foundation of Japanese writing/),
    ).toBeInTheDocument();
  });

  it("should render content sections", () => {
    render(
      <TopicPage params={{ lang: "japanese", topic: "hiragana" }} />,
    );
    expect(screen.getByText("What Is Hiragana?")).toBeInTheDocument();
    expect(screen.getByText("Why Start with Hiragana?")).toBeInTheDocument();
  });

  it("should render FAQ section", () => {
    render(
      <TopicPage params={{ lang: "japanese", topic: "hiragana" }} />,
    );
    expect(
      screen.getByText("How long does it take to learn hiragana?"),
    ).toBeInTheDocument();
  });

  it("should render breadcrumb with language link", () => {
    render(
      <TopicPage params={{ lang: "japanese", topic: "hiragana" }} />,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Learn Japanese")).toBeInTheDocument();
    expect(
      screen.getByText("Learn Japanese Hiragana"),
    ).toBeInTheDocument();
  });

  it("should generate correct metadata for topic page", () => {
    const meta = generateMetadata({
      params: { lang: "japanese", topic: "hiragana" },
    });
    expect(meta.title).toContain("Hiragana");
    expect(meta.description).toContain("hiragana");
    expect(meta.keywords).toContain("learn hiragana");
  });

  it("should render JSON-LD FAQ schema", () => {
    const { container } = render(
      <TopicPage params={{ lang: "japanese", topic: "hiragana" }} />,
    );
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).toBeTruthy();
    const schema = JSON.parse(script!.textContent!);
    expect(schema["@type"]).toBe("FAQPage");
  });

  it("should return empty metadata for unknown topic", () => {
    const meta = generateMetadata({
      params: { lang: "japanese", topic: "nonexistent" },
    });
    expect(meta).toEqual({});
  });

  it("should call notFound for unknown topic", () => {
    expect(() =>
      render(
        <TopicPage params={{ lang: "japanese", topic: "nonexistent" }} />,
      ),
    ).toThrow("NEXT_NOT_FOUND");
  });

  it("should render CTA section", () => {
    render(
      <TopicPage params={{ lang: "japanese", topic: "hiragana" }} />,
    );
    expect(
      screen.getByText("Ready to Start Learning?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Start Learning Free")).toBeInTheDocument();
  });

  it("should render back link to language page", () => {
    render(
      <TopicPage params={{ lang: "japanese", topic: "hiragana" }} />,
    );
    expect(
      screen.getByText("Back to Learn Japanese"),
    ).toBeInTheDocument();
  });
});
