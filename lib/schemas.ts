import { z } from "zod";

export const subscriptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nazwa jest wymagana.")
    .max(60, "Nazwa jest za długa (maks. 60 znaków)."),
  price: z.coerce
    .number({ error: "Cena musi być liczbą." })
    .positive("Cena musi być większa od zera.")
    .max(100000, "Cena wygląda na zbyt wysoką — sprawdź, czy to na pewno poprawna wartość."),
  billing_cycle: z.enum(["monthly", "yearly"], {
    error: "Wybierz cykl rozliczeniowy.",
  }),
  category: z.enum(["streaming", "software", "cloud", "other"], {
    error: "Wybierz kategorię.",
  }),
  next_renewal: z
    .string()
    .min(1, "Data odnowienia jest wymagana.")
    .refine((val) => !Number.isNaN(Date.parse(val)), "Nieprawidłowa data."),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

export const analyzeSchema = z.object({
  subscriptions: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
        billing_cycle: z.string(),
        category: z.string(),
      })
    )
    .min(1, "Brak subskrypcji do przeanalizowania."),
});

export const budgetLimitSchema = z
  .coerce.number({ error: "Limit musi być liczbą." })
  .positive("Limit musi być większy od zera.")
  .max(1000000, "Limit wygląda na zbyt wysoki — sprawdź wartość.");

export const authSchema = z.object({
  email: z.string().trim().email("Podaj poprawny adres e-mail."),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków."),
});