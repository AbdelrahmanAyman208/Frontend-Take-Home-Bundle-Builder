import { useBundle } from "../BundleContext";
import type { Product } from "../types";
import { QuantityStepper } from "./QuantityStepper";
import { VariantSelector } from "./VariantSelector";

export function ProductCard({ product }: { product: Product }) {
  const { state, dispatch, getQty, productTotalQty } = useBundle();
  const activeId = state.activeVariant[product.id] ?? product.variants[0].id;
  const variant = product.variants.find((v) => v.id === activeId) ?? product.variants[0];
  const qty = getQty(product.id, variant.id);
  const totalQty = productTotalQty(product.id);
  const isSelected = totalQty > 0;

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-card p-4 transition ${
        isSelected ? "border-primary ring-1 ring-primary/40" : "border-border"
      }`}
    >
      <div className="mb-4 grid h-40 place-items-center">
        <img
          key={variant.id}
          src={variant.image ?? product.image}
          alt={`${product.title} in ${variant.label}. ${product.alt}`}
          width={512}
          height={512}
          loading="lazy"
          className="h-32 w-auto object-contain transition-opacity duration-200"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-bold tracking-tight text-foreground">{product.title}</h3>
        {product.badge && (
          <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {product.badge}
          </span>
        )}
      </div>
      {product.description && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {product.description}{" "}
          <a className="inline-flex items-center gap-0.5 text-primary hover:underline" href="#">
            Learn More
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="mt-px">
              <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </p>
      )}

      <div className="mt-3">
        <VariantSelector
          variants={product.variants}
          activeId={activeId}
          onChange={(id) =>
            dispatch({ type: "SET_ACTIVE_VARIANT", productId: product.id, variantId: id })
          }
          label={product.title}
        />
      </div>

      <div className="mt-auto pt-4 flex items-end justify-between gap-3">
        <QuantityStepper
          value={qty}
          label={product.title}
          onInc={() =>
            dispatch({ type: "INC", productId: product.id, variantId: variant.id })
          }
          onDec={() =>
            dispatch({ type: "DEC", productId: product.id, variantId: variant.id })
          }
        />
        <div className="text-right">
          {variant.compareAt && variant.compareAt > variant.price && (
            <div className="text-xs text-muted-foreground line-through decoration-[color:var(--strike)]">
              ${variant.compareAt.toFixed(2)}
            </div>
          )}
          <div className="text-sm font-bold text-primary">
            ${variant.price.toFixed(2)}
          </div>
        </div>
      </div>
    </article>
  );
}
