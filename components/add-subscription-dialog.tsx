"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { subscriptionSchema } from "@/lib/schemas";
import type { Subscription } from "@/lib/use-subscriptions";
import { EXPENSE_CATEGORY_KEYS, EXPENSE_CATEGORY_META } from "@/lib/expense-categories";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";

const categories = EXPENSE_CATEGORY_KEYS.map((key) => ({
  value: key,
  label: EXPENSE_CATEGORY_META[key].label,
}));

const KINDS = [
  { value: "subscription", label: "Subskrypcja" },
  { value: "fixed", label: "Opłata stała" },
] as const;

type Kind = (typeof KINDS)[number]["value"];

type FieldErrors = Partial<
  Record<"name" | "price" | "billing_cycle" | "category" | "kind" | "next_renewal", string>
>;

const primaryButtonClass =
  "bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]";

interface SubscriptionFormDialogProps {
  subscription?: Subscription; // brak = tryb dodawania, jest = tryb edycji
  trigger: React.ReactElement;
  onSaved: () => void;
  open?: boolean; // opcjonalne sterowanie z zewnątrz
  onOpenChange?: (open: boolean) => void;
}

function SubscriptionFormDialog({
  subscription,
  trigger,
  onSaved,
  open: controlledOpen,
  onOpenChange,
}: SubscriptionFormDialogProps) {
  const isEdit = !!subscription;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    onOpenChange?.(value);
  };

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>("fun");
  const [kind, setKind] = useState<Kind>("subscription");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [nextRenewal, setNextRenewal] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleCategoryChange(value: string | null) {
    if (value) setCategory(value);
  }

  function handleBillingCycleChange(value: string | null) {
    if (value) setBillingCycle(value);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    setFieldErrors({});

    // Przy otwarciu w trybie edycji wypełniamy pola aktualnymi danymi z bazy.
    if (next && subscription) {
      setName(subscription.name);
      setPrice(String(subscription.price));
      setCategory(subscription.category);
      setKind(subscription.kind ?? "subscription");
      setBillingCycle(subscription.billing_cycle);
      setNextRenewal(subscription.next_renewal);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const result = subscriptionSchema.safeParse({
      name,
      price: price.trim().replace(",", "."),
      billing_cycle: billingCycle,
      category,
      kind,
      next_renewal: nextRenewal,
    });

    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      toast.error("Popraw błędy w formularzu.");
      return;
    }

    setLoading(true);

    if (isEdit && subscription) {
      const { error } = await supabase
        .from("subscriptions")
        .update(result.data)
        .eq("id", subscription.id);

      setLoading(false);

      if (error) {
        toast.error("Nie udało się zapisać zmian.", { description: error.message });
        return;
      }

      toast.success(`Zaktualizowano "${result.data.name}".`);
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        toast.error("Musisz być zalogowany, żeby dodać płatność.");
        return;
      }

      const { error } = await supabase.from("subscriptions").insert({
        user_id: userData.user.id,
        ...result.data,
      });

      setLoading(false);

      if (error) {
        toast.error("Nie udało się dodać płatności.", { description: error.message });
        return;
      }

      toast.success(`Dodano "${result.data.name}" do płatności cyklicznych.`);
      setName("");
      setPrice("");
      setNextRenewal("");
    }

    setOpen(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />

      <DialogContent className="max-h-[90dvh] overflow-y-auto glass-card border-emerald-500/20">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edytuj płatność cykliczną" : "Nowa płatność cykliczna"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div
            role="group"
            aria-label="Typ płatności"
            className="grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1"
          >
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                aria-pressed={kind === k.value}
                onClick={() => setKind(k.value)}
                className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                  kind === k.value
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nazwa</Label>
            <Input
              id="name"
              placeholder={kind === "fixed" ? "np. Czynsz" : "np. Netflix"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && <p className="text-xs text-red-400">{fieldErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Kwota (zł)</Label>
              <Input
                id="price"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={!!fieldErrors.price}
              />
              {fieldErrors.price && <p className="text-xs text-red-400">{fieldErrors.price}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Cykl</Label>
              <Select value={billingCycle} onValueChange={handleBillingCycleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Miesięcznie</SelectItem>
                  <SelectItem value="yearly">Rocznie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Kategoria</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="renewal">Data najbliższej płatności</Label>
            <Input
              id="renewal"
              type="date"
              value={nextRenewal}
              onChange={(e) => setNextRenewal(e.target.value)}
              aria-invalid={!!fieldErrors.next_renewal}
            />
            {fieldErrors.next_renewal ? (
              <p className="text-xs text-red-400">{fieldErrors.next_renewal}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                W tym dniu płatność sama zapisze się w wydatkach, a data przeskoczy na kolejny okres.
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading} className={`mt-2 ${primaryButtonClass}`}>
            {loading ? "Zapisywanie..." : isEdit ? "Zapisz zmiany" : "Dodaj płatność"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddSubscriptionDialog({
  onAdded,
  open,
  onOpenChange,
}: {
  onAdded: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <SubscriptionFormDialog
      onSaved={onAdded}
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <Button className={`gap-2 ${primaryButtonClass}`}>
          <Plus className="h-4 w-4" />
          Dodaj płatność
        </Button>
      }
    />
  );
}

export function EditSubscriptionDialog({
  subscription,
  onUpdated,
}: {
  subscription: Subscription;
  onUpdated: () => void;
}) {
  return (
    <SubscriptionFormDialog
      subscription={subscription}
      onSaved={onUpdated}
      trigger={
        <button
          aria-label={`Edytuj ${subscription.name}`}
          className="-m-2 p-2 text-muted-foreground transition-colors hover:text-emerald-400 sm:m-0 sm:p-0"
        >
          <Pencil className="h-4 w-4" />
        </button>
      }
    />
  );
}