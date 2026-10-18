"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Crown, Loader2, Settings2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authedFetch } from "@/lib/api-client";
import { useIsDemoUser } from "@/lib/use-demo-user";
import { Button } from "@/components/ui/button";

type Status = "free" | "pro" | null;

const primaryButton =
  "bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]";

export function SubscriptionPlanCard() {
  const isDemo = useIsDemoUser();
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", userData.user.id)
        .single();

      setStatus((profile?.subscription_status as Status) ?? "free");
    }

    loadProfile();
  }, []);

  async function handleUpgrade() {
    if (isDemo) {
      toast.info("W trybie demo płatności są wyłączone. Załóż konto, żeby przejść na Pro.");
      return;
    }

    setLoading(true);
    const res = await authedFetch("/api/checkout", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error ?? "Nie udało się rozpocząć płatności. Spróbuj ponownie.");
    }
  }

  async function handleCancel() {
    setLoading(true);
    const res = await authedFetch("/api/cancel-subscription", { method: "POST" });
    setLoading(false);

    if (res.ok) {
      setStatus("free");
      toast.success("Subskrypcja Pro anulowana. Przechodzisz na plan darmowy.");
    } else {
      toast.error("Nie udało się anulować subskrypcji.");
    }
  }

  async function handleOpenPortal() {
    setPortalLoading(true);
    const res = await authedFetch("/api/create-portal-session", { method: "POST" });
    const data = await res.json().catch(() => ({}));
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
          <Button onClick={handleOpenPortal} disabled={portalLoading} className={`gap-2 ${primaryButton}`}>
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
        <Button onClick={handleUpgrade} disabled={loading} className={primaryButton}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Przejdź na Pro — 29,99 zł/mies."}
        </Button>
      )}
    </div>
  );
}