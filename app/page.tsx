"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing-navbar";
import { DashboardPreview } from "@/components/dashboard-preview";
import { Button } from "@/components/ui/button";
import { Sparkles, BarChart3, ShieldCheck, Zap, Check, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Doradca Finansowy AI",
    description:
      "Gemini AI analizuje Twoje subskrypcje, wykrywa duplikaty i podpowiada, gdzie realnie możesz oszczędzić.",
  },
  {
    icon: BarChart3,
    title: "Analityka na żywo",
    description:
      "Wykresy wydatków wg kategorii i prognoza burn rate — widzisz, dokąd zmierzają Twoje pieniądze, zanim to poczujesz w portfelu.",
  },
  {
    icon: ShieldCheck,
    title: "Bezpieczeństwo danych",
    description:
      "Row Level Security na poziomie bazy danych — Twoje dane finansowe widzisz tylko Ty, nawet gdyby ktoś próbował to obejść.",
  },
  {
    icon: Zap,
    title: "Przypomnienia o odnowieniach",
    description:
      "Nigdy więcej nieplanowanego obciążenia karty — zobacz dokładnie, kiedy odnawia się każda subskrypcja.",
  },
];

const freeFeatures = ["Do 5 subskrypcji", "Podstawowe wykresy", "Alerty o odnowieniach"];
const proFeatures = [
  "Nielimitowane subskrypcje",
  "Doradca Finansowy AI",
  "Eksport danych do CSV",
  "Priorytetowe wsparcie",
];

export function fadeInUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
  };
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <motion.div {...fadeInUp()}>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-400">
            <Sparkles className="h-3 w-3" />
            Doradca finansowy oparty na AI
          </span>
          <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Przestań płacić za subskrypcje, z których nie korzystasz.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            PayGuard zbiera wszystkie Twoje subskrypcje w jednym miejscu, analizuje je sztuczną
            inteligencją i pokazuje dokładnie, ile realnie możesz oszczędzić miesięcznie.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/login">
              <Button
                size="lg"
                className="gap-2 bg-emerald-500 px-6 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]"
              >
                Zacznij za darmo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-emerald-500/20 text-foreground hover:bg-white/[0.04]">
                Zobacz funkcje
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Bez karty kredytowej. Plan darmowy dostępny od razu.
          </p>
        </motion.div>

        <motion.div {...fadeInUp(0.15)}>
          <DashboardPreview />
        </motion.div>
      </section>

      {/* Funkcje */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-16">
        <motion.div {...fadeInUp()} className="mb-12 text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground">
            Wszystko, czego potrzebujesz, żeby odzyskać kontrolę
          </h2>
          <p className="mt-3 text-muted-foreground">
            Jedna aplikacja zamiast kalkulatora w głowie i piętnastu zapomnianych kart.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div key={title} {...fadeInUp(i * 0.08)} className="glass-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Icon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cennik */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20 scroll-mt-16">
        <motion.div {...fadeInUp()} className="mb-12 text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground">Prosty, uczciwy cennik</h2>
          <p className="mt-3 text-muted-foreground">Zacznij za darmo. Przejdź na Pro, kiedy będziesz gotowy.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <motion.div {...fadeInUp(0.05)} className="glass-card p-8">
            <h3 className="font-display text-xl font-semibold text-foreground">Free</h3>
            <p className="mt-2 font-mono text-3xl font-semibold text-foreground">0 zł</p>
            <p className="mb-6 text-sm text-muted-foreground">na zawsze</p>
            <ul className="flex flex-col gap-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            {...fadeInUp(0.15)}
            className="glass-card relative overflow-hidden border-emerald-500/40 p-8"
          >
            <span className="absolute right-6 top-6 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              Najpopularniejszy
            </span>
            <h3 className="font-display text-xl font-semibold text-foreground">Pro</h3>
            <p className="mt-2 font-mono text-3xl font-semibold text-foreground">
              29,99 zł<span className="text-base font-normal text-muted-foreground">/mies.</span>
            </p>
            <p className="mb-6 text-sm text-muted-foreground">rozliczane co miesiąc</p>
            <ul className="mb-6 flex flex-col gap-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <Button className="w-full bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]">
                Przejdź na Pro
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stopka */}
      <footer className="border-t border-emerald-500/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="font-display text-sm font-semibold text-foreground">PayGuard</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PayGuard. Projekt portfolio.
          </p>
        </div>
      </footer>
    </div>
  );
}