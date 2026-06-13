"use client";

import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { TrendingUp, Users } from "lucide-react";

interface DashboardChartsProps {
  monthlyRevenueData: Array<{ month: string; revenue: number; bookings: number }>;
  leadConversionsData: Array<{ name: string; total: number; converted: number }>;
}

export default function DashboardCharts({ monthlyRevenueData, leadConversionsData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Revenue Line Chart */}
      <div className="lg:col-span-8 glassmorphism p-6 rounded-xl border border-white/5 space-y-4">
        <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <span>Monthly Revenue & Rides Analytics</span>
        </h2>
        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }} 
                labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="Revenue (INR)" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="bookings" stroke="#f59e0b" strokeWidth={2} name="Total Rides" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lead conversions Bar Chart */}
      <div className="lg:col-span-4 glassmorphism p-6 rounded-xl border border-white/5 space-y-4">
        <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          <span>Lead Conversions Pipeline</span>
        </h2>
        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadConversionsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
              />
              <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
              <Bar dataKey="total" fill="#475569" name="Inquiries Received" radius={[4, 4, 0, 0]} />
              <Bar dataKey="converted" fill="#f59e0b" name="Converted Booking" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
