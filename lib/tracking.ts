export function track(event: string, properties?: Record<string, string | number | boolean>): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[track]", event, properties ?? {});
  }
}