import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  Lock,
  Mail,
  Plus,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { AuroraBackground } from "@/components/aurora-background";
import { HeroPreview } from "@/components/hero-preview";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/reveal";
import { SpotlightCard } from "@/components/spotlight-card";
import { SavingsCalculator } from "@/components/savings-calculator";
import { DemoButton } from "@/components/demo-button";
import { ctaPrimaryLg } from "@/lib/ui-classes";

const steps = [
  {
    n: "01",
    icon: Plus,
    title: "Dodaj subskrypcje",
    text: "Wpisz nazwę, cenę i datę odnowienia. Albo od razu wypróbuj tryb demo z gotowymi danymi.",
  },
  {
    n: "02",
    icon: BarChart3,
    title: "Zobacz obraz całości",
    text: "Dashboard liczy koszt miesięczny i roczny, pokazuje podział na kategorie i oś nadchodzących płatności.",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Oszczędzaj z pomocą AI",
    text: "Doradca wskaże nakładające się usługi, a przypomnienia e-mail ostrzegą przed każdym odnowieniem.",
  },
];

const chartBars = [
  { c: "#A78BFA", h: 70 },
  { c: "#38BDF8", h: 45 },
  { c: "#34D399", h: 90 },
  { c: "#FBBF24", h: 30 },
  { c: "#A78BFA", h: 55 },
  { c: "#34D399", h: 75 },
];

const freeFeatures = ["Do 5 subskrypcji", "Wykresy i karty KPI", "Limit budżetu z alertem"];
const proFeatures = [
  "Nielimitowane subskrypcje",
  "Doradca Finansowy AI",
  "Eksport danych do CSV",
  "Portal rozliczeń Stripe",
];

const stack = [
  "Next.js 16",
  "TypeScript",
  "Tailwind CSS 4",
  "Supabase",
  "Stripe",
  "Google Gemini",
  "Framer Motion",
  "Recharts",
];

