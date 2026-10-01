"use client";

import { Camera, CheckCircle2 } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { UserAvatar } from "@/components/common/UserAvatar";
import { apiFetch } from "@/lib/api-client";
import type { CurrentUser, ProfileSummary } from "@/types/api";

export default function AccountClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [form, setForm] = useState<ProfileSummary | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    apiFetch<CurrentUser>("/api/users/me")
      .then((data) => {
        setUser(data);
        setForm(data.profile);
      })
      .catch((reason: unknown) => {
        const message =
          reason instanceof Error ? reason.message : "Unable to load account.";
        if (message === "Unauthorized") {
          router.replace("/login");
          return;
        }
        setError(message);
      });
  }, [router]);

  useEffect(() => {
    if (!status) return;

    const timeout = window.setTimeout(() => setStatus(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const updateField = (field: keyof ProfileSummary, value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
    setStatus("");
  };

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    setError("");
    if (!/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type)) {
      setError("Please select a PNG, JPEG, WebP, GIF, or AVIF image.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Please select an image smaller than 4 MB.");
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    try {
      const result = await apiFetch<{ avatarImageUrl: string }>(
        "/api/profile/avatar",
        { method: "POST", body: data },
      );
      updateField("avatarImage", result.avatarImageUrl);
      setUser((current) =>
        current
          ? {
              ...current,
              profile: {
                ...current.profile,
                avatarImage: result.avatarImageUrl,
              },
            }
          : current,
      );
      setStatus("Photo saved successfully.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const saved = await apiFetch<ProfileSummary>("/api/profiles/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm(saved);
      setUser((current) =>
        current ? { ...current, profile: saved } : current,
      );
      setStatus("Changes saved successfully.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save changes.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user || !form) {
    return <PageStatus message={error || "Loading account…"} error={!!error} />;
  }

  return (
    <AppLayout
      user={{
        username: user.username,
        name: user.profile.name,
        avatarImage: user.profile.avatarImage,
      }}
    >
      <PageHeader
        title="My account"
        description="Manage your public creator profile and account details."
      />
      <form onSubmit={save} className="mt-6 space-y-5">
        <section className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold">Personal information</h2>
          <div className="mt-5 flex items-center gap-4">
            <UserAvatar name={form.name} src={form.avatarImage} size="lg" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-medium hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera className="size-4" />
              {uploading ? "Uploading…" : "Change photo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              className="hidden"
            />
          </div>
          <div className="mt-5 grid gap-4">
            <Field label="Display name">
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="About">
              <textarea
                value={form.about}
                onChange={(event) => updateField("about", event.target.value)}
                rows={4}
                className={`${inputClass} resize-y py-2`}
              />
            </Field>
            <Field label="Social media URL">
              <input
                value={form.socialMediaURL}
                onChange={(event) =>
                  updateField("socialMediaURL", event.target.value)
                }
                className={inputClass}
              />
            </Field>
            <Field label="Support confirmation message">
              <textarea
                value={form.successMessage}
                onChange={(event) =>
                  updateField("successMessage", event.target.value)
                }
                rows={3}
                className={`${inputClass} resize-y py-2`}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold">Account</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="mt-1 font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Username</dt>
              <dd className="mt-1 font-medium">@{user.username}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Payment card</dt>
              <dd className="mt-1 font-medium">
                {user.bankCard
                  ? `•••• ${user.bankCard.lastFour}`
                  : "No payment card saved"}
              </dd>
            </div>
          </dl>
        </section>

        <div className="flex items-center justify-end gap-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="h-10 rounded-md bg-zinc-950 px-5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
      {status && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-20 z-50 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-900 shadow-lg"
        >
          <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
          {status}
        </div>
      )}
    </AppLayout>
  );
}

const inputClass =
  "h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-sm text-zinc-600">{label}</span>
      {children}
    </label>
  );
}

function PageStatus({
  message,
  error = false,
}: {
  message: string;
  error?: boolean;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <p className={`text-sm ${error ? "text-red-600" : "text-zinc-500"}`}>
        {message}
      </p>
    </main>
  );
}
