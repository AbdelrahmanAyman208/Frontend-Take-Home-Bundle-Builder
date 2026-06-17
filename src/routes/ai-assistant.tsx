import { createFileRoute } from "@tanstack/react-router";
import { AIAssistantPage } from "@/features/bundle/AIAssistantPage";
import { BundleProvider } from "@/features/bundle/BundleContext";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({
    meta: [
      { title: "AI Bundle Assistant" },
      {
        name: "description",
        content: "Let our AI assistant help you build the perfect security system for your home.",
      },
    ],
  }),
  component: () => (
    <BundleProvider>
      <AIAssistantPage />
    </BundleProvider>
  ),
});
