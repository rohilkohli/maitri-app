import React from "react";

interface MasteryBarProps {
  value: number; // 0 to 1 or 0 to 100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  animate?: boolean;
}

export function MasteryBar({
  value,
  size = "md",
  showLabel = false,
  className = "",
  animate = true,
}: MasteryBarProps) {
  // Normalize to 0-100
  const percentage = Math.min(100, Math.max(0, Math.round(value <= 1 ? value * 100 : value)));

  let heightClass = "h-2";
  if (size === "sm") heightClass = "h-1.5";
  if (size === "lg") heightClass = "h-3.5";

  let gradient = "from-red-500 to-rose-400";
  let textColor = "text-red-600";

  if (percentage >= 80) {
    gradient = "from-emerald-500 to-teal-400";
    textColor = "text-emerald-600";
  } else if (percentage >= 40) {
    gradient = "from-amber-500 to-yellow-400";
    textColor = "text-amber-600";
  }

  return (
    <div className={`w-full flex items-center gap-2.5 ${className}`}>
      <div className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 ease-out ${
            animate ? "animate-in fade-in" : ""
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-semibold shrink-0 min-w-[2.5rem] text-right ${textColor}`}>
          {percentage}%
        </span>
      )}
    </div>
  );
}
