"use client";

import React from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTopics } from "@/lib/hooks/use-topics";
import { useLearnerState } from "@/lib/hooks/use-learner-state";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Download,
  Flame,
  GraduationCap,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function ProgressPage() {
  const { user, profile } = useAuth();
  const { topics } = useTopics(user?.id);
  const { topicStates, stats } = useLearnerState(user?.id);

  // 1. Mastery by Topic Data for BarChart
  const masteryByTopicData = topics.map((t) => {
    const s = topicStates.find((st) => st.topicId === t.id);
    return {
      name: t.name.length > 18 ? `${t.name.slice(0, 16)}...` : t.name,
      fullName: t.name,
      mastery: Math.round((s?.mastery ?? 0.45) * 100),
    };
  });

  // 2. Study Time Trend Data (AreaChart)
  const studyTimeData = [
    { day: "Mon", minutes: 35 },
    { day: "Tue", minutes: 45 },
    { day: "Wed", minutes: 50 },
    { day: "Thu", minutes: 30 },
    { day: "Fri", minutes: 60 },
    { day: "Sat", minutes: 75 },
    { day: "Sun", minutes: 45 },
  ];

  // 3. Misconceptions Breakdown (PieChart)
  const misconceptionData = [
    { name: "Chain Rule Inversion", count: 4, color: "#EF4444" },
    { name: "Sign Errors in Limits", count: 3, color: "#F59E0B" },
    { name: "Integration Bound Shift", count: 2, color: "#3B82F6" },
    { name: "Product Rule Factor", count: 1, color: "#10B981" },
  ];

  // 4. Accuracy Over Time (LineChart)
  const accuracyData = [
    { session: "Sess 1", accuracy: 50 },
    { session: "Sess 2", accuracy: 65 },
    { session: "Sess 3", accuracy: 60 },
    { session: "Sess 4", accuracy: 78 },
    { session: "Sess 5", accuracy: 82 },
    { session: "Sess 6", accuracy: 88 },
  ];

  const handleDownloadReport = () => {
    const reportData = {
      user: {
        name: user?.displayName,
        email: user?.email,
        profile,
      },
      stats,
      topics: topics.map((t) => {
        const s = topicStates.find((st) => st.topicId === t.id);
        return {
          topicId: t.id,
          name: t.name,
          mastery: s?.mastery ?? 0,
          status: s?.status ?? "not_assessed",
          attempts: s?.attemptCount ?? 0,
          misconceptions: s?.misconceptions ?? [],
        };
      }),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maitri-learning-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="h-7 w-7 text-primary" />
            <span>Progress & Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Empirical learning trajectory, accuracy trends, and misconception diagnostics.
          </p>
        </div>

        <Button
          onClick={handleDownloadReport}
          variant="outline"
          className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 gap-2 font-semibold text-xs shadow-xs"
        >
          <Download className="h-4 w-4 text-primary" />
          <span>Download Learning Report</span>
        </Button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Mastery
          </span>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats.overallMasteryPercentage}%
          </div>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> +14% since diagnostic
          </span>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Study Time
          </span>
          <div className="text-3xl font-extrabold text-slate-900">5.7 hrs</div>
          <span className="text-xs text-slate-500 font-medium">This week</span>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Curriculum Velocity
          </span>
          <div className="text-3xl font-extrabold text-primary">1.8x</div>
          <span className="text-xs text-slate-500 font-medium">Above target pace</span>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Streak
          </span>
          <div className="text-3xl font-extrabold text-amber-500 flex items-center gap-1">
            <Flame className="h-7 w-7 fill-amber-500" />
            <span>3 days</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Keep the momentum</span>
        </div>
      </div>

      {/* 2x2 Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Mastery by Topic (BarChart) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Mastery by Curriculum Topic
            </h3>
            <span className="text-xs text-slate-400">Target: 80%+</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={masteryByTopicData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} width={100} />
                <Tooltip
                  formatter={(val) => [`${val}%`, "Mastery"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="mastery" fill="#1E3A8A" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily Study Time (AreaChart) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Daily Study Time (Minutes)
            </h3>
            <span className="text-xs text-slate-400">Goal: 45m/day</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  formatter={(val) => [`${val} mins`, "Study Time"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorStudy)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Accuracy Over Time (LineChart) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Accuracy Trajectory
            </h3>
            <span className="text-xs text-emerald-600 font-semibold">+38% improvement</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="session" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  formatter={(val) => [`${val}%`, "Session Accuracy"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ fill: "#10B981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Flagged Misconceptions (PieChart) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Misconception Distribution
            </h3>
            <span className="text-xs text-slate-400">Resolved via remediation</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={misconceptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {misconceptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val} flags`, "Occurrences"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-700">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
