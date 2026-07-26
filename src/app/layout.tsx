import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { signOutAction } from "@/features/auth/application/auth-actions";
import { getCurrentActor } from "@/features/auth/application/current-actor";

import "./globals.css";

const sans = Plus_Jakarta_Sans({
  display: "swap",
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  display: "swap",
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const display = Fraunces({
  axes: ["opsz"],
  display: "swap",
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "MowStudio",
  description: "Đặt lịch creative studio tại MowStudio.",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const actor = await getCurrentActor();
  return (
    <html lang="vi">
      <body className={`${sans.variable} ${mono.variable} ${display.variable}`}>
        <AppShell actor={actor} onSignOut={signOutAction}>{children}</AppShell>
      </body>
    </html>
  );
}
