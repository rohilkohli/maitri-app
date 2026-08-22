import { NextRequest, NextResponse } from "next/server";
import { runDecisionEngine } from "@/lib/decision-engine";
import { generateStructuredJson } from "@/lib/gemini";
import { Recommendation } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { topics = [], topicStates = [], examDate, dueFlashcardsCount = 0 } = await req.json();

    // 1. Run deterministic decision engine to identify candidates & evidence
    const baseRecommendation = runDecisionEngine({
      topics,
      topicStates,
      examDate,
      dueFlashcardsCount,
    });

    // 2. Enhance reasoning using Gemini for natural, encouraging, evidence-driven phrasing if API key is present
    try {
      const prompt = `You are the Maitri Decision Engine. 
The deterministic engine computed the following recommendation:
- Activity Type: ${baseRecommendation.activityType}
- Target Topic: ${baseRecommendation.topicName}
- Core Evidence: ${baseRecommendation.evidence.join("; ")}
- Computed Reason: ${baseRecommendation.reason}

Refine the "reason" into a punchy, 1-2 sentence evidence-based explanation for why this learner must study this right now. Reference concrete metrics (e.g. "Based on your 2/4 score..." or "Prerequisite for...").
Also return an array of 2-3 specific bullet-point evidence strings.

Output JSON:
{
  "reason": "You answered 2/4 correctly on quadratic word problems. Factorisation is a foundational prerequisite.",
  "evidence": [
    "Score: 50% on downstream topic",
    "Missing prerequisite mastery",
    "High exam frequency"
  ]
}`;

      const aiRefinement = await generateStructuredJson<{ reason: string; evidence: string[] }>(prompt);
      
      return NextResponse.json({
        ...baseRecommendation,
        reason: aiRefinement.reason || baseRecommendation.reason,
        evidence: aiRefinement.evidence || baseRecommendation.evidence,
      });
    } catch {
      // Fallback cleanly to the deterministic decision engine output
      return NextResponse.json(baseRecommendation);
    }
  } catch (error: unknown) {
    console.error("AI Recommendation Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to compute recommendation." },
      { status: 500 }
    );
  }
}
