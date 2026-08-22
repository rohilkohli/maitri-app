"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTopics } from "@/lib/hooks/use-topics";
import { useLearnerState } from "@/lib/hooks/use-learner-state";
import { TopicTree } from "@/components/topic-tree";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Map,
  Settings,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { topics } = useTopics(user?.id);
  const { topicStates } = useLearnerState(user?.id);
  const [collapsed, setCollapsed] = useState(false);
  const [showTopicTree, setShowTopicTree] = useState(true);

  const mainNavLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
    { href: "/knowledge-map", label: "Knowledge Map", icon: Map, color: "text-purple-500" },
    { href: "/flashcards", label: "Flashcards", icon: CreditCard, color: "text-amber-500" },
    { href: "/exam", label: "Practice Test", icon: Target, color: "text-emerald-500" },
  ];

  const secondaryNavLinks = [
    { href: "/progress", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 h-screen sticky top-0 transition-all duration-300 z-30 ${
        collapsed ? "w-[72px]" : "w-72"
      }`}
    >
      {/* Brand Header */}
      <div className={`p-4 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block leading-tight">
                Maitri
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 block leading-none tracking-wide">
                ADAPTIVE AI LEARNING
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <Sparkles className="h-5 w-5" />
            </div>
          </Link>
        )}

        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mx-auto mb-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Main Navigation */}
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        {/* Primary Nav */}
        <div className="space-y-1">
          {!collapsed && (
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Learn
            </span>
          )}
          {mainNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                } ${collapsed ? "justify-center px-2" : ""}`}
                title={collapsed ? link.label : undefined}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? "bg-white/10" : "bg-transparent"
                }`}>
                  <Icon className={`h-[18px] w-[18px] ${isActive ? link.color : ""}`} />
                </div>
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Secondary Nav */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-1">
          {!collapsed && (
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              More
            </span>
          )}
          {secondaryNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                } ${collapsed ? "justify-center px-2" : ""}`}
                title={collapsed ? link.label : undefined}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-white" : ""}`} />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Course Topics Tree (collapsible) */}
        {!collapsed && topics.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowTopicTree(!showTopicTree)}
              className="w-full px-3 flex items-center justify-between text-slate-400 hover:text-white transition-colors"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Course Topics
              </span>
              {showTopicTree ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showTopicTree && (
              <div className="mt-2 max-h-56 overflow-y-auto pr-1">
                <div className="bg-white/5 rounded-xl p-2">
                  <TopicTree
                    topics={topics}
                    topicStates={topicStates}
                    onSelectTopic={(topicId) => {
                      window.location.href = `/learn/${topicId}`;
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Streak / Achievement Card (Only when expanded) */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-3 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Keep your streak!</p>
                <p className="text-[10px] text-amber-200/80">Study today to maintain progress</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Footer */}
      <div className={`p-3 border-t border-white/10 ${collapsed ? "" : "bg-white/5"}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white/20">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-500 text-white font-bold text-xs">
                {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : "ME"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user?.displayName || "Learner"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || "learner@maitri.ai"}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-9 w-9 border-2 border-white/20">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-500 text-white font-bold text-xs">
                {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : "ME"}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
