"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Wallet, Sparkles, Settings, ShieldCheck } from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Przegląd" },
  { href: "/subscriptions", icon: Wallet, label: "Subskrypcje" },
  { href: "/#advisor", icon: Sparkles, label: "Doradca AI" },
  { href: "/settings", icon: Settings, label: "Ustawienia" },
];

interface NavSidebarProps {
  monthlyCost?: number;
}

export function NavSidebar({ monthlyCost }: NavSidebarProps) {
  const pathname = usePathname();

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
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = href.startsWith("/#") ? false : pathname === href;

            return (
              <Link
                key={label}
                href={href}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                  isActive ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive ? (
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
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="glass-card p-4">
        <p className="text-xs text-muted-foreground">Miesięczne wydatki</p>
        <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
          {monthlyCost !== undefined ? `${monthlyCost.toFixed(2)} zł` : "—"}
        </p>
      </div>
    </aside>
  );
}