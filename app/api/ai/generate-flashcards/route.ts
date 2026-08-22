import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/gemini";

interface FlashcardItem {
  front: string;
  back: string;
}

interface FlashcardResponse {
  flashcards: FlashcardItem[];
}

export async function POST(req: NextRequest) {
  try {
    const { topicName, subtopics = [], misconceptions = [], count = 4 } = await req.json();

    if (!topicName) {
      return NextResponse.json(
        { error: "topicName is required." },
        { status: 400 }
      );
    }

    const prompt = `Generate ${count} high-yield active recall flashcards for the topic: "${topicName}".
Subtopics: ${subtopics.join(", ")}
Target Misconceptions to address: ${misconceptions.join(", ") || "General mastery"}

Rules:
1. Wrap all mathematical notation in single dollar signs (e.g. $f(x) = \\cos(x)$).
2. The front should be a clear, unambiguous prompt, definition query, or short problem.
3. The back should be the crisp, accurate answer with a 1-sentence insight.

Output JSON:
{
  "flashcards": [
    {
      "front": "What is the derivative of $\\tan(x)$?",
      "back": "$\\frac{d}{dx}[\\tan(x)] = \\sec^2(x)$."
    }
  ]
}`;

    const response = await generateStructuredJson<FlashcardResponse>(prompt);
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("AI Flashcard Generation Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to generate flashcards." },
      { status: 500 }
    );
  }
}
