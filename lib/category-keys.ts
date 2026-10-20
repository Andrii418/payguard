export const CATEGORY_KEYS = [
  "food",
  "transport",
  "home",
  "bills",
  "health",
  "shopping",
  "fun",
  "work",
  "other",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];