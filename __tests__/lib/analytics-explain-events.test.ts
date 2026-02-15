import { describe, expectTypeOf, it } from "vitest";

import type { AnalyticsEventMap } from "@/lib/analytics";

describe("AnalyticsEventMap (explain)", () => {
  it("should include explain event payload types", () => {
    expectTypeOf<AnalyticsEventMap["explanation_view"]>().toMatchTypeOf<{
      challenge_id: number;
      cached: boolean;
    }>();

    expectTypeOf<AnalyticsEventMap["explanation_practice_click"]>().toMatchTypeOf<{
      challenge_id: number;
    }>();
  });
});
