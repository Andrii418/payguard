import { z } from "zod";

const money = z.number().min(-10_000_000).max(10_000_000);
const percent = z.number().min(-100_000).max(100_000);
const text = (max: number) => z.string().max(max);

// Migawka budżetu wysyłana do Gemini. Wszystkie liczby są policzone po stronie aplikacji.
export const budgetSnapshotSchema = z.object({
  monthLabel: text(40),
  isCurrentMonth: z.boolean(),
  dayOfMonth: z.number().int().min(1).max(31),
  daysInMonth: z.number().int().min(28).max(31),
  daysLeft: z.number().int().min(0).max(31),
  totals: z.object({
    spent: money,
    fixed: money,
    variable: money,
    scheduledRemaining: money,
    projected: money.nullable(),
    dailyAverageVariable: money,
  }),
  budget: z.object({
    limit: money.nullable(),
    usagePercent: percent.nullable(),
    remaining: money.nullable(),
    freePerDay: money.nullable(),
  }),
  previous: z.object({
    monthLabel: text(40),
    spentSamePeriod: money,
    spentTotal: money,
    changePercent: percent.nullable(),
  }),
  categories: z
    .array(
      z.object({
        label: text(40),
        spent: money,
        sharePercent: percent,
        limit: money.nullable(),
        limitUsagePercent: percent.nullable(),
        previousSamePeriod: money,
      })
    )
    .max(12),
  recurring: z
    .array(
      z.object({
        name: text(60),
        category: text(40),
        kind: z.enum(["subscription", "fixed"]),
        monthlyAmount: money,
        billing: z.enum(["monthly", "yearly"]),
        daysUntilNext: z.number().int().min(-100_000).max(100_000),
      })
    )
    .max(60),
  recurringMonthlyTotal: money,
  largestVariable: z.array(z.object({ category: text(40), amount: money })).max(5),
  expenseCount: z.number().int().min(0).max(1_000_000),
});

export type BudgetSnapshot = z.infer<typeof budgetSnapshotSchema>;

// Odpowiedź AI. Schemat jest łagodny: za długie teksty przycinamy, brakujące listy zamieniamy na puste.
const clip = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .transform((s) => s.slice(0, max));

const severity = z.enum(["low", "medium", "high"]).catch("medium");

export const budgetAdviceSchema = z.object({
  headline: clip(220),
  summary: clip(800),
  risks: z
    .array(z.object({ title: clip(120), detail: clip(400).catch(""), severity }))
    .transform((a) => a.slice(0, 4))
    .catch([]),
  savings: z
    .array(
      z.object({
        title: clip(120),
        detail: clip(400).catch(""),
        monthlySaving: z.coerce.number().min(0).max(100_000).catch(0),
      })
    )
    .transform((a) => a.slice(0, 5))
    .catch([]),
  actions: z
    .array(clip(240))
    .transform((a) => a.slice(0, 5))
    .catch([]),
});

export type BudgetAdvice = z.infer<typeof budgetAdviceSchema>;