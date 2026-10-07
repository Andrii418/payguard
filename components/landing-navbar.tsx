"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export function LandingNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-500/10 bg-obsidian/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <span className="font-display text-lg font-semibold text-foreground">PayGuard</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Funkcje
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Cennik
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {isLoggedIn ? "Przejdź do panelu" : "Zaloguj się"}
          </Link>
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <Button className="bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] active:scale-[0.97]">
              {isLoggedIn ? "Panel" : "Zacznij za darmo"}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}