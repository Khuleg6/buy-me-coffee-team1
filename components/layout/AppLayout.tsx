"use client";

import { Logo } from "@/components/common/Logo";
import { AccountMenu } from "@/components/common/AccountMenu";
import { AppSidebar } from "./AppSidebar";

export function AppLayout({
  user,
  children,
}: {
  user: { username: string; name: string; avatarImage: string };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <header className="h-16 border-b border-zinc-200">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5 sm:px-6">
          <Logo />
          <AccountMenu user={user} />
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-6 md:grid-cols-[176px_minmax(0,1fr)] md:gap-12">
        <AppSidebar username={user.username} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
