# PayGuard

**Zawsze wiesz, ile możesz jeszcze wydać.**

PayGuard to aplikacja do prowadzenia całego budżetu: zapisujesz wydatki, pilnujesz limitów, a czynsz i subskrypcje księgują się same. Doradca AI analizuje cały Twój miesiąc i podpowiada, gdzie realnie możesz zaoszczędzić.

**Demo na żywo:** https://payguard-pearl.vercel.app

Przycisk „Wypróbuj demo" tworzy tymczasowe, anonimowe konto z przykładowymi danymi (z historią kilku miesięcy), bez rejestracji.

> Projekt portfolio, stworzony w celach edukacyjnych. Nie łączy się z kontem bankowym, a wydatki wpisuje się ręcznie.

<!--
Zrzuty ekranu (odkomentuj po dodaniu plików do folderu docs/):

![Przegląd budżetu](docs/overview.png)
![Wydatki i limity](docs/expenses.png)
![Doradca AI](docs/advisor.png)
![Widok mobilny](docs/mobile.png)
-->

## Funkcje

**Budżet i wydatki**
- Szybkie dodawanie wydatku (kwota, Enter), edycja, usuwanie z potwierdzeniem, lista pogrupowana po dniach i przełącznik miesięcy
- Budżet miesiąca oraz limity na 9 kategorii, z paskami zmieniającymi kolor (zielony, bursztynowy, czerwony)
- Koszty stałe i zmienne osobno
- Prognoza końca miesiąca (tempo kosztów zmiennych plus zaplanowane płatności) i podpowiedź „ile możesz wydawać dziennie"
- Porównanie z poprzednim miesiącem „do tego samego dnia", a nie z jego pełną sumą

