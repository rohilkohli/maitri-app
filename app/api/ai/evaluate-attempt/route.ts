import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/gemini";
import { ConfidenceLevel } from "@/types";
import { calculateMasteryUpdate } from "@/lib/mastery-calculator";

interface EvaluationResponse {
  isCorrect: boolean;
  errorCategory?: string;
  feedback: string;
  misconceptionTags: string[];
  confidence: number;
}

export async function POST(req: NextRequest) {
  try {
    const {
      question,
      correctAnswer,
      learnerAnswer,
      learnerExplanation,
      currentMastery = 0.5,
      confidenceBefore = ConfidenceLevel.SOMEWHAT_SURE,
      difficulty = 0.5,
      responseTimeSeconds = 30,
    } = await req.json();

    if (!question || learnerAnswer === undefined) {
      return NextResponse.json(
        { error: "question and learnerAnswer are required." },
        { status: 400 }
      );
    }

    const prompt = `You are an expert diagnostic tutor in Maitri's adaptive decision engine.
Evaluate the learner's response to the question.

Question: "${question}"
Reference Correct Answer: "${correctAnswer}"
Learner's Submitted Answer: "${learnerAnswer}"
Learner's Explanation / Reasoning: "${learnerExplanation || 'No written explanation provided.'}"

Instructions:
1. Determine if the answer is conceptually and factually correct (account for equivalent mathematical expressions, minor formatting, or case differences).
2. If incorrect, classify the specific error category (e.g. "Sign Error", "Concept Misunderstanding", "Algebraic Manipulation", "Formula Misapplication", "Calculation Mistake").
3. Detect 1-3 specific misconception tags (e.g. ["confusing derivative with integral", "forgot chain rule factor"]).
4. Provide constructive, encouraging feedback explaining why the answer is right or wrong and how to think about it.

Output Schema:
{
  "isCorrect": true,
  "errorCategory": null,
  "feedback": "Great work! You correctly applied the power rule and multiplied by the constant.",
  "misconceptionTags": []
}`;

    const aiEval = await generateStructuredJson<EvaluationResponse>(prompt);

    // Run mastery update calculation
    const masteryCalc = calculateMasteryUpdate({
      currentMastery,
      isCorrect: aiEval.isCorrect,
      confidenceBefore: confidenceBefore as ConfidenceLevel,
      difficulty,
      responseTimeSeconds,
    });

    return NextResponse.json({
      ...aiEval,
      newMastery: masteryCalc.newMastery,
      masteryDelta: masteryCalc.masteryDelta,
      newStatus: masteryCalc.newStatus,
    });
  } catch (error: unknown) {
    console.error("AI Evaluation Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to evaluate learner attempt." },
      { status: 500 }
    );
  }
}
