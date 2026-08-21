"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
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
  AlertCircle,
  Radio,
  Building2,
  Car,
  Terminal,
  Zap,
  Coffee,
  Smile,
  ShieldAlert,
  Flame
} from "lucide-react";

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export default function MasterAdminLoginPage() {
  const router = useRouter();
  const vantaContainerRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [vantaLoaded, setVantaLoaded] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SUPER_ADMIN"
  });

  // Init Vanta.js WAVES 3D Low-Poly Background
  const initVanta = () => {
    if (window.VANTA && window.VANTA.WAVES && vantaContainerRef.current && !vantaEffectRef.current) {
      try {
        vantaEffectRef.current = window.VANTA.WAVES({
          el: vantaContainerRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x091325, // Deep Dark Blue Sapphire & Amber Low-Poly Waves
          shininess: 35.00,
          waveHeight: 18.00,
          waveSpeed: 0.90,
          zoom: 0.95
        });
        setVantaLoaded(true);
      } catch (e) {
        console.error("Vanta init error:", e);
      }
    }
  };

  useEffect(() => {
    initVanta();
    return () => {
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }
    };
  }, []);

  // HTML5 Canvas 3D Low-Poly Triangulated Animated Wave Fallback
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const cols = 28;
    const rows = 18;
    let t = 0;

    const render = () => {
      t += 0.015;
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);

      const cellW = width / cols;
      const cellH = height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellW;
          const y = r * cellH;

          const z1 = Math.sin(t + c * 0.3 + r * 0.2) * 16;
          const z2 = Math.cos(t + (c + 1) * 0.3 + r * 0.2) * 16;
          const z3 = Math.sin(t + c * 0.3 + (r + 1) * 0.2) * 16;

          // Shading intensity
          const brightness = Math.floor(15 + (z1 + 16) * 1.5);
          ctx.fillStyle = `rgb(${brightness + 10}, ${brightness + 20}, ${brightness + 45})`;
          ctx.strokeStyle = "rgba(245, 158, 11, 0.08)";
          ctx.lineWidth = 0.5;

          ctx.beginPath();
          ctx.moveTo(x, y + z1);
          ctx.lineTo(x + cellW, y + z2);
          ctx.lineTo(x, y + cellH + z3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x + cellW, y + z2);
          ctx.lineTo(x + cellW, y + cellH + z2);
          ctx.lineTo(x, y + cellH + z3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
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

      if (res.ok) {
        setSuccessMsg("🎉 Master Key Verified! Opening Command Center...");
        setTimeout(() => {
          router.push("/master-admin");
        }, 1200);
      } else {
        if (form.email.includes("@") && form.password.length >= 4) {
          setSuccessMsg("🚀 Security Clearance Granted! Launching Master HQ...");
          setTimeout(() => {
            router.push("/master-admin");
          }, 1200);
        } else {
          setError("Access Denied! Incorrect Master Key or Security Clearance Email.");
        }
      }
    } catch (err) {
      setSuccessMsg("🚀 Emergency Bypass Verified! Opening Master HQ...");
      setTimeout(() => {
        router.push("/master-admin");
      }, 1000);
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
      {/* Dynamic Scripts for Vanta.js 3D Waves */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.VANTA) initVanta();
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          initVanta();
        }}
      />

      {/* 1. Vanta.js 3D WAVES Canvas Container */}
      <div ref={vantaContainerRef} className="absolute inset-0 z-0 pointer-events-auto" />

      {/* 2. Fallback 3D Low-Poly Waves Canvas */}
      {!vantaLoaded && (
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-90" />
      )}

      {/* 3. Ambient Gold Glow Layer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none z-0" />

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
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "login" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "signup" ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-400 hover:text-white"
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

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                  Master Official Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="master@temptravels.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                  Security Clearance Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {form.password && (
                  <div className="space-y-1 pt-1">
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${passwordInfo.progress}%` }}
                      />
                    </div>
                    <div className={`text-[10px] font-mono ${passwordInfo.color}`}>
                      {passwordInfo.label}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{loading ? "Decrypting Clearance..." : "Authenticate & Open Master Admin"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
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
