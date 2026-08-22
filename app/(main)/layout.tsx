"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Chatbot } from "@/components/chatbot";
import { useAuth } from "@/lib/hooks/use-auth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row text-slate-900 selection:bg-primary/10 selection:text-primary">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header & Bottom Nav */}
        <MobileNav />

        {/* Main Workspace Area */}
        <main className="flex-1 flex flex-col pb-20 lg:pb-8">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 flex-1 animate-in fade-in duration-300">
            {children}
          </div>
        </main>

        {/* AI Chatbot for logged-in users */}
        <Chatbot />
      </div>
    </div>
  );
}
