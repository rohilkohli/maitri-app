import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/gemini";
import { Question, Topic, QuestionType } from "@/types";

interface DiagnosticOutput {
  questions: Question[];
}

export async function POST(req: NextRequest) {
  try {
    const { topics, learnerGoal } = await req.json();

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: "A list of topics is required." },
        { status: 400 }
      );
    }

    const topicSummaries = (topics as Topic[]).map((t) => ({
      id: t.id,
      name: t.name,
      subtopics: t.subtopics,
    }));

    const prompt = `You are designing a high-yield diagnostic baseline assessment for a learner preparing for: "${learnerGoal || 'Course Mastery'}".
Generate 6 to 10 diagnostic questions spanning the key concepts across the provided topics.

Rules:
1. Include a balanced mix of MCQ (multiple choice) and Short Answer questions.
2. For math/scientific notation, format mathematical formulas in standard LaTeX enclosed in single dollar signs (e.g. $f'(x) = 3x^2$ or $\\int x^2 dx$).
3. For MCQ questions, provide exactly 4 options labeled or formatted clearly. The 'correctAnswer' must match one of the options verbatim.
4. Set difficulty between 0.2 (foundational) and 0.8 (challenging).
5. For each question, link it to the exact 'topicId' from the list provided.

Topics:
${JSON.stringify(topicSummaries, null, 2)}

JSON Output Format:
{
  "questions": [
    {
      "id": "diag-q1",
      "topicId": "${topicSummaries[0]?.id || 'topic-1'}",
      "question": "What is the value of $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$?",
      "type": "mcq",
      "options": ["0", "2", "4", "Does not exist"],
      "correctAnswer": "4",
      "difficulty": 0.3,
      "hints": ["Factor the numerator as a difference of squares $(x-2)(x+2)$."],
      "explanation": "Factoring $(x-2)(x+2)/(x-2) = x+2$. Evaluating at $x=2$ yields $2+2=4$."
    }
  ]
}`;

    const response = await generateStructuredJson<DiagnosticOutput>(prompt);
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("AI Diagnostic Generation Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to generate diagnostic assessment." },
      { status: 500 }
    );
  }
}
