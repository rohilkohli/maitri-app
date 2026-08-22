import React from "react";
import Link from "next/link";
import {
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  Network,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-primary/20 selection:text-white">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white leading-none">
              Maitri
            </span>
            <span className="text-[10px] font-bold text-blue-400 tracking-wider leading-tight">
              ADAPTIVE LEARNING
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Split Grid */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        {/* Left Side: Brand Showcase & Interactive Preview (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 fill-blue-400" />
              <span>Next-Gen Bayesian Knowledge Engine</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Every answer <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
                changes your path.
              </span>
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-lg">
              Experience the power of real-time diagnostic calibration, prerequisite graphing, and SM-2 spaced repetition personalized to your exact learning velocity.
            </p>
          </div>

          {/* Floating Glassmorphic Knowledge Preview Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-4 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-blue-400">
                <BrainCircuit className="h-4 w-4" />
                <span>Real-Time Knowledge State</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                Calibrated Live
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-200">Differentiation Rules</span>
                <span className="font-bold text-emerald-400">88% Mastered</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full w-[88%]" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80 text-center">
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Recall Streak</span>
                <span className="text-base font-extrabold text-amber-400">6 Days</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Retention</span>
                <span className="text-base font-extrabold text-blue-400">94.2%</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Curriculum Pace</span>
                <span className="text-base font-extrabold text-emerald-400">1.8x</span>
              </div>
            </div>
          </div>

          {/* Social Proof & Metrics */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Zero Static Curricula</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Cognitive Error Diagnosis</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Adaptive Question Engine</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="lg:col-span-6 flex items-center justify-center w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-500 z-10 border-t border-slate-900">
        &copy; {new Date().getFullYear()} Maitri Inc. &bull; Every answer changes the path.
      </footer>
    </div>
  );
}
