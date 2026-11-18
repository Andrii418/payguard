"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { TURNSTILE_SITE_KEY } from "@/lib/captcha";

export interface CaptchaHandle {
  getToken: () => Promise<string | undefined>;
  reset: () => void;
}

interface CaptchaProps {
  mode: "auto" | "on-demand";
  className?: string;
}

const TIMEOUT_MS = 30_000;

export const Captcha = forwardRef<CaptchaHandle, CaptchaProps>(function Captcha({ mode, className }, ref) {
  const widgetRef = useRef<TurnstileInstance | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      async getToken() {
        if (!TURNSTILE_SITE_KEY) return undefined;

        const widget = widgetRef.current;
        if (!widget) throw new Error("Widżet CAPTCHA nie jest jeszcze gotowy.");

        if (widget.isExpired()) widget.reset();
        if (mode === "on-demand") widget.execute();
        return widget.getResponsePromise(TIMEOUT_MS);
      },

      reset() {
        try {
          widgetRef.current?.reset();
        } catch {
        }
      },
    }),
    [mode]
  );

  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <div className={className}>
      <Turnstile
        ref={widgetRef}
        siteKey={TURNSTILE_SITE_KEY}
        options={{
          theme: "dark",
          language: "pl",
          appearance: mode === "auto" ? "always" : "interaction-only",
          execution: mode === "on-demand" ? "execute" : "render",
          responseField: false,
        }}
      />
    </div>
  );
});