const faqs = [
  {
    q: "Czy PayGuard jest darmowy?",
    a: "Tak, plan Free jest dostępny od razu i bez karty. Plan Pro to płatny dodatek z dodatkowymi funkcjami.",
  },
  {
    q: "Czy płatności są prawdziwe?",
    a: "Nie. PayGuard to projekt portfolio, a płatności działają wyłącznie w trybie testowym Stripe. Nie pobieramy prawdziwych pieniędzy, a do testów służy karta 4242 4242 4242 4242.",
  },
  {
    q: "Czy moje dane są bezpieczne?",
    a: "Dane chroni Row Level Security na poziomie bazy PostgreSQL: każdy użytkownik widzi wyłącznie własne rekordy, nawet gdyby ktoś próbował pytać API bezpośrednio. Klucze serwerowe nigdy nie trafiają do przeglądarki.",
  },
  {
    q: "Jak działa Doradca AI?",
    a: "Do Google Gemini wysyłamy tylko listę Twoich subskrypcji (nazwa, cena, cykl, kategoria). Nie wysyłamy adresu e-mail ani hasła. W odpowiedzi dostajesz analizę nakładających się usług i szacunek oszczędności.",
  },
  {
    q: "Czy mogę wypróbować bez rejestracji?",
    a: "Tak. Tryb demo tworzy tymczasowe, anonimowe konto z przykładowymi danymi. Możesz je dowolnie edytować i w każdej chwili zresetować.",
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
                Doradca finansowy oparty na AI
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Przestań płacić za to, <span className="text-gradient">czego nie używasz.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                PayGuard zbiera wszystkie Twoje subskrypcje w jednym miejscu, analizuje je sztuczną inteligencją i
                pokazuje, ile realnie możesz oszczędzić. Zanim bank pobierze kolejną opłatę.
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
                {["Bez karty kredytowej", "Plan darmowy na start", "Demo bez rejestracji"].map((t) => (
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

      {/* ===== Pasek serwisów ===== */}
      <section className="border-y border-white/[0.06] bg-white/[0.015] py-8">
        <p className="mb-5 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Śledź wszystko w jednym miejscu, od streamingu po chmurę
        </p>
        <Marquee />
      </section>

      {/* ===== Funkcje (bento) ===== */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Wszystko, czego potrzebujesz, żeby <span className="text-gradient">odzyskać kontrolę</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Jedna aplikacja zamiast kalkulatora w głowie i piętnastu zapomnianych kart.
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          <Reveal className="md:col-span-2">
            <SpotlightCard className="h-full p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">Doradca Finansowy AI</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Google Gemini analizuje Twoje subskrypcje, wykrywa duplikaty i podpowiada, gdzie realnie możesz
                oszczędzić.
              </p>
              <div className="mt-6 rounded-xl border border-white/[0.08] bg-black/25 p-4 text-sm">
                <p className="mb-2 flex items-center justify-between text-xs text-violet-300">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Doradca AI
                  </span>
                  <span className="text-muted-foreground">przykładowa odpowiedź</span>
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  Masz <strong className="text-foreground">4 platformy streamingowe</strong> za łącznie 135,96 zł
                  miesięcznie. Rezygnacja z dwóch z nich może dać{" "}
                  <strong className="text-emerald-300">około 60 zł</strong> oszczędności co miesiąc.
                </p>
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.08}>
            <SpotlightCard className="h-full p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                <BarChart3 className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">Analityka na żywo</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Wykresy kategorii, prognoza burn rate i oś płatności na 30 dni.
              </p>
              <div className="mt-6 flex h-20 items-end gap-2">
                {chartBars.map((b, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{ height: `${b.h}%`, background: `linear-gradient(to top, ${b.c}22, ${b.c})` }}
                  />
                ))}
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal>
            <SpotlightCard className="h-full p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <Lock className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">Bezpieczeństwo danych</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Row Level Security: widzisz tylko swoje dane, nawet przy bezpośrednim zapytaniu do API.
              </p>
              <code className="mt-6 block rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2.5 font-mono text-xs text-emerald-300">
                using (auth.uid() = user_id)
              </code>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.08}>
            <SpotlightCard className="h-full p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                <Mail className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">Przypomnienia e-mail</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Wiadomość 3 dni przed odnowieniem, żeby nic Cię nie zaskoczyło.
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2.5">
                <Bell className="h-4 w-4 shrink-0 text-amber-300" />
                <p className="truncate text-xs text-muted-foreground">Netflix odnawia się za 3 dni</p>
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.16}>
            <SpotlightCard className="h-full p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300">
                <Wallet className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">Limit budżetu</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Ustaw miesięczny próg, a PayGuard ostrzeże Cię, gdy go przekroczysz.
              </p>
              <div className="mt-6">
                <div className="mb-1.5 flex justify-between font-mono text-[11px] text-muted-foreground">
                  <span>246 zł</span>
                  <span>limit 300 zł</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full w-[82%] rounded-full bg-linear-to-r from-amber-400 to-orange-400" />
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
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
            Ile tak naprawdę <span className="text-gradient">tracisz?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Przesuń suwaki i zobacz, ile kosztują zapomniane subskrypcje.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <SavingsCalculator />
        </Reveal>
      </section>

      {/* ===== Cennik ===== */}
      <section id="pricing" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Prosty, uczciwy cennik
          </h2>
          <p className="mt-4 text-muted-foreground">Zacznij za darmo. Przejdź na Pro, kiedy będziesz gotowy.</p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="glass-card h-full p-8">
              <h3 className="font-display text-xl font-semibold text-foreground">Free</h3>
              <p className="mt-3 font-mono text-4xl font-semibold text-foreground">0 zł</p>
              <p className="mb-7 mt-1 text-sm text-muted-foreground">na zawsze</p>
              <ul className="mb-8 flex flex-col gap-3">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login?mode=signup"
                className="flex h-11 w-full items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-sm font-medium text-foreground transition-colors hover:border-emerald-500/30 hover:bg-white/[0.06]"
              >
                Zacznij za darmo
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="h-full rounded-2xl bg-linear-to-b from-emerald-400/70 via-emerald-500/20 to-transparent p-px">
              <div className="relative h-full overflow-hidden rounded-[15px] bg-[#0b0d13] p-8">
                <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-emerald-500/25 blur-3xl" />
                <span className="absolute right-6 top-6 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                  Najpopularniejszy
                </span>
                <h3 className="relative font-display text-xl font-semibold text-foreground">Pro</h3>
                <p className="relative mt-3 font-mono text-4xl font-semibold text-foreground">
                  29,99 zł<span className="text-base font-normal text-muted-foreground"> / mies.</span>
                </p>
                <p className="relative mb-7 mt-1 text-sm text-muted-foreground">rozliczane co miesiąc</p>
                <ul className="relative mb-8 flex flex-col gap-3">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                      <Check className="h-4 w-4 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login?mode=signup" className={`${ctaPrimaryLg} relative w-full`}>
                  Przejdź na Pro
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
          Projekt portfolio: płatności działają w trybie testowym Stripe, więc nie pobieramy prawdziwych pieniędzy.
          Różnice między planami są ilustracyjne.
        </p>
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
                Gotowy, żeby odzyskać kontrolę nad <span className="text-gradient">subskrypcjami?</span>
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
            © {new Date().getFullYear()} PayGuard. Projekt portfolio, płatności w trybie testowym.
          </p>
        </div>
      </footer>
    </div>
  );
}