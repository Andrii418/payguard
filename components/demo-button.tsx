"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Captcha, type CaptchaHandle } from "@/components/captcha";
import { startDemo } from "@/lib/demo";

interface DemoButtonProps {
  size?: "default" | "sm" | "lg";
  className?: string;
  fullWidth?: boolean;
}

export function DemoButton({ size = "default", className, fullWidth }: DemoButtonProps) {
  const router = useRouter();
  const captchaRef = useRef<CaptchaHandle>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    const { error } = await startDemo(async () => captchaRef.current?.getToken());

    captchaRef.current?.reset();

    if (error) {
      setLoading(false);
      toast.error("Nie udało się uruchomić trybu demo.", { description: error });
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className={`relative ${fullWidth ? "w-full" : "inline-flex"}`}>
      <Button
        size={size}
        variant="outline"
        onClick={handleClick}
        disabled={loading}
        className={`gap-2 ${className ?? ""}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uruchamiam demo...
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Wypróbuj demo
          </>
        )}
      </Button>

      {/* Niewidoczny póki Cloudflare nie uzna że potrzebna jest interakcja, wtedy pojawia się pod przyciskiem. */}
      <Captcha ref={captchaRef} mode="on-demand" className="absolute left-0 top-full z-20 mt-2" />
    </div>
  );
}