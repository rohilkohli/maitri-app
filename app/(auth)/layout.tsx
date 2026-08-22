import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-sm shadow-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
              Maitri
            </span>
          </div>
        </Link>
      </div>

      {/* Center Auth Card */}
      <div className="w-full flex items-center justify-center my-8">
        {children}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Maitri. Every answer changes the path.
      </div>
    </div>
  );
}
