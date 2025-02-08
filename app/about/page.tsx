"use client";

import StepByStep from "@/components/StepByStep";
import AppPromotion from "@/components/AppPromotion";
import ServicePackages from "@/components/ServicePackages";
import TryItNow from "@/components/TryItNow";
import WhoIsThisFor from "@/components/WhoIsThisFor";

const steps = [
  {
    number: 1,
    title: "Select a Service, Room, or Package",
    description:
      "<p>In each section, choose the type of work you need, the quantity, any finishing materials and equipment, and your preferred start time or special payment plan. Our system will generate a detailed estimate for all tasks—no prior registration or subscription required.</p> <p>Whether it's a single-time service, a specific room renovation, or a full maintenance package, you’ll see the maximum detail of costs and materials.</p>",
    image: "/images/how-it-works-step-1.png",
  },
  {
    number: 2,
    title: "Wait for System Confirmation",
    description:
      "<p>The system checks the availability and delivery schedules for all required materials, then coordinates the final estimate with each assigned professional.</p> <p>This step ensures accurate timeframes and cost alignment, preventing unexpected delays or price changes later.</p>",
    image: "/images/how-it-works-step-2.png",
  },
  {
    number: 3,
    title: "Confirm and Pay",
    description:
      "<p>Once the order is confirmed, simply pay through the app according to your chosen conditions. The system automatically orders all necessary materials from suppliers and dispatches the details to the assigned professionals.</p> <p>If any unexpected issues arise—like shipping delays or last-minute schedule conflicts—the system automatically reassigns workers or substitutes materials to keep your project on track.</p>",
    image: "/images/how-it-works-step-3.png",
  },
  {
    number: 4,
    title: "Monitor All Stages in the App",
    description:
      "<p>Track every phase of the project in real time: review documentation if needed, see ongoing updates, and contact our support team if you have any questions.</p><p>With full visibility into the process, you maintain control while our system and professionals handle the logistics and execution.</p>",
    image: "/images/how-it-works-step-4.png",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen pt-20">
      <StepByStep title="How It Works?" steps={steps} />
      <TryItNow />
      <WhoIsThisFor />
      <AppPromotion />
      <ServicePackages />
    </main>
  );
}