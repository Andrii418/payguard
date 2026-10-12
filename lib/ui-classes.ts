const primaryBase =
  "btn-shine inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 font-semibold text-obsidian shadow-[0_0_0_1px_rgba(16,185,129,0.4),0_8px_30px_-10px_rgba(16,185,129,0.7)] transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.7),0_14px_44px_-10px_rgba(16,185,129,0.9)] active:scale-[0.97]";

const ghostBase =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] font-medium text-foreground backdrop-blur transition-colors hover:border-emerald-500/30 hover:bg-white/[0.06]";

export const ctaPrimary = `${primaryBase} h-10 px-5 text-sm`;
export const ctaPrimaryLg = `${primaryBase} h-12 px-7 text-base`;
export const ctaGhost = `${ghostBase} h-10 px-5 text-sm`;
export const ctaGhostLg = `${ghostBase} h-12 px-7 text-base`;