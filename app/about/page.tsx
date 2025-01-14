"use client";

import StepByStep from "@/components/StepByStep";
import AppPromotion from "@/components/AppPromotion";
import ServicePackages from "@/components/ServicePackages";
import TryItNow from "@/components/TryItNow";
import WhoIsThisFor from "@/components/WhoIsThisFor";

const steps = [
  {
    number: 1,
    title: "Choose a Service",
    description:
      "<p>On our website or in the app, select the type of job you need: single-time task, full-room service, or a comprehensive maintenance package. We support any task—from small fixes to large-scale renovations.</p><p>This could be anything from mounting a shelf or replacing plumbing fixtures to a full kitchen remodel.</p>",
    image: "/images/how-it-works-step-1.png",
  },
  {
    number: 2,
    title: "Answer a Few Questions",
    description:
      "<p>We automatically assign a qualified professional to complete the job. All of our experts are thoroughly vetted and experienced in their fields.</p><p>You don't need to worry about the quality of work. We only assign trusted professionals who arrive on time and complete the job with care.</p>",
    image: "/images/how-it-works-step-2.png",
  },
  {
    number: 3,
    title: "Get Your Professional Assigned",
    description:
      "<p>We automatically assign a qualified professional to complete the job. All of our experts are thoroughly vetted and experienced in their fields.</p><p>You don't need to worry about the quality of work. We only assign trusted professionals who arrive on time and complete the job with care.</p>",
    image: "/images/how-it-works-step-3.png",
  },
  {
    number: 4,
    title: "Track Your Progress",
    description:
      "<p>Through your account on the website or mobile app, you can track the progress of your job in real time. You'll always know what stage the work is at, and you can make changes if needed.</p><p>We give you full control over the repair or maintenance process.</p>",
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