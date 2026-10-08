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
          <p class="footer">PayGuard — inteligentny menedżer subskrypcji. To wiadomość testowa (tryb deweloperski).</p>
        </div>
      </body>
    </html>
  `;
}

export function welcomeEmailHtml() {
  return wrapper(`
    <h1 style="margin-top:0;">Witaj w PayGuard! 👋</h1>
    <p class="muted">
      Cieszymy się, że tu jesteś. Od teraz wszystkie Twoje subskrypcje masz w jednym miejscu,
      a nasz Doradca AI pomoże Ci znaleźć oszczędności, o których nawet nie wiedziałeś.
    </p>
    <a href="#" class="btn">Przejdź do panelu</a>
  `);
}

export function renewalReminderEmailHtml(params: {
  subscriptionName: string;
  price: number;
  billingCycle: string;
}) {
  const { subscriptionName, price, billingCycle } = params;
  return wrapper(`
    <h1 style="margin-top:0;">Nadchodzi odnowienie ⏰</h1>
    <p class="muted">
      Twoja subskrypcja <strong style="color:#F5F7FA;">${subscriptionName}</strong>
      odnawia się za <strong class="accent">3 dni</strong>.
    </p>
    <p class="amount">${price.toFixed(2)} zł <span style="font-size:14px;color:#8B93A5;">/ ${billingCycle === "monthly" ? "mies." : "rok"}</span></p>
    <p class="muted">Jeśli już z niej nie korzystasz, to dobry moment, żeby ją anulować.</p>
    <a href="#" class="btn">Zarządzaj subskrypcjami</a>
  `);
}

export function weeklyDigestEmailHtml(params: { monthlyCost: number; subscriptionCount: number }) {
  const { monthlyCost, subscriptionCount } = params;
  return wrapper(`
    <h1 style="margin-top:0;">Twoje tygodniowe podsumowanie 📊</h1>
    <p class="muted">Oto jak wygląda Twój budżet subskrypcyjny w tym tygodniu:</p>
    <p class="amount">${monthlyCost.toFixed(2)} zł<span style="font-size:14px;color:#8B93A5;"> / mies.</span></p>
    <p class="muted">Aktywnych subskrypcji: <strong style="color:#F5F7FA;">${subscriptionCount}</strong></p>
    <a href="#" class="btn">Zobacz pełny raport</a>
  `);
}