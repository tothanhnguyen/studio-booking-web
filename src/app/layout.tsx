import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { signOutAction } from "@/features/auth/application/auth-actions";
import { getCurrentActor } from "@/features/auth/application/current-actor";

import "./globals.css";

export const metadata: Metadata = {
  title: "MowStudio",
  description: "Đặt lịch creative studio tại MowStudio.",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const actor = await getCurrentActor();
  return (
    <html lang="vi">
      <body>
        <AppShell actor={actor} onSignOut={signOutAction}>{children}</AppShell>
      </body>
    </html>
  );
}
