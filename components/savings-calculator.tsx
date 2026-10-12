"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";
import { ctaPrimaryLg } from "@/lib/ui-classes";

interface SliderRowProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  display: string;
  onChange: (value: number) => void;
}

function SliderRow({ id, label, value, min, max, display, onChange }: SliderRowProps) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm text-muted-foreground">
          {label}
        </label>
        <span className="font-mono text-base font-semibold tabular-nums text-foreground">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-400"
      />
    </div>
  );
}

export function SavingsCalculator() {
  const [count, setCount] = useState(8);
  const [avg, setAvg] = useState(35);
  const [unused, setUnused] = useState(3);

  // Liczba nieużywanych nie może przekroczyć liczby subskrypcji.
  const unusedValue = Math.min(unused, count);
  const monthlyTotal = count * avg;
  const monthlyWaste = unusedValue * avg;
  const yearlyWaste = monthlyWaste * 12;
  const share = monthlyTotal > 0 ? monthlyWaste / monthlyTotal : 0;

  return (
    <div className="glass-card grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col justify-center gap-8">
        <SliderRow
          id="calc-count"
          label="Ile masz subskrypcji?"
          value={count}
          min={1}
          max={20}
          display={String(count)}
          onChange={setCount}
        />
        <SliderRow
          id="calc-avg"
          label="Średnia cena jednej (miesięcznie)"
          value={avg}
          min={10}
          max={100}
          display={`${avg} zł`}
          onChange={setAvg}
        />
        <SliderRow
          id="calc-unused"
          label="Z ilu z nich rzadko korzystasz?"
          value={unusedValue}
          min={0}
          max={count}
          display={String(unusedValue)}
          onChange={setUnused}
        />
      </div>

      <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl" />

        <p className="relative text-sm text-muted-foreground">Rocznie możesz zaoszczędzić</p>
        <p className="relative mt-2 font-mono text-5xl font-semibold tabular-nums text-foreground sm:text-6xl">
          <AnimatedNumber value={yearlyWaste} decimals={0} />
          <span className="ml-2 text-2xl text-muted-foreground">zł</span>
        </p>

        {unusedValue === 0 ? (
          <p className="relative mt-3 text-sm text-muted-foreground">
            Brawo, korzystasz ze wszystkiego, za co płacisz. PayGuard i tak pomoże Ci pilnować terminów odnowień.
          </p>
        ) : (
          <>
            <p className="relative mt-3 text-sm text-muted-foreground">
              czyli{" "}
              <span className="font-mono font-semibold text-foreground">{monthlyWaste} zł</span> miesięcznie, około{" "}
              <span className="font-mono font-semibold text-foreground">{Math.round(share * 100)}%</span> Twoich
              wydatków na subskrypcje.
            </p>
            <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-400 to-sky-400 transition-all duration-500"
                style={{ width: `${share * 100}%` }}
              />
            </div>
          </>
        )}

        <Link href="/login?mode=signup" className={`${ctaPrimaryLg} relative mt-8 w-fit`}>
          Sprawdź swoje prawdziwe liczby
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="relative mt-3 text-[11px] text-muted-foreground">
          Szacunek na podstawie Twoich odpowiedzi. To nie jest porada finansowa.
        </p>
      </div>
    </div>
  );
}