import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Font nagłówków — charakterystyczny, geometryczny krój dla identyfikacji marki
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

// Font treści — czytelny na małych rozmiarach
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

// Font liczb finansowych — monospace daje efekt "terminala tradingowego"
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PayGuard — Inteligentny Menedżer Subskrypcji",
  description: "Analizuj wydatki, przewiduj odnowienia i oszczędzaj dzięki AI.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-body bg-obsidian text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
