"use client";

import { useEffect, useState, useMemo } from "react";
import { Course, Topic, TopicNode, TopicStatus } from "@/types";
import { getUserCourses } from "@/lib/firebase";

// Default comprehensive sample topics (AP Calculus / STEM baseline)
export const DEFAULT_SAMPLE_TOPICS: Topic[] = [
  {
    id: "topic-limits",
    name: "Limits and Continuity",
    prerequisites: [],
    subtopics: ["One-Sided Limits", "Continuity at a Point", "Intermediate Value Theorem"],
    importance: 0.85,
    description: "Foundational understanding of function behavior approaching points and infinity.",
  },
  {
    id: "topic-derivatives-intro",
    name: "Definition of Derivative",
    prerequisites: ["topic-limits"],
    subtopics: ["Difference Quotient", "Differentiability vs Continuity", "Tangent Lines"],
    importance: 0.9,
    description: "Rate of change, slopes of curves, and rigorous limit definitions.",
  },
  {
    id: "topic-diff-rules",
    name: "Differentiation Rules",
    prerequisites: ["topic-derivatives-intro"],
    subtopics: ["Power Rule", "Product Rule", "Quotient Rule", "Chain Rule"],
    importance: 0.95,
    description: "Computational tools for finding derivatives of algebraic and composite functions.",
  },
  {
    id: "topic-implicit-diff",
    name: "Implicit Differentiation",
    prerequisites: ["topic-diff-rules"],
    subtopics: ["Inverse Trig Derivatives", "Logarithmic Differentiation"],
    importance: 0.75,
    description: "Differentiating equations where dependent variables cannot be isolated directly.",
  },
  {
    id: "topic-related-rates",
    name: "Related Rates & Applications",
    prerequisites: ["topic-implicit-diff"],
    subtopics: ["Geometric Rates", "Distance & Velocity Rates", "Shadow Problems"],
    importance: 0.88,
    description: "Real-world modeling of interconnected changing quantities over time.",
  },
  {
    id: "topic-curve-sketching",
    name: "Curve Sketching & Extrema",
    prerequisites: ["topic-diff-rules"],
    subtopics: ["Mean Value Theorem", "First Derivative Test", "Concavity & Inflection Points", "Optimization"],
    importance: 0.92,
    description: "Analyzing function extrema, concavity, and global behavior using derivatives.",
  },
  {
    id: "topic-riemann-sums",
    name: "Riemann Sums & Definite Integrals",
    prerequisites: ["topic-limits"],
    subtopics: ["Left/Right/Midpoint Sums", "Trapezoidal Rule", "Area under Curve"],
    importance: 0.85,
    description: "Approximating and formalizing accumulated area under curves.",
  },
  {
    id: "topic-ftc",
    name: "Fundamental Theorem of Calculus",
    prerequisites: ["topic-diff-rules", "topic-riemann-sums"],
    subtopics: ["FTC Part 1 (Derivative of Integral)", "FTC Part 2 (Evaluation)", "Accumulation Functions"],
    importance: 1.0,
    description: "The bridge connecting differentiation and integration.",
  },
  {
    id: "topic-u-sub",
    name: "Integration by Substitution",
    prerequisites: ["topic-ftc"],
    subtopics: ["Indefinite U-Sub", "Definite U-Sub with Bounds Change", "Symmetric Integrals"],
    importance: 0.92,
    description: "Reversing the Chain Rule to solve complex integrals.",
  },
  {
    id: "topic-integral-apps",
    name: "Applications of Integration",
    prerequisites: ["topic-u-sub"],
    subtopics: ["Area Between Curves", "Volumes of Solids of Revolution", "Average Value of a Function"],
    importance: 0.88,
    description: "Computing physical and geometric properties using integral calculus.",
  },
];

export function useTopics(userId: string | null | undefined) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>(DEFAULT_SAMPLE_TOPICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserCourses() {
      const effectiveUserId = userId || "demo-user";

      setLoading(true);
      try {
        // Load courses from Firebase
        const rawCourses = await getUserCourses(effectiveUserId);

        if (rawCourses && rawCourses.length > 0) {
          const parsedCourses: Course[] = rawCourses.map((c: any) => ({
            id: c.id,
            userId: c.userId as string,
            title: c.title as string,
            syllabusUrl: c.syllabusUrl as string | undefined,
            topics: (c.topics as Topic[]) || [],
            createdAt: c.createdAt ? new Date(c.createdAt.toDate?.() || c.createdAt) : new Date(),
          }));

          setCourses(parsedCourses);
          setActiveCourse(parsedCourses[0]);

          // Use topics from the most recent course
          if (parsedCourses[0]?.topics?.length > 0) {
            setTopics(parsedCourses[0].topics);
          } else {
            setTopics(DEFAULT_SAMPLE_TOPICS);
          }
        } else {
          // No courses found - use defaults
          setTopics(DEFAULT_SAMPLE_TOPICS);
        }
      } catch (err) {
        console.error("Error loading courses from Firebase:", err);
        setTopics(DEFAULT_SAMPLE_TOPICS);
      } finally {
        setLoading(false);
      }
    }

    loadUserCourses();
  }, [userId]);

  // Build tree from flat topics based on prerequisites
  const topicTree = useMemo(() => {
    const map = new Map<string, TopicNode>();

    topics.forEach((t) => {
      map.set(t.id, {
        ...t,
        mastery: 0,
        status: TopicStatus.NOT_ASSESSED,
        children: [],
      });
    });

    const roots: TopicNode[] = [];

    topics.forEach((t) => {
      const node = map.get(t.id)!;
      if (!t.prerequisites || t.prerequisites.length === 0) {
        roots.push(node);
      } else {
        // Attach as child of first prerequisite if exists in map
        const parentId = t.prerequisites[0];
        const parent = map.get(parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    return roots;
  }, [topics]);

  return {
    topics,
    courses,
    activeCourse,
    topicTree,
    loading,
    setTopics,
  };
}
