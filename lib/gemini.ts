import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export function getGeminiModel(modelName: string = "gemini-3.6-flash") {
  return genAI.getGenerativeModel({
    model: modelName,
  });
}

/**
 * Generate structured JSON response from Gemini
 */
export async function generateStructuredJson<T>(
  prompt: string,
  systemInstruction?: string,
  modelName: string = "gemini-3.6-flash"
): Promise<T> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemInstruction || "You are an expert adaptive learning AI. Always return valid, well-structured JSON without markdown code fences or backticks.",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const cleanedText = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    return JSON.parse(cleanedText) as T;
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON. Raw response:", text);
    throw new Error("Gemini returned invalid JSON structure.");
  }
}
