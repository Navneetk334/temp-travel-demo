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
  Mail
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

  useEffect(() => {
    document.cookie = "temp-travel-admin-session=mock-admin-token; path=/; max-age=86400; SameSite=Lax";
  }, []);

  // Mock Admin session (role can be SUPER_ADMIN, MANAGER, DISPATCHER)
  const adminSession = {
    name: "Navneet Kumar",
    email: "admin@temptravels.com",
    role: "SUPER_ADMIN"
  };

  const navItems: SidebarItem[] = [
    { name: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings Dispatch", href: "/admin/bookings-dispatch", icon: CalendarRange },
    { name: "Tour Packages", href: "/admin/tours", icon: Compass },
    { name: "Fleet Vehicles", href: "/admin/fleet", icon: Car },
    { name: "Corporate Leads", href: "/admin/corporate-leads", icon: Building2 },
    { name: "Rental Leads", href: "/admin/rental-leads", icon: PhoneCall },
    { name: "Contact Leads", href: "/admin/contact-leads", icon: Mail },
    { name: "Blog Posts CMS", href: "/admin/blog", icon: BookOpen },
    { name: "Gallery Catalog", href: "/admin/gallery", icon: ImageIcon },
    { name: "Testimonials Moderation", href: "/admin/testimonials", icon: MessageSquare },
    { name: "Payments Ledger", href: "/admin/payments", icon: CreditCard },
    { name: "Site Settings", href: "/admin/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
  ];

  // Filter items by role (RBAC)
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(adminSession.role)
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* 1. Sidebar Panel for Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 border-r border-white/5 shrink-0">
        {/* Brand identity */}
        <div className="h-20 px-6 border-b border-white/5 flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <Car className="w-5 h-5 text-accent" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-50 uppercase">Temp Travel</span>
            <span className="block text-[8px] font-bold text-accent tracking-widest uppercase -mt-0.5">Admin Control</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-l-2 border-accent"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-accent" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Avatar Card */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-accent font-bold uppercase">
              {adminSession.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-slate-200">{adminSession.name}</div>
              <div className="text-[9px] text-slate-500 font-semibold uppercase mt-0.5">{adminSession.role}</div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-200">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Header toolbar */}
        <header className="h-20 bg-slate-900 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Active section title */}
          <div className="hidden sm:block text-slate-400 text-xs font-semibold tracking-wider uppercase">
            Temp Travel Car Rentals &bull; Operational Dashboard
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-slate-200">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
            </button>
            <div className="h-6 w-px bg-white/5" />
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center text-accent border border-white/5 font-bold">
                {adminSession.role.charAt(0)}
              </div>
              <div className="hidden sm:block text-slate-300 font-bold">{adminSession.name}</div>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Slide-out */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 w-64 p-6 relative flex flex-col justify-between h-full border-r border-white/10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-1 bg-slate-950 border border-white/5 rounded-lg text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-8 mt-4">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-accent" />
                <span className="font-extrabold text-sm tracking-tight text-slate-50 uppercase">Temp Travel</span>
              </div>

              <nav className="space-y-1.5">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground border-l-2 border-accent"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs mt-auto">
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
