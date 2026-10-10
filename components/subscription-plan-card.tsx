"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useIsDemoUser } from "@/lib/use-demo-user";

export function SubscriptionPlanCard() {
  const [status, setStatus] = useState<"free" | "pro" | null>(null);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const isDemo = useIsDemoUser();

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
        if (isDemo) {
      toast.info("W trybie demo płatności są wyłączone. Załóż konto, żeby przejść na Pro.");
      return;
    }
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

  async function handleOpenPortal() {
    if (!userId) return;
    setPortalLoading(true);

    const res = await fetch("/api/create-portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    setPortalLoading(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error ?? "Nie udało się otworzyć portalu rozliczeniowego.");
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
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleOpenPortal}
            disabled={portalLoading}
            className="gap-2 bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]"
          >
            {portalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Settings2 className="h-4 w-4" />
                Zarządzaj płatnością i fakturami
              </>
            )}
          </Button>

          <Button
            onClick={handleCancel}
            disabled={loading}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Szybkie anulowanie"}
          </Button>
        </div>
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