export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined;

export const CAPTCHA_FAILED_MESSAGE =
  "Nie udało się potwierdzić, że jesteś człowiekiem. Wyłącz blokery reklam dla tej strony, odśwież ją i spróbuj ponownie.";

export function isCaptchaError(message: string | undefined | null): boolean {
  return Boolean(message && message.toLowerCase().includes("captcha"));
}