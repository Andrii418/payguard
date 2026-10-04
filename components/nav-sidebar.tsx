"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Wallet, Sparkles, Settings, ShieldCheck } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Przegląd", active: true },
  { icon: Wallet, label: "Subskrypcje" },
  { icon: Sparkles, label: "Doradca AI" },
  { icon: Settings, label: "Ustawienia" },
];

export function NavSidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-emerald-500/10 bg-white/[0.02] p-6">
      <div>
        <div className="mb-10 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            PayGuard
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                active ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active ? (
                <motion.span
                  layoutId="nav-active-bg"
                  className="absolute inset-0 rounded-lg bg-emerald-500/10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              ) : (
                <span className="absolute inset-0 rounded-lg bg-white/0 transition-colors duration-200 group-hover:bg-white/[0.04]" />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="glass-card p-4">
        <p className="text-xs text-muted-foreground">Miesięczne wydatki</p>
        <p className="font-mono text-lg font-semibold tabular-nums text-foreground">247,50 zł</p>
      </div>
    </aside>
  );
}