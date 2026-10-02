"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { signOut } from "@/lib/logout";
import { AppSidebar } from "./AppSidebar";

export function AppLayout({
  user,
  children,
}: {
  user: { username: string; name: string; avatarImage: string };
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const logout = async () => {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await signOut();
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Could not log out.",
      );
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <header className="h-16 border-b border-zinc-200">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5 sm:px-6">
          <Logo />
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-md p-1.5 text-sm font-medium hover:bg-zinc-50"
              aria-expanded={menuOpen}
            >
              <UserAvatar
                name={user.name || user.username}
                src={user.avatarImage}
                size="sm"
              />
              <span className="hidden sm:inline">
                {user.name || user.username}
              </span>
              <ChevronDown className="size-4 text-zinc-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-36 rounded-md border border-zinc-200 bg-white p-1 shadow-lg">
                <button
                  type="button"
                  onClick={logout}
                  disabled={loggingOut}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loggingOut ? "Logging out…" : "Log out"}
                </button>
                {logoutError && (
                  <p role="alert" className="px-3 pb-2 text-xs text-red-600">
                    {logoutError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-6 md:grid-cols-[176px_minmax(0,1fr)] md:gap-12">
        <AppSidebar username={user.username} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
