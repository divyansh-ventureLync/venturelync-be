"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Linkedin,
  Globe,
  ArrowRight,
  Zap,
  Check,
} from "lucide-react";

export default function SignupPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [projectWebsite, setProjectWebsite] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call the bcrypt signup API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          inviteCode: inviteCode.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      if (data.status === "waitlisted") {
        try {
          const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-invite-email`;
          await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              inviteCode: data.inviteCode,
            }),
          });
        } catch (emailError) {
          console.error("Email send failed:", emailError);
        }

        router.push(
          `/waitlist?email=${encodeURIComponent(email)}&code=${data.inviteCode}`
        );
        return;
      }

      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (
    icon: React.ReactNode,
    label: string,
    fieldName: string,
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    type: string = "text"
  ) => (
    <div className="group">
      <label className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-blue-400 transition-colors duration-300">
        {label}
      </label>
      <div
        className={`relative transition-all duration-300 ${
          focused === fieldName ? "scale-105" : ""
        }`}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
          {icon}
        </div>
        <input
          type={type === "password" && !showPassword ? "password" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(fieldName)}
          onBlur={() => setFocused(null)}
          className="w-full pl-12 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-slate-600 text-sm"
          placeholder={placeholder}
          required={
            fieldName === "email" ||
            fieldName === "password" ||
            fieldName === "username"
          }
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-300"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in duration-700">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              VentureLync
            </h1>
          </div>
          <p className="text-slate-400 text-lg mb-2 font-medium">
            Join the Elite
          </p>
          <p className="text-slate-500 text-sm">
            Build without performing. Rise without pretending.
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Invite Code */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-300 mb-2 group-focus-within:text-purple-400 transition-colors duration-300">
                Invite Code
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focused === "inviteCode" ? "scale-105" : ""
                }`}
              >
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  onFocus={() => setFocused("inviteCode")}
                  onBlur={() => setFocused(null)}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:border-slate-600 text-sm"
                  placeholder="ENTER CODE"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Don't have a code? You'll be added to our waitlist.
              </p>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-2 gap-4">
              {renderInputField(
                <User className="w-4 h-4" />,
                "Username",
                "username",
                username,
                setUsername,
                "your_username"
              )}

              {renderInputField(
                <Phone className="w-4 h-4" />,
                "Phone",
                "phone",
                phoneNumber,
                setPhoneNumber,
                "+1 (555) 000-0000"
              )}
            </div>

            {/* Email */}
            {renderInputField(
              <Mail className="w-4 h-4" />,
              "Email Address",
              "email",
              email,
              setEmail,
              "you@example.com",
              "email"
            )}

            {/* Password */}
            {renderInputField(
              <Lock className="w-4 h-4" />,
              "Password",
              "password",
              password,
              setPassword,
              "••••••••",
              "password"
            )}

            {/* LinkedIn */}
            {renderInputField(
              <Linkedin className="w-4 h-4" />,
              "LinkedIn Profile",
              "linkedin",
              linkedInUrl,
              setLinkedInUrl,
              "linkedin.com/in/yourprofile"
            )}

            {/* Project Website */}
            {renderInputField(
              <Globe className="w-4 h-4" />,
              "Project Website",
              "website",
              projectWebsite,
              setProjectWebsite,
              "https://yourproject.com"
            )}

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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
            <span className="text-slate-500 text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-gradient-to-l from-slate-700 to-transparent"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="py-2.5 bg-slate-900/50 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 text-sm font-medium transition-all duration-300 hover:bg-slate-800/50"
            >
              Google
            </button>
            <button
              type="button"
              className="py-2.5 bg-slate-900/50 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 text-sm font-medium transition-all duration-300 hover:bg-slate-800/50"
            >
              GitHub
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div
          className="text-center mt-8 animate-in fade-in duration-700"
          style={{ animationDelay: "300ms" }}
        >
          <p className="text-slate-400 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold hover:opacity-80 transition-opacity duration-300"
            >
              Login
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
