"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authSchema } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { AuroraBackground } from "@/components/aurora-background";
import { DemoButton } from "@/components/demo-button";
import { ctaPrimaryLg } from "@/lib/ui-classes";

type Mode = "login" | "signup";
type FieldErrors = Partial<Record<"email" | "password", string>>;

const TONES = {
  amber: "bg-amber-500/10 text-amber-300",
  violet: "bg-violet-500/10 text-violet-300",
  emerald: "bg-emerald-500/10 text-emerald-300",
  sky: "bg-sky-500/10 text-sky-300",
} as const;

interface FeedEvent {
  icon: LucideIcon;
  tone: keyof typeof TONES;
  title: string;
  meta: string;
}

const EVENTS: FeedEvent[] = [
  { icon: Bell, tone: "amber", title: "Netflix odnawia się za 2 dni", meta: "43,99 zł" },
  { icon: Sparkles, tone: "violet", title: "AI wykryło 4 platformy streamingowe", meta: "możliwe −63 zł" },
  { icon: TrendingDown, tone: "emerald", title: "Wydatki niższe o 12% niż w zeszłym miesiącu", meta: "−28,50 zł" },
  { icon: Mail, tone: "sky", title: "Tygodniowe podsumowanie jest gotowe", meta: "poniedziałek 8:00" },
  { icon: Lock, tone: "emerald", title: "Twoje dane widzisz tylko Ty (RLS)", meta: "zabezpieczone" },
];

const STRENGTH = [
  { label: "", bar: "" },
  { label: "Słabe", bar: "bg-red-400" },
  { label: "Średnie", bar: "bg-amber-400" },
  { label: "Dobre", bar: "bg-sky-400" },
  { label: "Silne", bar: "bg-emerald-400" },
];

function passwordScore(pw: string): number {
  if (pw.length === 0) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length < 6) score = Math.min(score, 1);
  return Math.max(score, 1);
}

function translateAuthError(message: string, mode: Mode): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Nieprawidłowy e-mail lub hasło.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Konto z tym adresem e-mail już istnieje. Spróbuj się zalogować.";
  if (m.includes("signups are disabled") || m.includes("signup is disabled"))
    return "Rejestracja jest chwilowo wyłączona.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Zbyt wiele prób. Spróbuj ponownie za chwilę.";
  if (m.includes("email not confirmed")) return "Potwierdź adres e-mail, zanim się zalogujesz.";
  return mode === "login"
    ? "Nie udało się zalogować. Spróbuj ponownie."
    : "Nie udało się utworzyć konta. Spróbuj ponownie.";
}

// Przykładowe powiadomienia - co ~3 s wjeżdża nowe, a najstarsze znika.
function LiveFeed() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2800);
    return () => clearInterval(id);
  }, []);

  const visible = [0, 1, 2].map((i) => ({ id: tick + i, ...EVENTS[(tick + i) % EVENTS.length] }));

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {visible.map((e) => {
          const Icon = e.icon;
          return (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-xl"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TONES[e.tone]}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
                <p className="font-mono text-xs text-muted-foreground">{e.meta}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Linki "Zacznij za darmo" prowadzą tu z ?mode=signup
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "signup") {
      setMode("signup");
    }
  }, []);

  const score = mode === "signup" ? passwordScore(password) : 0;

  function switchMode(next: Mode) {
    setMode(next);
    setFieldErrors({});
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const credentials = parsed.data;
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials);

    if (error) {
      setLoading(false);
      setFormError(translateAuthError(error.message, mode));
      return;
    }

    if (mode === "signup") {
      fetch("/api/send-welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credentials.email }),
      }).catch(() => {});
    }

    // Przycisk zostaje zablokowany do przejścia na dashboard - nie da się wysłać formularza dwa razy.
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* ===== Lewy panel: marka + żywy feed ===== */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.06] p-12 lg:flex">
        <AuroraBackground />

        <Link href="/" className="relative flex w-fit items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-emerald-400" />
          <span className="font-display text-xl font-semibold text-foreground">PayGuard</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight text-foreground">
            Twoje subskrypcje. <span className="text-gradient">Pod pełną kontrolą.</span>
          </h2>

          <ul className="mt-7 flex flex-col gap-3 text-sm text-muted-foreground">
            {[
              "Wykresy kosztów i prognoza na żywo",
              "Przypomnienia e-mail przed każdym odnowieniem",
              "Dane chronione na poziomie bazy (RLS)",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Tak wygląda PayGuard w akcji (przykładowe powiadomienia)
            </p>
            <LiveFeed />
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground">
          Projekt portfolio, płatności działają w trybie testowym Stripe.
        </p>
      </aside>

      {/* ===== Prawa strona: formularz ===== */}
      <main className="relative flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Strona główna
          </Link>
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="font-display text-base font-semibold text-foreground">PayGuard</span>
          </Link>
        </div>

        <div className="my-auto flex w-full justify-center py-10">
          <div className="glass-card w-full max-w-[480px] p-6 min-[400px]:p-8 sm:p-10">
            {/* Przełącznik trybu z płynnym wskaźnikiem */}
            <div className="relative mb-8 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`relative z-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    mode === m ? "text-obsidian" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="auth-tab"
                      className="absolute inset-0 -z-10 rounded-lg bg-emerald-400 shadow-[0_6px_24px_-6px_rgba(16,185,129,0.8)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {m === "login" ? "Logowanie" : "Rejestracja"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-7"
              >
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  {mode === "login" ? "Witaj z powrotem" : "Stwórz konto"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {mode === "login"
                    ? "Zaloguj się, żeby wrócić do swojego panelu."
                    : "Zajmie to mniej niż minutę. Bez karty kredytowej."}
                </p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-muted-foreground">
                  Adres e-mail
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="ty@przyklad.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!fieldErrors.email}
                    className="h-12 pl-11 text-base"
                  />
                </div>
                {fieldErrors.email && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm text-muted-foreground">
                  Hasło
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="Minimum 6 znaków"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!fieldErrors.password}
                    className="h-12 pl-11 pr-12 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p>}

                {mode === "signup" && score > 0 && (
                  <div className="mt-3">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            i <= score ? STRENGTH[score].bar : "bg-white/[0.08]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Siła hasła: <span className="text-foreground">{STRENGTH[score].label}</span>
                    </p>
                  </div>
                )}
              </div>

              {formError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {formError}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`${ctaPrimaryLg} mt-1 w-full disabled:pointer-events-none disabled:opacity-60`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chwileczkę...
                  </>
                ) : mode === "login" ? (
                  "Zaloguj się"
                ) : (
                  "Utwórz konto"
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">lub</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <DemoButton
              size="lg"
              className="h-12 w-full border-white/10 bg-white/[0.03] text-base hover:border-emerald-500/30 hover:bg-white/[0.06]"
            />

            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
              To projekt portfolio. Nie używaj tu haseł, z których korzystasz w innych serwisach.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}