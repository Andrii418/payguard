import type { Subscription } from "@/lib/use-subscriptions";

export function exportSubscriptionsToCsv(subscriptions: Subscription[]) {
  const headers = ["Nazwa", "Cena", "Cykl rozliczeniowy", "Kategoria", "Nastepne odnowienie"];

  const rows = subscriptions.map((s) => [
    s.name,
    s.price.toFixed(2).replace(".", ","),
    s.billing_cycle === "monthly" ? "Miesiecznie" : "Rocznie",
    s.category,
    new Date(s.next_renewal).toLocaleDateString("pl-PL"),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `payguard-subskrypcje-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}