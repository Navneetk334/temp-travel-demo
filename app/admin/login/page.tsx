"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Car, Lock, Mail, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("admin@temptravels.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.admin) {
        localStorage.setItem("tt_admin_user", JSON.stringify(data.admin));
      }
      if (data.token) {
        localStorage.setItem("tt_admin_token", data.token);
      }

      // Hard redirect to clear browser middleware cache on mobile
      window.location.href = callbackUrl || "/admin";
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <img
          src="/images/logo.png"
          alt="TEMP TRAVEL CAR RENTALS"
          className="h-14 w-auto object-contain mx-auto mb-2"
        />
        <h1 className="text-xl font-extrabold tracking-tight text-slate-50">
          Admin Control Center
        </h1>
        <p className="text-xs text-slate-400">
          Sign in to access operational dashboard & CRM systems
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2.5 text-xs text-red-400">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@temptravels.com"
              className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Admin</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Hint */}
      <div className="pt-4 border-t border-white/5 text-center text-[10px] text-slate-500">
        Super Admin Credentials: <span className="text-slate-400 font-mono">admin@temptravels.com</span> / <span className="text-slate-400 font-mono">admin123</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <Suspense fallback={
        <div className="text-slate-400 text-xs flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading login form...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
