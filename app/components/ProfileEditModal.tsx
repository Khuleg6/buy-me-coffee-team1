"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export type ProfileDetails = {
  name: string;
  about: string;
  socialUrl: string;
  avatarUrl: string;
};

export function ProfileEditModal({
  profile,
  onClose,
  onSave,
}: {
  profile: ProfileDetails;
  onClose: () => void;
  onSave: (updated: ProfileDetails) => Promise<void>;
}) {
  const [name, setName] = useState(profile.name);
  const [about, setAbout] = useState(profile.about);
  const [socialUrl, setSocialUrl] = useState(profile.socialUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      let finalAvatarUrl = profile.avatarUrl;

      // Upload new avatar first if one was picked
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Avatar upload failed");
        }

        const { avatarImageUrl } = await res.json();
        finalAvatarUrl = avatarImageUrl;
      }

      await onSave({ name, about, socialUrl, avatarUrl: finalAvatarUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-[#F4F4F5]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Avatar picker */}
        <div className="mb-5 flex items-center gap-4">
          <div className="relative shsrink-0">
            {avatarPreview && avatarPreview.trim() !== "" ? (
              <Image
                src={avatarPreview}
                alt={name}
                width={64}
                height={64}
                className="rounded-full object-cover"
                style={{ width: 64, height: 64 }}
                unoptimized={
                  avatarPreview.startsWith("blob:") ||
                  avatarPreview.startsWith("/api/profile/image?")
                }
              />
            ) : (
              <div
                className="flex items-center justify-center rounded-full bg-emerald-500 font-medium text-black"
                style={{ width: 64, height: 64, fontSize: 24 }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="rounded-md border border-[#E4E4E7] px-3 py-1.5 text-sm font-medium hover:bg-[#F4F4F5]"
            >
              Change avatar
            </button>
            <p className="mt-1 text-xs text-[#71717A]">JPG, PNG. Max 2MB.</p>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-[#E4E4E7] px-3 py-2 text-sm outline-none focus:border-[#A1A1AA]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">About</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[#E4E4E7] px-3 py-2 text-sm outline-none focus:border-[#A1A1AA]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Social URL</label>
            <input
              type="url"
              value={socialUrl}
              onChange={(e) => setSocialUrl(e.target.value)}
              className="w-full rounded-md border border-[#E4E4E7] px-3 py-2 text-sm outline-none focus:border-[#A1A1AA]"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-[#E4E4E7] px-4 py-2 text-sm font-medium hover:bg-[#F4F4F5] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
