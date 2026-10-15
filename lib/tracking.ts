// Tymczasowa wersja: analityka jest wylaczona, wiec track() niczego nigdzie nie wysyla.
// W trybie deweloperskim zdarzenia widac w konsoli przegladarki (F12), co ulatwia testowanie.
export function track(event: string, properties?: Record<string, string | number | boolean>): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[track]", event, properties ?? {});
  }
}