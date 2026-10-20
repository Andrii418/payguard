import {
  Briefcase,
  Car,
  HeartPulse,
  Home,
  Receipt,
  ShoppingBag,
  Tag,
  Ticket,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { CATEGORY_KEYS, type CategoryKey } from "@/lib/category-keys";

export const EXPENSE_CATEGORY_KEYS = CATEGORY_KEYS;
export type ExpenseCategoryKey = CategoryKey;

export interface ExpenseCategoryMeta {
  label: string;
  short: string;
  color: string;
  icon: LucideIcon;
}

export const EXPENSE_CATEGORY_META: Record<ExpenseCategoryKey, ExpenseCategoryMeta> = {
  food: { label: "Jedzenie", short: "Jedzenie", color: "#FB923C", icon: UtensilsCrossed },
  transport: { label: "Transport", short: "Transport", color: "#38BDF8", icon: Car },
  home: { label: "Dom", short: "Dom", color: "#A78BFA", icon: Home },
  bills: { label: "Rachunki", short: "Rachunki", color: "#F472B6", icon: Receipt },
  health: { label: "Zdrowie", short: "Zdrowie", color: "#34D399", icon: HeartPulse },
  shopping: { label: "Zakupy", short: "Zakupy", color: "#FBBF24", icon: ShoppingBag },
  fun: { label: "Rozrywka", short: "Rozrywka", color: "#22D3EE", icon: Ticket },
  work: { label: "Praca i rozwój", short: "Praca", color: "#818CF8", icon: Briefcase },
  other: { label: "Inne", short: "Inne", color: "#94A3B8", icon: Tag },
};

// Stare nazwy kategorii (sprzed połączenia subskrypcji i wydatków) - dla pewności, gdyby jakiś rekord je miał.
const LEGACY_ALIASES: Record<string, ExpenseCategoryKey> = {
  streaming: "fun",
  software: "work",
  cloud: "work",
};

export function getExpenseCategoryMeta(category: string): ExpenseCategoryMeta {
  const key = LEGACY_ALIASES[category] ?? category;
  return EXPENSE_CATEGORY_META[key as ExpenseCategoryKey] ?? EXPENSE_CATEGORY_META.other;
}