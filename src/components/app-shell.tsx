import type { ReactNode } from "react";
import Link from "next/link";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link className="text-lg font-semibold tracking-wide" href="/">MowStudio</Link>
          <nav aria-label="Điều hướng chính">
            <Link className="text-sm text-stone-300 hover:text-amber-300" href="/studios">Studio</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}
