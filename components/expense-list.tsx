"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { EditExpenseDialog } from "@/components/expense-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatPLN } from "@/lib/analytics";
import { addDays, toISODate } from "@/lib/dates";
import { getExpenseCategoryMeta } from "@/lib/expense-categories";
import type { Expense } from "@/lib/use-expenses";

function dayLabel(date: string) {
  if (date === toISODate(new Date())) return "Dziś";
  if (date === toISODate(addDays(-1))) return "Wczoraj";
  return new Date(`${date}T00:00:00`).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function DeleteExpenseButton({ expense, onDeleted }: { expense: Expense; onDeleted: () => void }) {
  async function handleDelete() {
    const { error } = await supabase.from("expenses").delete().eq("id", expense.id);

    if (error) {
      toast.error("Nie udało się usunąć wydatku.", { description: error.message });
      return;
    }

    toast.success("Usunięto wydatek.");
    onDeleted();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <button
            aria-label={`Usuń wydatek: ${expense.description || "bez opisu"}`}
            className="-m-2 p-2 text-muted-foreground transition-colors hover:text-red-400 sm:m-0 sm:p-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        }
      />
      <AlertDialogContent className="glass-card border-emerald-500/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">Usunąć wydatek?</AlertDialogTitle>
          <AlertDialogDescription>
            Wydatek {formatPLN(expense.amount)}
            {expense.description ? ` (${expense.description})` : ""} zostanie trwale usunięty.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-500/90">
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const actionsClass =
  "flex shrink-0 items-center gap-5 transition-opacity sm:gap-3 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100";

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  monthName: string;
  onChanged: () => void;
}

export function ExpenseList({ expenses, loading, monthName, onChanged }: ExpenseListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-muted-foreground">
          <Receipt className="h-7 w-7" />
        </span>
        <p className="text-sm text-muted-foreground">Brak wydatków w miesiącu: {monthName}.</p>
        <p className="text-xs text-muted-foreground">Wpisz pierwszą kwotę w polu powyżej i wciśnij Enter.</p>
      </div>
    );
  }

  // Lista jest już posortowana malejąco po dacie, więc grupy powstają w dobrej kolejności.
  const groups = new Map<string, Expense[]>();
  for (const expense of expenses) {
    groups.set(expense.spent_on, [...(groups.get(expense.spent_on) ?? []), expense]);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...groups.entries()].map(([date, items]) => (
        <section key={date}>
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider capitalize text-muted-foreground">
              {dayLabel(date)}
            </h3>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {formatPLN(items.reduce((sum, e) => sum + e.amount, 0))}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((expense) => {
                const meta = getExpenseCategoryMeta(expense.category);
                const Icon = meta.icon;

                return (
                  <motion.div
                    key={expense.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-emerald-500/20 hover:bg-white/[0.04] sm:gap-4"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${meta.color}1F`, color: meta.color }}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium text-foreground sm:truncate">
                        {expense.description || meta.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{meta.label}</p>
                    </div>

                    <p className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
                      −{formatPLN(expense.amount)}
                    </p>

                    <div className={actionsClass}>
                      <EditExpenseDialog expense={expense} onUpdated={onChanged} />
                      <DeleteExpenseButton expense={expense} onDeleted={onChanged} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      ))}
    </div>
  );
}