**Płatności cykliczne** (subskrypcje i opłaty stałe, np. czynsz)
- Dodajesz raz, a w dniu płatności księgują się same jako wydatki; termin przeskakuje na kolejny okres
- Zapamiętany dzień miesiąca (płatność 31. nie „ucieka" na 28. po lutym)
- Księgowanie przy wejściu do aplikacji oraz raz dziennie w tle
- Eksport listy do CSV

**Doradca AI**
- Analiza całego budżetu: kategorie, limity, prognoza, trend i płatności cykliczne
- Odpowiedź w strukturze: wniosek, ryzyka z poziomem pilności, oszczędności z kwotami, następne kroki
- Do AI trafiają kategorie, sumy i nazwy płatności cyklicznych (bez opisów wydatków i bez adresu e-mail)

**Przegląd**
- Alerty z prostych reguł (działają bez AI): przekroczenie limitu, prognoza ponad budżet
- Kafelek miesiąca, trend ostatnich 6 miesięcy, wykres kołowy kategorii, najbliższe płatności

**Powiadomienia e-mail** (Resend)
- Powitanie po rejestracji, przypomnienie 3 dni przed płatnością, tygodniowe podsumowanie wydatków (w poniedziałki)

**Tryb demo**
- Anonimowe logowanie Supabase z przykładowymi danymi, reset jednym kliknięciem, automatyczne usuwanie kont po 7 dniach
- Opcjonalna ochrona CAPTCHA (Cloudflare Turnstile) przy logowaniu, rejestracji i trybie demo

**Doświadczenie użytkownika**
- Paleta komend `Ctrl+K` (nawigacja, akcje, wyszukiwanie płatności)
- Synchronizacja na żywo (Supabase Realtime): zmiana w jednej karcie pojawia się w drugiej
- Responsywny układ z menu hamburger na telefonach
- Dostępność: `aria-*`, obsługa klawiatury, `prefers-reduced-motion`
- Ciemny motyw w stylu „glass"

## Decyzje techniczne

**Płatności cykliczne księgowane w bazie, nie w przeglądarce.** Funkcja PL/pgSQL `post_due_recurring` zapisuje zaległe płatności jako wydatki. Jest idempotentna (unikalny indeks na `recurring_id` i dacie), odporna na podwójne wywołanie, a stare, błędnie wpisane terminy tylko po cichu przesuwa, zamiast zalewać historię. Wersja dla użytkownika (`post_my_due_recurring`) działa wyłącznie na jego danych, a wersja „dla wszystkich" jest dostępna tylko dla serwera.

**AI na policzonych liczbach.** Modele językowe słabo liczą, więc przeglądarka składa „migawkę budżetu" (sumy, prognoza, wykorzystanie limitów, trend), a Gemini ma ją zinterpretować. Migawka jest walidowana schematem Zod, odpowiedź wraca jako JSON (też walidowany, łagodnie: za długie teksty są przycinane), a kwoty oszczędności są ograniczane po stronie serwera. Endpoint ponawia próbę przy przeciążeniu modelu (błąd 503) i zwraca osobne, zrozumiałe komunikaty dla zmienionego modelu, złego klucza i wyczerpanego limitu.

**Bezpieczeństwo.**
- Row Level Security w każdej tabeli: użytkownik widzi wyłącznie własne rekordy, także przy bezpośrednim zapytaniu do API
- Endpointy serwerowe ustalają tożsamość z zweryfikowanego tokenu sesji, a nie z danych przesłanych w zapytaniu
- Zadania cron chronione sekretem, endpointy deweloperskie wyłączone na produkcji
- Klucze serwerowe nigdy nie trafiają do przeglądarki

**Realtime z filtrem po użytkowniku.** Zdarzenia DELETE w Supabase nie przechodzą przez RLS, więc tabele mają `replica identity full`, a subskrypcja filtruje po `user_id`. Odświeżenia są łączone (debounce), żeby seria zmian dawała jedno zapytanie.

**Uczciwe liczby.** Porównania z poprzednim miesiącem „do tego samego dnia", prognoza oparta na kosztach zmiennych, a nie na pełnej sumie, oraz brak prognozy w pierwszych dniach miesiąca, gdy próbka jest za mała.

## Stack

| Warstwa | Technologie |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), Framer Motion, Recharts, cmdk |
| Backend i dane | Supabase (PostgreSQL, Auth, Row Level Security, Realtime), funkcje PL/pgSQL |
| AI | Google Gemini (`@google/genai`) |
| Walidacja | Zod |
| E-mail | Resend |
| Ochrona przed botami | Cloudflare Turnstile (opcjonalnie) |
| Hosting i cron | Vercel |

## Struktura projektu

```text
app/
  dashboard/            Przegląd budżetu
  expenses/             Wydatki, budżet i limity
  subscriptions/        Płatności cykliczne
  settings/             Ustawienia (limit na subskrypcje, sesja)
  login/                Logowanie i rejestracja
  api/analyze/          Doradca AI
  api/cron/             Zadania cykliczne (daily, post-recurring, przypomnienia, podsumowanie, sprzątanie demo)
components/             Komponenty UI i sekcje aplikacji
lib/                    Logika: analityka miesiąca, migawka budżetu, alerty, demo, hooki, schematy Zod
supabase/schema.sql     Schemat bazy danych (tabele, RLS, funkcje)
vercel.json             Harmonogram zadania cron
```

## Ograniczenia

- **E-maile:** bez własnej, zweryfikowanej domeny darmowy plan Resend dostarcza wiadomości wyłącznie na adres właściciela konta Resend.
- **Brak integracji z bankiem:** wydatki wpisuje się ręcznie, a stałe płatności księgują się same.
- **Darmowe limity:** Gemini (limity zapytań i okresowe przeciążenia), Resend i Supabase wystarczają na portfolio, ale nie na duży ruch. Nazwa modelu Gemini bywa zmieniana przez Google (jest w `app/api/analyze/route.ts`).
- **Analiza AI** może zawierać błędy i nie jest poradą finansową.

## Autor

[@Andrii418](https://github.com/Andrii418)


