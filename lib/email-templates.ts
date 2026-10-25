// Adres aplikacji w linkach z e-maili. Na Vercelu uzupełnia się sam, lokalnie wskazuje localhost.
const baseUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3001");

// Nazwy płatności wpisuje użytkownik, więc przed wstawieniem do HTML-a zamieniamy znaki specjalne.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmt(n: number) {
  return `${n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

const baseStyles = `
  body { background-color: #090A0F; font-family: -apple-system, Segoe UI, Arial, sans-serif; color: #F5F7FA; margin: 0; padding: 0; }
  .container { max-width: 480px; margin: 0 auto; padding: 32px 24px; }
  .card { background-color: rgba(255,255,255,0.03); border: 1px solid rgba(16,185,129,0.2); border-radius: 16px; padding: 32px; }
  .logo { font-size: 18px; font-weight: 600; margin-bottom: 24px; }
  .accent { color: #34D399; }
  .muted { color: #8B93A5; font-size: 14px; line-height: 1.6; }
  .amount { font-family: monospace; font-size: 28px; font-weight: 700; color: #F5F7FA; margin: 16px 0; }
  .btn { display: inline-block; background-color: #10B981; color: #090A0F !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  .footer { margin-top: 32px; font-size: 12px; color: #8B93A5; text-align: center; }
`;

function wrapper(content: string) {
  return `
    <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="logo">🛡️ <span class="accent">PayGuard</span></div>
          <div class="card">${content}</div>
          <p class="footer">PayGuard — Twój budżet w jednym miejscu. Projekt portfolio.</p>
        </div>
      </body>
    </html>
  `;
}

export function welcomeEmailHtml() {
  return wrapper(`
    <h1 style="margin-top:0;">Witaj w PayGuard! 👋</h1>
    <p class="muted">
      Cieszymy się, że tu jesteś. Zapisuj wydatki, ustaw limity i dodaj stałe płatności (czynsz, rachunki,
      subskrypcje): będą się księgować same. Doradca AI przeanalizuje cały Twój miesiąc i podpowie, gdzie
      możesz zaoszczędzić.
    </p>
    <a href="${baseUrl}/dashboard" class="btn">Przejdź do przeglądu</a>
  `);
}

export function renewalReminderEmailHtml(params: {
  name: string;
  price: number;
  billingCycle: string;
  kind: "subscription" | "fixed";
}) {
  const { name, price, billingCycle, kind } = params;
  const hint =
    kind === "subscription"
      ? "Jeśli już z niej nie korzystasz, to dobry moment, żeby ją anulować."
      : "Płatność zaksięguje się automatycznie w Twoich wydatkach w dniu płatności.";

  return wrapper(`
    <h1 style="margin-top:0;">Nadchodzi płatność ⏰</h1>
    <p class="muted">
      Płatność <strong style="color:#F5F7FA;">${escapeHtml(name)}</strong>
      przypada za <strong class="accent">3 dni</strong>.
    </p>
    <p class="amount">${fmt(price)} <span style="font-size:14px;color:#8B93A5;">/ ${billingCycle === "monthly" ? "mies." : "rok"}</span></p>
    <p class="muted">${hint}</p>
    <a href="${baseUrl}/subscriptions" class="btn">Zobacz płatności cykliczne</a>
  `);
}

export function weeklyDigestEmailHtml(params: {
  weekTotal: number;
  monthTotal: number;
  monthName: string;
  topCategory: string | null;
  topCategoryAmount: number;
}) {
  const { weekTotal, monthTotal, monthName, topCategory, topCategoryAmount } = params;

  return wrapper(`
    <h1 style="margin-top:0;">Twój tydzień w liczbach 📊</h1>
    <p class="muted">Tyle wydałeś w ciągu ostatnich 7 dni:</p>
    <p class="amount">${fmt(weekTotal)}</p>
    ${
      topCategory
        ? `<p class="muted">Najwięcej poszło na: <strong style="color:#F5F7FA;">${escapeHtml(topCategory)}</strong> (${fmt(topCategoryAmount)}).</p>`
        : ""
    }
    <p class="muted">Od początku miesiąca (${escapeHtml(monthName)}): <strong style="color:#F5F7FA;">${fmt(monthTotal)}</strong>.</p>
    <a href="${baseUrl}/dashboard" class="btn">Otwórz przegląd budżetu</a>
  `);
}