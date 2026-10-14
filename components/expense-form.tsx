"use client";

import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { expenseSchema } from "@/lib/expense-schema";
import { EXPENSE_CATEGORY_KEYS, EXPENSE_CATEGORY_META } from "@/lib/expense-categories";
import { formatPLN } from "@/lib/analytics";
import { toISODate } from "@/lib/dates";
import { track } from "@/lib/tracking";
import { ctaPrimary } from "@/lib/ui-classes";
import type { Expense } from "@/lib/use-expenses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const fieldClass =
  "h-10 w-full rounded-md border border-emerald-500/20 bg-white/[0.03] px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-emerald-500/50 aria-invalid:border-red-500/60 [color-scheme:dark] [&>option]:bg-[#0d0f16] [&>option]:text-foreground";

type FieldName = "amount" | "category" | "description" | "spent_on";
type FieldErrors = Partial<Record<FieldName, string>>;

interface ExpenseFormProps {
  expense?: Expense; // brak = dodawanie, jest = edycja
  layout?: "inline" | "stacked";
  defaultDate?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onSaved: () => void;
}

export function ExpenseForm({ expense, layout = "stacked", defaultDate, inputRef, onSaved }: ExpenseFormProps) {
  const isEdit = !!expense;
  const inline = layout === "inline";
  const id = useId();

  const innerRef = useRef<HTMLInputElement>(null);
  const amountRef = inputRef ?? innerRef;

  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [category, setCategory] = useState<string>(expense?.category ?? "food");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [date, setDate] = useState(expense?.spent_on ?? defaultDate ?? toISODate(new Date()));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const firstError = Object.values(errors)[0];
  const labelClass = inline ? "sr-only" : "mb-1.5 block text-xs text-muted-foreground";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = expenseSchema.safeParse({
      amount: amount.trim().replace(",", "."),
      category,
      description,
      spent_on: date,
    });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName;
        if (!next[field]) next[field] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSaving(true);

    if (expense) {
      const { error } = await supabase.from("expenses").update(parsed.data).eq("id", expense.id);
      setSaving(false);

      if (error) {
        toast.error("Nie udało się zapisać zmian.", { description: error.message });
        return;
      }

      toast.success("Zaktualizowano wydatek.");
      track("expense_edited", { category: parsed.data.category });
      onSaved();
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      toast.error("Musisz być zalogowany, żeby dodać wydatek.");
      return;
    }

    const { error } = await supabase.from("expenses").insert({ user_id: userData.user.id, ...parsed.data });
    setSaving(false);

    if (error) {
      toast.error("Nie udało się dodać wydatku.", { description: error.message });
      return;
    }

    toast.success(`Dodano wydatek: ${formatPLN(parsed.data.amount)}`);
    track("expense_added", { category: parsed.data.category });

    // Zostawiamy kategorie i date, zeby wpisywanie kilku wydatkow z rzedu bylo szybkie.
    setAmount("");
    setDescription("");
    amountRef.current?.focus();
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <div
        className={
          inline
            ? "grid grid-cols-2 items-end gap-3 md:grid-cols-[130px_170px_minmax(0,1fr)_150px_auto]"
            : "grid grid-cols-2 gap-4"
        }
      >
        <div>
          <label htmlFor={`${id}-amount`} className={labelClass}>
            Kwota (zł)
          </label>
          <input
            id={`${id}-amount`}
            ref={amountRef}
            inputMode="decimal"
            placeholder="Kwota (zł)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={!!errors.amount}
            className={`${fieldClass} font-mono tabular-nums`}
          />
        </div>

        <div className={inline ? "" : "col-span-2"}>
          <label htmlFor={`${id}-category`} className={labelClass}>
            Kategoria
          </label>
          <select
            id={`${id}-category`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-invalid={!!errors.category}
            className={fieldClass}
          >
            {EXPENSE_CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {EXPENSE_CATEGORY_META[key].label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 md:col-span-1">
          <label htmlFor={`${id}-description`} className={labelClass}>
            Opis
          </label>
          <input
            id={`${id}-description`}
            placeholder="Na co? (opcjonalnie)"
            maxLength={80}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-invalid={!!errors.description}
            className={fieldClass}
          />
        </div>

        <div className={inline ? "" : "col-span-2"}>
          <label htmlFor={`${id}-date`} className={labelClass}>
            Data
          </label>
          <input
            id={`${id}-date`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!errors.spent_on}
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`${ctaPrimary} disabled:pointer-events-none disabled:opacity-60 ${inline ? "" : "col-span-2"}`}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEdit ? null : (
            <Plus className="h-4 w-4" />
          )}
          {isEdit ? "Zapisz zmiany" : "Dodaj"}
        </button>
      </div>

      {firstError && (
        <p role="alert" className="text-xs text-red-400">
          {firstError}
        </p>
      )}
    </form>
  );
}

export function EditExpenseDialog({ expense, onUpdated }: { expense: Expense; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            aria-label={`Edytuj wydatek: ${expense.description || "bez opisu"}`}
            className="text-muted-foreground transition-colors hover:text-emerald-400"
          >
            <Pencil className="h-4 w-4" />
          </button>
        }
      />
      <DialogContent className="glass-card border-emerald-500/20">
        <DialogHeader>
          <DialogTitle className="font-display">Edytuj wydatek</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          expense={expense}
          layout="stacked"
          onSaved={() => {
            setOpen(false);
            onUpdated();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}