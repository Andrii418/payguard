"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
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

export function AddSubscriptionDialog({ onAdded }: AddSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("other");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [nextRenewal, setNextRenewal] = useState("");
  const [loading, setLoading] = useState(false);

  // Base UI może zwrócić `null` gdy nic nie jest wybrane — te funkcje
  // "strażniczki" ignorują null i trzymają nasz stan zawsze jako string.
  function handleCategoryChange(value: string | null) {
    if (value) setCategory(value);
  }

  function handleBillingCycleChange(value: string | null) {
    if (value) setBillingCycle(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("subscriptions").insert({
      user_id: userData.user.id,
      name,
      price: parseFloat(price),
      category,
      billing_cycle: billingCycle,
      next_renewal: nextRenewal,
    });

    setLoading(false);

    if (!error) {
      setName("");
      setPrice("");
      setNextRenewal("");
      setOpen(false);
      onAdded();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nazwa</Label>
            <Input
              id="name"
              required
              placeholder="np. Netflix"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Cena (zł)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
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
              required
              value={nextRenewal}
              onChange={(e) => setNextRenewal(e.target.value)}
            />
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
