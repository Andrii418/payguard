"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Repeat,
  Receipt,
  Sparkles,
  Settings,
  ShieldCheck,
  FlaskConical,
  Search,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { resetDemoData } from "@/lib/demo";
import { formatPLN } from "@/lib/analytics";
import { monthKey } from "@/lib/dates";
import { useIsDemoUser } from "@/lib/use-demo-user";
import { useExpenses } from "@/lib/use-expenses";
import { useRecurringSync } from "@/lib/use-recurring-sync";
import { CommandPalette, OPEN_PALETTE_EVENT } from "@/components/command-palette";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Przegląd" },
  { href: "/expenses", icon: Receipt, label: "Wydatki" },
  { href: "/subscriptions", icon: Repeat, label: "Cykliczne" },
  { href: "/dashboard#advisor", icon: Sparkles, label: "Doradca AI" },
  { href: "/settings", icon: Settings, label: "Ustawienia" },
];

interface NavSidebarProps {
  // Zostawione dla zgodności ze stronami, które je jeszcze przekazują. Karta pokazuje teraz prawdziwe wydatki miesiąca.
  monthlyCost?: number;
}

export function NavSidebar(_props: NavSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDemo = useIsDemoUser();
  const [resetting, setResetting] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useRecurringSync();

  const month = monthKey();
  const { expenses } = useExpenses(month, 0);
  const monthSpent = expenses
    .filter((e) => e.spent_on.startsWith(month))
    .reduce((sum, e) => sum + e.amount, 0);

  // Panel jest "otwarty dla konkretnej ścieżki": po przejściu na inną stronę zamyka się sam.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const openDrawer = () => setOpenFor(pathname);
  const closeDrawer = () => setOpenFor(null);

  const openPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenFor(null);
    }

    const desktop = window.matchMedia("(min-width: 1024px)");
    function onBreakpoint() {
      if (desktop.matches) setOpenFor(null);
    }

    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

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

  function renderBody(variant: "desktop" | "drawer") {
    const mobile = variant === "drawer";

    return (
      <>
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                PayGuard
              </span>
            </div>
            {mobile && (
              <button
                ref={closeRef}
                onClick={closeDrawer}
                aria-label="Zamknij menu"
                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              closeDrawer();
              openPalette();
            }}
            className="mb-6 flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-emerald-500/30 hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Szukaj...</span>
            {!mobile && (
              <kbd className="rounded border border-white/10 px-1.5 font-mono text-[10px]">Ctrl K</kbd>
            )}
          </button>

          <nav className="flex flex-col gap-1">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = href.includes("#") ? false : pathname === href;

              return (
                <Link
                  key={label}
                  href={href}
                  onClick={closeDrawer}
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 text-sm transition-colors duration-200 ${
                    mobile ? "py-3" : "py-2.5"
                  } ${isActive ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId={mobile ? "nav-active-bg-mobile" : "nav-active-bg"}
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

        <div className="mt-8 flex flex-col gap-4">
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
                  className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-obsidian transition-all hover:bg-emerald-500/90 active:scale-[0.97]"
                >
                  Załóż konto
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  {resetting ? "Resetuję..." : "Resetuj dane demo"}
                </button>
              </div>
            </div>
          )}

          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground">Wydatki w tym miesiącu</p>
            <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {formatPLN(monthSpent)}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-emerald-500/10 bg-white/[0.02] p-6 lg:flex">
        {renderBody("desktop")}
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-white/[0.08] bg-obsidian/80 px-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={openDrawer}
          aria-label="Otwórz menu"
          aria-expanded={open}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-white/[0.06] active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span className="font-display text-base font-semibold text-foreground">PayGuard</span>
        </Link>

        {isDemo && (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
            Demo
          </span>
        )}

        <button
          onClick={openPalette}
          aria-label="Szukaj"
          className="-mr-2 ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground active:scale-95"
        >
          <Search className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDrawer} aria-hidden />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menu nawigacji"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.4, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70 || info.velocity.x < -400) closeDrawer();
              }}
              className="absolute left-0 top-0 flex h-dvh w-[84%] max-w-[300px] flex-col justify-between overflow-y-auto border-r border-emerald-500/15 bg-[#0b0d13]/95 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl"
            >
              {renderBody("drawer")}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette />
    </>
  );
}