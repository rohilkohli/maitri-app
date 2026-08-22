"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTopics } from "@/lib/hooks/use-topics";
import { useLearnerState } from "@/lib/hooks/use-learner-state";
import { Topic, TopicStatus } from "@/types";
import { TopicStatusBadge } from "@/components/topic-status-badge";
import { MasteryBar } from "@/components/mastery-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GitPullRequest,
  Layers,
  Network,
  Sparkles,
} from "lucide-react";

export default function KnowledgeMapPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { topics, loading: topicsLoading } = useTopics(user?.id);
  const { topicStates, loading: statesLoading } = useLearnerState(user?.id);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const stateMap = new Map<string, (typeof topicStates)[0]>();
  topicStates.forEach((s) => stateMap.set(s.topicId, s));

  const selectedState = selectedTopic ? stateMap.get(selectedTopic.id) : null;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Network className="h-7 w-7 text-primary" />
            <span>Interactive Knowledge Map</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visual prerequisite graph connecting curriculum topics and your real-time mastery state.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 shadow-xs">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
            <span>Mastered (&gt;80%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500 shadow-sm" />
            <span>Developing (40-80%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500 shadow-sm" />
            <span>Needs Focus (&lt;40%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-300" />
            <span>Unassessed</span>
          </span>
        </div>
      </div>

      {/* Visual Prerequisite Graph */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-8 relative overflow-hidden">
        <div className="space-y-12">
          {topics.map((topic, index) => {
            const state = stateMap.get(topic.id);
            const mastery = state?.mastery ?? 0;
            const status = state?.status ?? TopicStatus.NOT_ASSESSED;
            const percentage = Math.round(mastery * 100);

            // Determine border and fill styles based on status
            let nodeBorder = "border-slate-200 hover:border-slate-300";
            let nodeBg = "bg-slate-50/70";
            let glow = "";

            if (status === TopicStatus.MASTERED) {
              nodeBorder = "border-emerald-300 hover:border-emerald-400";
              nodeBg = "bg-gradient-to-br from-emerald-50/80 to-teal-50/30";
              glow = "shadow-emerald-500/10";
            } else if (status === TopicStatus.DEVELOPING) {
              nodeBorder = "border-amber-300 hover:border-amber-400";
              nodeBg = "bg-gradient-to-br from-amber-50/80 to-yellow-50/30";
              glow = "shadow-amber-500/10";
            } else if (status === TopicStatus.WEAK) {
              nodeBorder = "border-red-300 hover:border-red-400";
              nodeBg = "bg-gradient-to-br from-red-50/80 to-rose-50/30";
              glow = "shadow-red-500/10";
            }

            const prereqNames = topic.prerequisites
              .map((pId) => topics.find((t) => t.id === pId)?.name)
              .filter(Boolean);

            return (
              <div key={topic.id} className="relative">
                {/* Node Card */}
                <div
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-6 rounded-2xl border ${nodeBorder} ${nodeBg} shadow-sm hover:shadow-md ${glow} transition-all cursor-pointer space-y-4`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center font-bold text-sm text-slate-700">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {topic.name}
                        </h3>
                        {topic.description && (
                          <p className="text-xs text-slate-500">{topic.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-800">
                        {percentage}%
                      </span>
                      <TopicStatusBadge status={status} />
                    </div>
                  </div>

                  <MasteryBar value={mastery} size="sm" animate={false} />

                  {/* Subtopics and Prerequisites info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5 text-xs text-slate-500">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-600 flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        Subtopics:
                      </span>
                      {topic.subtopics.slice(0, 3).map((sub, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 bg-white rounded-md border border-slate-200 text-slate-600">
                          {sub}
                        </span>
                      ))}
                    </div>

                    {prereqNames.length > 0 && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <GitPullRequest className="h-3.5 w-3.5 text-primary" />
                        <span>Prereqs: {prereqNames.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connecting Edge Indicator if next topic exists */}
                {index < topics.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-slate-300 to-slate-200" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
          <DialogContent className="sm:max-w-xl rounded-2xl p-6 md:p-8 space-y-6">
            <DialogHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <TopicStatusBadge status={selectedState?.status ?? TopicStatus.NOT_ASSESSED} />
                <span className="text-xs font-semibold text-slate-400">
                  Importance: {Math.round((selectedTopic.importance ?? 0.8) * 100)}%
                </span>
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {selectedTopic.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                {selectedTopic.description || "Core curricular topic in your study journey."}
              </DialogDescription>
            </DialogHeader>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Mastery</span>
                <span className="text-lg font-black text-slate-900">
                  {Math.round((selectedState?.mastery ?? 0) * 100)}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Attempts</span>
                <span className="text-lg font-black text-slate-900">
                  {selectedState?.attemptCount ?? 0}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Accuracy</span>
                <span className="text-lg font-black text-slate-900">
                  {selectedState?.attemptCount
                    ? `${Math.round(((selectedState.correctAttempts || 0) / selectedState.attemptCount) * 100)}%`
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Subtopics Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Subtopic Competencies:
              </span>
              <div className="space-y-1.5">
                {selectedTopic.subtopics.map((sub, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700 p-2 bg-slate-50/80 rounded-lg border border-slate-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Misconceptions detected */}
            {selectedState?.misconceptions && selectedState.misconceptions.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  Flagged Gaps & Misconceptions:
                </span>
                <ul className="list-disc list-inside text-xs text-amber-950 space-y-1">
                  {selectedState.misconceptions.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Start Practice CTA */}
            <div className="pt-2">
              <Button
                onClick={() => router.push(`/learn/${selectedTopic.id}`)}
                className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-sm gap-2"
              >
                <span>Start Adaptive Session for {selectedTopic.name}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
