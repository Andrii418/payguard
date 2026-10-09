"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { SortOption, SubscriptionFilters } from "@/lib/filter-subscriptions";

// Zwykłe natywne <select> zamiast komponentu Select - prostsze, niezawodne
// i w pełni dostępne (klawiatura, czytniki ekranu, mobile).
const selectClass =
  "h-9 rounded-md border border-emerald-500/20 bg-white/[0.03] px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-emerald-500/50 [&>option]:bg-[#0d0f16] [&>option]:text-foreground";

interface SubscriptionFiltersBarProps {
  filters: SubscriptionFilters;
  onChange: (filters: SubscriptionFilters) => void;
  shown: number;
  total: number;
}

export function SubscriptionFiltersBar({
  filters,
  onChange,
  shown,
  total,
}: SubscriptionFiltersBarProps) {
  return (
    <div className="mb-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Szukaj po nazwie..."
            aria-label="Szukaj subskrypcji"
            className="pl-9 pr-9"
          />
          {filters.query && (
            <button
              onClick={() => onChange({ ...filters, query: "" })}
              aria-label="Wyczyść wyszukiwanie"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          aria-label="Filtruj wg kategorii"
          className={selectClass}
        >
          <option value="all">Wszystkie kategorie</option>
          <option value="streaming">Streaming</option>
          <option value="software">Oprogramowanie</option>
          <option value="cloud">Chmura / Hosting</option>
          <option value="other">Inne</option>
        </select>

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
      </div>

      <p className="text-xs text-muted-foreground">
        Wyświetlono <span className="font-mono text-foreground">{shown}</span> z{" "}
        <span className="font-mono text-foreground">{total}</span>
      </p>
    </div>
  );
}