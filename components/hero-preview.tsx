"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Repeat, Sparkles } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";

// Przykładowy miesiąc: v = wydatki zmienne danego dnia, f = płatność stała (fioletowy fragment słupka).
const DAYS = [
  { v: 28, f: 42 },
  { v: 14, f: 0 },
  { v: 40, f: 14 },
  { v: 22, f: 0 },
  { v: 52, f: 0 },
  { v: 18, f: 10 },
  { v: 36, f: 0 },
  { v: 12, f: 0 },
  { v: 46, f: 0 },
  { v: 30, f: 12 },
  { v: 20, f: 0 },
  { v: 58, f: 0 },
  { v: 16, f: 0 },
  { v: 34, f: 0 },
  { v: 24, f: 0 },
  { v: 44, f: 0 },
  { v: 26, f: 0 },
  { v: 38, f: 0 },
];

export function HeroPreview() {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[520px]"
      style={{ perspective: 1400 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="pointer-events-none absolute inset-6 rounded-full bg-emerald-500/20 blur-3xl" />

      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
        <div className="glass-card p-5 shadow-2xl shadow-black/40">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
            </div>
            <span className="text-[11px] text-muted-foreground">Przegląd budżetu</span>
            <span className="w-10" />
          </div>

          <p className="text-xs text-muted-foreground">Wydano w tym miesiącu</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-4xl font-semibold tabular-nums text-foreground">
              <AnimatedNumber value={3412} decimals={0} />
            </span>
            <span className="font-mono text-lg text-muted-foreground">zł</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">z 4 800 zł</span>
          </div>

          {/* Stałe i zmienne */}
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full bg-indigo-400" style={{ width: "66%" }} />
            <div className="h-full bg-emerald-400" style={{ width: "34%" }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>
              Stałe <span className="font-mono text-foreground">2 238 zł</span>
            </span>
            <span>
              Zmienne <span className="font-mono text-foreground">1 174 zł</span>
            </span>
          </div>

          {/* Budżet */}
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
              <span>Wykorzystano 71% budżetu</span>
              <span>zostało 1 388 zł</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "71%" }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-linear-to-r from-emerald-400 to-sky-400"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Swobodnie możesz wydawać ok. <span className="font-mono text-foreground">75 zł</span> dziennie.
            </p>
          </div>

          {/* Wydatki dzień po dniu */}
          <div className="mt-4 flex h-16 items-end gap-1">
            {DAYS.map((d, i) => (
              <div key={i} className="flex h-full flex-1 flex-col justify-end">
                {d.f > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.f}%` }}
                    transition={{ duration: 0.7, delay: 0.5 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-t-sm bg-indigo-400"
                  />
                )}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${d.v}%` }}
                  transition={{ duration: 0.7, delay: 0.5 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className={`bg-linear-to-t from-emerald-500/40 to-emerald-400 ${d.f > 0 ? "" : "rounded-t-sm"}`}
                />
              </div>
            ))}
          </div>

          <p className="mt-3 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
            Przykładowe dane
          </p>
        </div>

        {/* Pływające powiadomienia "wysunięte" przed kartę (translateZ) */}
        <div className="absolute -right-3 -top-6 sm:-right-10" style={{ transform: "translateZ(70px)" }}>
          <div className="animate-float flex items-center gap-2.5 rounded-xl border border-indigo-400/25 bg-[#0d1017]/95 px-3.5 py-2.5 shadow-xl shadow-black/40">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
              <Repeat className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-foreground">Czynsz zaksięgowany sam</p>
              <p className="font-mono text-[11px] text-muted-foreground">−1 850,00 zł</p>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-6 -left-3 sm:-left-10" style={{ transform: "translateZ(90px)" }}>
          <div className="animate-float flex items-center gap-2.5 rounded-xl border border-violet-400/20 bg-[#0d1017]/95 px-3.5 py-2.5 shadow-xl shadow-black/40 [animation-delay:-3s]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-foreground">Doradca AI</p>
              <p className="font-mono text-[11px] text-emerald-300">Możliwe oszczędności: 112 zł / mies.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}