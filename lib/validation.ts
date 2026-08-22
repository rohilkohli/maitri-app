/**
 * Input validation utilities for security and data integrity
 * Prevents XSS, injection attacks, and ensures data quality
 */

const MAX_INPUT_LENGTH = 500;
const MAX_TOPIC_LENGTH = 200;

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, MAX_INPUT_LENGTH)
    .replace(/[<>]/g, ""); // Basic XSS prevention
}

export function sanitizeTopicName(topic: string): string {
  if (!topic || typeof topic !== "string") return "";
  return topic
    .trim()
    .slice(0, MAX_TOPIC_LENGTH)
    .replace(/[<>{}]/g, "");
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidSubject(subject: string): boolean {
  if (!subject || typeof subject !== "string") return false;
  const sanitized = sanitizeInput(subject);
  return sanitized.length >= 2 && sanitized.length <= 100;
}

export function isValidClassLevel(classLevel: string): boolean {
  if (!classLevel || typeof classLevel !== "string") return false;
  const validLevels = [
    "5th Class", "6th Class", "7th Class", "8th Class",
    "9th Class", "10th Class", "11th Class", "12th Class",
    "College / University", "Other"
  ];
  return validLevels.includes(classLevel) || classLevel.length <= 50;
}

export function isValidBoard(board: string): boolean {
  if (!board || typeof board !== "string") return false;
  const validBoards = [
    "CBSE", "ICSE", "State Board", "IB", "Cambridge", "AP", "GCSE", "Other"
  ];
  return validBoards.includes(board) || board.length <= 50;
}

export function validateProfileData(data: {
  subject?: string;
  classLevel?: string;
  board?: string;
  examGoal?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.subject && !isValidSubject(data.subject)) {
    errors.push("Invalid subject name");
  }
  if (data.classLevel && !isValidClassLevel(data.classLevel)) {
    errors.push("Invalid class level");
  }
  if (data.board && !isValidBoard(data.board)) {
    errors.push("Invalid board name");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}
