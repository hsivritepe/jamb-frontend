"use client";

import HeroSection from "@/components/home/HeroSection";
import AiEstimatorButton from "@/components/ui/AiEstimatorButton";
import ServicesGrid from "@/components/home/ServicesGrid";
import HowItWorks from "@/components/home/HowItWorks";
import RoomMakeovers from "@/components/home/RoomMakeovers";
import AppPromotion from "@/components/AppPromotion";
import ServicePackages from "@/components/ServicePackages";

export default function Home() {
  return (
    <main className="min-h-screen pt-20">
      <HeroSection />
      <AiEstimatorButton />
      <ServicesGrid
        title="Comprehensive Home Services<br />at Your Fingertips"
        subtitle=""
      />
      <HowItWorks />
      <RoomMakeovers />
      <AppPromotion />
      <ServicePackages />
    </main>
  );
}