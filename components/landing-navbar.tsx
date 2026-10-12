"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ctaPrimary } from "@/lib/ui-classes";

const links = [
  { href: "#features", label: "Funkcje" },
  { href: "#how", label: "Jak to działa" },
  { href: "#calculator", label: "Kalkulator" },
  { href: "#pricing", label: "Cennik" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));

    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.08] bg-obsidian/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <span className="font-display text-lg font-semibold text-foreground">PayGuard</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link href="/dashboard" className={ctaPrimary}>
              Przejdź do panelu
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Zaloguj się
              </Link>
              <Link href="/login?mode=signup" className={ctaPrimary}>
                Zacznij za darmo
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}