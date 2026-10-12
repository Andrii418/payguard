const items = [
  "Netflix",
  "Spotify",
  "HBO Max",
  "Disney+",
  "GitHub Copilot",
  "Notion",
  "AWS",
  "Figma",
  "YouTube Premium",
  "iCloud",
  "Siłownia",
  "Domeny",
  "Hosting",
  "Kursy online",
];

export function Marquee() {
  // Lista podwojona + przesunięcie o -50% daje płynną, nieskończoną pętlę.
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div className="animate-marquee flex w-max">
        {loop.map((name, i) => (
          <span
            key={i}
            className="mr-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}