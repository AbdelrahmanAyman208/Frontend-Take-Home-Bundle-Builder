import { ChevronDown } from "lucide-react";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";


interface Props {
  stepNumber: 1 | 2 | 3 | 4;
  totalSteps: number;
  title: string;
  icon: ReactNode;
  selectedCount: number;
  selectedLabel?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function AccordionStep({
  stepNumber,
  totalSteps,
  title,
  icon,
  selectedCount,
  selectedLabel,
  isOpen,
  onToggle,
  children,
}: Props) {
  const headerId = `step-${stepNumber}-header`;
  const panelId = `step-${stepNumber}-panel`;
  const sectionRef = useRef<HTMLElement>(null);

  // Smooth-scroll the just-opened step into view (respects reduced motion)
  useEffect(() => {
    if (!isOpen || !sectionRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sectionRef.current.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, [isOpen]);

  const onHeaderKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const headers = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-accordion-header="true"]'),
    );
    const i = headers.findIndex((h) => h.id === headerId);
    if (i === -1) return;
    const target =
      e.key === "Home"
        ? headers[0]
        : e.key === "End"
          ? headers[headers.length - 1]
          : e.key === "ArrowDown"
            ? headers[(i + 1) % headers.length]
            : headers[(i - 1 + headers.length) % headers.length];
    target?.focus();
  };

  return (
    <section ref={sectionRef} className="scroll-mt-4 border-t border-border first:border-t-0">
      <div className="px-1 pt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Step {stepNumber} of {totalSteps}
        </div>
      </div>
      <h2>
        <button
          id={headerId}
          data-accordion-header="true"
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          onKeyDown={onHeaderKeyDown}
          className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 text-muted-foreground">{icon}</span>
            <span className="truncate text-xl font-extrabold text-foreground sm:text-2xl">
              {title}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
            {selectedCount > 0
              ? selectedLabel ?? `${selectedCount} selected`
              : "Get started"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </span>
        </button>
      </h2>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        hidden={!isOpen}
        className="pb-4"
      >
        {isOpen && (
          <div className="rounded-2xl bg-[color:var(--surface-soft)] p-4 sm:p-6">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
