import React from "react";
import { TopicStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

interface TopicStatusBadgeProps {
  status: TopicStatus | string;
  className?: string;
  showIcon?: boolean;
}

export function TopicStatusBadge({
  status,
  className = "",
  showIcon = true,
}: TopicStatusBadgeProps) {
  let label = "Not Assessed";
  let dotColor = "bg-slate-400";
  let badgeVariant = "outline" as const;
  let bgClass = "bg-slate-50 text-slate-700 border-slate-200";

  switch (status) {
    case TopicStatus.MASTERED:
    case "mastered":
      label = "Mastered";
      dotColor = "bg-emerald-500 shadow-emerald-500/50 shadow-sm";
      bgClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case TopicStatus.DEVELOPING:
    case "developing":
      label = "Developing";
      dotColor = "bg-amber-500 shadow-amber-500/50 shadow-sm";
      bgClass = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case TopicStatus.WEAK:
    case "weak":
      label = "Needs Focus";
      dotColor = "bg-red-500 shadow-red-500/50 shadow-sm";
      bgClass = "bg-red-50 text-red-700 border-red-200";
      break;
    case TopicStatus.AT_RISK:
    case "at_risk":
      label = "At Risk";
      dotColor = "bg-purple-500 shadow-purple-500/50 shadow-sm";
      bgClass = "bg-purple-50 text-purple-700 border-purple-200";
      break;
    default:
      label = "Not Assessed";
      dotColor = "bg-slate-400";
      bgClass = "bg-slate-100 text-slate-600 border-slate-200";
  }

  return (
    <Badge
      variant={badgeVariant}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${bgClass} ${className}`}
    >
      {showIcon && <span className={`h-2 w-2 rounded-full ${dotColor}`} />}
      <span>{label}</span>
    </Badge>
  );
}
