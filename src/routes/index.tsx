import { createFileRoute } from "@tanstack/react-router";
import { BundleBuilderPage } from "@/features/bundle/BundleBuilderPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Build your security system" },
      {
        name: "description",
        content:
          "Build a personalized home security bundle: choose cameras, plan, sensors, and extras with a live review of your system.",
      },
      { property: "og:title", content: "Build your security system" },
      {
        property: "og:description",
        content:
          "Build a personalized home security bundle: choose cameras, plan, sensors, and extras with a live review of your system.",
      },
    ],
  }),
  component: BundleBuilderPage,
});
