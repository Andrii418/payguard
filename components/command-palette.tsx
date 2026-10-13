"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Download,
  Home,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  Plus,
  Search,
  Settings,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { exportSubscriptionsToCsv } from "@/lib/export-csv";
import { formatPLN, monthlyEquivalent } from "@/lib/analytics";
import { getCategoryMeta } from "@/lib/category-meta";
import type { Subscription } from "@/lib/use-subscriptions";

// Przycisk w menu bocznym otwiera palete przez to zdarzenie - komponenty nie musza sie znac.
export const OPEN_PALETTE_EVENT = "payguard:open-palette";

const groupClass =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground";

interface PaletteItemProps {
  icon: LucideIcon;
  label: string;
  hint?: string;
  keywords?: string[];
  color?: string;
  onSelect: () => void;
}

function PaletteItem({ icon: Icon, label, hint, keywords, color, onSelect }: PaletteItemProps) {
  return (
    <Command.Item
      value={label}
      keywords={keywords}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground outline-none data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-foreground"
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.05]"
        style={color ? { backgroundColor: `${color}1F`, color } : undefined}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {hint && <span className="font-mono text-xs text-muted-foreground">{hint}</span>}
    </Command.Item>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    function onOpenEvent() {
      setOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    };
  }, []);

  // Swieze dane przy kazdym otwarciu palety
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    supabase
      .from("subscriptions")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (!cancelled) setSubscriptions((data as Subscription[]) ?? []);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  function go(path: string) {
    setOpen(false);
    router.push(path);
  }

  function handleExport() {
    setOpen(false);
    if (subscriptions.length === 0) {
      toast.error("Brak subskrypcji do wyeksportowania.");
      return;
    }
    exportSubscriptionsToCsv(subscriptions);
    toast.success("Plik CSV został pobrany.");
  }

  async function handleSignOut() {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[14vh]"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Paleta komend"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0b0d13]/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
          >
            <Command label="Paleta komend" loop>
              <div className="flex items-center gap-3 border-b border-white/10 px-4">
                <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
                <Command.Input
                  autoFocus
                  placeholder="Wpisz komendę lub nazwę subskrypcji..."
                  className="h-14 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
                <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  esc
                </kbd>
              </div>

              <Command.List className="max-h-[360px] overflow-y-auto p-2">
                <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
                  Nic nie znaleziono.
                </Command.Empty>

                <Command.Group heading="Nawigacja" className={groupClass}>
                  <PaletteItem icon={LayoutDashboard} label="Przegląd" keywords={["dashboard", "pulpit"]} onSelect={() => go("/dashboard")} />
                  <PaletteItem icon={Wallet} label="Subskrypcje" keywords={["lista"]} onSelect={() => go("/subscriptions")} />
                  <PaletteItem icon={Sparkles} label="Doradca AI" keywords={["gemini", "oszczędności"]} onSelect={() => go("/dashboard#advisor")} />
                  <PaletteItem icon={Settings} label="Ustawienia" keywords={["konto", "plan", "budżet"]} onSelect={() => go("/settings")} />
                  <PaletteItem icon={Home} label="Strona główna" keywords={["landing"]} onSelect={() => go("/")} />
                </Command.Group>

                <Command.Group heading="Akcje" className={groupClass}>
                  <PaletteItem icon={Plus} label="Dodaj subskrypcję" keywords={["nowa", "utwórz"]} onSelect={() => go("/subscriptions?new=1")} />
                  <PaletteItem icon={Download} label="Eksportuj do CSV" keywords={["pobierz", "excel"]} onSelect={handleExport} />
                  <PaletteItem icon={PiggyBank} label="Ustaw limit budżetu" keywords={["budżet", "limit"]} onSelect={() => go("/settings")} />
                  <PaletteItem icon={LogOut} label="Wyloguj się" keywords={["wyjdź", "logout"]} onSelect={handleSignOut} />
                </Command.Group>

                {subscriptions.length > 0 && (
                  <Command.Group heading="Twoje subskrypcje" className={groupClass}>
                    {subscriptions.map((sub) => {
                      const meta = getCategoryMeta(sub.category);
                      return (
                        <PaletteItem
                          key={sub.id}
                          icon={Wallet}
                          label={sub.name}
                          hint={formatPLN(monthlyEquivalent(sub))}
                          keywords={[meta.label, meta.short]}
                          color={meta.color}
                          onSelect={() => go(`/subscriptions?q=${encodeURIComponent(sub.name)}`)}
                        />
                      );
                    })}
                  </Command.Group>
                )}
              </Command.List>

              <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2.5 text-[11px] text-muted-foreground">
                <span><kbd className="font-mono">↑↓</kbd> nawigacja</span>
                <span><kbd className="font-mono">↵</kbd> wybierz</span>
                <span><kbd className="font-mono">esc</kbd> zamknij</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}