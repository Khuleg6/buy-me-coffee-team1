"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { QPayPanel } from "./Qrmodal";

interface PaymentDialogProps {
  onClose: () => void;
  onConfirmQPay: () => void;
  amount?: number;
  specialMessage?: string | null;
  socialURLOrBuyMeCoffee?: string | null;
  recipientId: number;
}

export function PaymentDialog({
  onClose,
  onConfirmQPay,
  amount,
  specialMessage,
  socialURLOrBuyMeCoffee,
  recipientId,
}: PaymentDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!amount) return;
    let cancelled = false;

    fetch("/api/payment/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, specialMessage, socialURLOrBuyMeCoffee, recipientId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not generate QR code");
        return data;
      })
      .then((data) => {
        if (!cancelled) {
          setQrCodeUrl(data.qrCodeUrl);
          setPaymentUrl(data.paymentUrl);
          setTransactionId(data.transactionId);
        }
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not generate QR code");
      })
      .finally(() => { if (!cancelled) setGenerating(false); });

    return () => { cancelled = true; };
  }, [amount, specialMessage, socialURLOrBuyMeCoffee, recipientId]);

  useEffect(() => {
    if (!transactionId) return;
    const interval = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?transactionId=${encodeURIComponent(transactionId)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "COMPLETED") {
          window.clearInterval(interval);
          onConfirmQPay();
        }
      } catch { /* Retry on the next poll. */ }
    }, 2000);
    return () => window.clearInterval(interval);
  }, [transactionId, onConfirmQPay]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Demo donation QR code" className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex min-h-11 min-w-11 items-center justify-center text-zinc-600 hover:text-zinc-950">
          <X size={20} aria-hidden="true" />
        </button>
        <div className="pt-8">
          <QPayPanel qrCodeUrl={qrCodeUrl} paymentUrl={paymentUrl} generating={generating} amount={amount} error={error} />
        </div>
      </div>
    </div>
  );
}
