import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PayGuard: budżet, wydatki i doradca AI",
  description:
    "Zapisuj wydatki, pilnuj limitów i pozwól, żeby czynsz oraz subskrypcje księgowały się same. Doradca AI analizuje cały Twój miesiąc.",
  openGraph: {
    title: "PayGuard: budżet, wydatki i doradca AI",
    description: "Zawsze wiesz, ile możesz jeszcze wydać.",
    type: "website",
    locale: "pl_PL",
  },
};

export const viewport: Viewport = {
  themeColor: "#090A0F",
  colorScheme: "dark",
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
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}