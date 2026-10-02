export function AmountButton({
  value,
  selected,
  onClick,
}: {
  value: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm border transition-all ${
        selected
          ? "border-gray-900 border-2 font-medium"
          : "border-gray-200 hover:border-gray-400"
      }`}
    >
      <Coffee aria-hidden="true" className="size-4" />
      <span>{value}</span>
    </button>
  );
}
import { Coffee } from "lucide-react";
