import { z } from "zod";
import { EXPENSE_CATEGORY_KEYS } from "@/lib/expense-categories";

export const expenseSchema = z.object({
  amount: z.coerce
    .number({ error: "Kwota musi być liczbą." })
    .positive("Kwota musi być większa od zera.")
    .max(1000000, "Kwota wygląda na zbyt wysoką — sprawdź wartość."),
  category: z.enum(EXPENSE_CATEGORY_KEYS, { error: "Wybierz kategorię." }),
  description: z.string().trim().max(80, "Opis jest za długi (maks. 80 znaków)."),
  spent_on: z
    .string()
    .min(1, "Data jest wymagana.")
    .refine((val) => !Number.isNaN(Date.parse(val)), "Nieprawidłowa data."),
});