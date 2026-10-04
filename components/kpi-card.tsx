"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  glow?: boolean;
  index?: number;
}

export function KpiCard({
  label,
  value,
  prefix = "",
  suffix = "",
  icon: Icon,
  glow,
  index = 0,
}: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 1200, bounce: 0 });

  useEffect(() => {
    motionValue.set(value);
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest * 100) / 100);
    });
    return unsubscribe;
  }, [value, motionValue, springValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="glass-card overflow-hidden p-5"
    >
      {glow && (
        <div className="absolute -right-6 -top-6 h-24 w-24 animate-pulse-glow rounded-full bg-emerald-500 blur-2xl" />
      )}

      <div className="relative flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-emerald-400" />
      </div>

      <p className="relative mt-3 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {prefix}
        {displayValue.toLocaleString("pl-PL")}
        {suffix}
      </p>
    </motion.div>
  );
}