"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signInGoogle, signUpWithCredentials, loading } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Compute password strength metrics
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "Empty", color: "bg-slate-700" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score <= 4) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  }, [password]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (!agreeTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "Please accept the terms of service to create your account.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Your passwords do not match. Please verify and try again.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password should be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await signUpWithCredentials(email, password, name);
      toast({
        title: "Account Created!",
        description: "Welcome to Maitri! Let's set up your personalized roadmap.",
      });
      router.push("/onboarding");
    } catch (err: unknown) {
      toast({
        title: "Signup Notice",
        description: (err as Error)?.message || "Could not complete signup. You can also explore via the Instant Demo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSubmitting(true);
    try {
      await signInGoogle();
      toast({
        title: "Signed Up with Google",
        description: "Welcome to Maitri!",
      });
      router.push("/onboarding");
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

  const handleDemoBypass = () => {
    toast({
      title: "Welcome Demo Learner!",
      description: "Entering onboarding wizard...",
    });
    router.push("/onboarding");
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl p-8 sm:p-10 space-y-6 backdrop-blur-xl animate-in fade-in relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Mode Switcher */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-bold w-full">
            <Link
              href="/login"
              className="flex-1 py-2 text-center rounded-lg text-slate-400 hover:text-white transition-all"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="flex-1 py-2 text-center rounded-lg bg-blue-600 text-white shadow-sm transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Join Maitri and unlock your personalized, adaptive study roadmap.
          </p>
        </div>
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignup}
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
        <span>Sign up with Google</span>
      </Button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-800" />
        <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-widest font-bold">
          or with email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleEmailSignup} className="space-y-3.5">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs font-bold text-slate-300">
            Full Name
          </Label>
          <div className="relative">
            <User className="h-4 w-4 text-slate-400 absolute left-4 top-4" />
            <Input
              id="name"
              type="text"
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="pl-11 py-5 rounded-2xl border-slate-700 bg-slate-950/60 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs font-bold text-slate-300">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="h-4 w-4 text-slate-400 absolute left-4 top-4" />
            <Input
              id="email"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-11 py-5 rounded-2xl border-slate-700 bg-slate-950/60 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" className="text-xs font-bold text-slate-300">
            Password
          </Label>
          <div className="relative">
            <Lock className="h-4 w-4 text-slate-400 absolute left-4 top-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-11 pr-11 py-5 rounded-2xl border-slate-700 bg-slate-950/60 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          <div className="pt-1.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Security Strength:</span>
              <span className={`font-bold ${password ? "text-slate-200" : "text-slate-500"}`}>
                {password ? passwordStrength.label : "Enter password"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-full rounded-full transition-all duration-300 ${
                    password && level <= passwordStrength.score ? passwordStrength.color : "bg-slate-800"
                  }`}
                />
              ))}
            </div>
            {password.length > 0 && password.length < 6 && (
              <p className="text-[10px] text-amber-400 font-medium">
                Tip: Minimum 6 characters required (8+ recommended with numbers)
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-300">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="h-4 w-4 text-slate-400 absolute left-4 top-4" />
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-11 py-5 rounded-2xl border-slate-700 bg-slate-950/60 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 text-sm font-mono"
            />
          </div>
        </div>

        {/* Terms Agreement Checkbox */}
        <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none text-xs text-slate-400">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
          />
          <span>
            I agree to the{" "}
            <span className="text-blue-400 hover:underline">Terms of Service</span> and{" "}
            <span className="text-blue-400 hover:underline">Privacy Policy</span>.
          </span>
        </label>

        <Button
          type="submit"
          disabled={submitting || loading}
          className="w-full py-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 gap-2 mt-2 transition-all hover:scale-[1.01]"
        >
          {submitting ? (
            <span>Creating Roadmap...</span>
          ) : (
            <>
              <span>Create Account & Start</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Demo Bypass */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleDemoBypass}
          className="w-full p-3 rounded-2xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Explore with Instant Demo Account &rarr;</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>FERPA / GDPR Compliant Privacy Safeguard</span>
      </div>
    </div>
  );
}
