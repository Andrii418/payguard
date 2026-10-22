"use client";

import { motion } from "framer-motion";
import type { Subscription } from "@/lib/use-subscriptions";
import { daysUntil, formatPLN } from "@/lib/analytics";
import { getCategoryMeta } from "@/lib/category-meta";

function pillClass(days: number) {
  if (days <= 3) return "bg-red-500/10 text-red-300";
  if (days <= 7) return "bg-amber-500/10 text-amber-300";
  return "bg-white/[0.05] text-muted-foreground";
}

export function UpcomingRenewals({ subscriptions }: { subscriptions: Subscription[] }) {
  const upcoming = subscriptions
    .map((sub) => ({ sub, days: daysUntil(sub.next_renewal) }))
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  return (
    <div className="glass-card h-full p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Najbliższe płatności</h2>
      <p className="mb-5 mt-0.5 text-xs text-muted-foreground">Subskrypcje i opłaty stałe</p>

      {upcoming.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Brak zaplanowanych płatności cyklicznych.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {upcoming.map(({ sub, days }, i) => {
            const meta = getCategoryMeta(sub.category);
            const date = new Date(`${sub.next_renewal}T00:00:00`);

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
              >
                <div
                  className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
                >
                  <span className="font-mono text-base font-semibold leading-none">{date.getDate()}</span>
                  <span className="mt-0.5 text-[10px] uppercase">
                    {date.toLocaleDateString("pl-PL", { month: "short" })}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">{meta.short}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-sm tabular-nums text-foreground">{formatPLN(sub.price)}</span>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${pillClass(days)}`}>
                    {days === 0 ? "dziś" : `za ${days} dni`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}