"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingDown } from "lucide-react";

const bars = [38, 62, 45, 80, 55, 70];

export function DashboardPreview() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="glass-card relative mx-auto w-full max-w-md p-5"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

      {/* Pasek tytułowy jak w oknie aplikacji */}
      <div className="relative mb-4 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
      </div>

      <div className="relative grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-500/15 bg-white/[0.03] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" />
            <span className="text-[11px]">Miesięczny koszt</span>
          </div>
          <p className="font-mono text-lg font-semibold text-foreground">247,50 zł</p>
        </div>
        <div className="rounded-xl border border-emerald-500/15 bg-white/[0.03] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
            <TrendingDown className="h-3.5 w-3.5" />
            <span className="text-[11px]">Oszczędności</span>
          </div>
          <p className="font-mono text-lg font-semibold text-emerald-400">62 zł</p>
        </div>
      </div>

      <div className="relative mt-4 flex h-20 items-end gap-2 rounded-xl border border-emerald-500/15 bg-white/[0.02] p-3">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-500/40 to-emerald-400"
          />
        ))}
      </div>

      <div className="relative mt-4 flex items-center justify-between rounded-xl border border-emerald-500/15 bg-white/[0.02] px-3 py-2.5">
        <span className="text-sm text-foreground">Netflix</span>
        <span className="font-mono text-xs text-emerald-400">43,99 zł/mies.</span>
      </div>
    </motion.div>
  );
}