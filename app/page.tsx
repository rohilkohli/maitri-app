"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Layers,
  Network,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { Chatbot } from "@/components/chatbot";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-primary/10 selection:text-primary">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-sm shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                Maitri
              </span>
              <span className="text-[10px] font-semibold text-primary tracking-wide leading-tight">
                ADAPTIVE LEARNING
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              Decision Engine
            </a>
            <a href="#testimonials" className="hover:text-primary transition-colors">
              Impact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-semibold text-slate-700 hover:text-primary">
                Sign In
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-4 shadow-sm shadow-primary/20 gap-2">
                <span>Start Learning Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-primary text-xs font-semibold shadow-xs">
              <Zap className="h-3.5 w-3.5 fill-primary" />
              <span>The Next-Generation Adaptive Learning Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.15]">
              Every answer <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-secondary">changes the path.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Maitri turns any syllabus into a living, personalized learning journey. Our AI Decision Engine diagnoses your exact knowledge gaps and adapts after every single question.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-8 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-bold shadow-md shadow-primary/25 gap-2.5">
                  <span>Start Your Diagnostic Baseline</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto px-6 py-6 rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-base font-semibold">
                  Explore Demo Dashboard
                </Button>
              </Link>
            </div>

            {/* Quick social proof */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No Mock Data — Real Bayesian Tracing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                SM-2 Spaced Retrieval Scheduling
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Explain-Back Active Recall
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Value Props */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Intelligent Adaptation
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Why static courses fail where Maitri excels
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value Prop 1 */}
            <div className="p-8 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:shadow-md transition-all space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-primary flex items-center justify-center">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Diagnose your knowledge gaps
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pinpoint root-cause misconceptions instead of just scoring raw tests. If you struggle with Chain Rule, we trace it back to basic function composition.
              </p>
            </div>

            {/* Value Prop 2 */}
            <div className="p-8 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:shadow-md transition-all space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Network className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Get a personalized roadmap
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No two learners follow the same trajectory. Your prerequisite graph dynamically re-routes based on confidence calibration and response latency.
              </p>
            </div>

            {/* Value Prop 3 */}
            <div className="p-8 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:shadow-md transition-all space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Track your evolving mastery
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Watch topics progress from Weak (Red) to Developing (Amber) to Mastered (Green) with Ebbinghaus memory decay protection built right in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: 4-step visual flow */}
      <section id="how-it-works" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              The Learning Loop
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              4 Steps to True Curriculum Mastery
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              {
                step: "01",
                title: "Upload & Ingest",
                desc: "Drop your syllabus PDF or pick a standard course. Gemini parses the full prerequisite ontology.",
                icon: Layers,
              },
              {
                step: "02",
                title: "Diagnose Gaps",
                desc: "Take an adaptive diagnostic test calibrated with certainty ratings to benchmark your starting baseline.",
                icon: Cpu,
              },
              {
                step: "03",
                title: "Adaptive Practice",
                desc: "Engage in targeted sessions with tiered explanations, worked examples, and explain-back prompts.",
                icon: GraduationCap,
              },
              {
                step: "04",
                title: "Master & Retain",
                desc: "SM-2 spaced flashcards and continuous exam simulations ensure knowledge locks into long-term memory.",
                icon: RotateCcw,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative space-y-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-slate-200">{item.step}</span>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-gradient-to-r from-primary via-blue-900 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to experience learning that adapts to you?
          </h2>
          <p className="text-base md:text-lg text-blue-100 max-w-xl mx-auto">
            Take a 5-minute diagnostic assessment and see your personalized knowledge map right now.
          </p>
          <Link href="/onboarding">
            <Button className="px-8 py-6 rounded-xl bg-white text-primary hover:bg-slate-100 text-base font-bold shadow-lg gap-2">
              <span>Start Learning Free</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold">
              M
            </div>
            <span className="font-bold text-slate-900">Maitri</span>
            <span>— Every answer changes the path.</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/knowledge-map" className="hover:text-primary transition-colors">
              Knowledge Map
            </Link>
            <Link href="/flashcards" className="hover:text-primary transition-colors">
              Flashcards
            </Link>
            <Link href="/exam" className="hover:text-primary transition-colors">
              Simulator
            </Link>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
}
