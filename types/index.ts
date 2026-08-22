/**
 * Core type definitions for the Maitri Adaptive Learning Platform
 * @module types
 */

// ===== ENUMS =====

/** Represents the learner's mastery status for a topic */
export enum TopicStatus {
  NOT_ASSESSED = "not_assessed",
  WEAK = "weak",
  DEVELOPING = "developing",
  MASTERED = "mastered",
  AT_RISK = "at_risk",
}

export enum ActivityType {
  LESSON = "lesson",
  PRACTICE = "practice",
  REVIEW = "review",
  DIAGNOSTIC = "diagnostic",
  FLASHCARD = "flashcard",
  EXAM = "exam",
}

export enum QuestionType {
  MCQ = "mcq",
  SHORT_ANSWER = "short_answer",
  EXPLAIN = "explain",
}

export enum ConfidenceLevel {
  GUESSING = "guessing",
  SOMEWHAT_SURE = "somewhat_sure",
  CONFIDENT = "confident",
}

export enum LearningStyle {
  VISUAL = "visual",
  READING = "reading",
  PRACTICE = "practice",
  MIXED = "mixed",
}

// ===== FIRESTORE DOCUMENT TYPES =====

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Profile {
  userId: string;
  subject: string;
  classLevel: string; // e.g., "8th Class", "12th Class"
  board: string; // e.g., "CBSE", "ICSE", "State Board"
  examGoal: string;
  examDate: Date;
  studyTimePerDay: number; // minutes
  confidenceLevel: ConfidenceLevel;
  preferredLearningStyle: LearningStyle;
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  name: string;
  prerequisites: string[];
  subtopics: string[];
  importance: number; // 0-1
  description?: string;
}

export interface Course {
  id: string;
  userId: string;
  title: string;
  syllabusUrl?: string;
  topics: Topic[];
  createdAt: Date;
}

export interface LearnerTopicState {
  id: string; // {userId}_{topicId}
  userId: string;
  topicId: string;
  mastery: number; // 0-1
  confidence: number; // 0-1
  status: TopicStatus;
  attemptCount: number;
  correctAttempts: number;
  misconceptions: string[];
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  evidenceIds: string[];
}

export interface Attempt {
  id: string;
  userId: string;
  questionId: string;
  topicId: string;
  submittedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTimeSeconds: number;
  confidenceBefore: ConfidenceLevel;
  confidenceAfter?: ConfidenceLevel;
  reasoning?: string;
  errorTags: string[];
  createdAt: Date;
}

export interface Flashcard {
  id: string;
  userId: string;
  topicId: string;
  front: string;
  back: string;
  interval: number; // days
  easeFactor: number;
  nextReviewAt: Date;
  lastReviewedAt: Date | null;
  consecutiveCorrect: number;
}

// ===== AI TYPES =====

export interface Question {
  id: string;
  topicId: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  difficulty: number; // 0-1
  hints?: string[];
  explanation?: string;
}

export interface DiagnosticResult {
  topicId: string;
  topicName: string;
  questionsAsked: number;
  correctAnswers: number;
  mastery: number;
  status: TopicStatus;
  misconceptions: string[];
}

export interface Recommendation {
  activityType: ActivityType;
  topicId: string;
  topicName: string;
  reason: string;
  priority: number; // 0-1
  evidence: string[];
}

export interface EvaluationResult {
  isCorrect: boolean;
  errorCategory?: string;
  feedback: string;
  misconceptionTags: string[];
  confidence: number;
  masteryDelta: number;
}

export interface ExplanationContent {
  explanation: string;
  example?: string;
  hints: string[];
  sourceReference?: string;
}

// ===== SESSION TYPES =====

export enum SessionPhase {
  FLASHCARD_RETRIEVAL = "flashcard_retrieval",
  EXPLANATION = "explanation",
  WORKED_EXAMPLE = "worked_example",
  PRACTICE = "practice",
  EXPLAIN_BACK = "explain_back",
  FEEDBACK = "feedback",
}

export interface SessionActivity {
  phase: SessionPhase;
  topicId: string;
  data: Record<string, unknown>;
  completedAt?: Date;
}

export interface ExamSettings {
  questionCount: 10 | 20 | 30;
  timeLimit: boolean;
  timeLimitMinutes?: number;
  focusOnWeak: boolean;
}

export interface ExamResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number; // seconds
  topicBreakdown: {
    topicId: string;
    topicName: string;
    correct: number;
    total: number;
  }[];
  recommendations: string[];
}

// ===== UI TYPES =====

export interface TopicNode extends Topic {
  mastery: number;
  status: TopicStatus;
  children: TopicNode[];
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date | null;
}

export interface MasteryTrend {
  date: string;
  mastery: number;
}

export interface FlashcardRating {
  quality: 0 | 1 | 2 | 3; // Again=0, Hard=1, Good=2, Easy=3
  label: "Again" | "Hard" | "Good" | "Easy";
  color: string;
  interval: string;
}

export interface OnboardingData {
  subject: string;
  examGoal: string;
  examDate: Date | null;
  studyTimePerDay: number;
  topicConfidence: Record<string, ConfidenceLevel>;
  difficultTopics: string[];
  syllabusFile?: File;
  manualTopics?: string[];
}
