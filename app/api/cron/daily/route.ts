import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { GET as renewalReminders } from "@/app/api/cron/renewal-reminders/route";
import { GET as weeklyDigest } from "@/app/api/cron/weekly-digest/route";
import { GET as cleanupDemoUsers } from "@/app/api/cron/cleanup-demo-users/route";
import { GET as postRecurring } from "@/app/api/cron/post-recurring/route";

export const maxDuration = 60;

async function runJob(name: string, handler: (req: NextRequest) => Promise<Response>, req: NextRequest) {
  try {
    const res = await handler(req);
    return { job: name, status: res.status, result: await res.json() };
  } catch (err) {
    // Błąd jednego zadania nie blokuje pozostałych.
    console.error(`Zadanie cron "${name}" nie powiodło się:`, err);
    return { job: name, status: 500, result: null };
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const results = [await runJob("post-recurring", postRecurring, req)];
  results.push(await runJob("renewal-reminders", renewalReminders, req));

  // Tygodniowe podsumowanie wysyłamy tylko w poniedziałki (harmonogramy Vercela są w UTC).
  if (new Date().getUTCDay() === 1) {
    results.push(await runJob("weekly-digest", weeklyDigest, req));
  }

  results.push(await runJob("cleanup-demo-users", cleanupDemoUsers, req));

  return NextResponse.json({ results });
}