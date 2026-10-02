import { QRCodeFrame } from "./QrCodeFrame";

interface QPayPanelProps {
  qrCodeUrl: string;
  generating: boolean;
  amount?: number;
  error?: string;
  paymentUrl?: string;
}

export function QPayPanel({ qrCodeUrl, generating, amount, error, paymentUrl }: QPayPanelProps) {
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <h2 className="mb-1.5 text-xl font-semibold text-black">Scan demo QR code</h2>
      <p className="mb-6 text-sm text-gray-500">
        {amount
          ? `Scan to send ${amount} virtual coffees`
          : "Scan to support this creator"}
      </p>

      {generating ? (
        <div className="flex h-56 w-56 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        </div>
      ) : qrCodeUrl ? (
        <QRCodeFrame src={qrCodeUrl} alt="QR code for demo donation link" />
      ) : (
        <div role="alert" className="flex h-56 w-56 items-center justify-center text-sm text-red-700">
          {error || "Failed to generate QR"}
        </div>
      )}

      {paymentUrl && <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="mt-4 text-sm font-medium text-zinc-900 underline">Open demo link on this device</a>}
      <p className="mt-4 text-xs text-gray-600">
        Scan with your phone camera, not the QPay app. No real payment; open the link and tap Confirm.
      </p>
      {paymentUrl && /localhost|127\.0\.0\.1/.test(paymentUrl) && (
        <p className="mt-2 text-xs text-amber-800">
          This QR uses a local address. Deploy the site or use a public HTTPS URL before scanning from another phone.
        </p>
      )}
    </div>
  );
}
