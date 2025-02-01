"use client";

import InfoBox from "./ui/InfoBox";
import { SectionBoxTitle } from "./ui/SectionBoxTitle";

const sections = [
  {
    image: "/images/who-is-this-for-img-1.jpg",
    title: "Homeowners",
    description:
      "Our service is perfect for those who want to fully entrust home improvement tasks to professionals...",
    highlights: [
      "You don't need to get into the details — just choose a service and enjoy the results.",
    ],
    layout: "vertical" as const,
  },
  {
    image: "/images/who-is-this-for-img-2.jpg",
    title: "Renters",
    description:
      "If you need to quickly fix problems or prepare a rental property, our service provides fast solutions...",
    highlights: [
      "We work within tight deadlines to help resolve any problems...",
    ],
    layout: "vertical" as const,
  },
  {
    image: "/images/who-is-this-for-img-3.jpg",
    title: "Busy Professionals",
    description:
      "For those who don't have time to deal with home issues or organize repairs...",
    highlights: [
      "We handle all the logistics and execution. All you need to do is pick the service...",
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