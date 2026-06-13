"use client";

import React, { useState } from "react";
import { ChevronRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Prepare payload
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      subject: formData.subject.trim() || null,
      message: formData.message.trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && typeof data.error === "object") {
          const fieldErrors = Object.values(data.error).flat().join(", ");
          throw new Error(fieldErrors || "Failed to submit inquiry.");
        }
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-slate-900/40 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4 glassmorphism flex flex-col items-center justify-center min-h-[350px]">
        <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h3 className="text-xl font-bold text-slate-50">Message Submitted!</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Thank you for getting in touch. Your message has been logged in our sales panel. Our support team will respond to your registered email address within 24 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-2 text-xs font-semibold text-accent hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 glassmorphism">
      <h3 className="text-xl font-bold text-slate-50">Send Inquiry Message</h3>
      
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex gap-3 text-xs text-rose-300 items-start">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@example.com"
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number (with country code)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +919999999999"
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject / Purpose</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Outstation Tour Rental Query"
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Message Details *</label>
          <textarea
            name="message"
            rows={5}
            required
            value={formData.message}
            onChange={handleChange}
            placeholder="Describe your tour dates, routes, or corporate fleet requirements..."
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 disabled:bg-primary/50 text-white font-bold py-3 rounded-lg shadow-lg tracking-wider transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending Inquiry...</span>
            </>
          ) : (
            <>
              <span>Send Message Inquiry</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
