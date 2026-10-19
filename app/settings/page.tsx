"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FlaskConical, LogOut, PiggyBank, Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { useIsDemoUser } from "@/lib/use-demo-user";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { budgetLimitSchema } from "@/lib/schemas";
import { formatPLN, totalMonthly } from "@/lib/analytics";
import { NavSidebar } from "@/components/nav-sidebar";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [150, 300, 500, 800];

function meterClass(usage: number) {
  if (usage > 100) return "bg-linear-to-r from-red-500 to-orange-400";
  if (usage > 75) return "bg-linear-to-r from-amber-400 to-orange-400";
  return "bg-linear-to-r from-emerald-400 to-sky-400";
}

const primaryButton =
  "bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]";

export default function SettingsPage() {
  const checkingAuth = useAuthGuard();
  const router = useRouter();
  const isDemo = useIsDemoUser();
  const { subscriptions } = useSubscriptions(0);

  const [email, setEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [savedLimit, setSavedLimit] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (checkingAuth) return;

    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      setEmail(userData.user.email ?? null);
      setMemberSince(
        new Date(userData.user.created_at).toLocaleDateString("pl-PL", { month: "long", year: "numeric" })
      );

      const { data: profile } = await supabase
        .from("profiles")
        .select("budget_limit")
        .eq("id", userData.user.id)
        .single();

      if (profile?.budget_limit) {
        setBudgetInput(String(profile.budget_limit));
        setSavedLimit(Number(profile.budget_limit));
      }
      setLoadingProfile(false);
    }

    loadProfile();
  }, [checkingAuth]);

  if (checkingAuth) return <LoadingScreen />;

  const monthlyCost = totalMonthly(subscriptions);
  const parsed = budgetInput.trim() === "" ? null : Number(budgetInput.replace(",", "."));
  const validLimit = parsed !== null && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  const usage = validLimit ? (monthlyCost / validLimit) * 100 : null;
  const dirty = validLimit !== savedLimit;
  const sliderValue = validLimit ? Math.min(Math.max(validLimit, 50), 1000) : 300;
  const initial = isDemo ? "D" : (email?.[0]?.toUpperCase() ?? "?");

  async function persistLimit(value: number | null) {
    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ budget_limit: value, updated_at: new Date().toISOString() })
      .eq("id", userData.user.id);

    setSaving(false);

    if (error) {
      toast.error("Nie udało się zapisać limitu.", { description: error.message });
      return;
    }

    setSavedLimit(value);
    toast.success(value ? `Limit ustawiony na ${formatPLN(value)} / mies.` : "Limit usunięty.");
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (budgetInput.trim() === "") {
      persistLimit(null);
      return;
    }

    const result = budgetLimitSchema.safeParse(budgetInput.replace(",", "."));
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Nieprawidłowa wartość.");
      return;
    }
    persistLimit(result.data);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function triggerDev(path: string) {
    const res = await fetch(path, { method: "POST" });
    const data = await res.json();
    toast.success(`Sprawdzono: ${data.checked ?? data.usersChecked}, wysłano: ${data.sent}`);
  }

  return (
    <div className="flex min-h-screen">
      <NavSidebar monthlyCost={monthlyCost} />

      <main className="min-w-0 flex-1 px-4 pb-10 pt-18 sm:px-6 lg:p-8">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Ustawienia</h1>
          <p className="mt-1 text-sm text-muted-foreground">Zarządzaj kontem i budżetem.</p>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Lewa kolumna: profil i sesja */}
          <div className="flex flex-col gap-6">
            <section className="glass-card relative overflow-hidden p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-500/20 blur-3xl" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-sky-500 font-display text-2xl font-semibold text-obsidian shadow-lg shadow-emerald-500/20">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-semibold text-foreground">
                    {isDemo ? "Konto demo" : (email ?? "...")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isDemo ? "Dane są tymczasowe" : memberSince ? `Z nami od: ${memberSince}` : ""}
                  </p>
                </div>
              </div>

              {isDemo && (
                <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <FlaskConical className="h-3.5 w-3.5" />
                  Tryb demo
                </span>
              )}

              <div className="relative mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <p className="text-[11px] text-muted-foreground">Subskrypcje</p>
                  <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
                    {subscriptions.length}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <p className="text-[11px] text-muted-foreground">Miesięcznie</p>
                  <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
                    {formatPLN(monthlyCost)}
                  </p>
                </div>
              </div>
            </section>

            <section className="glass-card p-6">
              <h2 className="mb-1 font-display text-lg font-semibold text-foreground">Sesja</h2>
              <p className="mb-4 text-sm text-muted-foreground">Wyloguj się z PayGuard na tym urządzeniu.</p>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Wyloguj się
              </Button>
            </section>
          </div>

          {/* Prawa kolumna: limit na subskrypcje i narzędzia deweloperskie */}
          <div className="flex flex-col gap-6 xl:col-span-2">
            <section className="glass-card p-6">
              <div className="mb-1 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <PiggyBank className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Limit na subskrypcje</h2>
                  <p className="text-xs text-muted-foreground">
                    Ostrzeżemy Cię na Przeglądzie, gdy koszt subskrypcji przekroczy tę kwotę. Budżet całego miesiąca
                    ustawisz w sekcji Wydatki.
                  </p>
                </div>
              </div>

              {loadingProfile ? (
                <p className="mt-6 text-sm text-muted-foreground">Ładowanie...</p>
              ) : (
                <form onSubmit={handleSave} className="mt-6 flex flex-col gap-5">
                  {usage !== null && validLimit !== null ? (
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Wykorzystano{" "}
                          <span className="font-mono font-semibold tabular-nums text-foreground">
                            {Math.round(usage)}%
                          </span>{" "}
                          limitu
                        </span>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {formatPLN(monthlyCost)} / {formatPLN(validLimit)}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${meterClass(usage)}`}
                          style={{ width: `${Math.min(usage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
                      Limit nie jest ustawiony. Wybierz wartość poniżej, a zobaczysz podgląd wykorzystania na żywo.
                    </p>
                  )}

                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={10}
                    value={sliderValue}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    aria-label="Limit na subskrypcje"
                    className="w-full accent-emerald-400"
                  />

                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setBudgetInput(String(p))}
                        className={`rounded-full border px-3 py-1.5 font-mono text-xs tabular-nums transition-colors ${
                          validLimit === p
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 text-muted-foreground hover:border-emerald-500/30 hover:text-foreground"
                        }`}
                      >
                        {p} zł
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="np. 300"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      aria-label="Limit w złotych"
                      className="h-10 max-w-[160px]"
                    />
                    <Button type="submit" disabled={saving || !dirty} className={primaryButton}>
                      {saving ? "Zapisywanie..." : "Zapisz limit"}
                    </Button>
                    {savedLimit !== null && (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={saving}
                        onClick={() => {
                          setBudgetInput("");
                          persistLimit(null);
                        }}
                        className="text-muted-foreground hover:text-red-400"
                      >
                        Usuń limit
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </section>

            {/* Widoczne tylko lokalnie (npm run dev) - na produkcji tej sekcji nie ma */}
            {process.env.NODE_ENV === "development" && (
              <details className="glass-card group p-6">
                <summary className="flex cursor-pointer list-none items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-muted-foreground">
                    <Wrench className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Narzędzia deweloperskie
                    </h2>
                    <p className="text-xs text-muted-foreground">Ręczne wyzwalanie zadań cyklicznych (e-maile)</p>
                  </div>
                </summary>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-emerald-500/20 text-foreground hover:bg-white/[0.04]"
                    onClick={() => triggerDev("/api/dev/trigger-renewal-reminders")}
                  >
                    Testuj przypomnienia o odnowieniu
                  </Button>
                  <Button
                    variant="outline"
                    className="border-emerald-500/20 text-foreground hover:bg-white/[0.04]"
                    onClick={() => triggerDev("/api/dev/trigger-weekly-digest")}
                  >
                    Testuj tygodniowy digest
                  </Button>
                </div>
              </details>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}