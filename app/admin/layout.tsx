"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  LayoutDashboard,
  CalendarRange,
  Compass,
  Building2,
  PhoneCall,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Mail,
  UserCheck,
  Clock,
  Briefcase,
  MapPin,
  FileText,
  Loader2,
  Sparkles
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles?: string[]; // RBAC restriction
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const [adminSession, setAdminSession] = useState<{
    name: string;
    email: string;
    role: string;
  }>({
    name: "Operations Dispatch Desk",
    email: "admin@temptravel.in",
    role: "SUPER_ADMIN",
  });

  // Reset navigating indicator when route changes
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  // Safety fallback: if navigation takes longer than 6s, clear the loading state
  useEffect(() => {
    if (!navigatingTo) return;
    const timer = setTimeout(() => {
      setNavigatingTo(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [navigatingTo]);

  // Fetch admin session details (or mock)
  useEffect(() => {
    // In production, sync with next-auth or custom session
    const storedUser = localStorage.getItem("tt_admin_user");
    if (storedUser) {
      try {
        setAdminSession(JSON.parse(storedUser));
      } catch (e) {
        // fallback to default
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tt_admin_user");
    localStorage.removeItem("tt_admin_token");
    window.location.href = "/admin/login";
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }


  const navItems: SidebarItem[] = [
    { name: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings Dispatch", href: "/admin/bookings-dispatch", icon: CalendarRange },
    { name: "Fleet Roster & Status", href: "/admin/fleet", icon: Car },
    { name: "Driver Roster", href: "/admin/drivers", icon: UserCheck },
    { name: "Pickup & Drop Leads", href: "/admin/corporate-leads", icon: Building2 },
    { name: "Local Rentals Leads", href: "/admin/local-rental-leads", icon: Clock },
    { name: "Outstation Leads", href: "/admin/outstation-leads", icon: Compass },
    { name: "Corporate Inquiry Leads", href: "/admin/corporate-inquiry-leads", icon: Briefcase },
    { name: "Tour Package Leads", href: "/admin/tour-leads", icon: MapPin },
    { name: "Contact Leads", href: "/admin/contact-leads", icon: Mail },
    { name: "Duties", href: "/admin/duties", icon: FileText },
    { name: "Payments & Cash Ledger", href: "/admin/payments", icon: CreditCard },
  ];

  // Filter items by role (RBAC)
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(adminSession.role)
  );

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Top Global Loading Progress Bar during navigation */}
      {navigatingTo && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-slate-900/60 overflow-hidden pointer-events-none">
          <div className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse w-full" />
        </div>
      )}

      {/* 1. Sidebar Panel for Desktop (Fixed) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface border-r border-border z-40 shrink-0">
        {/* Brand identity */}
        <div className="h-20 px-4 border-b border-border flex items-center justify-center text-center">
          <Link href="/admin" className="inline-flex items-center justify-center" title="Admin Home">
            <img
              src="/images/logo.png"
              alt="TEMP TRAVEL"
              className="h-[50px] sm:h-[54px] w-auto object-contain mx-auto"
            />
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isNavigatingThis = navigatingTo === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (item.href !== pathname) {
                    setNavigatingTo(item.href);
                  }
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isNavigatingThis
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10"
                    : isActive
                    ? "bg-accent text-slate-950 font-bold shadow-md shadow-accent/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isNavigatingThis ? (
                    <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />
                  ) : (
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-accent"}`} />
                  )}
                  <span className="truncate">{item.name}</span>
                </div>

                {isNavigatingThis && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-accent bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 rounded-md animate-pulse uppercase tracking-wider shrink-0 ml-2">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>Loading</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile & logout */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold text-xs">
              {adminSession.name.charAt(0)}
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-200">{adminSession.name}</div>
              <div className="text-slate-500 font-mono text-[10px]">{adminSession.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. Main content area (Padded for fixed sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 overflow-x-hidden min-h-screen">

        {/* Header toolbar */}
        <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Active section title / Navigation loading indicator */}
          {navigatingTo ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold animate-pulse shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Opening {visibleNavItems.find(i => i.href === navigatingTo)?.name || "Section"}...</span>
            </div>
          ) : (
            <div className="hidden sm:block text-slate-400 text-xs font-semibold tracking-wider uppercase">
              Temp Travel Car Rentals &bull; Operational Dashboard
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 bg-background border border-border rounded-lg text-slate-400 hover:text-slate-200">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
            </button>
            <div className="h-6 w-px bg-white/5" />
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center text-accent border border-border font-bold">
                {adminSession.role.charAt(0)}
              </div>
              <div className="hidden sm:block text-slate-300 font-bold">{adminSession.name}</div>
            </div>
          </div>
        </header>

        {/* Main Content Body with subtle transition overlay */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Slide-out */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[9999] flex lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-64 p-6 relative flex flex-col justify-between h-full border-r border-border">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-1 bg-background border border-border rounded-lg text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-8 mt-4">
              <div className="flex items-center justify-center">
                <img
                  src="/images/logo.png"
                  alt="TEMP TRAVEL"
                  className="h-[50px] w-auto object-contain mx-auto"
                />
              </div>

              <nav className="space-y-1.5">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isNavigatingThis = navigatingTo === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        if (item.href !== pathname) {
                          setNavigatingTo(item.href);
                        }
                        setMobileOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                        isNavigatingThis
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : isActive
                          ? "bg-primary text-primary-foreground border-l-2 border-accent"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isNavigatingThis ? (
                          <Loader2 className="w-4.5 h-4.5 text-accent animate-spin" />
                        ) : (
                          <Icon className="w-4.5 h-4.5" />
                        )}
                        <span>{item.name}</span>
                      </div>

                      {isNavigatingThis && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-accent bg-amber-400/20 px-1.5 py-0.5 rounded animate-pulse">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 text-xs mt-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-accent font-bold">
                  {adminSession.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-200">{adminSession.name}</div>
                  <div className="text-[9px] text-slate-500 font-semibold uppercase">{adminSession.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

