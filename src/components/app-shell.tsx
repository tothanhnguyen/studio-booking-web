import type { ReactNode } from "react";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-white/10 px-6 py-4">
        <span className="text-lg font-semibold tracking-wide">MowStudio</span>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}
