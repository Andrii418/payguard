"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ctaPrimary } from "@/lib/ui-classes";

const links = [
  { href: "#features", label: "Funkcje" },
  { href: "#how", label: "Jak to działa" },
  { href: "#calculator", label: "Kalkulator" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));

    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const solid = scrolled || menuOpen;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        solid ? "border-b border-white/[0.08] bg-obsidian/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
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

        <div className="flex items-center gap-3 sm:gap-4">
          {isLoggedIn ? (
            <Link href="/dashboard" className={ctaPrimary}>
              Panel
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
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Zacznij za darmo</span>
              </Link>
            </>
          )}

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={menuOpen}
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-white/[0.06] active:scale-95 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/[0.08] md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={closeMenu}
                  className="rounded-lg px-2 py-3 text-base text-muted-foreground transition-colors hover:text-foreground active:bg-white/[0.05]"
                >
                  {l.label}
                </a>
              ))}
              {!isLoggedIn && (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-lg px-2 py-3 text-base text-foreground active:bg-white/[0.05]"
                >
                  Zaloguj się
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}