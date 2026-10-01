"use client";

import { useState } from "react";

type UserAvatarProps = {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function UserAvatar({
  name,
  src,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const sizes = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-12 text-base",
  };
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt={`${name}'s avatar`}
        onError={() => setFailedSrc(src)}
        className={`${sizes[size]} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-label={`${name}'s avatar`}
      className={`${sizes[size]} grid shrink-0 place-items-center rounded-full bg-zinc-100 font-medium text-zinc-700 ${className}`}
    >
      {initials}
    </span>
  );
}
