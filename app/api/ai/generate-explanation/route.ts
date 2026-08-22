import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/gemini";
import { ExplanationContent } from "@/types";

interface ExplanationResponse extends ExplanationContent {
  simplifiedExplanation?: string;
  workedExampleSteps: { stepNumber: number; title: string; description: string; mathExpression?: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const { topicName, subtopics = [], masteryLevel = 0.5, misconceptions = [], simpler = false } = await req.json();

    if (!topicName) {
      return NextResponse.json(
        { error: "topicName is required." },
        { status: 400 }
      );
    }

    const masteryLabel = masteryLevel >= 0.8 ? "Mastered (focus on nuances & applications)" : masteryLevel >= 0.4 ? "Developing (focus on core intuition & step-by-step mechanics)" : "Weak/Novice (focus on fundamental mental models & common traps)";

    const prompt = `You are a world-class adaptive tutor on Maitri.
Create a personalized learning explanation for the topic: "${topicName}".

Learner Context:
- Current Mastery: ${(masteryLevel * 100).toFixed(0)}% (${masteryLabel})
- Subtopics: ${subtopics.join(", ")}
- Known Misconceptions to address: ${misconceptions.join(", ") || "None recorded"}
- Mode Requested: ${simpler ? "Ultra-simplified intuitive breakdown" : "Standard comprehensive breakdown"}

Requirements:
1. Wrap all mathematical notation in single dollar signs (e.g. $f'(x) = 2x$).
2. Provide a main explanation adapted to their level.
3. Provide a simplified intuitive analogy or mental model.
4. Include a fully worked example with 3-4 expandable steps.
5. Provide 2-3 progressive hints for solving problems in this topic.
6. Provide an academic citation / source reference (e.g. "Chapter 3: Differential Calculus, Section 3.2").

Output JSON Schema:
{
  "explanation": "Clear, concise core explanation tailored to the mastery level...",
  "simplifiedExplanation": "ELI5 / Intuitive analogy...",
  "example": "Worked problem statement...",
  "workedExampleSteps": [
    {
      "stepNumber": 1,
      "title": "Identify the given function and rules",
      "description": "Notice that $y = \\sin(3x^2)$ has an outer function $\\sin(u)$ and inner function $u = 3x^2$.",
      "mathExpression": "u = 3x^2, \\quad y = \\sin(u)"
    }
  ],
  "hints": [
    "Look for composite functions first before applying basic power rules.",
    "Remember to multiply by the derivative of the inside function."
  ],
  "sourceReference": "Calculus: Early Transcendentals, Chapter 3.5, Page 198"
}`;

    const response = await generateStructuredJson<ExplanationResponse>(prompt);
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("AI Explanation Generation Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to generate explanation." },
      { status: 500 }
    );
  }
}
