import type { Metadata, Viewport } from "next";
import { Anybody, Newsreader } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { InkCursor } from "@/components/providers/InkCursor";

const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  axes: ["wdth"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Overprint — risograph studio, Bandung",
  description:
    "Overprint prints zines, posters and small books on a risograph in Bandung. Two inks at a time, one pass each.",
};

export const viewport: Viewport = {
  themeColor: "#ebece6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anybody.variable} ${newsreader.variable}`}>
      <body>
        <SmoothScroll>
          {children}
          <InkCursor />
        </SmoothScroll>
        <div aria-hidden className="paper-grain pointer-events-none fixed inset-0 z-[90] opacity-70" />
      </body>
    </html>
  );
}
