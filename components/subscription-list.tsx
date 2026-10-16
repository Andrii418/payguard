"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { EditSubscriptionDialog } from "@/components/add-subscription-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Subscription } from "@/lib/use-subscriptions";
import { daysUntil, formatPLN, monthlyEquivalent } from "@/lib/analytics";
import { getCategoryMeta } from "@/lib/category-meta";

export type ViewMode = "list" | "grid";

function renewalInfo(days: number) {
  if (days < 0) return { text: "termin minął", cls: "bg-red-500/10 text-red-300" };
  if (days === 0) return { text: "dziś", cls: "bg-red-500/10 text-red-300" };
  if (days === 1) return { text: "jutro", cls: "bg-red-500/10 text-red-300" };
  if (days <= 3) return { text: `za ${days} dni`, cls: "bg-red-500/10 text-red-300" };
  if (days <= 7) return { text: `za ${days} dni`, cls: "bg-amber-500/10 text-amber-300" };
  return { text: `za ${days} dni`, cls: "bg-white/[0.05] text-muted-foreground" };
}

function DeleteSubscriptionButton({
  subscription,
  onDeleted,
}: {
  subscription: Subscription;
  onDeleted: () => void;
}) {
  async function handleDelete() {
    const { error } = await supabase.from("subscriptions").delete().eq("id", subscription.id);

    if (error) {
      toast.error("Nie udało się usunąć subskrypcji.", { description: error.message });
      return;
    }

    toast.success(`Usunięto "${subscription.name}".`);
    onDeleted();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <button
            aria-label={`Usuń ${subscription.name}`}
            className="-m-2 p-2 text-muted-foreground transition-colors hover:text-red-400 sm:m-0 sm:p-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        }
      />
      <AlertDialogContent className="glass-card border-emerald-500/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">Usunąć subskrypcję?</AlertDialogTitle>
          <AlertDialogDescription>
            Na pewno chcesz usunąć &quot;{subscription.name}&quot;? Tej akcji nie można cofnąć.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-500/90">
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ItemProps {
  sub: Subscription;
  totalMonthlyCost: number;
  onChanged: () => void;
}

// Telefon: akcje w osobnym rzędzie pod wierszem. Od 640 px: jak dotąd, z prawej strony,
// a na desktopie (md+) pojawiają się po najechaniu.
const rowActionsClass =
  "flex basis-full items-center justify-end gap-6 border-t border-white/[0.06] pt-2.5 transition-opacity sm:basis-auto sm:justify-start sm:gap-3 sm:border-0 sm:pt-0 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100";

const cardActionsClass =
  "flex items-center gap-5 transition-opacity sm:gap-3 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100";

function SubscriptionRow({ sub, totalMonthlyCost, onChanged }: ItemProps) {
  const meta = getCategoryMeta(sub.category);
  const monthly = monthlyEquivalent(sub);
  const share = totalMonthlyCost > 0 ? monthly / totalMonthlyCost : 0;
  const renewal = renewalInfo(daysUntil(sub.next_renewal));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-emerald-500/20 hover:bg-white/[0.04] sm:flex-nowrap sm:gap-4 sm:p-3.5"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-base font-semibold"
        style={{ backgroundColor: `${meta.color}1F`, color: meta.color }}
      >
        {sub.name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <p className="break-words font-medium text-foreground sm:truncate">{sub.name}</p>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
          >
            {meta.short}
          </span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {new Date(`${sub.next_renewal}T00:00:00`).toLocaleDateString("pl-PL")}
          <span>·</span>
          {sub.billing_cycle === "monthly" ? "co miesiąc" : "co rok"}
          <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${renewal.cls}`}>{renewal.text}</span>
        </p>
      </div>

      <div className="w-24 shrink-0 text-right sm:w-32">
        <p className="font-mono text-sm font-semibold tabular-nums text-foreground">{formatPLN(monthly)}</p>
        <p className="text-[10px] text-muted-foreground">
          {sub.billing_cycle === "yearly" ? `${formatPLN(sub.price)} / rok` : "/ mies."}
        </p>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full" style={{ width: `${share * 100}%`, backgroundColor: meta.color }} />
        </div>
      </div>

      <div className={rowActionsClass}>
        <EditSubscriptionDialog subscription={sub} onUpdated={onChanged} />
        <DeleteSubscriptionButton subscription={sub} onDeleted={onChanged} />
      </div>
    </motion.div>
  );
}

function SubscriptionCard({ sub, totalMonthlyCost, onChanged }: ItemProps) {
  const meta = getCategoryMeta(sub.category);
  const monthly = monthlyEquivalent(sub);
  const share = totalMonthlyCost > 0 ? monthly / totalMonthlyCost : 0;
  const renewal = renewalInfo(daysUntil(sub.next_renewal));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="glass-card group flex flex-col p-5"
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-lg font-semibold"
          style={{ backgroundColor: `${meta.color}1F`, color: meta.color }}
        >
          {sub.name.charAt(0).toUpperCase()}
        </div>
        <div className={cardActionsClass}>
          <EditSubscriptionDialog subscription={sub} onUpdated={onChanged} />
          <DeleteSubscriptionButton subscription={sub} onDeleted={onChanged} />
        </div>
      </div>

      <p className="truncate font-display text-lg font-semibold text-foreground">{sub.name}</p>
      <span
        className="mt-1.5 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium"
        style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
      >
        {meta.label}
      </span>

      <p className="mt-5 font-mono text-2xl font-semibold tabular-nums text-foreground">{formatPLN(monthly)}</p>
      <p className="text-xs text-muted-foreground">
        {sub.billing_cycle === "yearly" ? `${formatPLN(sub.price)} rocznie, w przeliczeniu na miesiąc` : "miesięcznie"}
      </p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full" style={{ width: `${share * 100}%`, backgroundColor: meta.color }} />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">{Math.round(share * 100)}% Twoich wydatków</p>

      <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs text-muted-foreground">
        <span>{new Date(`${sub.next_renewal}T00:00:00`).toLocaleDateString("pl-PL")}</span>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${renewal.cls}`}>{renewal.text}</span>
      </div>
    </motion.div>
  );
}

interface SubscriptionListProps {
  subscriptions: Subscription[];
  loading: boolean;
  view: ViewMode;
  totalMonthlyCost: number;
  onChanged: () => void;
}

export function SubscriptionList({
  subscriptions,
  loading,
  view,
  totalMonthlyCost,
  onChanged,
}: SubscriptionListProps) {
  if (loading) {
    return view === "grid" ? (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    ) : (
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[74px] rounded-xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  const Item = view === "grid" ? SubscriptionCard : SubscriptionRow;

  return (
    <div
      className={
        view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-2.5"
      }
    >
      <AnimatePresence initial={false} mode="popLayout">
        {subscriptions.map((sub) => (
          <Item key={sub.id} sub={sub} totalMonthlyCost={totalMonthlyCost} onChanged={onChanged} />
        ))}
      </AnimatePresence>
    </div>
  );
}