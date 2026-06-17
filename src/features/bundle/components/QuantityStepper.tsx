import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onInc: () => void;
  onDec: () => void;
  label: string;
  size?: "sm" | "md";
}

export function QuantityStepper({ value, onInc, onDec, label, size = "md" }: Props) {
  const btn =
    size === "sm"
      ? "h-9 w-9 sm:h-7 sm:w-7 text-sm"
      : "h-11 w-11 sm:h-9 sm:w-9 text-base";
  const num = size === "sm" ? "w-6 text-sm" : "w-8 text-base";

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onDec}
        aria-label={`Decrease ${label} quantity`}
        disabled={value <= 0}
        className={`${btn} inline-grid place-items-center rounded-md border border-border bg-card text-foreground transition hover:bg-accent disabled:opacity-40`}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={`${num} text-center font-semibold tabular-nums`}>{value}</span>
      <button
        type="button"
        onClick={onInc}
        aria-label={`Increase ${label} quantity`}
        className={`${btn} inline-grid place-items-center rounded-md border border-border bg-card text-foreground transition hover:bg-accent`}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
