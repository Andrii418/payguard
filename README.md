# PayGuard

Inteligentny menedżer subskrypcji z doradcą AI, który pomaga kontrolować wydatki, śledzić aktywne usługi i wykrywać miejsca, w których można realnie zaoszczędzić.

Aplikacja jest zbudowana w Next.js i pozwala użytkownikowi:
- dodawać i zarządzać subskrypcjami,
- monitorować miesięczny koszt i budżet,
- analizować wydatki według kategorii,
- otrzymywać rekomendacje AI dotyczące zbędnych lub nakładających się usług,
- otrzymywać przypomnienia o odnowieniach.

## Demo i produkcja

- Strona główna: https://payguard-pearl.vercel.app

## Główne funkcje

- Dashboard z podsumowaniem wydatków miesięcznych i rocznych
- Lista aktywnych subskrypcji z kategoriami i datami odnowienia
- Analiza budżetu z alertami przy przekroczeniu limitu
- Doradca AI oparty o Google Gemini, który proponuje oszczędności
- Wykresy i KPI dla kategorii, trendów i przyszłych opłat
- Przypomnienia e-mail przed odnowieniem subskrypcji
- Tryb demo z przykładowymi danymi
- Bezpieczna autoryzacja użytkownika i RLS w Supabase

## Stack technologiczny

- Next.js 16 (App Router)
- TypeScript
- React 19
- Tailwind CSS 4
- Supabase
- Google Gemini API
- Resend (e-mail)
- Recharts
- Framer Motion

## Struktura projektu

```bash
app/                  # widoki aplikacji i routing app router
components/          # komponenty UI i sekcje dashboardu
lib/                 # logika biznesowa, klient Supabase, analityka, auth
public/              # ikony i zasoby statyczne
app/api/             # endpoints API (analiza AI, cron, emaile)
next.config.ts       # konfiguracja Next.js
package.json         # zależności i skrypty
```

## Wymagania

- Node.js 20+
- npm / pnpm / yarn / bun
- Konto Supabase
- Klucz API Google Gemini
- Klucz API Resend (opcjonalnie, jeśli korzystasz z e-maili)

## Uruchomienie lokalne

1. Sklonuj repozytorium:

```bash
git clone https://github.com/Andrii418/payguard.git
cd payguard
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Skonfiguruj zmienne środowiskowe w pliku `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_google_gemini_key
RESEND_API_KEY=your_resend_key
CRON_SECRET=your_cron_secret
```

4. Uruchom środowisko developerskie:

```bash
npm run dev
```

5. Otwórz aplikację w przeglądarce:

```text
http://localhost:3000
```

## Przydatne skrypty

```bash
npm run dev      # start deweloperski
npm run build    # build produkcyjny
npm run start    # uruchomienie produkcyjne
npm run lint     # linting ESLint
```

## Konfiguracja środowiska

Aplikacja używa:
- `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY` w kliencie frontendowym,
- `SUPABASE_SECRET_KEY` w endpointach serwerowych,
- `GEMINI_API_KEY` do analizy subskrypcji przez AI,
- `RESEND_API_KEY` do wysyłki przypomnień e-mail,
- `CRON_SECRET` do ochrony endpointów cron.

## Bezpieczeństwo i prywatność

- dane użytkownika są izolowane przez RLS w Supabase,
- w żądaniach AI wysyłane są tylko podstawowe informacje o subskrypcjach,
- sesja użytkownika jest weryfikowana po stronie serwera,
- endpointy cron są chronione przez `CRON_SECRET`.

