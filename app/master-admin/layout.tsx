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
  Sparkles,
  Activity,
  ChevronRight,
  UserCheck,
  Settings,
  FileCheck,
  FileText,
  AlertTriangle,
  Cake,
  Clock,
  Briefcase,
  ShieldAlert,
  Calendar
} from "lucide-react";

// Age & Birthday Calculation Helper
function calculateAge(dobString: string): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

function daysUntilExpiry(expiryDateString: string): number | null {
  if (!expiryDateString) return null;
  const exp = new Date(expiryDateString);
  if (isNaN(exp.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isBirthdayThisMonth(dobString: string): { isToday: boolean; isComingUp: boolean; age: number | null } {
  if (!dobString) return { isToday: false, isComingUp: false, age: null };
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return { isToday: false, isComingUp: false, age: null };
  const today = new Date();
  const age = calculateAge(dobString);
  const isToday = dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
  
  // Is coming up in next 7 days
  const dobThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  const diff = (dobThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  const isComingUp = diff >= 0 && diff <= 7;
  
  return { isToday, isComingUp, age };
}

export default function MasterAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Expiries & Birthday Notifications State
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([]);
  const [birthdayAlerts, setBirthdayAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Ensure dark theme is locked
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");

    // Scan vehicles, drivers, and office staff for 30-day document expiries and birthdays
    const scanNotifications = () => {
      const expList: any[] = [];
      const bdayList: any[] = [];

      // 1. Scan Vehicles
      const savedFleet = localStorage.getItem("user_uploaded_fleet");
      if (savedFleet) {
        try {
          const fleet = JSON.parse(savedFleet);
          fleet.forEach((v: any) => {
            const reg = v.registrationNumber || v.model;
            // Insurance Expiry
            const insDays = daysUntilExpiry(v.insuranceExpiry);
            if (insDays !== null && insDays <= 30) {
              expList.push({
                type: "INSURANCE",
                title: `Insurance Expiry: ${v.make} ${v.model}`,
                subtitle: `Reg: ${reg} • ${v.insuranceProvider || 'HDFC ERGO'}`,
                daysLeft: insDays,
                date: v.insuranceExpiry
              });
            }
            // Fitness Expiry
            const fitDays = daysUntilExpiry(v.fitnessExpiry);
            if (fitDays !== null && fitDays <= 30) {
              expList.push({
                type: "FITNESS",
                title: `Fitness Cert Expiry: ${reg}`,
                subtitle: `${v.make} ${v.model}`,
                daysLeft: fitDays,
                date: v.fitnessExpiry
              });
            }
            // All India Permit Expiry
            const permitDays = daysUntilExpiry(v.permitExpiry);
            if (permitDays !== null && permitDays <= 30) {
              expList.push({
                type: "PERMIT",
                title: `All India Permit Expiry: ${reg}`,
                subtitle: `${v.make} ${v.model}`,
                daysLeft: permitDays,
                date: v.permitExpiry
              });
            }
            // PUC Expiry
            const pucDays = daysUntilExpiry(v.pucExpiry);
            if (pucDays !== null && pucDays <= 30) {
              expList.push({
                type: "PUC",
                title: `PUC Cert Expiry: ${reg}`,
                subtitle: `${v.make} ${v.model}`,
                daysLeft: pucDays,
                date: v.pucExpiry
              });
            }
          });
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Scan Drivers
      const savedDrivers = localStorage.getItem("user_uploaded_drivers");
      const drivers = savedDrivers ? JSON.parse(savedDrivers) : [];
      drivers.forEach((d: any) => {
        const licDays = daysUntilExpiry(d.licenseExpiry);
        if (licDays !== null && licDays <= 30) {
          expList.push({
            type: "LICENSE",
            title: `Driver License Expiry: ${d.name}`,
            subtitle: `Mobile: +91-${d.phone}`,
            daysLeft: licDays,
            date: d.licenseExpiry
          });
        }

        // Driver Birthday Check
        const bdayInfo = isBirthdayThisMonth(d.dob);
        if (bdayInfo.isToday || bdayInfo.isComingUp) {
          bdayList.push({
            name: d.name,
            role: "Driver / Chauffeur",
            age: bdayInfo.age,
            isToday: bdayInfo.isToday,
            dob: d.dob
          });
        }
      });

      // 3. Scan Office Staff
      const savedStaff = localStorage.getItem("user_uploaded_office_staff");
      const staffList = savedStaff ? JSON.parse(savedStaff) : [];
      staffList.forEach((stf: any) => {
        const bdayInfo = isBirthdayThisMonth(stf.dob);
        if (bdayInfo.isToday || bdayInfo.isComingUp) {
          bdayList.push({
            name: stf.name,
            role: stf.role,
            age: bdayInfo.age,
            isToday: bdayInfo.isToday,
            dob: stf.dob
          });
        }
      });

      setExpiryAlerts(expList);
      setBirthdayAlerts(bdayList);
    };

    scanNotifications();
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
    { name: "Office Staff", href: "/master-admin/office-staff", icon: Briefcase },
    { name: "Billing & Ledger", href: "/master-admin/billing-ledger", icon: CreditCard },
    { name: "SEO & Growth", href: "/master-admin/seo-growth", icon: Globe },
    { name: "Master Blog CMS", href: "/master-admin/blog", icon: FileText },
    { name: "Document Vault", href: "/master-admin/vault", icon: FileCheck },
    { name: "Audit Logs", href: "/master-admin/audit-logs", icon: ShieldCheck },
    { name: "System Settings", href: "/master-admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Master Desktop Sidebar Panel (Fixed Left) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-slate-900/95 backdrop-blur-2xl border-r border-amber-500/20 z-40 shrink-0 shadow-2xl">
        {/* Brand Header */}
        <div className="h-14 px-3 border-b border-amber-500/20 flex items-center justify-center relative bg-gradient-to-b from-amber-500/10 via-transparent to-transparent">
          <Link href="/master-admin" className="w-full h-full flex items-center justify-center group" title="Master Admin Home">
            <img
              src="/images/logo.png"
              alt="TEMP TRAVEL"
              className="max-h-10 w-auto max-w-[190px] object-contain mx-auto group-hover:scale-105 transition-transform drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]"
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-amber-400 group-hover:scale-110"} transition-transform`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-slate-950" />}
              </Link>
            );
          })}
        </nav>

        {/* System Telemetry */}
        <div className="p-2.5 border-t border-amber-500/20 bg-slate-950/60 space-y-2">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
            <span className="font-mono text-slate-500">v2.5 HQ</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content & Right Fixed Notification Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-56 xl:pr-72 overflow-x-hidden min-h-screen">
        {/* Header Toolbar */}
        <header className="h-14 bg-slate-900/80 backdrop-blur-xl border-b border-amber-500/20 flex items-center justify-between px-4 sm:px-5 lg:px-6 sticky top-0 z-30 shadow-lg">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-white/5"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active Breadcrumb / Badge */}
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span>TEMP TRAVEL MASTER HQ</span>
            </span>
            <span className="text-slate-600 text-xs">&bull;</span>
            <span className="text-slate-400 text-xs font-semibold">
              Real-Time Operational Telemetry & Compliance
            </span>
          </div>

          {/* Controls: Telemetry indicator */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Telemetry Synced</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 3. FIXED RIGHT-SIDE MASTER NOTIFICATION SIDEBAR PANEL */}
      <aside className="hidden xl:flex xl:flex-col xl:w-72 xl:fixed xl:right-0 xl:inset-y-0 bg-slate-900/95 backdrop-blur-2xl border-l border-amber-500/20 z-40 shrink-0 shadow-2xl">
        {/* Right Panel Header */}
        <div className="h-14 px-4 border-b border-amber-500/20 flex items-center justify-between gap-2 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <h3 className="font-black text-slate-100 text-xs tracking-wider uppercase truncate">
              Notifications
            </h3>
          </div>
          <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono whitespace-nowrap shrink-0">
            {expiryAlerts.length + birthdayAlerts.length} Alerts
          </span>
        </div>

        {/* Notifications Scroll Container */}
        <div className="flex-1 px-4 py-5 space-y-6 overflow-y-auto">
          {/* Section 1: Document Expiries (30 Days Warning) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-black uppercase text-amber-400 tracking-wider">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> 30-Day Document Expiries
              </span>
              <span className="font-mono text-slate-500">{expiryAlerts.length}</span>
            </div>

            {expiryAlerts.length === 0 ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center text-xs text-slate-500 italic">
                All vehicle & driver compliance documents are 100% valid.
              </div>
            ) : (
              <div className="space-y-2.5">
                {expiryAlerts.map((exp, idx) => {
                  const isUrgent = exp.daysLeft <= 7;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all text-xs space-y-1 ${
                        isUrgent
                          ? "bg-rose-500/10 border-rose-500/40 text-rose-200"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      }`}
                    >
                      <div className="flex justify-between items-start font-bold">
                        <span className="leading-tight text-slate-100">{exp.title}</span>
                        <span
                          className={`text-[9px] font-black font-mono px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            exp.daysLeft < 0
                              ? "bg-rose-500 text-white"
                              : exp.daysLeft <= 7
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {exp.daysLeft < 0
                            ? "EXPIRED"
                            : exp.daysLeft === 0
                            ? "EXPIRES TODAY"
                            : `${exp.daysLeft} DAYS LEFT`}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{exp.subtitle}</div>
                      <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-white/5 flex justify-between">
                        <span>Expiry Date:</span>
                        <span className="font-bold text-slate-300">{exp.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Birthday Celebrations (Drivers & Office Staff) */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] font-black uppercase text-amber-400 tracking-wider">
              <span className="flex items-center gap-1.5">
                <Cake className="w-3.5 h-3.5 text-amber-400" /> Birthday Celebrations
              </span>
              <span className="font-mono text-slate-500">{birthdayAlerts.length}</span>
            </div>

            {birthdayAlerts.length === 0 ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center text-xs text-slate-500 italic">
                No birthdays scheduled for today or this week.
              </div>
            ) : (
              <div className="space-y-2.5">
                {birthdayAlerts.map((bday, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-100">{bday.name}</span>
                      {bday.isToday && (
                        <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          🎉 TODAY!
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-amber-400 font-bold">{bday.role}</div>
                    {bday.age !== null && (
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Turning {bday.age + 1} Years Old ({bday.dob})</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
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
