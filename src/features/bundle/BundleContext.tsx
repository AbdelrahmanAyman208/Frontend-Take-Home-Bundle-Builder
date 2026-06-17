import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { plans, products } from "./catalog";
import type { BundleState, Product, StepId } from "./types";

const STORAGE_KEY = "wyze-bundle:v1";

const stepOrder: StepId[] = ["cameras", "plan", "sensors", "accessories"];

const initialState: BundleState = {
  items: {},
  planId: "cam-unlimited",
  openStep: 1,
  activeVariant: Object.fromEntries(products.map((p) => [p.id, p.variants[0].id])),
};

type Action =
  | { type: "SET_QTY"; productId: string; variantId: string; qty: number }
  | { type: "INC"; productId: string; variantId: string }
  | { type: "DEC"; productId: string; variantId: string }
  | { type: "SET_ACTIVE_VARIANT"; productId: string; variantId: string }
  | { type: "SELECT_PLAN"; planId: string | null }
  | { type: "OPEN_STEP"; step: 1 | 2 | 3 | 4 | null }
  | { type: "HYDRATE"; state: Partial<BundleState> }
  | { type: "RESET" };

function reducer(state: BundleState, action: Action): BundleState {
  switch (action.type) {
    case "SET_QTY": {
      const key = `${action.productId}:${action.variantId}`;
      const items = { ...state.items };
      if (action.qty <= 0) delete items[key];
      else items[key] = action.qty;
      return { ...state, items };
    }
    case "INC": {
      const key = `${action.productId}:${action.variantId}`;
      return { ...state, items: { ...state.items, [key]: (state.items[key] ?? 0) + 1 } };
    }
    case "DEC": {
      const key = `${action.productId}:${action.variantId}`;
      const next = (state.items[key] ?? 0) - 1;
      const items = { ...state.items };
      if (next <= 0) delete items[key];
      else items[key] = next;
      return { ...state, items };
    }
    case "SET_ACTIVE_VARIANT":
      return {
        ...state,
        activeVariant: { ...state.activeVariant, [action.productId]: action.variantId },
      };
    case "SELECT_PLAN":
      return { ...state, planId: action.planId };
    case "OPEN_STEP":
      return { ...state, openStep: action.step };
    case "HYDRATE":
      return { ...state, ...action.state };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface Ctx {
  state: BundleState;
  dispatch: React.Dispatch<Action>;
  getQty: (productId: string, variantId: string) => number;
  productTotalQty: (productId: string) => number;
  selectedCountByStep: Record<StepId, number>;
  lineItems: LineItem[];
  totals: { subtotal: number; compareAt: number; savings: number; planMonthly: number };
}

export interface LineItem {
  key: string;
  product: Product;
  variantId: string;
  variantLabel: string;
  qty: number;
  unitPrice: number;
  compareAt?: number;
  free?: boolean;
}

const BundleCtx = createContext<Ctx | null>(null);

function init(initialValue: BundleState) {
  if (typeof window === "undefined") return initialValue;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...initialValue, ...JSON.parse(raw) };
    }
  } catch {
    /* ignore */
  }
  return initialValue;
}

export function BundleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, init);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const value = useMemo<Ctx>(() => {
    const getQty = (productId: string, variantId: string) =>
      state.items[`${productId}:${variantId}`] ?? 0;

    const productTotalQty = (productId: string) =>
      Object.entries(state.items)
        .filter(([k]) => k.startsWith(`${productId}:`))
        .reduce((sum, [, v]) => sum + v, 0);

    const hasAnySensor = products
      .filter((p) => p.step === "sensors" && !p.required)
      .some((p) => productTotalQty(p.id) > 0);

    // Auto-add hub if sensors selected and not yet present
    const lineItems: LineItem[] = [];
    for (const [key, qty] of Object.entries(state.items)) {
      if (qty <= 0) continue;
      const [pid, vid] = key.split(":");
      const product = products.find((p) => p.id === pid);
      if (!product) continue;
      const variant = product.variants.find((v) => v.id === vid);
      if (!variant) continue;
      lineItems.push({
        key,
        product,
        variantId: vid,
        variantLabel: variant.label,
        qty,
        unitPrice: variant.price,
        compareAt: variant.compareAt,
        free: product.freeWhenAnySensor && variant.price === 0,
      });
    }

    // inject free hub
    if (hasAnySensor) {
      const hub = products.find((p) => p.freeWhenAnySensor);
      if (hub && !lineItems.some((li) => li.product.id === hub.id)) {
        const v = hub.variants[0];
        lineItems.push({
          key: `${hub.id}:${v.id}`,
          product: hub,
          variantId: v.id,
          variantLabel: v.label,
          qty: 1,
          unitPrice: 0,
          compareAt: v.compareAt,
          free: true,
        });
      }
    }

    const selectedCountByStep: Record<StepId, number> = {
      cameras: 0,
      plan: state.planId && state.planId !== "no-plan" ? 1 : 0,
      sensors: 0,
      accessories: 0,
    };
    for (const li of lineItems) {
      selectedCountByStep[li.product.step] += li.qty;
    }

    const subtotal = lineItems.reduce((s, li) => s + li.unitPrice * li.qty, 0);
    const compareAt = lineItems.reduce(
      (s, li) => s + (li.compareAt ?? li.unitPrice) * li.qty,
      0,
    );
    const plan = plans.find((p) => p.id === state.planId);
    const planMonthly = plan?.price ?? 0;

    return {
      state,
      dispatch,
      getQty,
      productTotalQty,
      selectedCountByStep,
      lineItems,
      totals: {
        subtotal,
        compareAt,
        savings: Math.max(0, compareAt - subtotal),
        planMonthly,
      },
    };
  }, [state]);

  return <BundleCtx.Provider value={value}>{children}</BundleCtx.Provider>;
}

export function useBundle() {
  const ctx = useContext(BundleCtx);
  if (!ctx) throw new Error("useBundle must be used inside BundleProvider");
  return ctx;
}

export { stepOrder };
