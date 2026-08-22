import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UserContext {
  name?: string;
  subject?: string;
  classLevel?: string;
  board?: string;
  examGoal?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, userContext } = body as {
      message: string;
      history?: ChatMessage[];
      userContext?: UserContext;
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { response: "I'm currently unavailable. Please try again later." },
        { status: 200 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    // Build system context
    let systemContext = `You are Maitri AI, a friendly and helpful learning assistant for the Maitri adaptive learning platform.

ABOUT MAITRI:
- Maitri is an AI-powered adaptive learning platform
- It creates personalized learning journeys based on each student's level
- Features include: diagnostic assessments, personalized study roadmaps, flashcards, knowledge tracking
- Supports multiple subjects, class levels (5th-12th, College), and boards (CBSE, ICSE, IB, AP, etc.)
- Uses AI to generate questions appropriate for the student's level

YOUR ROLE:
- Help users understand how Maitri works
- Answer questions about subjects and topics
- Provide study tips and motivation
- Guide users to relevant features
- Be encouraging and supportive`;

    // Add personalized context for logged-in users
    if (userContext?.name) {
      systemContext += `\n\nCURRENT USER:
- Name: ${userContext.name}`;
      if (userContext.subject) {
        systemContext += `\n- Subject: ${userContext.subject}`;
      }
      if (userContext.classLevel) {
        systemContext += `\n- Class Level: ${userContext.classLevel}`;
      }
      if (userContext.board) {
        systemContext += `\n- Board/Curriculum: ${userContext.board}`;
      }
      if (userContext.examGoal) {
        systemContext += `\n- Exam Goal: ${userContext.examGoal}`;
      }
      systemContext += `\n\nPersonalize your responses based on the user's profile. You can reference their subject, class level, and goals when relevant.`;
    } else {
      systemContext += `\n\nThis user is not logged in yet. Encourage them to sign up to get personalized learning experiences.`;
    }

    systemContext += `\n\nGUIDELINES:
- Keep responses concise (2-3 sentences max unless explaining something complex)
- Be friendly and encouraging
- Use simple language appropriate for students
- If asked about specific subject content, provide helpful educational information
- If you don't know something, admit it honestly
- Never make up facts about Maitri features that don't exist`;

    // Build conversation history
    const conversationParts: { role: "user" | "model"; parts: [{ text: string }] }[] = [];

    // Add history
    if (history && history.length > 0) {
      for (const msg of history) {
        conversationParts.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Start chat
    const chat = model.startChat({
      history: conversationParts,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    // Send message with system context
    const prompt = history && history.length > 0
      ? message
      : `${systemContext}\n\nUser: ${message}`;

    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { response: "I'm having trouble right now. Please try again." },
      { status: 200 }
    );
  }
}
