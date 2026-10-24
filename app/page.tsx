import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Lock,
  Plus,
  Repeat,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { AuroraBackground } from "@/components/aurora-background";
import { HeroPreview } from "@/components/hero-preview";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/reveal";
import { SpotlightCard } from "@/components/spotlight-card";
import { BudgetCalculator } from "@/components/budget-calculator";
import { DemoButton } from "@/components/demo-button";
import { ctaPrimaryLg } from "@/lib/ui-classes";

const steps = [
  {
    n: "01",
    icon: Plus,
    title: "Zapisuj wydatki w 3 sekundy",
    text: "Wpisz kwotę, wybierz kategorię i wciśnij Enter. Kolejny wydatek dodajesz bez klikania w cokolwiek innego.",
  },
  {
    n: "02",
    icon: Repeat,
    title: "Dodaj stałe płatności raz",
    text: "Czynsz, rachunki, subskrypcje. Od teraz księgują się same w dniu płatności, a 3 dni wcześniej dostajesz przypomnienie e-mail.",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Ustaw budżet i pytaj doradcę",
    text: "Limit na miesiąc i na kategorie, prognoza oraz analiza AI pokażą, dokąd uciekają pieniądze i co możesz zmienić.",
  },
];

const limitBars = [
  { label: "Jedzenie", pct: 78, color: "#FBBF24" },
  { label: "Transport", pct: 41, color: "#34D399" },
  { label: "Rozrywka", pct: 104, color: "#F87171" },
];

const stack = [
  "Next.js 16",
  "TypeScript",
  "Tailwind CSS 4",
  "Supabase",
  "PostgreSQL + RLS",
  "Realtime",
  "Google Gemini",
  "Framer Motion",
  "Recharts",
];

