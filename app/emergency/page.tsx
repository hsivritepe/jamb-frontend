"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb";
import { EMERGENCY_STEPS } from "@/constants/navigation";
import Button from "@/components/ui/Button";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";

export default function Emergency() {
  const router = useRouter();

  // Navigate to /emergency/services when "Next" is clicked
  const handleNext = () => {
    router.push("/emergency/services");
  };

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto xl:px-0 mb-2 sm:mb-16">
        {/* Breadcrumb for Emergency steps */}
        <BreadCrumb items={EMERGENCY_STEPS} />

        {/* Next button (desktop) - hidden on mobile, shown on sm+ (new comment in English) */}
        <div className="hidden sm:flex justify-end mb-8 mt-8">
          <Button onClick={handleNext}>Next →</Button>
        </div>

        {/* Main content: single-column on smaller screens, 2 columns on xl */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[45%,45%] xl:gap-[10%] xl:min-h-[500px] mt-4 sm:mt-0">
          {/* Left column: Text and checklist */}
          <div className="space-y-8">
            <SectionBoxTitle>
              Fast assistance for urgent home issues
            </SectionBoxTitle>

            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <p className="text-lg">Select the category of work you need</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <p className="text-lg">Specify work type and quantity</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <p className="text-lg">Receive an instant estimate</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <p className="text-lg">
                  Sign up, finalize details, and place your order
                </p>
              </div>
            </div>
          </div>

          {/* Right column: Image */}
          <div className="flex items-start justify-center">
            <img
              src="/images/about-emergency.jpg"
              alt="Emergency Service"
              className="w-full max-w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Next button for mobile only, pinned at bottom, hidden on sm+ (new comment in English) */}
      <div className="block sm:hidden mt-6">
        <Button onClick={handleNext} className="w-full justify-center">
          Next →
        </Button>
      </div>
    </main>
  );
}