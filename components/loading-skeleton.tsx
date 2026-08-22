import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-3 w-32 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function RecommendationCardSkeleton() {
  return (
    <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-4 w-28 rounded-md" />
      </div>
      <Skeleton className="h-8 w-64 rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <div className="pt-4 flex gap-4">
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <Skeleton className="h-6 w-48 rounded-md" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export function TopicListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-md" />
            <Skeleton className="h-4 w-36 rounded-md" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SessionSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="p-8 bg-white rounded-2xl border border-slate-200 space-y-6">
        <Skeleton className="h-6 w-32 rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
