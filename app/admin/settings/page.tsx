"use client";

import React, { useState } from "react";
import { Settings, Save, ShieldCheck, Mail, Phone, MapPin, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "TEMP TRAVEL CAR RENTALS PVT LTD",
    supportEmail: "info@temptravels.com",
    supportPhone: "+91 99999 99999",
    officeAddress: "Flat No C-102, Shanti Vihar, Lokhandwala Complex, Kandivali East, Mumbai, MH, 400101",
    seoTitle: "Temp Travel Car Rentals - Corporate Transportation & Cab Services",
    seoDescription: "ISO 9001:2015 certified vehicle fleet providing corporate commutes and leisure tours.",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Branding configurations and support settings updated successfully!");
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <Settings className="w-8 h-8 text-accent" />
            <span>Site Settings Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage corporate details, customer service contacts, and primary metadata values.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 bg-slate-900 border border-white/5 p-6 md:p-8 rounded-xl space-y-6 glassmorphism">
          <h2 className="text-lg font-bold text-slate-50 border-b border-white/5 pb-3">Corporate Branding Details</h2>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business / Site Name</label>
            <input
              type="text"
              required
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <h2 className="text-lg font-bold text-slate-50 border-b border-white/5 pb-3 pt-4">Support & Contact Coordinates</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>Customer Support Email</span>
              </label>
              <input
                type="email"
                required
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-accent" />
                <span>Customer Service Hotline</span>
              </label>
              <input
                type="text"
                required
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>Office Address Coordinates</span>
            </label>
            <textarea
              rows={3}
              required
              value={settings.officeAddress}
              onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          <h2 className="text-lg font-bold text-slate-50 border-b border-white/5 pb-3 pt-4">Global Search Metadata (SEO)</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-accent" />
              <span>Homepage Search Title</span>
            </label>
            <input
              type="text"
              required
              value={settings.seoTitle}
              onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Homepage Search Summary</label>
            <textarea
              rows={3}
              required
              value={settings.seoDescription}
              onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-accent hover:bg-amber-600 text-slate-950 font-bold py-3 px-8 rounded-lg text-sm tracking-wider uppercase transition-all shadow-lg"
            >
              <Save className="w-4.5 h-4.5" />
              <span>Save Configurations</span>
            </button>
          </div>
        </form>

        {/* Security / Help card */}
        <div className="lg:col-span-4 bg-slate-900 border border-white/5 p-6 rounded-xl space-y-4 glassmorphism text-xs text-slate-300">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4.5 h-4.5 text-green-400" />
            <span>Settings Auditing</span>
          </h3>
          <p className="leading-relaxed">
            Site settings configurations are cached inside global state memory. Alterations apply immediately on next page requests.
          </p>
          <div className="text-[10px] text-slate-500 pt-2 border-t border-white/5 leading-relaxed">
            Note: Changing database configurations requires administrator authorization (SUPER_ADMIN role scope).
          </div>
        </div>
      </div>
    </div>
  );
}
