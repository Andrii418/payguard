import type { Subscription } from "@/lib/use-subscriptions";

export type SortOption = "renewal" | "price-desc" | "price-asc" | "name";

export interface SubscriptionFilters {
  query: string;
  category: string; // "all" albo konkretna kategoria
  sort: SortOption;
}

export const defaultFilters: SubscriptionFilters = {
  query: "",
  category: "all",
  sort: "renewal",
};

// Do sortowania po cenie porównujemy koszt MIESIĘCZNY - inaczej roczna
// subskrypcja za 120 zł wyglądałaby na droższą niż miesięczna za 50 zł.
function monthlyEquivalent(s: Subscription) {
  return s.billing_cycle === "monthly" ? s.price : s.price / 12;
}

export function filterAndSortSubscriptions(
  subscriptions: Subscription[],
  filters: SubscriptionFilters
): Subscription[] {
  const query = filters.query.trim().toLowerCase();

  const filtered = subscriptions.filter((s) => {
    const matchesCategory = filters.category === "all" || s.category === filters.category;
    const matchesQuery = query === "" || s.name.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  return [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case "price-desc":
        return monthlyEquivalent(b) - monthlyEquivalent(a);
      case "price-asc":
        return monthlyEquivalent(a) - monthlyEquivalent(b);
      case "name":
        return a.name.localeCompare(b.name, "pl");
      case "renewal":
      default:
        return new Date(a.next_renewal).getTime() - new Date(b.next_renewal).getTime();
    }
  });
}