const faqs = [
  {
    q: "Czy PayGuard jest darmowy?",
    a: "Tak, w całości. To projekt portfolio, więc nie ma tu płatności ani płatnych planów. Wszystkie funkcje są dostępne po założeniu konta albo w trybie demo.",
  },
  {
    q: "Czy aplikacja łączy się z moim bankiem?",
    a: "Nie. Wydatki wpisujesz ręcznie (to kilka sekund), a stałe płatności księgują się same. Dzięki temu nikt nie ma dostępu do Twojego konta bankowego ani historii transakcji.",
  },
  {
    q: "Jak działają płatności cykliczne?",
    a: "Dodajesz je raz, np. czynsz 1. dnia miesiąca. W dniu płatności zapisują się w wydatkach, a termin przeskakuje na kolejny okres. Aplikacja sprawdza to przy każdym wejściu oraz raz dziennie w tle, więc nic Ci nie umknie, nawet gdy dłużej nie zaglądasz.",
  },
  {
    q: "Co dokładnie widzi Doradca AI?",
    a: "Podsumowanie miesiąca: sumy, kategorie, limity, prognozę i nazwy płatności cyklicznych. Nie wysyłamy opisów pojedynczych wydatków ani adresu e-mail. Każda odpowiedź jest oznaczona jako wygenerowana przez AI i nie stanowi porady finansowej.",
  },
  {
    q: "Czy moje dane są bezpieczne?",
    a: "Dane chroni Row Level Security na poziomie bazy PostgreSQL: każdy użytkownik widzi wyłącznie własne rekordy, nawet gdyby ktoś odpytywał API bezpośrednio. Klucze serwerowe nigdy nie trafiają do przeglądarki.",
  },
  {
    q: "Czy mogę wypróbować bez rejestracji?",
    a: "Tak. Tryb demo tworzy tymczasowe, anonimowe konto z przykładowymi danymi (z historią kilku miesięcy). Możesz je dowolnie edytować i zresetować, a po tygodniu zostaje usunięte automatycznie.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <AuroraBackground />

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 pb-24 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-24">
          <div>
            <Reveal>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3.5 py-1.5 text-xs font-medium text-emerald-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Budżet z doradcą AI
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Zawsze wiesz, <span className="text-gradient">ile możesz jeszcze wydać.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                PayGuard zapisuje wydatki, pilnuje limitów i sam księguje czynsz oraz subskrypcje. Doradca AI patrzy na
                cały Twój miesiąc i podpowiada, gdzie realnie możesz zaoszczędzić.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/login?mode=signup" className={ctaPrimaryLg}>
                  Zacznij za darmo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <DemoButton
                  size="lg"
                  className="h-12 border-white/10 bg-white/[0.03] px-7 text-base hover:border-emerald-500/30 hover:bg-white/[0.06]"
                />
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {["Całkowicie za darmo", "Bez łączenia z bankiem", "Demo bez rejestracji"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <HeroPreview />
          </Reveal>
        </div>
      </section>

      {/* ===== Pasek kategorii ===== */}
      <section className="border-y border-white/[0.06] bg-white/[0.015] py-8">
        <p className="mb-5 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Śledź wszystko: od codziennych zakupów po czynsz
        </p>
        <Marquee />
      </section>

      {/* ===== Funkcje (bento) ===== */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Cały budżet w jednym miejscu, <span className="text-gradient">bez arkusza kalkulacyjnego</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Wydatki, limity, płatności cykliczne i prognoza liczą się razem, więc zawsze widzisz prawdziwy obraz miesiąca.
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Doradca AI */}
          <Reveal className="md:col-span-2">
            <SpotlightCard className="h-full p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">Doradca budżetu AI</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Gemini analizuje cały Twój miesiąc: kategorie, limity, prognozę i płatności cykliczne. W odpowiedzi
                dostajesz ryzyka, oszczędności z kwotami i konkretne kroki.
              </p>

              <div className="mt-6 rounded-xl border border-white/[0.08] bg-black/25 p-4 text-sm">
                <p className="mb-3 flex items-center justify-between text-xs text-violet-300">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Doradca AI
                  </span>
                  <span className="text-muted-foreground">przykładowa odpowiedź</span>
                </p>
                <p className="font-display text-base font-semibold leading-snug text-foreground">
                  Jedzenie rośnie szybciej niż limit, a dwie platformy streamingowe się dublują.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2">
                    <span className="text-xs text-muted-foreground">Jedzenie: 78% limitu po 18 dniach miesiąca</span>
                    <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      Uwaga
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2">
                    <span className="text-xs text-muted-foreground">Zrezygnuj z jednej z dwóch platform streamingowych</span>
                    <span className="shrink-0 font-mono text-xs font-semibold text-emerald-300">−30 zł/mies.</span>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Płatności cykliczne */}
          <Reveal delay={0.08}>
            <SpotlightCard className="h-full p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                <Repeat className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">Płatności, które księgują się same</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Dodaj czynsz, internet czy Netflix raz. W dniu płatności wpadną do wydatków, a termin przeskoczy dalej.
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                    <Repeat className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">Czynsz</p>
                    <p className="text-[11px] text-emerald-300">zaksięgowano 1. dnia miesiąca</p>
                  </div>
                  <span className="font-mono text-xs text-foreground">−1 850 zł</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                    <Repeat className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">Netflix</p>
                    <p className="text-[11px] text-muted-foreground">przypomnienie: za 3 dni</p>
                  </div>
                  <span className="font-mono text-xs text-foreground">−43,99 zł</span>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Limity */}
          <Reveal>
            <SpotlightCard className="h-full p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                <Target className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">Limity na kategorie</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Ustaw budżet na miesiąc i limity na kategorie. Pasek zmienia kolor, zanim będzie za późno.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                {limitBars.map((b) => (
                  <div key={b.label}>
                    <div className="mb-1 flex justify-between text-[11px]">
                      <span className="text-muted-foreground">{b.label}</span>
                      <span className="font-mono tabular-nums text-foreground">{b.pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(b.pct, 100)}%`, backgroundColor: b.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Prognoza */}
          <Reveal delay={0.08}>
            <SpotlightCard className="h-full p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <TrendingUp className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">Prognoza miesiąca</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Tempo wydatków plus zaplanowane płatności: wiesz, na ile starczy budżetu i ile możesz wydawać dziennie.
              </p>

              <p className="mt-6 font-mono text-3xl font-semibold tabular-nums text-foreground">≈ 4 210 zł</p>
              <p className="mt-1 text-xs text-muted-foreground">prognoza na koniec miesiąca przy budżecie 4 800 zł</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full w-[88%] rounded-full bg-linear-to-r from-emerald-400 to-sky-400" />
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Bezpieczeństwo */}
          <Reveal delay={0.16}>
            <SpotlightCard className="h-full p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                <Lock className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">Dane tylko dla Ciebie</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Row Level Security: widzisz tylko swoje rekordy, nawet przy bezpośrednim zapytaniu do API.
              </p>
              <code className="mt-6 block rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2.5 font-mono text-xs text-emerald-300">
                using (auth.uid() = user_id)
              </code>
            </SpotlightCard>
          </Reveal>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">Liczby w kartach to przykładowe dane.</p>
      </section>

      {/* ===== Jak to działa ===== */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">Jak to działa</h2>
          <p className="mt-4 text-muted-foreground">Trzy kroki od chaosu do pełnej kontroli.</p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(({ n, icon: Icon, title, text }, i) => (
            <Reveal key={n} delay={i * 0.1}>
              <div className="glass-card h-full p-7">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-gradient font-mono text-4xl font-semibold">{n}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Kalkulator ===== */}
      <section id="calculator" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Ile możesz wydawać <span className="text-gradient">dziennie?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Wpisz budżet, stałe opłaty i cel oszczędzania. Zobacz, ile zostaje na życie.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <BudgetCalculator />
        </Reveal>
      </section>

      {/* ===== Pod maską ===== */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <Reveal>
          <p className="mb-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">Pod maską</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {stack.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-6 py-24">
        <Reveal className="mb-10 text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">Najczęstsze pytania</h2>
        </Reveal>

        <div className="flex flex-col gap-3">
          {faqs.map(({ q, a }, i) => (
            <Reveal key={q} delay={i * 0.05}>
              <details className="glass-card group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                  {q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Końcowe CTA ===== */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <Reveal>
          <div className="glass-card relative overflow-hidden px-6 py-16 text-center sm:px-12">
            <AuroraBackground />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold text-foreground sm:text-4xl">
                Gotowy, żeby wiedzieć, <span className="text-gradient">na czym stoisz?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Załóż konto w minutę albo od razu zobacz aplikację na przykładowych danych.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/login?mode=signup" className={ctaPrimaryLg}>
                  Zacznij za darmo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <DemoButton
                  size="lg"
                  className="h-12 border-white/10 bg-white/[0.03] px-7 text-base hover:border-emerald-500/30 hover:bg-white/[0.06]"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Stopka ===== */}
      <footer className="border-t border-white/[0.06] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="font-display text-sm font-semibold text-foreground">PayGuard</span>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} PayGuard. Projekt portfolio.
          </p>
        </div>
      </footer>
    </div>
  );
}