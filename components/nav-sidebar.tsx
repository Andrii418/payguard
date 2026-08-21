"use client";

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
        {/* Logo */}
        <div className="mb-10 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            PayGuard
          </span>
        </div>

        {/* Nawigacja */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-muted hover:bg-white/[0.04] hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Status konta na dole */}
      <div className="glass-card p-4">
        <p className="text-xs text-muted">Miesięczne wydatki</p>
        <p className="font-mono text-lg font-semibold text-foreground">247,50 zł</p>
      </div>
    </aside>
  );
}