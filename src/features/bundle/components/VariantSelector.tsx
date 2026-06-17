import type { Variant } from "../types";

interface Props {
  variants: Variant[];
  activeId: string;
  onChange: (id: string) => void;
  label: string;
}

export function VariantSelector({ variants, activeId, onChange, label }: Props) {
  if (variants.length <= 1) return null;
  return (
    <div
      role="radiogroup"
      aria-label={`${label} variant`}
      className="flex flex-wrap gap-1.5"
    >
      {variants.map((v) => {
        const active = v.id === activeId;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v.id)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition ${
              active
                ? "border-primary ring-1 ring-primary text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {v.thumb ? (
              <img
                src={v.thumb}
                alt=""
                aria-hidden
                width={32}
                height={32}
                loading="lazy"
                className="h-5 w-5 rounded-sm object-contain"
              />
            ) : (
              <span
                className="h-3.5 w-3.5 rounded-sm border border-border"
                style={{ backgroundColor: v.swatch ?? "#fff" }}
                aria-hidden
              />
            )}
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
