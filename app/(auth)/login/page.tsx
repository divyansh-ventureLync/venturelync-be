"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call the bcrypt login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }

      // Store session token in httpOnly cookie via API endpoint
      await fetch("/api/auth/set-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionToken: data.sessionToken,
        }),
      });

      // Route based on profile completion status
      if (!data.user.profileCompleted) {
        router.push("/onboarding");
      } else {
        router.push("/feed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in duration-700">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              VentureLync
            </h1>
          </div>
          <p className="text-slate-400 text-lg mb-2 font-medium">
            Welcome Back
          </p>
          <p className="text-slate-500 text-sm">
            Build without performing. Rise without pretending.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-300 mb-3 group-focus-within:text-blue-400 transition-colors duration-300">
                Email Address
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focused === "email" ? "scale-105" : ""
                }`}
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-slate-600"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-300 mb-3 group-focus-within:text-blue-400 transition-colors duration-300">
                Password
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focused === "password" ? "scale-105" : ""
                }`}
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-slate-600"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm animate-in fade-in duration-300 flex items-start gap-3">
                <div className="mt-0.5 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></div>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                className="text-slate-400 hover:text-slate-300 text-sm transition-colors duration-300"
              >
                Forgot your password?
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
            <span className="text-slate-500 text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-gradient-to-l from-slate-700 to-transparent"></div>
          </div>

          {/* OAuth Buttons (placeholders) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="py-3 bg-slate-900/50 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 text-sm font-medium transition-all duration-300 hover:bg-slate-800/50"
            >
              Google
            </button>
            <button
              type="button"
              className="py-3 bg-slate-900/50 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 text-sm font-medium transition-all duration-300 hover:bg-slate-800/50"
            >
              GitHub
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div
          className="text-center mt-8 animate-in fade-in duration-700"
          style={{ animationDelay: "300ms" }}
        >
          <p className="text-slate-400 text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold hover:opacity-80 transition-opacity duration-300"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-400 text-xs transition-colors duration-300"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
