export interface TooltipRow {
  color: string;
  label: string;
  value: string;
}

export interface TooltipPayloadItem {
  name?: string | number;
  value?: number | string | readonly (number | string)[];
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

export interface RechartsTooltipProps {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  label?: string | number;
}

interface ChartTooltipCardProps {
  title?: string;
  rows: TooltipRow[];
  footer?: { label: string; value: string };
}

// Wspólny, "szklany" wygląd tooltipów we wszystkich wykresach.
export function ChartTooltipCard({ title, rows, footer }: ChartTooltipCardProps) {
  return (
    <div className="min-w-[170px] rounded-xl border border-white/10 bg-[#0b0d13]/90 px-3.5 py-3 text-xs shadow-2xl shadow-black/50 backdrop-blur-xl">
      {title && <p className="mb-2 font-medium text-foreground">{title}</p>}

      <div className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: row.color, boxShadow: `0 0 8px ${row.color}` }}
              />
              {row.label}
            </span>
            <span className="font-mono font-semibold tabular-nums text-foreground">{row.value}</span>
          </div>
        ))}
      </div>

      {footer && (
        <div className="mt-2 flex items-center justify-between gap-6 border-t border-white/10 pt-2">
          <span className="text-muted-foreground">{footer.label}</span>
          <span className="font-mono font-semibold tabular-nums text-emerald-300">{footer.value}</span>
        </div>
      )}
    </div>
  );
}