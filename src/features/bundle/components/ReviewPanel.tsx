import { useNavigate } from "@tanstack/react-router";
import { Shield, Truck } from "lucide-react";
import { toast } from "sonner";
import { plans } from "../catalog";
import { useBundle, type LineItem } from "../BundleContext";
import { QuantityStepper } from "./QuantityStepper";


const CATEGORY_LABELS: Record<string, string> = {
  cameras: "Cameras",
  sensors: "Sensors",
  accessories: "Accessories",
  plan: "Plan",
};

export function ReviewPanel() {
  const { lineItems, totals, state, dispatch } = useBundle();
  const navigate = useNavigate();
  const plan = plans.find((p) => p.id === state.planId);

  const grouped = lineItems.reduce<Record<string, LineItem[]>>((acc, li) => {
    (acc[li.product.step] ??= []).push(li);
    return acc;
  }, {});

  const isEmpty = lineItems.length === 0 && (!plan || plan.price === 0);
  const monthly = totals.subtotal > 0 ? totals.subtotal / 12 : 0;

  const handleSave = () => {
    try {
      localStorage.setItem("wyze-bundle:v1", JSON.stringify(state));
      toast.success("System saved", {
        description: "Come back any time to continue where you left off.",
      });
    } catch {
      toast.error("Couldn't save your system. Storage may be full.");
    }
  };


  return (
    <aside
      aria-label="Your security system review"
      className="rounded-2xl bg-[color:var(--surface-soft)] p-5 sm:p-6"
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Review
      </div>
      <h2 className="mt-1 text-2xl font-extrabold text-foreground">
        Your security system
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Review your personalized protection system designed to keep what matters most safe.
      </p>

      {isEmpty ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Add a camera to start building your system.
        </p>
      ) : (
        <div className="mt-5 divide-y divide-border">
          {(["cameras", "sensors", "accessories"] as const).map((cat) => {
            const items = grouped[cat];
            if (!items?.length) return null;
            return (
              <section key={cat} className="py-4 first:pt-0">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {CATEGORY_LABELS[cat]}
                </div>
                <ul className="space-y-3">
                  {items.map((li) => (
                    <li key={li.key} className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-card">
                        <img
                          src={li.product.image}
                          alt=""
                          width={40}
                          height={40}
                          loading="lazy"
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {li.product.title}
                        </div>
                      </div>
                      <QuantityStepper
                        size="sm"
                        value={li.qty}
                        label={li.product.title}
                        onInc={() =>
                          dispatch({
                            type: "INC",
                            productId: li.product.id,
                            variantId: li.variantId,
                          })
                        }
                        onDec={() =>
                          dispatch({
                            type: "DEC",
                            productId: li.product.id,
                            variantId: li.variantId,
                          })
                        }
                      />
                      <div className="w-16 text-right">
                        {li.compareAt && li.compareAt * li.qty > li.unitPrice * li.qty && (
                          <div className="text-[11px] text-muted-foreground line-through">
                            ${(li.compareAt * li.qty).toFixed(2)}
                          </div>
                        )}
                        <div className="text-sm font-bold text-primary">
                          {li.free ? "FREE" : `$${(li.unitPrice * li.qty).toFixed(2)}`}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          {plan && plan.price > 0 && (
            <section className="py-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Plan
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {plan.title}
                  </span>
                </div>
                <div className="text-right">
                  {plan.compareAt && (
                    <div className="text-[11px] text-muted-foreground line-through">
                      ${plan.compareAt.toFixed(2)}/mo
                    </div>
                  )}
                  <div className="text-sm font-bold text-primary">
                    ${plan.price.toFixed(2)}/mo
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Fast Shipping</span>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-muted-foreground line-through">$5.99</div>
                <div className="text-sm font-bold text-primary">FREE</div>
              </div>
            </div>
          </section>
        </div>
      )}

      {!isEmpty && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary/10 text-center text-[9px] font-bold uppercase tracking-tight text-primary">
              100%
              <br />
              guarantee
            </div>
            <div className="text-right" aria-live="polite" aria-atomic="true">
              <span className="inline-block rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                as low as ${monthly.toFixed(2)}/mo
              </span>
              <div className="mt-1 flex items-baseline justify-end gap-2">
                {totals.compareAt > totals.subtotal && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${totals.compareAt.toFixed(2)}
                  </span>
                )}
                <span className="text-2xl font-extrabold text-primary">
                  ${totals.subtotal.toFixed(2)}
                </span>
                <span className="sr-only">total</span>
              </div>
            </div>

          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/checkout" })}
            className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Checkout
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            Save my system for later
          </button>
        </div>
      )}
    </aside>
  );
}
