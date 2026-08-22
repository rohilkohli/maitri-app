import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TopicStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMasteryColor(mastery: number): string {
  if (mastery >= 0.8) return "hsl(160, 84%, 39%)"; // green
  if (mastery >= 0.4) return "hsl(38, 92%, 50%)"; // amber
  return "hsl(0, 84%, 60%)"; // red
}

export function getMasteryGradient(mastery: number): string {
  const percentage = Math.round(mastery * 100);
  if (percentage >= 80) return "from-emerald-500 to-emerald-400";
  if (percentage >= 40) return "from-amber-500 to-amber-400";
  return "from-red-500 to-red-400";
}

export function getStatusFromMastery(mastery: number): TopicStatus {
  if (mastery >= 0.8) return TopicStatus.MASTERED;
  if (mastery >= 0.4) return TopicStatus.DEVELOPING;
  if (mastery > 0) return TopicStatus.WEAK;
  return TopicStatus.NOT_ASSESSED;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function calculateOverallMastery(
  masteries: number[]
): number {
  if (masteries.length === 0) return 0;
  return masteries.reduce((sum, m) => sum + m, 0) / masteries.length;
}

export function daysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / 86400000);
}
