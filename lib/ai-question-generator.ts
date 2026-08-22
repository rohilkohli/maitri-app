import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question, QuestionType } from "@/types";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

export interface GenerateQuestionsParams {
  subject: string;
  classLevel: string; // e.g., "8th Class", "12th Class", "College"
  board: string; // e.g., "CBSE", "ICSE", "State Board", "AP", "IB"
  examGoal?: string;
  topics?: string[];
  count?: number;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
}

export async function generateDynamicQuestions(params: GenerateQuestionsParams): Promise<Question[]> {
  const {
    subject,
    classLevel,
    board,
    examGoal,
    topics,
    count = 6,
    difficulty = "mixed",
  } = params;

  if (!apiKey) {
    console.warn("No Gemini API key, returning fallback questions");
    return getFallbackQuestions(subject, classLevel);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const prompt = `You are an expert educational content creator. Generate ${count} multiple-choice questions for a student.

STUDENT PROFILE:
- Subject: ${subject}
- Class/Grade: ${classLevel}
- Board/Curriculum: ${board}
${examGoal ? `- Exam Goal: ${examGoal}` : ""}
${topics?.length ? `- Focus Topics: ${topics.join(", ")}` : ""}
- Difficulty Mix: ${difficulty}

REQUIREMENTS:
1. Questions MUST be appropriate for the ${classLevel} level
2. Follow ${board} curriculum standards and terminology
3. Include a mix of conceptual and application-based questions
4. Each question should test a different topic/concept
5. Provide clear, educational explanations
6. Use proper mathematical notation where needed (use $ for LaTeX)

Return a JSON array with this exact structure:
{
  "questions": [
    {
      "id": "q-1",
      "topicId": "topic-name-slug",
      "topicName": "Human Readable Topic Name",
      "question": "The question text with $math$ if needed",
      "type": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact correct option text",
      "difficulty": 0.3,
      "hints": ["A helpful hint"],
      "explanation": "Why the answer is correct"
    }
  ]
}

IMPORTANT:
- difficulty should be 0.2-0.4 for easy, 0.4-0.6 for medium, 0.6-0.8 for hard
- correctAnswer MUST exactly match one of the options
- Generate exactly ${count} questions
- Make questions engaging and educational`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    const questions = parsed.questions || parsed;

    return questions.map((q: any, idx: number) => ({
      id: q.id || `gen-q-${idx + 1}`,
      topicId: q.topicId || `topic-${idx + 1}`,
      topicName: q.topicName || q.topicId,
      question: q.question,
      type: QuestionType.MCQ,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty || 0.5,
      hints: q.hints || [],
      explanation: q.explanation || "",
    }));
  } catch (error) {
    console.error("AI question generation failed:", error);
    return getFallbackQuestions(subject, classLevel);
  }
}

