export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="animate-aurora-a absolute -left-[10%] -top-[20%] h-[520px] w-[520px] rounded-full bg-emerald-500/25 blur-[110px]" />
      <div className="animate-aurora-b absolute -right-[8%] top-[5%] h-[480px] w-[480px] rounded-full bg-violet-500/20 blur-[120px]" />
      <div className="animate-aurora-c absolute left-[30%] top-[35%] h-[420px] w-[420px] rounded-full bg-sky-500/15 blur-[120px]" />
      <div className="bg-grid absolute inset-0" />
    </div>
  );
}