import { Camera, Layers, Radio, Shield, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BundleProvider, useBundle } from "./BundleContext";
import { productsByStep } from "./catalog";
import { AccordionStep } from "./components/AccordionStep";
import { PlanSelector } from "./components/PlanSelector";
import { ProductCard } from "./components/ProductCard";
import { ReviewPanel } from "./components/ReviewPanel";

function Builder() {
  const { state, dispatch, selectedCountByStep } = useBundle();
  const toggle = (n: 1 | 2 | 3 | 4) =>
    dispatch({ type: "OPEN_STEP", step: state.openStep === n ? null : n });
  const next = (n: 1 | 2 | 3 | 4) =>
    dispatch({ type: "OPEN_STEP", step: (n + 1) as 1 | 2 | 3 | 4 });

  return (
    <div>
      <AccordionStep
        stepNumber={1}
        totalSteps={4}
        title="Choose your cameras"
        icon={<Camera className="h-5 w-5" />}
        selectedCount={selectedCountByStep.cameras}
        isOpen={state.openStep === 1}
        onToggle={() => toggle(1)}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {productsByStep("cameras").map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => next(1)}
            className="rounded-xl border border-primary bg-card px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            Next: Choose your plan
          </button>
        </div>
      </AccordionStep>

      <AccordionStep
        stepNumber={2}
        totalSteps={4}
        title="Choose your plan"
        icon={<Shield className="h-5 w-5" />}
        selectedCount={selectedCountByStep.plan}
        selectedLabel={selectedCountByStep.plan === 1 ? "1 selected" : undefined}
        isOpen={state.openStep === 2}
        onToggle={() => toggle(2)}
      >
        <PlanSelector />
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => next(2)}
            className="rounded-xl border border-primary bg-card px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            Next: Choose your sensors
          </button>
        </div>
      </AccordionStep>

      <AccordionStep
        stepNumber={3}
        totalSteps={4}
        title="Choose your sensors"
        icon={<Radio className="h-5 w-5" />}
        selectedCount={selectedCountByStep.sensors}
        isOpen={state.openStep === 3}
        onToggle={() => toggle(3)}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {productsByStep("sensors")
            .filter((p) => !p.required)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          A Wyze Sense Hub is included free with any sensor.
        </p>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => next(3)}
            className="rounded-xl border border-primary bg-card px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            Next: Add extra protection
          </button>
        </div>
      </AccordionStep>

      <AccordionStep
        stepNumber={4}
        totalSteps={4}
        title="Add extra protection"
        icon={<Layers className="h-5 w-5" />}
        selectedCount={selectedCountByStep.accessories}
        isOpen={state.openStep === 4}
        onToggle={() => toggle(4)}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {productsByStep("accessories").map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </AccordionStep>
    </div>
  );
}

export function BundleBuilderPage() {
  return (
    <BundleProvider>
      <div className="min-h-dvh bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Let's get started.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Build the security system that fits your home. Live updates as you go.
            </p>
            
            <div className="mt-6 flex justify-center">
              <Link
                to="/ai-assistant"
                className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/30 px-6 py-3 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                <Sparkles className="h-4 w-4" />
                Help me choose with AI Assistant
              </Link>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <main id="main-content" className="min-w-0">
              <Builder />
            </main>
            <div className="lg:sticky lg:top-6 lg:self-start">
              <ReviewPanel />
            </div>
          </div>
        </div>
      </div>
    </BundleProvider>
  );
}

