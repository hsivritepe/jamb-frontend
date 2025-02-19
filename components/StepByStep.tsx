"use client";

import { StepByStepProps } from "@/types/components";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { SectionBoxSubtitle } from "@/components/ui/SectionBoxSubtitle";
import Image from "next/image";

export default function StepByStep({ title, steps }: StepByStepProps) {
  return (
    <div className="py-12">
      <div className="container mx-auto px-0 ">
        <SectionBoxTitle>{title}</SectionBoxTitle>
        <div className="mx-auto mt-8 space-y-8">
          {steps.map((step, index) => {
            const isFirstStep = index === 0;
            const isEven = index % 2 === 0;

            if (isEven) {
              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-center bg-gray-200 p-4 md:p-8 rounded-md"
                >
                  {/* Step number => hidden on phone, visible on md, leftmost */}
                  <div className="hidden md:block md:order-1 w-14 flex-shrink-0 mr-8 self-start">
                    <div className="w-14 h-14 flex items-center justify-center bg-white text-gray-400 rounded-md text-xl font-medium border border-gray-200">
                      {step.number}
                    </div>
                  </div>

                  {/* Text => order-1 on phone, order-2 on md */}
                  <div className="order-1 md:order-2 w-full md:flex-1 md:pr-16 mb-4 md:mb-0">
                    <SectionBoxSubtitle>{step.title}</SectionBoxSubtitle>
                    <div
                      className="text-gray-600 space-y-4"
                      dangerouslySetInnerHTML={{ __html: step.description }}
                    />
                  </div>

                  {/* Image => order-2 on phone, order-3 on md */}
                  <div className="order-2 md:order-3 relative w-full md:w-[300px] h-[200px] md:h-[400px]">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      priority={isFirstStep}
                      sizes="(max-width: 768px) 90vw, 300px"
                      style={{ objectFit: "contain" }}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-center bg-gray-200 p-4 md:p-8 rounded-md"
                >
                  {/* Image => order-2 on phone, order-1 on md */}
                  <div className="order-2 md:order-1 relative w-full md:w-[300px] h-[200px] md:h-[400px] mb-4 md:mb-0">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      priority={false}
                      sizes="(max-width: 768px) 90vw, 300px"
                      style={{ objectFit: "contain" }}
                      className="rounded-lg"
                    />
                  </div>

                  {/* Text => order-1 on phone, order-2 on md */}
                  <div className="order-1 md:order-2 w-full md:flex-1 md:px-16 mb-4 md:mb-0">
                    <SectionBoxSubtitle>{step.title}</SectionBoxSubtitle>
                    <div
                      className="text-gray-600 space-y-4"
                      dangerouslySetInnerHTML={{ __html: step.description }}
                    />
                  </div>

                  {/* Step number => hidden on phone, visible on md, rightmost */}
                  <div className="hidden md:block md:order-3 w-14 flex-shrink-0 ml-8 self-start">
                    <div className="w-14 h-14 flex items-center justify-center bg-white text-gray-400 rounded-md text-xl font-medium border border-gray-200">
                      {step.number}
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}