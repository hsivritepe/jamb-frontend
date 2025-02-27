"use client";

export const dynamic = "force-dynamic";

import { Step } from "@/types/services";
import { SectionBoxTitle } from "../ui/SectionBoxTitle";

const steps: Step[] = [
  {
    id: 1,
    number: "1",
    title: "Select a Service, Room, or Package",
    description:
      "Pick the service, room, or package you need and add any details like quantity or finishing materials. You can also choose a convenient start time or even a payment plan. As you do, our system instantly shows a detailed price estimate — no sign-up required.",
    row: 1,
    colSpan: 3,
    colStart: 1,
  },
  {
    id: 2,
    number: "2",
    title: "Instant Confirmation",
    description:
      "Sit back while our system double-checks all the details and assigns the right professionals to your project. In no time, you’ll receive a confirmed schedule and price with no surprises or delays.",
    row: 2,
    colSpan: 3,
    colStart: 3,
  },
  {
    id: 3,
    number: "3",
    title: "Confirm and Pay",
    description:
      "Once you’re ready, confirm your booking and pay securely through the app. We’ll immediately order all the needed materials and send the professionals to your home to get started. If anything unexpected comes up, we’ll quickly assign a replacement so your project stays on track.",
    row: 1,
    colSpan: 3,
    colStart: 5,
  },
  {
    id: 4,
    number: "4",
    title: "Track Progress in the App",
    description:
      "Follow your project in real time through our app. You can review each stage, see any relevant documentation, and contact support whenever you need.",
    row: 2,
    colSpan: 2,
    colStart: 7,
  },
];

export default function HowItWorks() {
  return (
    <section className="p-8 my-4 bg-brand-light rounded-2xl">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <SectionBoxTitle>How It Works?</SectionBoxTitle>
          <a
            href="/about"
            className="text-blue-600 hover:text-blue-700 text-sm hidden lg:block"
          >
            Learn more about our process
          </a>
        </div>

        {/* Phone & Tablet Layout (<1024px): Vertical List */}
        <div className="lg:hidden flex flex-col gap-8 mt-12">
          {steps.map((step) => (
            <StepBox step={step} key={step.id} />
          ))}
        </div>

        {/* Desktop Layout (≥1024px): Grid with shifted steps #2 and #4 */}
        <div className="hidden lg:block relative mt-12">
          <div className="grid grid-cols-8 gap-y-16 gap-x-4">
            {steps.map((step) => {
              const shiftStyle =
                step.id === 2 || step.id === 4
                  ? { transform: "translateX(-80px)" }
                  : {};

              return (
                <div
                  key={step.id}
                  style={{
                    gridColumn: `${step.colStart} / span ${step.colSpan}`,
                    gridRow: step.row,
                    ...shiftStyle,
                  }}
                >
                  <StepBox step={step} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepBox({ step }: { step: Step }) {
  return (
    <div className="relative">
      <div className="flex items-start mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-white text-gray-300 font-bold rounded text-2xl">
          {step.number}
        </div>
        <h3 className="text-xl font-semibold ml-4 pt-2">{step.title}</h3>
      </div>
      <p className="text-gray-600 text-medium">{step.description}</p>
    </div>
  );
}