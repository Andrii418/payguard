import { AlertTriangle } from "lucide-react";

interface BudgetAlertBannerProps {
  monthlyCost: number;
  budgetLimit: number;
}

export function BudgetAlertBanner({ monthlyCost, budgetLimit }: BudgetAlertBannerProps) {
  const overBy = monthlyCost - budgetLimit;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4">
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-400" />
      <p className="text-sm text-foreground">
        Przekroczono miesięczny limit budżetu o{" "}
        <span className="font-mono font-semibold text-red-400">{overBy.toFixed(2)} zł</span>{" "}
        (limit: {budgetLimit.toFixed(2)} zł/mies.).
      </p>
    </div>
  );
}