"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { Insight } from "@/lib/insights";

const TONES = {
  danger: { cls: "border-red-500/30 bg-red-500/[0.07] text-red-200", Icon: AlertTriangle },
  warning: { cls: "border-amber-400/30 bg-amber-500/[0.07] text-amber-200", Icon: AlertTriangle },
  info: { cls: "border-sky-400/30 bg-sky-500/[0.07] text-sky-200", Icon: Info },
  good: { cls: "border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-200", Icon: CheckCircle2 },
} as const;

export function InsightsStrip({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {insights.map((insight) => {
        const { cls, Icon } = TONES[insight.tone];
        return (
          <Link
            key={insight.id}
            href="/expenses"
            className={`flex items-start gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition-[filter] hover:brightness-110 ${cls}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{insight.text}</span>
          </Link>
        );
      })}
    </div>
  );
}