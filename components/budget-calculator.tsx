"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";
import { ctaPrimaryLg } from "@/lib/ui-classes";

const fmt = (n: number) => `${Math.round(n).toLocaleString("pl-PL")} zł`;

interface SliderRowProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function SliderRow({ id, label, value, min, max, step, onChange }: SliderRowProps) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm text-muted-foreground">
          {label}
        </label>
        <span className="shrink-0 font-mono text-base font-semibold tabular-nums text-foreground">{fmt(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-400"
      />
    </div>
  );
}

export function BudgetCalculator() {
  const [budget, setBudget] = useState(5000);
  const [fixed, setFixed] = useState(2400);
  const [goal, setGoal] = useState(600);

  const free = budget - fixed - goal;
  const over = free < 0;
  const perDay = over ? 0 : free / 30; // uproszczenie: 30 dni w miesiącu
  const perWeek = perDay * 7;

  // Szerokości segmentów paska (gdy suma przekracza budżet, skalujemy do sumy, żeby pasek się nie "wylewał")
  const total = Math.max(budget, fixed + goal);
  const pct = (n: number) => `${(Math.max(n, 0) / total) * 100}%`;

  return (
    <div className="glass-card grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col justify-center gap-8">
        <SliderRow
          id="calc-budget"
          label="Miesięczny budżet (np. wypłata)"
          value={budget}
          min={1000}
          max={15000}
          step={100}
          onChange={setBudget}
        />
        <SliderRow
          id="calc-fixed"
          label="Stałe opłaty (czynsz, rachunki, subskrypcje)"
          value={fixed}
          min={0}
          max={10000}
          step={50}
          onChange={setFixed}
        />
        <SliderRow
          id="calc-goal"
          label="Chcę odłożyć miesięcznie"
          value={goal}
          min={0}
          max={5000}
          step={50}
          onChange={setGoal}
        />
      </div>

      <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl" />

        <p className="relative text-sm text-muted-foreground">Swobodnie możesz wydawać dziennie</p>
        <p className="relative mt-2 font-mono text-5xl font-semibold tabular-nums text-foreground sm:text-6xl">
          <AnimatedNumber value={perDay} decimals={0} />
          <span className="ml-2 text-2xl text-muted-foreground">zł</span>
        </p>

        {over ? (
          <p role="alert" className="relative mt-3 text-sm text-red-300">
            Stałe opłaty i cel oszczędności przekraczają budżet o{" "}
            <span className="font-mono">{fmt(-free)}</span>. Zmniejsz cel albo koszty.
          </p>
        ) : (
          <p className="relative mt-3 text-sm text-muted-foreground">
            czyli ok. <span className="font-mono font-semibold text-foreground">{fmt(perWeek)}</span> tygodniowo i{" "}
            <span className="font-mono font-semibold text-foreground">{fmt(free)}</span> na wydatki zmienne w miesiącu.
          </p>
        )}

        <div className="relative mt-5">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full bg-indigo-400 transition-all duration-500" style={{ width: pct(fixed) }} />
            <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: pct(goal) }} />
            <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: pct(free) }} />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Stałe
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Oszczędności
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Na życie
            </span>
          </div>
        </div>

        <Link href="/login?mode=signup" className={`${ctaPrimaryLg} relative mt-8 w-fit`}>
          Pilnuj tego automatycznie
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="relative mt-3 text-[11px] text-muted-foreground">
          Uproszczone wyliczenie (30 dni w miesiącu). To nie jest porada finansowa.
        </p>
      </div>
    </div>
  );
}