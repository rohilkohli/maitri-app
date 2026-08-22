"use client";

import React, { useState } from "react";
import { KaTeXMath } from "@/components/katex-math";
import { Button } from "@/components/ui/button";
import { RotateCw, Sparkles } from "lucide-react";

interface FlipCardProps {
  front: string;
  back: string;
  onRate?: (quality: 0 | 1 | 2 | 3) => void;
  className?: string;
  isFlippedControlled?: boolean;
  onFlipChange?: (flipped: boolean) => void;
}

export function FlipCard({
  front,
  back,
  onRate,
  className = "",
  isFlippedControlled,
  onFlipChange,
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);

  const isFlipped = isFlippedControlled !== undefined ? isFlippedControlled : internalFlipped;

  const handleFlip = () => {
    const next = !isFlipped;
    if (isFlippedControlled === undefined) {
      setInternalFlipped(next);
    }
    onFlipChange?.(next);
  };

  const handleRate = (quality: 0 | 1 | 2 | 3, e: React.MouseEvent) => {
    e.stopPropagation();
    onRate?.(quality);
    if (isFlippedControlled === undefined) {
      setInternalFlipped(false);
    }
    onFlipChange?.(false);
  };

  return (
    <div className={`flex flex-col items-center gap-6 w-full max-w-2xl mx-auto ${className}`}>
      {/* 3D Flip Container */}
      <div
        onClick={handleFlip}
        className="w-full h-80 md:h-96 perspective-1000 cursor-pointer group select-none"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front Face */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-white border border-slate-200/90 shadow-md p-8 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Prompt / Question
              </span>
              <span>Click card to reveal answer</span>
            </div>

            <div className="flex-1 flex items-center justify-center text-center my-4">
              <div className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed max-w-lg">
                <KaTeXMath text={front} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 group-hover:text-primary transition-colors">
              <RotateCw className="h-3.5 w-3.5" />
              <span>Tap to flip</span>
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl p-8 flex flex-col justify-between border border-slate-700">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="text-emerald-400">Answer & Explanation</span>
              <span className="text-slate-400">SM-2 Spaced Recall</span>
            </div>

            <div className="flex-1 flex items-center justify-center text-center my-4 overflow-y-auto">
              <div className="text-lg md:text-xl font-normal text-slate-100 leading-relaxed max-w-lg">
                <KaTeXMath text={back} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <span>Rate your recall below to schedule next review</span>
            </div>
          </div>
        </div>
      </div>

      {/* SM-2 Recall Rating Buttons */}
      {isFlipped && onRate && (
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in-up">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleRate(0, e)}
            className="flex flex-col py-6 rounded-xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300"
          >
            <span className="text-sm font-bold">Again</span>
            <span className="text-[10px] text-red-500 font-normal">&lt; 15 min</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleRate(1, e)}
            className="flex flex-col py-6 rounded-xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
          >
            <span className="text-sm font-bold">Hard</span>
            <span className="text-[10px] text-amber-500 font-normal">1 day</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleRate(2, e)}
            className="flex flex-col py-6 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
          >
            <span className="text-sm font-bold">Good</span>
            <span className="text-[10px] text-emerald-600 font-normal">3 days</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleRate(3, e)}
            className="flex flex-col py-6 rounded-xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
          >
            <span className="text-sm font-bold">Easy</span>
            <span className="text-[10px] text-blue-600 font-normal">6 days</span>
          </Button>
        </div>
      )}
    </div>
  );
}
