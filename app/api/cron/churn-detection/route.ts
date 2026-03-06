import { NextResponse } from "next/server";
import { getAtRiskUsers, saveChurnRisk } from "@/db/queries/churn-risk";

/**
 * Cron: Daily churn risk detection
 * Runs daily to identify users at risk of churning
 * Protected by CRON_SECRET header
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all at-risk users
    const atRiskUsers = await getAtRiskUsers();

    // Save risk assessments to database
    const saved = await Promise.all(
      atRiskUsers.map((user) =>
        saveChurnRisk(user.userId, user.riskLevel, user.riskReasons)
      )
    );

    // Log summary
    const summary = {
      total: atRiskUsers.length,
      high: atRiskUsers.filter((u) => u.riskLevel === "high").length,
      medium: atRiskUsers.filter((u) => u.riskLevel === "medium").length,
      low: atRiskUsers.filter((u) => u.riskLevel === "low").length,
    };

    console.log("[churn-detection] Summary:", summary);

    return NextResponse.json({
      success: true,
      summary,
      checked: atRiskUsers.length,
      saved: saved.length,
    });
  } catch (error) {
    console.error("[churn-detection] Error:", error);
    return NextResponse.json(
      { error: "Failed to run churn detection" },
      { status: 500 }
    );
  }
}
