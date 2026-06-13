"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Trash2, CheckCircle2, XCircle, Award } from "lucide-react";

interface Testimonial {
  id: string;
  authorName: string;
  authorRole?: string | null;
  companyName?: string | null;
  content: string;
  rating: number;
  isFeatured: boolean;
  status: "APPROVED" | "PENDING" | "REJECTED";
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock load testimonials (in production fetched from /api/testimonials)
    const mockTestimonials: Testimonial[] = [
      {
        id: "1",
        authorName: "Rahul Mehta",
        authorRole: "HR Lead",
        companyName: "TCS",
        content: "Managing employee shifts used to take hours. Temp Travel's bulk roster tool changed everything.",
        rating: 5,
        isFeatured: true,
        status: "APPROVED"
      },
      {
        id: "2",
        authorName: "Preeti Sharma",
        authorRole: "Traveler",
        content: "Booked a Mahabaleshwar package. The Innova Crysta was clean and driver was polite.",
        rating: 5,
        isFeatured: false,
        status: "PENDING"
      }
    ];
    setTestimonials(mockTestimonials);
    setLoading(false);
  }, []);

  const handleStatusChange = (id: string, newStatus: "APPROVED" | "PENDING" | "REJECTED") => {
    setTestimonials(
      testimonials.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const handleToggleFeatured = (id: string) => {
    setTestimonials(
      testimonials.map((t) => (t.id === id ? { ...t, isFeatured: !t.isFeatured } : t))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      setTestimonials(testimonials.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-8 h-8 text-accent" />
            <span>Testimonials Moderation Log</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit customer feedback, approve ratings, and pin featured stories to the homepage.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading reviews...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-slate-900 border border-white/5 p-6 rounded-xl space-y-4 hover:border-primary/45 transition-all flex flex-col justify-between">
              
              <div className="space-y-3">
                {/* Rating & Feature */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <button
                    onClick={() => handleToggleFeatured(t.id)}
                    className={`flex items-center gap-1 text-[9px] font-bold py-0.5 px-2 rounded-full border transition-colors ${
                      t.isFeatured
                        ? "bg-accent/10 text-accent border-accent/20"
                        : "bg-white/5 text-slate-500 border-white/5 hover:text-slate-300"
                    }`}
                  >
                    <Award className="w-3 h-3" />
                    <span>{t.isFeatured ? "FEATURED" : "PIN TO HOME"}</span>
                  </button>
                </div>

                {/* Content */}
                <p className="text-slate-300 text-xs italic leading-relaxed">"{t.content}"</p>
                
                {/* Author profile */}
                <div className="pt-3 border-t border-white/5">
                  <div className="font-bold text-slate-200 text-xs">{t.authorName}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{t.authorRole} {t.companyName ? `at ${t.companyName}` : ""}</div>
                </div>
              </div>

              {/* Status and Action CTAs */}
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border ${
                  t.status === "APPROVED"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : t.status === "PENDING"
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {t.status}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(t.id, "APPROVED")}
                    className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-green-400 transition-colors"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleStatusChange(t.id, "REJECTED")}
                    className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <XCircle className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
