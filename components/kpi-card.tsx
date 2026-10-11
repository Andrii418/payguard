"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";

type Accent = "emerald" | "violet" | "sky" | "amber";

// Pełne nazwy klas (nie sklejane dynamicznie), żeby Tailwind je wykrył.
const ACCENTS: Record<Accent, { chip: string; blob: string }> = {
  emerald: { chip: "bg-emerald-500/10 text-emerald-400", blob: "bg-emerald-500" },
  violet: { chip: "bg-violet-500/10 text-violet-300", blob: "bg-violet-500" },
  sky: { chip: "bg-sky-500/10 text-sky-300", blob: "bg-sky-500" },
  amber: { chip: "bg-amber-500/10 text-amber-300", blob: "bg-amber-500" },
};

interface KpiCardProps {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  icon: LucideIcon;
  accent?: Accent;
  hint?: string;
  index?: number;
}

export function KpiCard({
  label,
  value,
  decimals = 0,
  suffix,
  icon: Icon,
  accent = "emerald",
  hint,
  index = 0,
}: KpiCardProps) {
  const a = ACCENTS[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="glass-card group flex h-full flex-col justify-between overflow-hidden p-5"
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-45 ${a.blob}`}
      />

      <div className="relative flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.chip}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="relative mt-6">
        <p className="font-mono text-3xl font-semibold tabular-nums text-foreground">
          <AnimatedNumber value={value} decimals={decimals} />
          {suffix && <span className="ml-1.5 text-base font-normal text-muted-foreground">{suffix}</span>}
        </p>
        {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </motion.div>
  );
}