import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { useBundle } from "./BundleContext";
import { toast } from "sonner";

const QUESTIONS = [
  {
    id: "propertyType",
    title: "What type of home do you have?",
    options: ["House", "Apartment", "Townhouse", "Business"]
  },
  {
    id: "coverage",
    title: "Where do you need camera coverage?",
    options: ["Indoors Only", "Outdoors Only", "Both Indoors and Outdoors"]
  },
  {
    id: "entryPoints",
    title: "How many ground-floor entry points (doors/windows) do you have?",
    options: ["1-2 (Small)", "3-4 (Medium)", "5+ (Large)"]
  },
  {
    id: "pets",
    title: "Do you have pets that roam freely indoors?",
    options: ["Yes", "No"]
  },
  {
    id: "storage",
    title: "How do you prefer to store your camera footage?",
    options: ["Cloud Storage (App Access)", "Local Storage (MicroSD)", "Both"]
  },
  {
    id: "monitoring",
    title: "Are you interested in 24/7 Professional Monitoring?",
    options: ["Yes, I want pros to call the police", "No, I'll monitor it myself"]
  },
  {
    id: "budget",
    title: "What is your budget for equipment?",
    options: ["Under $100 (Essential)", "$100 - $300 (Standard)", "$300+ (Premium)"]
  },
  {
    id: "extraProtection",
    title: "What kind of extra protection features are you looking for?",
    options: [
      "Physical Security (Keypad for easy arm/disarm)", 
      "Local Backup (MicroSD cards for 24/7 recording)",
      "Internal Awareness (Motion sensors for hallways)",
      "Maximum Protection (All of the above)",
      "None, just the basics"
    ]
  }
];

export function AIAssistantPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const navigate = useNavigate();
  const { dispatch } = useBundle();

  const handleSelectOption = (option: string) => {
    const currentQuestion = QUESTIONS[currentStep];
    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers: Record<string, string>) => {
    setIsAnalyzing(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch("http://localhost:3001/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) throw new Error("Failed to get AI recommendation");

      const data = await response.json();
      setIsAnalyzing(false);
      setRecommendation(data);
    } catch (error: any) {
      if (error?.name === "AbortError") {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error("Uh oh! The AI service failed to analyze your needs.");
      }
      console.error(error);
      setIsAnalyzing(false);
    }
  };

  const handleApplyRecommendation = () => {
    if (!recommendation || !recommendation.bundle) return;
    
    // Reconstruct the new state manually to ensure it saves synchronously
    const newState = {
      items: {} as Record<string, number>,
      planId: recommendation.bundle.planId || null,
      openStep: 1,
    };
    
    if (recommendation.bundle.items) {
      recommendation.bundle.items.forEach((item: any) => {
        newState.items[`${item.productId}:${item.variantId}`] = item.quantity;
      });
    }

    try {
      const existingStr = localStorage.getItem("wyze-bundle:v1");
      let fullState = existingStr ? JSON.parse(existingStr) : {};
      fullState = { ...fullState, ...newState };
      localStorage.setItem("wyze-bundle:v1", JSON.stringify(fullState));
    } catch {
      // ignore
    }

    toast.success("AI Bundle Applied!", {
      description: "Your recommended security system has been built.",
    });
    
    window.location.href = "/"; // Force a full navigation to ensure clean state load
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-xl border border-purple-200">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">AI Bundle Architect</h1>
              <p className="text-xs text-slate-500">Answer a few questions to get your perfect bundle</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          
          {isAnalyzing ? (
            <div className="text-center space-y-6 animate-in fade-in duration-500">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping"></div>
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin relative z-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Analyzing your requirements...</h2>
              <p className="text-slate-500">Our AI architect is selecting the best cameras and sensors for your {answers.propertyType?.toLowerCase()}.</p>
            </div>
          ) : recommendation ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
              {/* Header */}
              <div className="flex items-center gap-3 text-purple-600">
                <CheckCircle2 className="w-8 h-8" />
                <h2 className="text-3xl font-bold text-slate-900">Your Perfect Bundle</h2>
              </div>

              {/* AI Explanation */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 shadow-sm">
                <p className="text-sm leading-relaxed text-slate-700 italic">
                  {recommendation.explanation}
                </p>
              </div>

              {/* Items List */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recommended Products</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {(recommendation.bundle?.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between px-5 py-4 bg-white">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm border border-purple-200">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="text-slate-900 font-semibold">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.variantLabel} · {item.category}</p>
                        </div>
                      </div>
                      <p className="text-slate-900 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan */}
              {recommendation.plan && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Selected Plan</h3>
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between bg-white">
                    <div>
                      <p className="text-slate-900 font-semibold">{recommendation.plan.name}</p>
                      {recommendation.plan.features?.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {recommendation.plan.features.slice(0, 3).map((f: string, i: number) => (
                            <li key={i} className="text-xs text-slate-500 flex items-center gap-1">
                              <span className="text-green-500 font-bold">✓</span> {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <p className="text-slate-900 font-bold">${recommendation.plan.price}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-4 flex items-center justify-between">
                <p className="text-slate-500 font-semibold">Equipment Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(recommendation.bundle?.items || []).reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button 
                  onClick={handleApplyRecommendation}
                  className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] flex items-center justify-center gap-2 group"
                >
                  Apply to My Bundle
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => {
                    setRecommendation(null);
                    setCurrentStep(0);
                    setAnswers({});
                    setIsAnalyzing(false);
                  }}
                  className="px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors border border-slate-200 shadow-sm"
                >
                  Start Over
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-300" key={currentStep}>
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep) / QUESTIONS.length) * 100}%` }}
                />
              </div>

              <div>
                <p className="text-purple-600 text-sm font-bold mb-2 uppercase tracking-wider">
                  Step {currentStep + 1} of {QUESTIONS.length}
                </p>
                <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                  {QUESTIONS[currentStep].title}
                </h2>
              </div>

              <div className="grid gap-3">
                {QUESTIONS[currentStep].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option)}
                    className="w-full text-left px-6 py-5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all duration-200 group flex items-center justify-between shadow-sm"
                  >
                    <span className="text-lg font-semibold text-slate-700 group-hover:text-purple-700">{option}</span>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}
