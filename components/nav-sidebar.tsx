"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Wallet,
  Sparkles,
  Settings,
  ShieldCheck,
  FlaskConical,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { resetDemoData } from "@/lib/demo";
import { useIsDemoUser } from "@/lib/use-demo-user";
import { CommandPalette, OPEN_PALETTE_EVENT } from "@/components/command-palette";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Przegląd" },
  { href: "/subscriptions", icon: Wallet, label: "Subskrypcje" },
  { href: "/dashboard#advisor", icon: Sparkles, label: "Doradca AI" },
  { href: "/settings", icon: Settings, label: "Ustawienia" },
];

interface NavSidebarProps {
  monthlyCost?: number;
}

export function NavSidebar({ monthlyCost }: NavSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDemo = useIsDemoUser();
  const [resetting, setResetting] = useState(false);

  async function handleCreateAccount() {
    await supabase.auth.signOut();
    router.push("/login?mode=signup");
  }

  async function handleReset() {
    setResetting(true);
    const { error } = await resetDemoData();

    if (error) {
      setResetting(false);
      toast.error("Nie udało się zresetować danych demo.", { description: error });
      return;
    }

    toast.success("Dane demo zostały zresetowane.");
    window.location.reload();
  }

  return (
    <>
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-emerald-500/10 bg-white/[0.02] p-6">
        <div>
          <div className="mb-6 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              PayGuard
            </span>
          </div>

          <button
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
            className="mb-6 flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-emerald-500/30 hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Szukaj...</span>
            <kbd className="rounded border border-white/10 px-1.5 font-mono text-[10px]">Ctrl K</kbd>
          </button>

          <nav className="flex flex-col gap-1">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = href.includes("#") ? false : pathname === href;

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

        <div className="flex flex-col gap-4">
          {isDemo && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
              <div className="mb-1 flex items-center gap-2 text-emerald-400">
                <FlaskConical className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Tryb demo</span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Oglądasz przykładowe dane. Możesz je swobodnie edytować i usuwać.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCreateAccount}
                  className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-obsidian transition-all hover:bg-emerald-500/90 active:scale-[0.97]"
                >
                  Załóż konto
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  {resetting ? "Resetuję..." : "Resetuj dane demo"}
                </button>
              </div>
            </div>
          )}

          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground">Miesięczne wydatki</p>
            <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {monthlyCost !== undefined ? `${monthlyCost.toFixed(2)} zł` : "—"}
            </p>
          </div>
        </div>
      </aside>

      <CommandPalette />
    </>
  );
}