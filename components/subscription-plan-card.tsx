"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SubscriptionPlanCard() {
  const [status, setStatus] = useState<"free" | "pro" | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      setUserId(userData.user.id);
      setEmail(userData.user.email ?? null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", userData.user.id)
        .single();

      setStatus((profile?.subscription_status as "free" | "pro") ?? "free");
    }

    loadProfile();
  }, []);

  async function handleUpgrade() {
    if (!userId || !email) return;
    setLoading(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, email }),
    });

        const data = await res.json();
    setLoading(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error("Nie udało się rozpocząć płatności. Spróbuj ponownie.");
    }
  }

    async function handleCancel() {
    if (!userId) return;
    setLoading(true);

    const res = await fetch("/api/cancel-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    setLoading(false);

    if (res.ok) {
      setStatus("free");
      toast.success("Subskrypcja Pro anulowana. Przechodzisz na plan darmowy.");
    } else {
      toast.error("Nie udało się anulować subskrypcji.");
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-emerald-400" />
          <h2 className="font-display text-lg font-semibold text-foreground">Twój plan</h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            status === "pro" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.05] text-muted-foreground"
          }`}
        >
          {status === "pro" ? "PRO" : "FREE"}
        </span>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {status === "pro"
          ? "Masz aktywny plan Pro (tryb testowy Stripe) z nielimitowanymi subskrypcjami i priorytetowym wsparciem AI."
          : "Jesteś na planie darmowym. Przejdź na Pro (tryb testowy), żeby odblokować pełną funkcjonalność."}
      </p>

      {status === "pro" ? (
        <Button
          onClick={handleCancel}
          disabled={loading}
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Anuluj subskrypcję"}
        </Button>
      ) : (
        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Przejdź na Pro — 29,99 zł/mies."}
        </Button>
      )}
    </div>
  );
}
