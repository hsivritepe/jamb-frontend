"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SectionBoxTitle } from "../ui/SectionBoxTitle";
import { ImageBoxGrid } from "../ui/ImageBoxGrid";
import Button from "@/components/ui/Button";
import {
  INDOOR_SERVICE_SECTIONS,
  OUTDOOR_SERVICE_SECTIONS,
  ALL_CATEGORIES,
} from "@/constants/categories";

// Session storage helpers
const saveToSession = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

const loadFromSession = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  const savedValue = sessionStorage.getItem(key);
  try {
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing sessionStorage for key "${key}":`, error);
    return defaultValue;
  }
};

// Prepare indoor and outdoor service arrays
const indoorServices = Object.values(INDOOR_SERVICE_SECTIONS).map(
  (section) => ({
    title: section,
    image: `/images/services/${section.toLowerCase().replace(/ /g, "_")}.jpg`,
    subcategories: ALL_CATEGORIES.filter((cat) => cat.section === section).map(
      (cat) => cat.title
    ),
  })
);

const outdoorServices = Object.values(OUTDOOR_SERVICE_SECTIONS).map(
  (section) => ({
    title: section,
    image: `/images/services/${section.toLowerCase().replace(/ /g, "_")}.jpg`,
    subcategories: ALL_CATEGORIES.filter((cat) => cat.section === section).map(
      (cat) => cat.title
    ),
  })
);

interface ServicesGridProps {
  title?: string;
  subtitle?: string;
  searchQuery?: string;
}

export default function ServicesGrid({
  title = "Select a Service Category",
  subtitle = "Choose the type of service you need, then click “Next” to proceed",
  searchQuery = "",
}: ServicesGridProps) {
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<"indoor" | "outdoor">(
    loadFromSession("services_selectedType", "indoor")
  );
  const [selectedSections, setSelectedSections] = useState<string[]>(
    loadFromSession("services_selectedSections", [])
  );

  useEffect(() => {
    saveToSession("services_selectedType", selectedType);
  }, [selectedType]);

  useEffect(() => {
    saveToSession("services_selectedSections", selectedSections);
  }, [selectedSections]);

  const services = selectedType === "indoor" ? indoorServices : outdoorServices;

  const filteredServices = services.filter(
    (service) =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.subcategories.some((sub) =>
        sub.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleSectionClick = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleNext = () => {
    if (selectedSections.length === 0) {
      alert("Please select at least one service section before proceeding.");
      return;
    }
    router.push(`/calculate/services`);
  };

  return (
    <section className="py-8">
      <div className="container mx-auto">
        <SectionBoxTitle>
          <div dangerouslySetInnerHTML={{ __html: title }} />
          {subtitle && (
            <p
              className={`
      font-semibold sm:font-normal text-gray-500
      text-[20px] leading-[28px]
      md:text-[30px] md:leading-[41px]
    `}
            >
              {subtitle}
            </p>
          )}
        </SectionBoxTitle>

        <div className="flex justify-between items-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setSelectedType("indoor")}
              className={`px-4 py-2 rounded-md text-sm font-semibold sm:font-medium transition-colors ${
                selectedType === "indoor"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              Indoor
            </button>
            <button
              onClick={() => setSelectedType("outdoor")}
              className={`px-4 py-2 rounded-md text-sm font-semibold sm:font-medium transition-colors ${
                selectedType === "outdoor"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              Outdoor
            </button>
          </div>

          <Button onClick={handleNext}>Next →</Button>
        </div>

        <ImageBoxGrid
          items={filteredServices.map((service) => ({
            id: service.title,
            title: service.title,
            image: service.image,
            url: "#",
            subcategories: service.subcategories,
            isSelected: selectedSections.includes(service.title),
          }))}
          onSectionClick={handleSectionClick}
        />
      </div>
    </section>
  );
}
