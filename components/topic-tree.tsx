"use client";

import React, { useState } from "react";
import { LearnerTopicState, Topic, TopicStatus } from "@/types";
import { TopicStatusBadge } from "@/components/topic-status-badge";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Layers } from "lucide-react";

interface TopicTreeProps {
  topics: Topic[];
  topicStates?: LearnerTopicState[];
  selectedTopicId?: string;
  onSelectTopic: (topicId: string) => void;
  className?: string;
}

export function TopicTree({
  topics,
  topicStates = [],
  selectedTopicId,
  onSelectTopic,
  className = "",
}: TopicTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    topics.forEach((t) => {
      init[t.id] = true;
    });
    return init;
  });

  const stateMap = new Map<string, LearnerTopicState>();
  topicStates.forEach((s) => stateMap.set(s.topicId, s));

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {topics.map((topic) => {
        const state = stateMap.get(topic.id);
        const mastery = state?.mastery ?? 0;
        const status = state?.status ?? TopicStatus.NOT_ASSESSED;
        const isSelected = selectedTopicId === topic.id;
        const isExpanded = !!expandedNodes[topic.id];
        const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;

        return (
          <div key={topic.id} className="space-y-1">
            <div
              onClick={() => onSelectTopic(topic.id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl text-sm transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "hover:bg-slate-100/80 text-slate-700 font-medium"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                {hasSubtopics ? (
                  <button
                    type="button"
                    onClick={(e) => toggleExpand(topic.id, e)}
                    className={`p-0.5 rounded hover:bg-black/10 transition-colors ${
                      isSelected ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <span className="w-5" />
                )}

                {isExpanded ? (
                  <FolderOpen
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? "text-white/90" : "text-primary/70"
                    }`}
                  />
                ) : (
                  <Folder
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? "text-white/90" : "text-slate-400"
                    }`}
                  />
                )}

                <span className="truncate">{topic.name}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {state && state.attemptCount > 0 ? (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : mastery >= 0.8
                        ? "bg-emerald-100 text-emerald-800"
                        : mastery >= 0.4
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {Math.round(mastery * 100)}%
                  </span>
                ) : (
                  <TopicStatusBadge
                    status={status}
                    className={isSelected ? "bg-white/20 text-white border-transparent" : ""}
                  />
                )}
              </div>
            </div>

            {/* Subtopics branch */}
            {hasSubtopics && isExpanded && (
              <div className="ml-7 pl-3 border-l-2 border-slate-200 space-y-1 py-0.5 animate-in fade-in">
                {topic.subtopics.map((sub, sIdx) => (
                  <div
                    key={sIdx}
                    onClick={() => onSelectTopic(topic.id)}
                    className="flex items-center gap-2 py-1 px-2 text-xs text-slate-500 hover:text-primary hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Layers className="h-3 w-3 text-slate-400" />
                    <span className="truncate">{sub}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
