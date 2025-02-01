"use client";

import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";

export default function Emergency() {
  const router = useRouter();

  const handleNext = () => {
    router.push("/emergency/services");
  };

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto xl:px-0 mb-16">
        {/* Breadcrumb navigation */}
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Next Button positioned at the top-right */}
        <div className="text-right mb-8 mt-8">
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* Main content: single column for screens <1280px, two columns for >=1280px */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[45%,45%] xl:gap-[10%] xl:min-h-[500px]">
          {/* Left Column: Text Content and Checklist */}
          <div className="space-y-8">
            <SectionBoxTitle>Fast assistance for urgent home issues</SectionBoxTitle>

            {/* Checklist */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <p className="text-lg">Start by selecting the category of work you need</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <p className="text-lg">Specify the type and quantity of work</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <p className="text-lg">Receive a complete estimate instantly</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <p className="text-lg">Sign up, finalize the details, and place your order</p>
              </div>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="flex items-start justify-center">
            <img
              src="/images/about-emergency.jpg"
              alt="Emergency Service"
              className="w-full max-w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </main>
  );
}