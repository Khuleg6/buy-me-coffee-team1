export type PaymentMethod = "card" | "qpay";

interface MethodTabsProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function MethodTabs({ value, onChange }: MethodTabsProps) {
  return (
    <div className="mb-6 flex rounded-lg border border-gray-200 p-1">
      <button
        onClick={() => onChange("card")}
        className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
          value === "card"
            ? "bg-white text-black border border-gray-200"
            : "text-gray-400"
        }`}
      >
        Card
      </button>
      <button
        onClick={() => onChange("qpay")}
        className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
          value === "qpay"
            ? "bg-white text-black border border-gray-200"
            : "text-gray-400"
        }`}
      >
        QR demo
      </button>
    </div>
  );
}
