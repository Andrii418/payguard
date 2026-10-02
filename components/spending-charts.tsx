"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import type { Subscription } from "@/lib/use-subscriptions";

const categoryLabels: Record<string, string> = {
  streaming: "Streaming",
  software: "Oprogramowanie",
  cloud: "Chmura",
  other: "Inne",
};

const monthNames = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];

function monthlyEquivalent(s: Subscription) {
  return s.billing_cycle === "monthly" ? s.price : s.price / 12;
}

export function SpendingCharts({ subscriptions }: { subscriptions: Subscription[] }) {
  // Podział kosztów wg kategorii
  const categoryTotals = subscriptions.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + monthlyEquivalent(s);
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals).map(([category, total]) => ({
    category: categoryLabels[category] ?? category,
    total: Math.round(total * 100) / 100,
  }));

  // Prognoza "burn rate" - skumulowany koszt na najbliższe 6 miesięcy
  const totalMonthly = subscriptions.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
  const now = new Date();

  const burnRateData = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (now.getMonth() + i) % 12;
    return {
      month: monthNames[monthIndex],
      total: Math.round(totalMonthly * (i + 1) * 100) / 100,
    };
  });

  const tooltipStyle = {
    background: "#0d0f16",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: 8,
    fontSize: 12,
  };

  return (
    <>
      <div className="glass-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
          Wydatki wg kategorii
        </h2>
        {categoryData.length === 0 ? (
          <p className="text-sm text-muted">Brak danych do wyświetlenia.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="category" stroke="#8B93A5" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B93A5" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#F5F7FA" }}
                formatter={(value) => [`${value} zł`, "Koszt miesięczny"]}
              />
              <Bar dataKey="total" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
          Prognoza wydatków (burn rate)
        </h2>
        {totalMonthly === 0 ? (
          <p className="text-sm text-muted">Brak danych do wyświetlenia.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={burnRateData}>
              <defs>
                <linearGradient id="burnRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#8B93A5" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B93A5" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#F5F7FA" }}
                formatter={(value) => [`${value} zł`, "Skumulowany koszt"]}
              />
              <Area type="monotone" dataKey="total" stroke="#34D399" strokeWidth={2} fill="url(#burnRateGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}