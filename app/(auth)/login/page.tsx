"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInGoogle, signInWithCredentials, loading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    try {
      await signInWithCredentials(email, password);
      toast({
        title: "Welcome back!",
        description: "Logged in successfully.",
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      toast({
        title: "Authentication Failed",
        description: (err as Error)?.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    try {
      await signInGoogle();
      toast({
        title: "Signed in with Google",
        description: "Welcome to Maitri!",
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      toast({
        title: "Google Sign In Failed",
        description: (err as Error)?.message || "Could not sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-lg p-8 md:p-10 space-y-6 animate-in fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome back to Maitri
        </h1>
        <p className="text-sm text-slate-500">
          Sign in to resume your adaptive study roadmap
        </p>
      </div>

      {/* Google OAuth Button (Primary) */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={submitting || loading}
        className="w-full py-6 rounded-xl border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold flex items-center justify-center gap-3 text-sm shadow-xs"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </Button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">
          or email
        </span>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 py-5 rounded-xl border-slate-300 focus-visible:ring-primary text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
              Password
            </Label>
          </div>
          <div className="relative">
            <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 py-5 rounded-xl border-slate-300 focus-visible:ring-primary text-sm"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting || loading}
          className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-sm gap-2 mt-2"
        >
          <span>Sign In with Email</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {/* Switch to Signup */}
      <div className="text-center pt-2 text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Create free account
        </Link>
      </div>
    </div>
  );
}
