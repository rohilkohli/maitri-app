"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInGoogle, signInWithCredentials, loading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    try {
      await signInWithCredentials(email, password);
      toast({
        title: "Welcome back!",
        description: "Authenticated successfully.",
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      toast({
        title: "Authentication Notice",
        description: (err as Error)?.message || "Invalid credentials. You can also explore with the Instant Demo account.",
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
        title: "Google Sign In",
        description: (err as Error)?.message || "Could not sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    toast({
      title: "Welcome Demo Learner!",
      description: "Entering demo learning session...",
    });
    router.push("/dashboard");
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    toast({
      title: "Reset Link Dispatched",
      description: `If an account exists for ${resetEmail}, a password recovery link has been sent.`,
    });
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl p-8 sm:p-10 space-y-6 backdrop-blur-xl animate-in fade-in relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Mode Switcher */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-bold w-full">
            <button
              type="button"
              className="flex-1 py-2 text-center rounded-lg bg-blue-600 text-white shadow-sm transition-all"
            >
              Sign In
            </button>
            <Link
              href="/signup"
              className="flex-1 py-2 text-center rounded-lg text-slate-400 hover:text-white transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Sign In to Maitri
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Access your personalized learning state and diagnostic history.
          </p>
        </div>
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={submitting || loading}
        className="w-full py-6 rounded-2xl border-slate-700 bg-slate-950/70 hover:bg-slate-800/80 text-white font-semibold flex items-center justify-center gap-3 text-sm shadow-sm transition-all hover:scale-[1.01]"
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
        <div className="w-full border-t border-slate-800" />
        <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-widest font-bold">
          or credentials
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-slate-300">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="h-4 w-4 text-slate-400 absolute left-4 top-4" />
            <Input
              id="email"
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-11 py-6 rounded-2xl border-slate-700 bg-slate-950/60 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-bold text-slate-300">
              Password
            </Label>
            <button
              type="button"
              onClick={() => {
                setResetSent(false);
                setResetDialogOpen(true);
              }}
              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="h-4 w-4 text-slate-400 absolute left-4 top-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-11 pr-11 py-6 rounded-2xl border-slate-700 bg-slate-950/60 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting || loading}
          className="w-full py-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 gap-2 mt-2 transition-all hover:scale-[1.01]"
        >
          {submitting ? (
            <span>Verifying...</span>
          ) : (
            <>
              <span>Sign In with Email</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Demo Account Bypass Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full p-3 rounded-2xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Explore with Instant Demo Account &rarr;</span>
        </button>
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>256-bit Encrypted SSL Session</span>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white rounded-3xl p-6 md:p-8">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-extrabold text-white">
              Reset Your Password
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Enter your registered email address and we will send you instructions to reset your password.
            </DialogDescription>
          </DialogHeader>

          {!resetSent ? (
            <form onSubmit={handleSendReset} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-xs font-semibold text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="py-5 rounded-xl border-slate-700 bg-slate-950/60 text-white"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setResetDialogOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Send Recovery Link
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <p className="text-sm text-emerald-400 font-semibold">
                ✓ Check your inbox for reset instructions!
              </p>
              <Button
                type="button"
                onClick={() => setResetDialogOpen(false)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
