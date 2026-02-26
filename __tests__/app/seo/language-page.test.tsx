import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LanguagePage, {
  generateStaticParams,
  generateMetadata,
} from "@/app/(marketing)/learn/[lang]/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("Language SEO Page", () => {
  it("should generate static params for all 6 languages", () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(6);
    const slugs = params.map((p) => p.lang);
    expect(slugs).toContain("spanish");
    expect(slugs).toContain("chinese");
    expect(slugs).toContain("french");
    expect(slugs).toContain("italian");
    expect(slugs).toContain("japanese");
    expect(slugs).toContain("english");
  });

  it("should render SEO page with correct meta tags for each language", () => {
    const meta = generateMetadata({ params: { lang: "spanish" } });
    expect(meta.title).toContain("Spanish");
    expect(meta.description).toContain("Spanish");
    expect(meta.keywords).toContain("learn spanish online");
  });

  it("should render SEO page for spanish with hero content", () => {
    render(<LanguagePage params={{ lang: "spanish" }} />);
    // "Learn Spanish" appears in breadcrumb and hero heading
    const headings = screen.getAllByText(/Learn Spanish/);
    expect(headings.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Speak Spanish with confidence/)).toBeInTheDocument();
  });

  it("should render sample phrases for the language", () => {
    render(<LanguagePage params={{ lang: "spanish" }} />);
    expect(screen.getByText("Buenos dias")).toBeInTheDocument();
    // "Good morning" may appear in sample phrases and quiz options
    const matches = screen.getAllByText("Good morning");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("should render FAQ section", () => {
    render(<LanguagePage params={{ lang: "spanish" }} />);
    expect(
      screen.getByText("Is Yiya free to learn Spanish?"),
    ).toBeInTheDocument();
  });

  it("should render CTA button", () => {
    render(<LanguagePage params={{ lang: "spanish" }} />);
    expect(
      screen.getByText("Start Learning Spanish Free"),
    ).toBeInTheDocument();
  });

  it("should render other language links", () => {
    render(<LanguagePage params={{ lang: "spanish" }} />);
    expect(screen.getByText("French")).toBeInTheDocument();
    expect(screen.getByText("Chinese")).toBeInTheDocument();
  });

  it("should render breadcrumb navigation", () => {
    render(<LanguagePage params={{ lang: "spanish" }} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Learn Spanish")).toBeInTheDocument();
  });

  it("should render JSON-LD FAQ schema", () => {
    const { container } = render(
      <LanguagePage params={{ lang: "spanish" }} />,
    );
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).toBeTruthy();
    const schema = JSON.parse(script!.textContent!);
    expect(schema["@type"]).toBe("FAQPage");
  });

  it("should return empty metadata for unknown language", () => {
    const meta = generateMetadata({ params: { lang: "klingon" } });
    expect(meta).toEqual({});
  });

  it("should call notFound for unknown language", () => {
    expect(() =>
      render(<LanguagePage params={{ lang: "klingon" }} />),
    ).toThrow("NEXT_NOT_FOUND");
  });

  it("should render feature highlights", () => {
    render(<LanguagePage params={{ lang: "spanish" }} />);
    expect(screen.getByText("AI Explanations")).toBeInTheDocument();
    expect(screen.getByText("FSRS Spaced Repetition")).toBeInTheDocument();
  });

  it("should render interactive sample section", () => {
    render(<LanguagePage params={{ lang: "spanish" }} />);
    expect(
      screen.getByTestId("sample-quiz"),
    ).toBeInTheDocument();
  });
});
