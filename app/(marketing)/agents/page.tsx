import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code, Globe, Sparkles, Zap } from "lucide-react";

export const metadata = {
  title: "Agent API - Yiya",
  description: "Build AI agents that help users discover and learn languages with Yiya",
};

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/agent/courses",
    description: "List all available language courses",
    example: `curl https://yiya.ai/api/agent/courses`,
  },
  {
    method: "GET",
    path: "/api/agent/courses/[id]",
    description: "Get detailed information about a specific course",
    example: `curl https://yiya.ai/api/agent/courses/1`,
  },
  {
    method: "GET",
    path: "/api/agent/progress",
    description: "Get user's learning progress (authenticated)",
    example: `curl -H "Authorization: Bearer $TOKEN" https://yiya.ai/api/agent/progress`,
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Fast & Simple",
    description: "Designed for AI agents with minimal latency and clear responses",
  },
  {
    icon: Globe,
    title: "6 Languages",
    description: "Access to Spanish, French, German, Italian, Japanese, and Chinese courses",
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "OpenAPI-compatible endpoints with comprehensive examples",
  },
  {
    icon: Sparkles,
    title: "AI-Ready",
    description: "Text format option perfect for LLM consumption",
  },
];

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-screen-lg px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
              Build language tutors with <span className="text-green-600">Yiya Agent API</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
              Integrate Yiya&apos;s language courses into your AI agents. Help users discover,
              track, and complete lessons—all through a simple, fast API.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="#endpoints">View Endpoints</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl">
                <Link href="https://github.com/szj2ys/yiya/blob/main/docs/AGENT_API.md">
                  Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-screen-lg px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-4 font-semibold text-neutral-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section id="endpoints" className="border-t border-neutral-200 py-16">
        <div className="mx-auto max-w-screen-lg px-4">
          <h2 className="text-2xl font-bold text-neutral-900">API Endpoints</h2>
          <p className="mt-2 text-neutral-600">
            All endpoints are available at <code className="rounded bg-neutral-100 px-2 py-1">https://yiya.ai/api/agent</code>
          </p>

          <div className="mt-8 space-y-6">
            {ENDPOINTS.map((endpoint) => (
              <div
                key={endpoint.path}
                className="rounded-2xl border border-neutral-200 bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-semibold text-neutral-900">{endpoint.path}</code>
                </div>
                <p className="mt-2 text-sm text-neutral-600">{endpoint.description}</p>
                <div className="mt-4 rounded-xl bg-neutral-900 p-4">
                  <code className="text-xs text-green-400">{endpoint.example}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Case */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-16">
        <div className="mx-auto max-w-screen-lg px-4">
          <h2 className="text-2xl font-bold text-neutral-900">Example: Language Tutor Agent</h2>
          <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-700">
                  U
                </div>
                <div>
                  <p className="text-neutral-900">I want to learn Spanish</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                  AI
                </div>
                <div>
                  <p className="text-neutral-900">
                    Great choice! I found a Spanish course on Yiya with 5 units and 25 lessons.
                    Would you like me to help you get started?
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    <em>The agent called GET /api/agent/courses and found the Spanish course</em>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-200 py-16">
        <div className="mx-auto max-w-screen-lg px-4 text-center">
          <h2 className="text-2xl font-bold text-neutral-900">Ready to build?</h2>
          <p className="mt-2 text-neutral-600">
            Start integrating Yiya into your AI agents today.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/api/agent/courses" target="_blank">
                Try API
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link href="https://github.com/szj2ys/yiya">GitHub</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
