import React from "react";
import AiEstimateTabs from "./AiEstimateTabs";

export const metadata = {
  title: "AI Estimate",
};

export default function AiEstimateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen pt-28 pb-16 px-2 sm:px-0">
      <div className="container mx-auto">
        {/* Tabs menu for /ai-estimate/* routes */}
        <AiEstimateTabs />

        {/* The actual page content */}
        <div className="mt-4">{children}</div>
      </div>
    </main>
  );
}