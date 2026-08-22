import { NextRequest, NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/gemini";
import { Topic } from "@/types";

interface SyllabusOutput {
  topics: Topic[];
}

export async function POST(req: NextRequest) {
  try {
    const { syllabusText } = await req.json();

    if (!syllabusText || typeof syllabusText !== "string") {
      return NextResponse.json(
        { error: "syllabusText is required" },
        { status: 400 }
      );
    }

    const prompt = `Analyze the following course syllabus or curriculum outline and extract a structured prerequisite tree of topics.
For each topic, provide:
- id: unique string (e.g., "topic-1", "topic-2")
- name: clear academic topic title
- prerequisites: array of topic ids that MUST be understood before studying this topic
- subtopics: array of key sub-concepts (3-5 items)
- importance: float between 0.1 and 1.0 indicating curriculum weight/exam frequency
- description: 1-2 sentence overview of what the topic covers

Return format MUST match this JSON schema:
{
  "topics": [
    {
      "id": "topic-limits",
      "name": "Limits and Continuity",
      "prerequisites": [],
      "subtopics": ["One-Sided Limits", "Continuity at a Point"],
      "importance": 0.85,
      "description": "Foundational understanding of function behavior approaching points."
    }
  ]
}

Syllabus Content:
${syllabusText.substring(0, 10000)}`;

    const response = await generateStructuredJson<SyllabusOutput>(prompt);
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("AI Syllabus Extraction Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to extract syllabus." },
      { status: 500 }
    );
  }
}
