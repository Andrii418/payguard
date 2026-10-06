"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { subscriptionSchema } from "@/lib/schemas";
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
import { Plus } from "lucide-react";

const categories = [
  { value: "streaming", label: "Streaming" },
  { value: "software", label: "Oprogramowanie" },
  { value: "cloud", label: "Chmura / Hosting" },
  { value: "other", label: "Inne" },
];

interface AddSubscriptionDialogProps {
  onAdded: () => void;
}

type FieldErrors = Partial<Record<"name" | "price" | "billing_cycle" | "category" | "next_renewal", string>>;

export function AddSubscriptionDialog({ onAdded }: AddSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("other");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    // Walidacja Zod PRZED wysłaniem czegokolwiek do bazy danych.
    const result = subscriptionSchema.safeParse({
      name,
      price,
      billing_cycle: billingCycle,
      category,
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

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      toast.error("Musisz być zalogowany, żeby dodać subskrypcję.");
      return;
    }

    const { error } = await supabase.from("subscriptions").insert({
      user_id: userData.user.id,
      ...result.data,
    });

    setLoading(false);

    if (error) {
      toast.error("Nie udało się dodać subskrypcji.", { description: error.message });
      return;
    }

    toast.success(`Dodano "${result.data.name}" do Twoich subskrypcji.`);
    setName("");
    setPrice("");
    setNextRenewal("");
    setFieldErrors({});
    setOpen(false);
    onAdded();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setFieldErrors({});
      }}
    >
      <DialogTrigger
        render={
          <Button className="gap-2 bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]">
            <Plus className="h-4 w-4" />
            Dodaj subskrypcję
          </Button>
        }
      />

      <DialogContent className="glass-card border-emerald-500/20">
        <DialogHeader>
          <DialogTitle className="font-display">Nowa subskrypcja</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nazwa</Label>
            <Input
              id="name"
              placeholder="np. Netflix"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && <p className="text-xs text-red-400">{fieldErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Cena (zł)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={!!fieldErrors.price}
              />
              {fieldErrors.price && <p className="text-xs text-red-400">{fieldErrors.price}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Cykl rozliczeniowy</Label>
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
            <Label htmlFor="renewal">Data następnego odnowienia</Label>
            <Input
              id="renewal"
              type="date"
              value={nextRenewal}
              onChange={(e) => setNextRenewal(e.target.value)}
              aria-invalid={!!fieldErrors.next_renewal}
            />
            {fieldErrors.next_renewal && (
              <p className="text-xs text-red-400">{fieldErrors.next_renewal}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]"
          >
            {loading ? "Zapisywanie..." : "Zapisz subskrypcję"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}