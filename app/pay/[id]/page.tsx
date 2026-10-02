"use client";

import { use, useEffect, useState } from "react";

type DonationDetails = { amount: number; creatorName: string; status: string };

export default function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [details, setDetails] = useState<DonationDetails | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/payment/status?transactionId=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Donation link not found");
        return res.json() as Promise<DonationDetails>;
      })
      .then((data) => {
        setDetails(data);
        setStatus(data.status === "COMPLETED" ? "success" : "ready");
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : "Could not load donation");
        setStatus("error");
      });
  }, [id]);

  const confirm = async () => {
    setStatus("submitting");
    try {
      const res = await fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id }),
      });
      if (!res.ok) throw new Error("Could not record your support. Please try again.");
      setStatus("success");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not record your support");
      setStatus("error");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 py-10 text-zinc-950">
      <section className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-amber-700">Demo donation · No money is charged</p>
        {status === "loading" ? (
          <p role="status" className="text-sm text-zinc-600">Loading donation…</p>
        ) : status === "success" ? (
          <>
            <h1 className="text-2xl font-bold">Support sent!</h1>
            <p className="mt-3 text-sm text-zinc-600">{details?.creatorName} can see your demo donation on their dashboard.</p>
          </>
        ) : status === "error" ? (
          <>
            <h1 className="text-xl font-semibold">Could not complete donation</h1>
            <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>
            {details && <button type="button" onClick={confirm} className="mt-6 min-h-11 rounded-lg bg-zinc-950 px-5 text-sm font-medium text-white">Try again</button>}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Support {details?.creatorName}</h1>
            <p className="mt-3 text-sm text-zinc-600">Send a demo donation of {details?.amount} coffees. This is not a QPay payment.</p>
            <button
              type="button"
              onClick={confirm}
              disabled={status === "submitting"}
              className="mt-7 min-h-11 w-full rounded-lg bg-zinc-950 px-5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Confirm demo support"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
