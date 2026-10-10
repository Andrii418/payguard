"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { budgetLimitSchema } from "@/lib/schemas";
import { NavSidebar } from "@/components/nav-sidebar";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function SettingsPage() {
  const checkingAuth = useAuthGuard();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (checkingAuth) return;

    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      setEmail(userData.user.email ?? "Konto demo (anonimowe)");

      const { data: profile } = await supabase
        .from("profiles")
        .select("budget_limit")
        .eq("id", userData.user.id)
        .single();

      if (profile?.budget_limit) {
        setBudgetInput(String(profile.budget_limit));
      }
      setLoadingProfile(false);
    }

    loadProfile();
  }, [checkingAuth]);

  async function handleSaveBudget(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      return;
    }

    let budgetValue: number | null = null;

    if (budgetInput.trim() !== "") {
      const result = budgetLimitSchema.safeParse(budgetInput);
      if (!result.success) {
        setSaving(false);
        toast.error(result.error.issues[0]?.message ?? "Nieprawidłowa wartość.");
        return;
      }
      budgetValue = result.data;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ budget_limit: budgetValue, updated_at: new Date().toISOString() })
      .eq("id", userData.user.id);

    setSaving(false);

    if (error) {
      toast.error("Nie udało się zapisać limitu budżetu.", { description: error.message });
      return;
    }

    toast.success(
      budgetValue
        ? `Limit budżetu ustawiony na ${budgetValue.toFixed(2)} zł/mies.`
        : "Limit budżetu usunięty."
    );
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (checkingAuth) return <LoadingScreen />;

  return (
    <div className="flex">
      <NavSidebar />

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-foreground">Ustawienia</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Zarządzaj swoim kontem i preferencjami.
          </p>
        </header>

        <div className="flex max-w-lg flex-col gap-6">
          <section className="glass-card p-6">
            <h2 className="mb-1 font-display text-lg font-semibold text-foreground">Konto</h2>
            <p className="text-sm text-muted-foreground">{email ?? "..."}</p>
          </section>

          <section className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-400" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Miesięczny limit budżetu
              </h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Ostrzeżemy Cię na Przeglądzie, gdy Twoje miesięczne wydatki na subskrypcje
              przekroczą tę kwotę. Zostaw puste, żeby wyłączyć ostrzeżenia.
            </p>

            {loadingProfile ? (
              <p className="text-sm text-muted-foreground">Ładowanie...</p>
            ) : (
              <form onSubmit={handleSaveBudget} className="flex items-end gap-3">
                <div className="flex flex-1 flex-col gap-2">
                  <Label htmlFor="budget">Limit (zł / mies.)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    placeholder="np. 300"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]"
                >
                  {saving ? "Zapisywanie..." : "Zapisz"}
                </Button>
              </form>
            )}
          </section>

          <section className="glass-card p-6">
            <h2 className="mb-1 font-display text-lg font-semibold text-foreground">Sesja</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Wyloguj się z PayGuard na tym urządzeniu.
            </p>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Wyloguj się
            </Button>
          </section>
                    <section className="glass-card p-6">
            <div className="mb-1 flex items-center gap-2">
              <Mail className="h-5 w-5 text-emerald-400" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Narzędzia deweloperskie
              </h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Ręczne wyzwolenie zadań cyklicznych (docelowo uruchamianych automatycznie przez
              Vercel Cron). Usuń tę sekcję przed publicznym udostępnieniem produktu.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-emerald-500/20 text-foreground hover:bg-white/[0.04]"
                onClick={async () => {
                  const res = await fetch("/api/dev/trigger-renewal-reminders", { method: "POST" });
                  const data = await res.json();
                  toast.success(`Sprawdzono: ${data.checked}, wysłano: ${data.sent}`);
                }}
              >
                Testuj przypomnienia o odnowieniu
              </Button>
              <Button
                variant="outline"
                className="border-emerald-500/20 text-foreground hover:bg-white/[0.04]"
                onClick={async () => {
                  const res = await fetch("/api/dev/trigger-weekly-digest", { method: "POST" });
                  const data = await res.json();
                  toast.success(`Sprawdzono: ${data.usersChecked}, wysłano: ${data.sent}`);
                }}
              >
                Testuj tygodniowy digest
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}