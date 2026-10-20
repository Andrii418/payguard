import { CATEGORY_KEYS } from "@/lib/category-keys";
import { getExpenseCategoryMeta } from "@/lib/expense-categories";

export interface CategoryMeta {
  label: string;
  short: string;
  color: string;
}

export const CATEGORY_ORDER = CATEGORY_KEYS;

export function getCategoryMeta(category: string): CategoryMeta {
  const { label, short, color } = getExpenseCategoryMeta(category);
  return { label, short, color };
}