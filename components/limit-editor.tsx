"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { budgetLimitSchema } from "@/lib/schemas";
import { formatPLN } from "@/lib/analytics";
import { track } from "@/lib/tracking";

interface LimitEditorProps {
  value: number | null;
  onSave: (amount: number | null) => Promise<string | null>;
  emptyLabel?: string;
}

export function LimitEditor({ value, onSave, emptyLabel = "Ustaw limit" }: LimitEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  function start() {
    setDraft(value ? String(value) : "");
    setEditing(true);
  }

  async function commit() {
    const raw = draft.trim().replace(",", ".");
    let amount: number | null = null; // puste pole = usuniecie limitu

    if (raw !== "") {
      const parsed = budgetLimitSchema.safeParse(raw);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Nieprawidłowa wartość.");
        return;
      }
      amount = parsed.data;
    }

    setSaving(true);
    const error = await onSave(amount);
    setSaving(false);

    if (error) {
      toast.error("Nie udało się zapisać limitu.", { description: error });
      return;
    }

    track("budget_set", { removed: amount === null });
    toast.success(amount ? `Limit ustawiony na ${formatPLN(amount)}.` : "Limit usunięty.");
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={start}
        className="group flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-emerald-300"
      >
        {value ? (
          <>
            limit <span className="font-mono tabular-nums text-foreground">{formatPLN(value)}</span>
          </>
        ) : (
          emptyLabel
        )}
        <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") setEditing(false);
        }}
        placeholder="pusto = usuń"
        aria-label="Limit w złotych"
        disabled={saving}
        className="h-8 w-28 rounded-md border border-emerald-500/30 bg-white/[0.04] px-2 font-mono text-xs tabular-nums text-foreground outline-none placeholder:font-sans placeholder:text-muted-foreground focus-visible:border-emerald-500/60"
      />
      <button
        type="button"
        onClick={commit}
        disabled={saving}
        aria-label="Zapisz limit"
        className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300 transition-colors hover:bg-emerald-500/25"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        aria-label="Anuluj"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}