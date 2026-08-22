import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

export async function extractTextFromImage(imageBase64: string, mimeType: string = "image/jpeg"): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const prompt = `You are an OCR assistant. Extract ALL text from this image of a syllabus or curriculum document.

Rules:
- Extract text exactly as it appears
- Preserve structure (headings, bullet points, numbered lists)
- If there are topics/chapters, list them clearly
- Include any subtopics or learning objectives
- If text is unclear, make your best effort
- Return ONLY the extracted text, no commentary

Extracted text:`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ]);

  const response = await result.response;
  return response.text();
}

export async function extractTopicsFromText(text: string): Promise<{
  topics: Array<{
    name: string;
    subtopics: string[];
  }>;
}> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const prompt = `Analyze this syllabus/curriculum text and extract the main topics and subtopics.

Text:
${text}

Return a JSON object with this exact structure:
{
  "topics": [
    {
      "name": "Topic Name",
      "subtopics": ["Subtopic 1", "Subtopic 2"]
    }
  ]
}

Extract ALL topics mentioned. Be comprehensive.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();

  try {
    const cleaned = responseText
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return { topics: [] };
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
