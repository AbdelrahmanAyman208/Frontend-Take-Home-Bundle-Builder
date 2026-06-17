# Bundle Builder — Implementation Plan

A production-quality multi-step bundle builder ("Let's get started") with a live review panel ("Your security system"), matching the three Figma screenshots (mobile stacked, desktop split, desktop wide grid).

## Scope

- 4 accordion steps: Cameras, Plan, Sensors, Extra Protection
- Live Review panel grouped by category, with steppers, strike-through pricing, totals, savings, monthly financing line
- Variant chips (color/style) per product, independent quantity per variant
- Quantity steppers synced between product cards and review panel
- "Save my system for later" via localStorage (auto-hydrate on load)
- Responsive: desktop = builder + sticky review side-by-side; mobile = stacked accordion with review below
- Pixel-faithful to Figma: indigo accent, soft blue panels, rounded cards, "Save N%" badge, chevron accordions, "N selected" counters

## File structure

```text
src/
  routes/
    index.tsx                    # renders <BundleBuilderPage />
  features/bundle/
    BundleBuilderPage.tsx        # 2-column layout, header "Let's get started"
    BundleContext.tsx            # state + reducer + localStorage hydration
    types.ts                     # Product, Variant, Plan, BundleState
    catalog.ts                   # JSON-shaped product/plan/sensor/accessory data
    components/
      AccordionStep.tsx          # header (step N of 4, icon, title, "N selected", chevron)
      ProductCard.tsx            # badge, image, title, desc, Learn More, variants, stepper, price
      VariantSelector.tsx        # swatch chips, active-state ring
      QuantityStepper.tsx        # -, count, + (a11y, keyboard)
      PlanSelector.tsx           # plan tiles (Cam Unlimited etc.)
      ReviewPanel.tsx            # grouped sections, totals, savings, save button
      ReviewLineItem.tsx         # thumb, name, stepper, price
    assets/                      # generated product images (cam v4, pan v3, floodlight, doorbell, battery, sensors, hub, microSD, plan badge, guarantee seal)
  styles.css                     # add indigo primary, soft-blue surface tokens
```

## State model

```ts
type BundleState = {
  // key = `${productId}:${variantId}` -> quantity
  items: Record<string, number>;
  planId: string | null;
  openStep: 1 | 2 | 3 | 4 | null;
};
```

- Single reducer with actions: `SET_QTY`, `INC`, `DEC`, `SELECT_PLAN`, `OPEN_STEP`, `HYDRATE`, `RESET`.
- `BundleContext` exposes state + derived selectors: `selectedCountByStep`, `lineItemsByCategory`, `subtotal`, `compareAtTotal`, `savings`, `monthlyFromPrice`.
- `useEffect` persists to `localStorage["wyze-bundle:v1"]` on every change; hydrates on mount.

## Catalog (JSON-driven, no hardcoded UI)

Products grouped by `step` (`cameras` | `plan` | `sensors` | `accessories`). Each has variants with `{id, label, swatch|thumb, price, compareAt}`. Plans have monthly price + compareAt. The Hub is marked `required: true` and renders as FREE in review when any sensor selected.

## UI / interaction details

- **Accordion**: only one step open at a time; Step 1 open by default. Chevron rotates; "N selected" turns indigo. Keyboard: Enter/Space toggles, arrow keys move between headers.
- **ProductCard**: "Save X%" pill top-left (indigo bg, white text) when `compareAt > price`. Variant chip shows swatch + label, active variant gets indigo ring. Stepper binds to active variant only.
- **Next button**: outlined indigo pill at bottom of each step, advances `openStep`.
- **ReviewPanel**: sticky on desktop (`lg:sticky lg:top-6`), grouped headings (CAMERAS / SENSORS / ACCESSORIES / PLAN / SHIPPING). Shows compareAt strike + current price in indigo. Footer: "as low as $X/mo" pill + big total with strike. "Save my system for later" button + guarantee seal.
- **Mobile (<768px)**: review collapses under builder; pager dots like Figma's mobile screenshot are decorative only (no horizontal carousel — accordion handles step nav).
- **Desktop (>=1024px)**: 2-col grid `[1fr_380px]`, builder left, review right.

## Design tokens (src/styles.css)

Add to `:root` (oklch):
- `--primary` indigo ~ `oklch(0.52 0.22 280)`
- `--surface-soft` very light indigo `oklch(0.975 0.015 270)` (step panel bg)
- `--badge` matches primary
- `--danger-strike` muted red for compareAt
- Rounded `--radius` = 0.75rem; cards use `rounded-2xl`.

All colors via tokens; no hardcoded hex in components.

## Images

Generate with imagegen (transparent PNG, white bg) and store as `src/assets/*.png`:
cam-v4, cam-pan-v3, cam-floodlight, duo-doorbell, battery-cam-pro, motion-sensor, sense-hub, microsd, plan-shield, guarantee-seal. Imported as ES6.

## Accessibility

- Accordion headers = `<button aria-expanded aria-controls>`
- Steppers = `<button aria-label="Increase Wyze Cam v4 quantity">`
- Variant chips = `role="radiogroup"` with `aria-checked`
- Focus rings use `--ring`

## Out of scope

- Real checkout, real auth, server persistence (localStorage only)
- Carousel/pager behavior beyond accordion nav
- The "Frontend Test Figma" top bar in screenshot 1 (that's Figma chrome, not the app)

## Technical notes

- TanStack Start route at `src/routes/index.tsx` renders `<BundleBuilderPage />` inside the existing root shell.
- All state client-side; no server functions, no Lovable Cloud needed.
- TypeScript strict; interfaces in `types.ts`.
- No new deps required (shadcn primitives + Tailwind v4 tokens are enough).
