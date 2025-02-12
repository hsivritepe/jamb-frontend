"use client";

import InfoBox from "./ui/InfoBox";
import { SectionBoxTitle } from "./ui/SectionBoxTitle";

const sections = [
  {
    image: "/images/who-is-this-for-img-1.jpg",
    title: "Homeowners",
    description:
      "Our service is ideal for those who want to entrust home improvement tasks to professionals. We handle everything—from sourcing materials to completing the job—ensuring minimal client involvement.",
    highlights: [
      "No need to deal with the details—simply choose a service and enjoy the results. This is especially valuable for large projects or ongoing maintenance.",
    ],
    layout: "vertical" as const,
  },
  {
    image: "/images/who-is-this-for-img-2.jpg",
    title: "Renters",
    description:
      "Need to quickly fix issues or prepare a rental property? Our service provides fast, reliable solutions for any situation.",
    highlights: [
      "We work within tight deadlines to handle everything from repairs to cleaning or staging a property for the market. You save time and avoid the hassle.",
    ],
    layout: "vertical" as const,
  },
  {
    image: "/images/who-is-this-for-img-3.jpg",
    title: "Busy Professionals",
    description:
      "For those who don’t have time to manage home repairs or maintenance, our service offers a stress-free solution. We take care of everything from start to finish.",
    highlights: [
      "We manage all logistics and execution—just pick a service, and we’ll handle the rest. You save time and avoid unnecessary stress.",
    ],
    layout: "horizontal" as const,
  },
];

export default function WhoIsThisFor() {
  return (
    <section className="pt-12 pb-24">
      <div className="container mx-auto px-0 sm:px-4">
        <SectionBoxTitle>Who Is This For?</SectionBoxTitle>
        {/* 1 column on phones, 2 columns from md */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className={
                section.layout === "horizontal" ? "md:col-span-2" : ""
              }
            >
              <InfoBox {...section} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}