export async function generateTopicsForSubject(
  subject: string,
  classLevel: string,
  board: string
): Promise<{ id: string; name: string; subtopics: string[] }[]> {
  if (!apiKey) {
    return getDefaultTopics(subject);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const prompt = `Generate a list of main topics for:
- Subject: ${subject}
- Class/Grade: ${classLevel}
- Board/Curriculum: ${board}

Return JSON:
{
  "topics": [
    {
      "id": "topic-slug",
      "name": "Topic Name",
      "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"]
    }
  ]
}

Generate 6-10 main topics that are typically covered in this subject at this level. Be curriculum-appropriate.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return parsed.topics || [];
  } catch (error) {
    console.error("Topic generation failed:", error);
    return getDefaultTopics(subject);
  }
}

function getFallbackQuestions(subject: string, classLevel: string): Question[] {
  const isElementary = classLevel.includes("5") || classLevel.includes("6") || classLevel.includes("7") || classLevel.includes("8");

  const fallbackBySubject: Record<string, Question[]> = {
    "Computer Science": [
      {
        id: "cs-fb-1",
        topicId: "cs-basics",
        question: "What does CPU stand for?",
        type: QuestionType.MCQ,
        options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"],
        correctAnswer: "Central Processing Unit",
        difficulty: 0.2,
        hints: ["It's the 'brain' of the computer"],
        explanation: "CPU stands for Central Processing Unit - it executes instructions and processes data.",
      },
      {
        id: "cs-fb-2",
        topicId: "cs-programming",
        question: "Which of these is a programming language?",
        type: QuestionType.MCQ,
        options: ["Python", "Microsoft Word", "Google Chrome", "Windows"],
        correctAnswer: "Python",
        difficulty: 0.2,
        hints: ["Think of languages used to write code"],
        explanation: "Python is a popular programming language. The others are applications or operating systems.",
      },
      {
        id: "cs-fb-3",
        topicId: "cs-storage",
        question: "Which unit is used to measure computer memory?",
        type: QuestionType.MCQ,
        options: ["Bytes", "Meters", "Kilograms", "Seconds"],
        correctAnswer: "Bytes",
        difficulty: 0.2,
        hints: ["KB, MB, GB are all based on this unit"],
        explanation: "Computer memory is measured in bytes (B), kilobytes (KB), megabytes (MB), gigabytes (GB), etc.",
      },
      {
        id: "cs-fb-4",
        topicId: "cs-internet",
        question: "What does HTML stand for?",
        type: QuestionType.MCQ,
        options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink Text Management Language"],
        correctAnswer: "HyperText Markup Language",
        difficulty: 0.3,
        hints: ["It's used to create web pages"],
        explanation: "HTML (HyperText Markup Language) is the standard language for creating web pages.",
      },
      {
        id: "cs-fb-5",
        topicId: "cs-logic",
        question: "In binary, what does 10 represent in decimal?",
        type: QuestionType.MCQ,
        options: ["2", "10", "1", "0"],
        correctAnswer: "2",
        difficulty: 0.4,
        hints: ["Binary uses only 0 and 1, with place values of powers of 2"],
        explanation: "In binary: 10 = (1×2¹) + (0×2⁰) = 2 + 0 = 2 in decimal.",
      },
    ],
    Mathematics: isElementary ? [
      {
        id: "math-fb-1",
        topicId: "math-fractions",
        question: "What is $\\frac{1}{2} + \\frac{1}{4}$?",
        type: QuestionType.MCQ,
        options: ["$\\frac{3}{4}$", "$\\frac{2}{6}$", "$\\frac{1}{6}$", "$\\frac{2}{4}$"],
        correctAnswer: "$\\frac{3}{4}$",
        difficulty: 0.3,
        hints: ["Find a common denominator first"],
        explanation: "$\\frac{1}{2} = \\frac{2}{4}$, so $\\frac{2}{4} + \\frac{1}{4} = \\frac{3}{4}$",
      },
      {
        id: "math-fb-2",
        topicId: "math-percentages",
        question: "What is 25% of 80?",
        type: QuestionType.MCQ,
        options: ["20", "25", "40", "15"],
        correctAnswer: "20",
        difficulty: 0.3,
        hints: ["25% is the same as 1/4"],
        explanation: "25% of 80 = 0.25 × 80 = 20 (or 80 ÷ 4 = 20)",
      },
      {
        id: "math-fb-3",
        topicId: "math-algebra",
        question: "If $x + 5 = 12$, what is $x$?",
        type: QuestionType.MCQ,
        options: ["7", "17", "5", "12"],
        correctAnswer: "7",
        difficulty: 0.2,
        hints: ["Subtract 5 from both sides"],
        explanation: "$x + 5 = 12 \\Rightarrow x = 12 - 5 = 7$",
      },
      {
        id: "math-fb-4",
        topicId: "math-geometry",
        question: "What is the area of a rectangle with length 6 cm and width 4 cm?",
        type: QuestionType.MCQ,
        options: ["24 cm²", "10 cm²", "20 cm²", "12 cm²"],
        correctAnswer: "24 cm²",
        difficulty: 0.2,
        hints: ["Area = length × width"],
        explanation: "Area = 6 × 4 = 24 cm²",
      },
      {
        id: "math-fb-5",
        topicId: "math-ratios",
        question: "Simplify the ratio 12:8",
        type: QuestionType.MCQ,
        options: ["3:2", "6:4", "4:3", "2:3"],
        correctAnswer: "3:2",
        difficulty: 0.3,
        hints: ["Divide both numbers by their GCD (4)"],
        explanation: "12:8 → divide both by 4 → 3:2",
      },
    ] : [
      {
        id: "math-adv-1",
        topicId: "math-calculus",
        question: "Find $\\frac{d}{dx}(x^3)$",
        type: QuestionType.MCQ,
        options: ["$3x^2$", "$x^2$", "$3x^3$", "$x^4$"],
        correctAnswer: "$3x^2$",
        difficulty: 0.4,
        hints: ["Use the power rule"],
        explanation: "Power rule: $\\frac{d}{dx}(x^n) = nx^{n-1}$, so $\\frac{d}{dx}(x^3) = 3x^2$",
      },
    ],
  };

  return fallbackBySubject[subject] || fallbackBySubject["Mathematics"];
}

function getDefaultTopics(subject: string) {
  const defaultTopics: Record<string, { id: string; name: string; subtopics: string[] }[]> = {
    "Computer Science": [
      { id: "cs-basics", name: "Computer Fundamentals", subtopics: ["Hardware", "Software", "Operating Systems"] },
      { id: "cs-programming", name: "Introduction to Programming", subtopics: ["Variables", "Data Types", "Control Flow"] },
      { id: "cs-internet", name: "Internet & Web", subtopics: ["HTML", "Browsers", "URLs"] },
      { id: "cs-logic", name: "Number Systems", subtopics: ["Binary", "Decimal", "Conversions"] },
    ],
    Mathematics: [
      { id: "math-algebra", name: "Algebra", subtopics: ["Equations", "Expressions", "Variables"] },
      { id: "math-geometry", name: "Geometry", subtopics: ["Shapes", "Area", "Perimeter"] },
      { id: "math-arithmetic", name: "Arithmetic", subtopics: ["Fractions", "Decimals", "Percentages"] },
    ],
  };

  return defaultTopics[subject] || defaultTopics["Mathematics"];
}
