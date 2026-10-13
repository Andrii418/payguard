"use client";

import { useEffect, useRef } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import type { Subscription } from "@/lib/use-subscriptions";
import type { SortOption, SubscriptionFilters } from "@/lib/filter-subscriptions";
import { activeCategories } from "@/lib/analytics";
import { getCategoryMeta } from "@/lib/category-meta";
import type { ViewMode } from "@/components/subscription-list";

const selectClass =
  "h-10 rounded-md border border-emerald-500/20 bg-white/[0.03] px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-emerald-500/50 [&>option]:bg-[#0d0f16] [&>option]:text-foreground";

interface SubscriptionToolbarProps {
  subscriptions: Subscription[];
  filters: SubscriptionFilters;
  onChange: (filters: SubscriptionFilters) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  shown: number;
  total: number;
}

export function SubscriptionToolbar({
  subscriptions,
  filters,
  onChange,
  view,
  onViewChange,
  shown,
  total,
}: SubscriptionToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Skrot "/" ustawia fokus w wyszukiwarce (jak w GitHubie), o ile nie piszesz akurat w innym polu.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const chips = [
    { value: "all", label: "Wszystkie", color: null as string | null, count: subscriptions.length },
    ...activeCategories(subscriptions).map((c) => ({
      value: c,
      label: getCategoryMeta(c).short,
      color: getCategoryMeta(c).color as string | null,
      count: subscriptions.filter((s) => s.category === c).length,
    })),
  ];

  return (
    <div className="mb-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Szukaj po nazwie..."
            aria-label="Szukaj subskrypcji"
            className="h-10 w-full rounded-md border border-emerald-500/20 bg-white/[0.03] pl-9 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-emerald-500/50"
          />
          {filters.query ? (
            <button
              onClick={() => onChange({ ...filters, query: "" })}
              aria-label="Wyczyść wyszukiwanie"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 px-1.5 font-mono text-[10px] text-muted-foreground">
              /
            </kbd>
          )}
        </div>

        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortOption })}
          aria-label="Sortuj"
          className={selectClass}
        >
          <option value="renewal">Najbliższe odnowienie</option>
          <option value="price-desc">Cena: od najwyższej</option>
          <option value="price-asc">Cena: od najniższej</option>
          <option value="name">Nazwa A–Z</option>
        </select>

        <div
          role="group"
          aria-label="Widok"
          className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5"
        >
          {(
            [
              ["list", List, "Lista"],
              ["grid", LayoutGrid, "Kafelki"],
            ] as const
          ).map(([v, Icon, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              aria-pressed={view === v}
              aria-label={label}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                view === v ? "bg-emerald-500/15 text-emerald-300" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {chips.map((chip) => {
          const active = filters.category === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ ...filters, category: chip.value })}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                active && !chip.color
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : !active
                    ? "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                    : ""
              }`}
              style={
                active && chip.color
                  ? { borderColor: `${chip.color}80`, backgroundColor: `${chip.color}1A`, color: chip.color }
                  : undefined
              }
            >
              {chip.color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chip.color }} />}
              {chip.label}
              <span className="font-mono tabular-nums opacity-70">{chip.count}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Wyświetlono <span className="font-mono text-foreground">{shown}</span> z{" "}
        <span className="font-mono text-foreground">{total}</span>
      </p>
    </div>
  );
}