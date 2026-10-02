import { useState } from "react";
import { AmountButton } from "./AmmountButton";

interface DonationFormProps {
  creatorName: string;
  loading: boolean;
  disabled?: boolean;
  onSupport: (amount: number, url: string, msg: string) => void;
}

export function DonationForm({
  creatorName,
  loading,
  disabled = false,
  onSupport,
}: DonationFormProps) {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [supporterUrl, setSupporterUrl] = useState("");
  const [message, setMessage] = useState("");

  const canSubmit = supporterUrl.trim().length > 3 && !disabled;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
      <h1 className="text-xl text-black font-medium mb-4">
        Buy {creatorName} a Coffee
      </h1>

      {disabled && (
        <p className="mb-4 rounded-md bg-gray-100 px-3 py-2 text-xs text-gray-500">
          You can&apos;t support your own page.
        </p>
      )}

      <p className="text-sm text-black mb-2">Select virtual coffees (demo only):</p>
      <div className="flex gap-2 flex-wrap mb-5 text-black">
        {[1, 2, 5, 10].map((amt) => (
          <AmountButton
            key={amt}
            value={amt}
            selected={selectedAmount === amt}
            onClick={() => !disabled && setSelectedAmount(amt)}
          />
        ))}
      </div>
      <label className="block text-black text-sm text-gray-500h mb-1.5">
        Enter BuyMeCoffee or social account URL:
      </label>
      <input
        type="text"
        value={supporterUrl}
        onChange={(e) => setSupporterUrl(e.target.value)}
        placeholder="buymeacoffee.com/"
        disabled={disabled}
        className="w-full border border-gray-200 text-black rounded-lg px-3 py-2.5 text-sm mb-4 outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
      <label className="block text-sm text-gray-500 mb-1.5">
        Special message:
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Please write your message here"
        rows={4}
        disabled={disabled}
        className="w-full border text-black border-gray-200 rounded-lg px-3 py-2.5 text-sm mb-5 outline-none focus:border-gray-400 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
      <button
        onClick={() => onSupport(selectedAmount, supporterUrl, message)}
        disabled={!canSubmit || loading}
        className={`w-full py-3 rounded-lg text-sm font-medium ${
          canSubmit && !loading
            ? "bg-gray-900 text-white hover:bg-gray-700"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {loading ? "Preparing..." : "Support with QR demo"}
      </button>
    </div>
  );
}
