"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Settings,
  Sparkles,
  Target,
  X,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
    { href: "/knowledge-map", label: "Knowledge Map", icon: Map, color: "text-purple-500" },
    { href: "/flashcards", label: "Flashcards", icon: CreditCard, color: "text-amber-500" },
    { href: "/exam", label: "Practice Test", icon: Target, color: "text-emerald-500" },
    { href: "/progress", label: "Analytics", icon: BarChart3, color: "text-cyan-500" },
    { href: "/settings", label: "Settings", icon: Settings, color: "text-slate-400" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg block leading-tight">Maitri</span>
              <span className="text-[9px] font-semibold text-emerald-400 block leading-none">ADAPTIVE AI</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="p-2.5 rounded-xl text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-bold text-white">Menu</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : "ME"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.displayName || "Learner"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user.email || "learner@maitri.ai"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isActive ? "bg-white/10" : ""}`}>
                      <Icon className={`h-[18px] w-[18px] ${isActive ? link.color : ""}`} />
                    </div>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 bg-slate-900/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl py-3"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around px-1 py-1.5">
          {navLinks.slice(0, 5).map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive ? "text-white bg-white/10" : "text-slate-500"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? link.color : ""}`} />
                <span className={`text-[10px] font-medium ${isActive ? "text-white" : ""}`}>
                  {link.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
