export function LiveChip({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        live
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-white/10 bg-white/[0.04] text-muted-foreground"
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400" : "bg-muted-foreground"}`}
        />
      </span>
      {live ? "Synchronizacja na żywo" : "Łączenie..."}
    </span>
  );
}