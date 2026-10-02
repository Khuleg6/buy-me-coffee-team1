"use client";

import { Copy, Heart, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { UserAvatar } from "@/components/common/UserAvatar";
import { apiFetch } from "@/lib/api-client";
import type { DashboardStats } from "@/types/api";

const periods = {
  "30": "Last 30 days",
  "90": "Last 90 days",
  all: "All time",
} as const;

export default function HomeDashboardClient() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState<keyof typeof periods>("30");
  const [selectedAmounts, setSelectedAmounts] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const latestDonationId = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => apiFetch<DashboardStats>("/api/dashboard/me")
      .then((data) => {
        if (!active) return;
        const newest = data.donations[0];
        if (latestDonationId.current !== null && newest && newest.id !== latestDonationId.current) {
          setNotification(`${newest.donor.name} sent ${newest.amount} virtual coffees!`);
        }
        latestDonationId.current = newest?.id ?? 0;
        setDashboard(data);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        const message =
          reason instanceof Error ? reason.message : "Unable to load dashboard.";
        if (message === "Unauthorized") {
          router.replace("/login");
          return;
        }
        if (!latestDonationId.current) setError(message);
      });
    void load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 5000);
    return () => { active = false; window.clearInterval(interval); };
  }, [router]);

  const visibleDonations = useMemo(() => {
    if (!dashboard) return [];
    const cutoff =
      period === "all"
        ? null
        : new Date(dashboard.generatedAt).getTime() -
          Number(period) * 24 * 60 * 60 * 1000;
    return dashboard.donations.filter(
      (donation) =>
        (!cutoff || new Date(donation.createdAt).getTime() >= cutoff) &&
        (!selectedAmounts.length || selectedAmounts.includes(donation.amount)),
    );
  }, [dashboard, period, selectedAmounts]);

  const periodEarnings = visibleDonations.reduce(
    (total, donation) => total + donation.amount,
    0,
  );
  const amountOptions = useMemo(
    () =>
      Array.from(
        new Set(dashboard?.donations.map((donation) => donation.amount) ?? []),
      ).sort((a, b) => a - b),
    [dashboard],
  );

  if (!dashboard && !error) return <PageStatus message="Loading dashboard…" />;
  if (error || !dashboard) {
    return <PageStatus message={error || "Unable to load dashboard."} error />;
  }

  const { user } = dashboard;
  const publicPath = `/${user.username}`;

  const copyPageLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppLayout
      user={{
        username: user.username,
        name: user.profile.name,
        avatarImage: user.profile.avatarImage,
      }}
    >
      {notification && (
        <div role="status" className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <span>New demo support: {notification}</span>
          <button type="button" onClick={() => setNotification("")} aria-label="Dismiss notification" className="min-h-11 min-w-11 rounded-md font-semibold hover:bg-emerald-100">×</button>
        </div>
      )}
      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <div className="flex flex-col gap-5 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={user.profile.name || user.username}
              src={user.profile.avatarImage}
              size="lg"
            />
            <div>
              <h1 className="font-bold">
                {user.profile.name || user.username}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">{publicPath}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={copyPageLink}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <Copy className="size-4" />
            {copied ? "Copied" : "Share page link"}
          </button>
        </div>
        <div className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold">Demo support</h2>
            <select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value as keyof typeof periods)
              }
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none"
            >
              {Object.entries(periods).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-5 text-4xl font-extrabold tracking-tight">
            {periodEarnings} coffees
          </p>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="All-time virtual coffees"
          value={dashboard.totalEarnings.toString()}
        />
        <StatCard
          label="Unique supporters"
          value={dashboard.supporterCount.toString()}
        />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-bold">Recent transactions</h2>
          {!!amountOptions.length && (
            <div className="flex flex-wrap gap-2">
              {amountOptions.map((amount) => {
                const active = selectedAmounts.includes(amount);
                return (
                  <button
                    type="button"
                    key={amount}
                    onClick={() =>
                      setSelectedAmounts((current) =>
                        active
                          ? current.filter((value) => value !== amount)
                          : [...current, amount],
                      )
                    }
                    className={`h-8 rounded-md border px-3 text-sm ${
                      active
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    {amount} coffees
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white">
          {visibleDonations.length ? (
            <div className="divide-y divide-zinc-100 px-6">
              {visibleDonations.map((donation) => (
                <article
                  key={donation.id}
                  className="grid grid-cols-[40px_minmax(0,1fr)_auto] gap-3 py-5"
                >
                  <UserAvatar
                    name={donation.donor.name || donation.donor.username}
                    src={donation.donor.avatarImage}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">
                      {donation.donor.name || donation.donor.username}
                    </h3>
                    <p className="mt-0.5 break-words text-xs text-zinc-500">
                      {donation.socialURLOrBuyMeCoffee ||
                        `@${donation.donor.username}`}
                    </p>
                    {donation.specialMessage && (
                      <p className="mt-3 text-sm leading-5 text-zinc-700">
                        {donation.specialMessage}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">+ {donation.amount} coffees</p>
                    <time className="mt-1 block text-xs text-zinc-500">
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                      }).format(new Date(donation.createdAt))}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                dashboard.donations.length
                  ? "No donations match these filters"
                  : "You don't have any supporters yet"
              }
              description="Share your page with your audience to get started."
              icon={
                dashboard.donations.length ? (
                  <Users className="size-6" />
                ) : (
                  <Heart className="size-6" />
                )
              }
            />
          )}
        </div>
      </section>
    </AppLayout>
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
