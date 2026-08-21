"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Users,
  Car,
  CreditCard,
  Globe,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Bell,
  Sparkles,
  Activity,
  ChevronRight,
  UserCheck,
  Settings,
  FileCheck,
  FileText
} from "lucide-react";

export default function MasterAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminSession, setAdminSession] = useState<{
    email: string;
    role: string;
    name: string;
  }>({
    email: "master@temptravels.com",
    role: "SUPER_ADMIN",
    name: "Master Command Center",
  });

  useEffect(() => {
    // Ensure dark theme is locked
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/master-admin/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    router.push("/master-admin/login");
  };

  // If on login page, render full screen without master sidebar
  if (pathname === "/master-admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Master Overview", href: "/master-admin", icon: LayoutDashboard },
    { name: "Dispatch Radar", href: "/master-admin/dispatch-radar", icon: Radio },
    { name: "Omnichannel CRM", href: "/master-admin/crm", icon: Users },
    { name: "Fleet Vehicles", href: "/master-admin/fleet-roster", icon: Car },
    { name: "Driver Roster", href: "/master-admin/drivers", icon: UserCheck },
    { name: "Billing & Ledger", href: "/master-admin/billing-ledger", icon: CreditCard },
    { name: "SEO & Growth", href: "/master-admin/seo-growth", icon: Globe },
    { name: "Master Blog CMS", href: "/master-admin/blog", icon: FileText },
    { name: "Document Vault", href: "/master-admin/vault", icon: FileCheck },
    { name: "Audit Logs", href: "/master-admin/audit-logs", icon: ShieldCheck },
    { name: "System Settings", href: "/master-admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Master Desktop Sidebar Panel (Fixed) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900/95 backdrop-blur-2xl border-r border-amber-500/20 z-40 shrink-0 shadow-2xl">
        {/* Brand Header */}
        <div className="h-20 px-4 border-b border-amber-500/20 flex flex-col justify-center items-center text-center relative bg-gradient-to-b from-amber-500/10 via-transparent to-transparent">
          <Link href="/master-admin" className="inline-flex items-center justify-center group" title="Master Admin Home">
            <img
              src="/images/logo.png"
              alt="TEMP TRAVEL"
              className="h-[44px] w-auto object-contain mx-auto group-hover:scale-105 transition-transform drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]"
            />
          </Link>
          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-amber-400 mt-1">
            Master Control Center
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-400 group-hover:scale-110"} transition-transform`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
              </Link>
            );
          })}
        </nav>

        {/* System Telemetry & User Card */}
        <div className="p-3.5 border-t border-amber-500/20 bg-slate-950/60 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
            <span className="font-mono text-slate-500">v2.5 HQ</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs">
                M
              </div>
              <div>
                <div className="font-extrabold text-slate-200 text-xs">{adminSession.name}</div>
                <div className="text-[9px] text-amber-400/90 font-bold uppercase">{adminSession.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-amber-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 overflow-x-hidden min-h-screen">
        {/* Header Toolbar */}
        <header className="h-20 bg-slate-900/80 backdrop-blur-xl border-b border-amber-500/20 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-xl">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-white/5"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Active Breadcrumb / Badge */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TEMP TRAVEL MASTER HQ</span>
            </span>
            <span className="text-slate-500 text-xs">&bull;</span>
            <span className="text-slate-400 text-xs font-bold">
              Real-Time Operational Telemetry & CRM Engine
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden md:flex items-center gap-2 bg-slate-950 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Telemetry: 100% Synced</span>
            </div>

            <button className="relative p-2 bg-slate-950 border border-amber-500/20 rounded-lg text-slate-300 hover:text-amber-400 transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 w-72 p-6 relative flex flex-col justify-between h-full border-r border-amber-500/30">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-1.5 bg-slate-950 border border-white/10 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-center">
                <img
                  src="/images/logo.png"
                  alt="TEMP TRAVEL"
                  className="h-[50px] w-auto object-contain mx-auto"
                />
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-amber-500 text-slate-950 font-black"
                          : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
