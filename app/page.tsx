"use client";

import { NavSidebar } from "@/components/nav-sidebar";
import { KpiCard } from "@/components/kpi-card";
import { Wallet, TrendingDown, CalendarClock, Layers } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex">
      <NavSidebar />

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Przegląd finansowy
          </h1>
          <p className="mt-1 text-sm text-muted">
            Twoje subskrypcje pod kontrolą — na żywo.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Miesięczny koszt" value={247.5} suffix=" zł" icon={Wallet} glow />
          <KpiCard label="Aktywne subskrypcje" value={8} icon={Layers} />
          <KpiCard label="Możliwe oszczędności" value={62} suffix=" zł" icon={TrendingDown} />
          <KpiCard label="Najbliższe odnowienie" value={3} suffix=" dni" icon={CalendarClock} />
        </section>

        <section className="glass-card mt-6 flex h-64 items-center justify-center">
          <p className="text-sm text-muted">
            Wykresy i lista subskrypcji pojawią się w Etapie 2 i 4.
          </p>
        </section>
      </main>
    </div>
  );
}