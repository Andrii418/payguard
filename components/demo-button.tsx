"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startDemo } from "@/lib/demo";

interface DemoButtonProps {
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function DemoButton({ size = "default", className }: DemoButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const { error } = await startDemo();

    if (error) {
      setLoading(false);
      toast.error("Nie udało się uruchomić trybu demo.", { description: error });
      return;
    }

    // Celowo nie wyłączamy loading przy sukcesie - przycisk zostaje zablokowany
    // aż do przejścia na dashboard, więc nie da się kliknąć dwa razy.
    router.push("/dashboard");
  }

  return (
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
          Przygotowuję demo...
        </>
      ) : (
        <>
          <Play className="h-4 w-4" />
          Wypróbuj demo
        </>
      )}
    </Button>
  );
}