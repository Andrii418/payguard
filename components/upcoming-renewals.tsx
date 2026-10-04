"use client";

import type { Subscription } from "@/lib/use-subscriptions";
import { CalendarClock } from "lucide-react";

export function UpcomingRenewals({ subscriptions }: { subscriptions: Subscription[] }) {
  const today = new Date();

  const upcoming = subscriptions
    .map((s) => ({
      ...s,
      daysUntil: Math.ceil((new Date(s.next_renewal).getTime() - today.getTime()) / 86400000),
    }))
    .filter((s) => s.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  return (
    <div className="glass-card p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
        Nadchodzące odnowienia
      </h2>

      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak zaplanowanych odnowień.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarClock className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-foreground">{s.name}</span>
              </div>
              <span className={`font-mono text-xs ${s.daysUntil <= 3 ? "text-red-400" : "text-muted-foreground"}`}>
                {s.daysUntil === 0 ? "dziś" : `za ${s.daysUntil} dni`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
