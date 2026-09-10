"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface DotNode {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function MasterAdminLoginPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SUPER_ADMIN"
  });

  // Framer Dot-Grid-BG Repulsion & Wobble Physics Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = -9999;
    let mouseY = -9999;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initDots();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const DOT_SPACING = 35;
    const DOT_RADIUS = 1.2;
    const MOUSE_RADIUS = 120;
    const SPRING_K = 0.04;
    const FRICTION = 0.85;

    let dots: DotNode[] = [];

    const initDots = () => {
      dots = [];
      const cols = Math.floor(width / DOT_SPACING) + 2;
      const rows = Math.floor(height / DOT_SPACING) + 2;

      const offsetX = (width - cols * DOT_SPACING) / 2;
      const offsetY = (height - rows * DOT_SPACING) / 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = offsetX + i * DOT_SPACING;
          const y = offsetY + j * DOT_SPACING;
          dots.push({ originX: x, originY: y, x, y, vx: 0, vy: 0, radius: DOT_RADIUS });
        }
      }
    };

    initDots();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const maxPush = 15;
          const pushX = (dx / dist) * force * maxPush * -1;
          const pushY = (dy / dist) * force * maxPush * -1;
          dot.vx += pushX;
          dot.vy += pushY;
        }

        const springX = (dot.originX - dot.x) * SPRING_K;
        const springY = (dot.originY - dot.y) * SPRING_K;
        dot.vx += springX;
        dot.vy += springY;

        dot.vx *= FRICTION;
        dot.vy *= FRICTION;

        dot.x += dot.vx;
        dot.y += dot.vy;

        const displacement = Math.sqrt(
          (dot.x - dot.originX) * (dot.x - dot.originX) +
          (dot.y - dot.originY) * (dot.y - dot.originY)
        );

        const alpha = Math.min(0.85, 0.22 + (displacement / 20) * 0.5);
        const radius = dot.radius + Math.min(1.2, displacement / 15);

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const getPasswordHumor = (pass: string) => {
    if (!pass) return { label: "Awaiting Master Password...", color: "text-slate-500", progress: 0 };
    if (pass.length < 4) return { label: "🚗 Too weak! Even a parking valet could guess this!", color: "text-red-400", progress: 25 };
    if (pass.length < 8) return { label: "🔑 Getting warmer... Chauffeur level clearance!", color: "text-amber-400", progress: 65 };
    return { label: "🦁 FORT KNOX CLEARANCE GRANTED! Lion Defense Active!", color: "text-emerald-400 font-bold", progress: 100 };
  };

  const passwordInfo = getPasswordHumor(form.password);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.email) {
      setError("Please enter your Master HQ Email.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "Password reset requested.");
      } else {
        setError(data.error || "Failed to request reset.");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your Master HQ credentials.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (res.ok && data.admin) {
        if (data.admin.role !== 'SUPER_ADMIN' && data.admin.role !== 'MASTER_ADMIN') {
          setError("Access Denied! Standard Admins cannot access Master HQ.");
        } else {
          setSuccessMsg("🎉 Master Key Verified! Opening Command Center...");
          setTimeout(() => {
            router.push("/master-admin");
          }, 1200);
        }
      } else {
        setError(data.error || "Access Denied! Incorrect Master Key.");
      }
    } catch (err) {
      setError("System Offline! Check backend server status.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("All request fields are required.");
      return;
    }
    setSuccessMsg("✨ Access Request Submitted! Super Admin review in progress.");
    setTimeout(() => {
      setMode("login");
      setSuccessMsg("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Framer Interactive Repulsion Dot-Grid Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-auto" />

      {/* 2. Soft Ambient Vignette Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#020617_100%)] pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Clean Untampered Brand Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 bg-slate-900/90 border border-amber-500/30 rounded-3xl shadow-2xl backdrop-blur-xl">
            <img
              src="/images/logo.png"
              alt="TEMP TRAVEL"
              className="h-14 w-auto object-contain drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MASTER SUPER ADMIN COMMAND HQ</span>
            </div>
            <h1 className="text-2xl font-black text-slate-50 mt-2 tracking-tight">
              {mode === "login" ? "Master Control Sign In" : "Request Admin Access"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Encrypted clearance portal for Temp Travel Pvt Ltd operations.
            </p>
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          {/* Mode Tab Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === "login" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-400 hover:text-white"
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === "signup" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-400 hover:text-white"
                }`}
            >
              Request Access
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-red-400 font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 animate-bounce text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Master Email</label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-3.5 transition-colors group-focus-within:text-amber-500" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="super@temptravels.com"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center pr-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Master Password</label>
                    <button type="button" onClick={() => setMode("forgot")} className="text-[10px] text-amber-500/80 hover:text-amber-400 hover:underline transition-colors font-medium">Forgot Access?</button>
                  </div>
                  <div className="relative group">
                    <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-3.5 transition-colors group-focus-within:text-amber-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Humor Bar */}
                  <div className="pt-2 px-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-[10px] uppercase tracking-wider ${passwordInfo.color}`}>
                        {passwordInfo.label}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-500 ease-out"
                        style={{ width: `${passwordInfo.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold py-3.5 px-4 text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <Sparkles className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-5 h-5" />
                        <span>Initialize HQ</span>
                      </>
                    )}
                  </div>
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === "forgot" && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Master Email</label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-3.5 transition-colors group-focus-within:text-amber-500" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="super@temptravels.com"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold py-3.5 px-4 text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <Sparkles className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-5 h-5" />
                        <span>Request Recovery</span>
                      </>
                    )}
                  </div>
                </button>
                <div className="text-center pt-2">
                  <button type="button" onClick={() => setMode("login")} className="text-[11px] text-slate-400 hover:text-white transition-colors">
                    Back to Login
                  </button>
                </div>
              </form>
            )}

          {mode === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navneet Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@temptravels.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">Requested Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full HQ Control)</option>
                  <option value="OPERATIONS_DISPATCH">OPERATIONS_DISPATCH</option>
                  <option value="ACCOUNTANT">ACCOUNTANT</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 cursor-pointer"
              >
                Submit Access Request
              </button>
            </form>
          )}
        </div>

        {/* Security Footer Note */}
        <div className="text-center space-y-1">
          <div className="text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>256-Bit SSL Encrypted &bull; ISO 27001 Security Standard</span>
          </div>
          <div className="text-[9px] text-slate-600">
            TEMP TRAVEL CAR RENTALS PVT LTD &bull; All Rights Reserved
          </div>
        </div>
      </div>
    </div>
  );
}
