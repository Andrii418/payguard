"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Bell, Sparkles } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";

const rows = [
  { name: "Netflix", price: "43,99 zł", days: 2, color: "#A78BFA" },
  { name: "GitHub Copilot", price: "40,00 zł", days: 6, color: "#38BDF8" },
  { name: "AWS", price: "120,50 zł", days: 20, color: "#34D399" },
];

const STEP_PATH = "M0 70 H60 V58 H120 V50 H160 V34 H230 V16 H300";

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
            <span className="text-[11px] text-muted-foreground">Przegląd finansowy</span>
            <span className="w-10" />
          </div>

          <p className="text-xs text-muted-foreground">Miesięczny koszt subskrypcji</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-4xl font-semibold tabular-nums text-foreground">
              <AnimatedNumber value={238.96} />
            </span>
            <span className="font-mono text-lg text-muted-foreground">zł</span>
            <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
              −63,98 zł możliwe
            </span>
          </div>

          <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="mt-4 h-20 w-full">
            <defs>
              <linearGradient id="hp-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="hp-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
            <path d={`${STEP_PATH} V70 Z`} fill="url(#hp-fill)" />
            <motion.path
              d={STEP_PATH}
              fill="none"
              stroke="url(#hp-stroke)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, delay: 0.5, ease: "easeInOut" }}
            />
          </svg>

          <div className="mt-4 flex flex-col gap-2">
            {rows.map((r) => (
              <div
                key={r.name}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-sm font-semibold"
                  style={{ backgroundColor: `${r.color}26`, color: r.color }}
                >
                  {r.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">odnowienie za {r.days} dni</p>
                </div>
                <span className="font-mono text-sm tabular-nums text-foreground">{r.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pływające powiadomienia "wysunięte" przed kartę (translateZ) */}
        <div className="absolute -right-3 -top-6 sm:-right-10" style={{ transform: "translateZ(70px)" }}>
          <div className="animate-float flex items-center gap-2.5 rounded-xl border border-amber-400/20 bg-[#0d1017]/95 px-3.5 py-2.5 shadow-xl shadow-black/40">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-foreground">Netflix odnawia się za 2 dni</p>
              <p className="font-mono text-[11px] text-muted-foreground">43,99 zł</p>
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
              <p className="font-mono text-[11px] text-emerald-300">Możliwe oszczędności: 63,98 zł</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}