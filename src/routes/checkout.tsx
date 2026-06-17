import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BundleProvider, useBundle } from "@/features/bundle/BundleContext";
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: () => (
    <BundleProvider>
      <CheckoutPage />
    </BundleProvider>
  ),
});

function CheckoutPage() {
  const { lineItems, totals, state } = useBundle();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);

      // 1. Save bundle
      const sessionId = crypto.randomUUID();
      const saveRes = await fetch("http://localhost:3001/api/bundles/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          items: lineItems.map((li) => ({
            productId: li.product.id,
            variantId: li.variantId,
            quantity: li.qty,
            price: li.unitPrice,
          })),
          planId: state.planId,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save bundle");
      const { data: bundle } = await saveRes.json();

      // 2. Checkout
      const checkoutRes = await fetch("http://localhost:3001/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleId: bundle._id }),
      });

      if (!checkoutRes.ok) {
        const errorData = await checkoutRes.json();
        throw new Error(errorData.error || "Checkout failed");
      }

      const checkoutData = await checkoutRes.json();
      setSuccessData(checkoutData);
      
      // Clear localStorage after successful checkout
      localStorage.removeItem("wyze-bundle:v1");

    } catch (error: any) {
      toast.error(error.message || "An error occurred during checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Order Confirmed!</h1>
            <p className="text-slate-500 mt-2">Your bundle has been successfully ordered and inventory is reserved.</p>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 text-sm border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Order ID</span>
              <span className="font-medium text-slate-900">{successData.orderId.split('-')[0].toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Items</span>
              <span className="font-medium text-slate-900">{successData.itemCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Paid</span>
              <span className="font-medium text-slate-900">${successData.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">Est. Delivery</span>
              <span className="font-bold text-purple-600">{successData.estimatedDelivery}</span>
            </div>
          </div>

          <button
            onClick={() => navigate({ to: "/" })}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-50 flex items-center border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md shadow-sm">
        <Link to="/" className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          Back to Bundle
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-8">Checkout</h1>
        
        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
              <ul className="divide-y divide-slate-100">
                {lineItems.map((li) => (
                  <li key={li.key} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                        <img src={li.product.image} alt="" className="w-8 h-8 object-contain" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{li.product.title}</p>
                        <p className="text-xs text-slate-500">Qty: {li.qty} · {li.variantLabel}</p>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">
                      {li.free ? "FREE" : `$${(li.unitPrice * li.qty).toFixed(2)}`}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Details</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Equipment Total</span>
                  <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                {totals.planMonthly > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Monthly Plan</span>
                    <span className="font-medium">${totals.planMonthly.toFixed(2)}/mo</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <span className="font-semibold text-slate-900">Due Today</span>
                  <span className="text-xl font-bold text-purple-600">${totals.subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing || lineItems.length === 0}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
