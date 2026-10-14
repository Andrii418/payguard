import {
  Car,
  HeartPulse,
  Home,
  Receipt,
  Repeat,
  ShoppingBag,
  Tag,
  Ticket,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export const EXPENSE_CATEGORY_KEYS = [
  "food",
  "transport",
  "home",
  "bills",
  "health",
  "shopping",
  "fun",
  "other",
] as const;

export type ExpenseCategoryKey = (typeof EXPENSE_CATEGORY_KEYS)[number];

export interface ExpenseCategoryMeta {
  label: string;
  color: string;
  icon: LucideIcon;
}

export const EXPENSE_CATEGORY_META: Record<ExpenseCategoryKey, ExpenseCategoryMeta> = {
  food: { label: "Jedzenie", color: "#FB923C", icon: UtensilsCrossed },
  transport: { label: "Transport", color: "#38BDF8", icon: Car },
  home: { label: "Dom", color: "#A78BFA", icon: Home },
  bills: { label: "Rachunki", color: "#F472B6", icon: Receipt },
  health: { label: "Zdrowie", color: "#34D399", icon: HeartPulse },
  shopping: { label: "Zakupy", color: "#FBBF24", icon: ShoppingBag },
  fun: { label: "Rozrywka", color: "#22D3EE", icon: Ticket },
  other: { label: "Inne", color: "#94A3B8", icon: Tag },
};

// "Subskrypcje" to kategoria wirtualna: liczona z listy subskrypcji, a nie z tabeli wydatków.
export const SUBSCRIPTIONS_CATEGORY: ExpenseCategoryMeta = {
  label: "Subskrypcje",
  color: "#818CF8",
  icon: Repeat,
};

export function getExpenseCategoryMeta(category: string): ExpenseCategoryMeta {
  if (category === "subscriptions") return SUBSCRIPTIONS_CATEGORY;
  return EXPENSE_CATEGORY_META[category as ExpenseCategoryKey] ?? EXPENSE_CATEGORY_META.other;
}