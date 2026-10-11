export interface CategoryMeta {
  label: string;
  short: string;
  color: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  streaming: { label: "Streaming", short: "Streaming", color: "#A78BFA" },
  software: { label: "Oprogramowanie", short: "Software", color: "#38BDF8" },
  cloud: { label: "Chmura / Hosting", short: "Chmura", color: "#34D399" },
  other: { label: "Inne", short: "Inne", color: "#FBBF24" },
};

export const CATEGORY_ORDER = ["streaming", "software", "cloud", "other"] as const;

export function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category] ?? { label: category, short: category, color: "#8B93A5" };
}