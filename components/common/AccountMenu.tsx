"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { signOut } from "@/lib/logout";
import { UserAvatar } from "./UserAvatar";

type AccountMenuProps = {
  user: { username: string; name: string; avatarImage: string };
};

export function AccountMenu({ user }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const displayName = user.name || user.username;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const logout = async () => {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await signOut();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Could not log out.");
      setLoggingOut(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Account menu for ${displayName}`}
        aria-expanded={open}
        aria-controls={menuId}
        className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      >
        <UserAvatar name={displayName} src={user.avatarImage} size="sm" />
        <span className="hidden max-w-32 truncate sm:inline">{displayName}</span>
        <ChevronDown aria-hidden="true" className="size-4 text-zinc-600" />
      </button>
      {open && (
        <div
          id={menuId}
          className="absolute right-0 top-full z-30 mt-2 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
        >
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center rounded-md px-3 text-sm text-zinc-950 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900"
          >
            Account settings
          </Link>
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="flex min-h-11 w-full items-center rounded-md px-3 text-left text-sm text-zinc-950 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
          {logoutError && (
            <p role="alert" className="px-3 py-2 text-xs text-red-700">
              {logoutError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
