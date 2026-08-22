/**
 * Unit tests for validation utilities
 * Run with: npx jest lib/__tests__/validation.test.ts
 */

import {
  sanitizeInput,
  sanitizeTopicName,
  isValidEmail,
  isValidSubject,
  isValidClassLevel,
  isValidBoard,
  validateProfileData,
  escapeHtml,
} from "../validation";

describe("sanitizeInput", () => {
  it("removes HTML tags", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).toBe("scriptalert('xss')/script");
  });

  it("trims whitespace", () => {
    expect(sanitizeInput("  hello world  ")).toBe("hello world");
  });

  it("handles empty input", () => {
    expect(sanitizeInput("")).toBe("");
    expect(sanitizeInput(null as any)).toBe("");
    expect(sanitizeInput(undefined as any)).toBe("");
  });

  it("truncates long input", () => {
    const longString = "a".repeat(600);
    expect(sanitizeInput(longString).length).toBe(500);
  });
});

describe("isValidEmail", () => {
  it("validates correct emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.org")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
  });
});

describe("isValidSubject", () => {
  it("accepts valid subjects", () => {
    expect(isValidSubject("Mathematics")).toBe(true);
    expect(isValidSubject("Computer Science")).toBe(true);
    expect(isValidSubject("Environmental Studies")).toBe(true);
  });

  it("rejects invalid subjects", () => {
    expect(isValidSubject("")).toBe(false);
    expect(isValidSubject("a")).toBe(false); // Too short
  });
});

describe("isValidClassLevel", () => {
  it("accepts predefined class levels", () => {
    expect(isValidClassLevel("8th Class")).toBe(true);
    expect(isValidClassLevel("12th Class")).toBe(true);
    expect(isValidClassLevel("College / University")).toBe(true);
  });

  it("accepts custom class levels", () => {
    expect(isValidClassLevel("Graduate")).toBe(true);
    expect(isValidClassLevel("PhD")).toBe(true);
  });
});

describe("isValidBoard", () => {
  it("accepts predefined boards", () => {
    expect(isValidBoard("CBSE")).toBe(true);
    expect(isValidBoard("ICSE")).toBe(true);
    expect(isValidBoard("State Board")).toBe(true);
  });

  it("accepts custom boards", () => {
    expect(isValidBoard("Maharashtra Board")).toBe(true);
  });
});

describe("validateProfileData", () => {
  it("validates complete profile", () => {
    const result = validateProfileData({
      subject: "Mathematics",
      classLevel: "10th Class",
      board: "CBSE",
      examGoal: "Board Exam",
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("detects invalid data", () => {
    const result = validateProfileData({
      subject: "a", // Too short
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("escapeHtml", () => {
  it("escapes HTML entities", () => {
    expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
    expect(escapeHtml('"quoted"')).toBe("&quot;quoted&quot;");
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });
});
