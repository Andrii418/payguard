import { NextRequest } from "next/server";

// Zadania cykliczne (cron) nie mają "użytkownika" jak zwykłe żądania -
// chronimy je osobnym sekretem, znanym tylko serwerowi i Vercel Cron.
export function isAuthorizedCronRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secretFromHeader = authHeader?.replace("Bearer ", "");
  const secretFromQuery = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;

  if (!expected) return false;
  return secretFromHeader === expected || secretFromQuery === expected;
}