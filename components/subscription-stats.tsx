"use client";

import { Flame, Layers, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import type { Subscription } from "@/lib/use-subscriptions";
import { activeCategories, formatPLN, monthlyEquivalent, totalMonthly } from "@/lib/analytics";
import { AnimatedNumber } from "@/components/animated-number";

interface TileProps {
  label: string;
  icon: LucideIcon;
  tone: string;
  hint?: string;
  children: React.ReactNode;
}

function Tile({ label, icon: Icon, tone, hint, children }: TileProps) {
  return (
    <div className="glass-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="truncate font-mono text-xl font-semibold tabular-nums text-foreground">{children}</p>
      {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SubscriptionStats({ subscriptions }: { subscriptions: Subscription[] }) {
  const monthly = totalMonthly(subscriptions);
  const categories = activeCategories(subscriptions).length;
  const top = [...subscriptions].sort((a, b) => monthlyEquivalent(b) - monthlyEquivalent(a))[0];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Tile label="Miesięcznie" icon={Wallet} tone="bg-emerald-500/10 text-emerald-300" hint="łączny koszt">
        <AnimatedNumber value={monthly} />
        <span className="ml-1.5 text-sm font-normal text-muted-foreground">zł</span>
      </Tile>

      <Tile label="Rocznie" icon={TrendingUp} tone="bg-violet-500/10 text-violet-300" hint="przy obecnych subskrypcjach">
        <AnimatedNumber value={monthly * 12} decimals={0} />
        <span className="ml-1.5 text-sm font-normal text-muted-foreground">zł</span>
      </Tile>

      <Tile
        label="Subskrypcje"
        icon={Layers}
        tone="bg-sky-500/10 text-sky-300"
        hint={`w ${categories} ${categories === 1 ? "kategorii" : "kategoriach"}`}
      >
        <AnimatedNumber value={subscriptions.length} decimals={0} />
      </Tile>

      <Tile
        label="Najdroższa"
        icon={Flame}
        tone="bg-amber-500/10 text-amber-300"
        hint={top ? `${formatPLN(monthlyEquivalent(top))} / mies.` : undefined}
      >
        {top ? top.name : "—"}
      </Tile>
    </div>
  );
}