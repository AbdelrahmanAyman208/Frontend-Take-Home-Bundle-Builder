import { Check, Shield } from "lucide-react";
import { plans } from "../catalog";
import { useBundle } from "../BundleContext";

export function PlanSelector() {
  const { state, dispatch } = useBundle();
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {plans.map((p) => {
        const active = state.planId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => dispatch({ type: "SELECT_PLAN", planId: p.id })}
            aria-pressed={active}
            className={`relative flex flex-col rounded-2xl border bg-card p-4 text-left transition ${
              active
                ? "border-primary ring-1 ring-primary/40"
                : "border-border hover:border-primary/40"
            }`}
          >
            {active && (
              <span className="absolute right-3 top-3 inline-grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
            <Shield className="h-5 w-5 text-primary" />
            <div className="mt-3 text-base font-bold text-foreground">{p.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
            <div className="mt-4 flex items-baseline gap-2">
              {p.compareAt && p.compareAt > p.price && (
                <span className="text-xs text-muted-foreground line-through">
                  ${p.compareAt.toFixed(2)}/mo
                </span>
              )}
              <span className="text-lg font-extrabold text-primary">
                {p.price === 0 ? "Free" : `$${p.price.toFixed(2)}/mo`}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
