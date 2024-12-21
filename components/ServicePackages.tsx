"use client";

import Link from "next/link";
import {
  BoxGrid,
  BoxGridRow,
  Box,
  BoxTitle,
  BoxDescription,
  BoxPrice,
  BoxTags,
} from "@/components/ui/BoxGrid";
import { SectionBoxTitle } from "@/components/ui/SectionBoxTitle";
import { PACKAGES } from "@/constants/packages";

// Helper function to get random categories without repetition
function getRandomCategories(categories: string[], count: number): string[] {
  const shuffled = [...categories].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function ServicePackages() {
  return (
    <section className="py-16">
      {/* Section title for the service packages */}
      <SectionBoxTitle>
        Tailored Service Packages for Every Home Solution
      </SectionBoxTitle>

      <BoxGrid>
        {/* Row with three packages */}
        <BoxGridRow>
          {PACKAGES.filter(
            (pkg) =>
              pkg.id === "basic_package" ||
              pkg.id === "enhanced_package" ||
              pkg.id === "all_inclusive_package"
          ).map((pkg) => {
            const allServices = [
              ...pkg.services.indoor.map((service) => service.title),
              ...pkg.services.outdoor.map((service) => service.title),
            ];
            const visibleCategories = getRandomCategories(allServices, 5);
            const remainingServicesCount =
              allServices.length - visibleCategories.length;

            return (
              <Box
                key={pkg.id}
                variant={
                  pkg.id === "all_inclusive_package"
                    ? "primary"
                    : pkg.id === "enhanced_package"
                    ? "light"
                    : "default"
                }
                isPopular={pkg.id === "all_inclusive_package"}
              >
                <div>
                  {/* Title of the package */}
                  <BoxTitle>{pkg.title}</BoxTitle>

                  {/* Description of the package */}
                  <BoxDescription>
                    {pkg.id === "basic_package" &&
                      "Perfect for homeowners looking for a comprehensive yet cost-effective solution to maintain their home and garden."}
                    {pkg.id === "enhanced_package" &&
                      "Designed for homeowners seeking a more extensive range of home and garden maintenance services."}
                    {pkg.id === "all_inclusive_package" &&
                      "The most comprehensive offering, tailored for homeowners who demand the highest level of care and attention for their property."}
                  </BoxDescription>

                  {/* Tags representing visible service categories */}
                  <BoxTags
                    tags={visibleCategories}
                    variant={
                      pkg.id === "all_inclusive_package"
                        ? "primary"
                        : pkg.id === "enhanced_package"
                        ? "light"
                        : "default"
                    }
                  />

                  {/* Display remaining services count */}
                  {remainingServicesCount > 0 && (
                    <p className="mt-2 text-sm text-black">
                      more {remainingServicesCount} services
                    </p>
                  )}
                </div>

                {/* Link to read more with package price */}
                <Link
                  href={`/packages/services?packageId=${pkg.id}`}
                  className={`${
                    pkg.id === "all_inclusive_package"
                      ? "text-white"
                      : "text-blue-600"
                  } text-xl font-medium`}
                >
                  <BoxPrice
                    amount={
                      pkg.id === "basic_package"
                        ? 199
                        : pkg.id === "enhanced_package"
                        ? 399
                        : 899
                    }
                    period="month"
                    variant={
                      pkg.id === "all_inclusive_package" ? "primary" : "default"
                    }
                  />
                  Read more
                </Link>
              </Box>
            );
          })}
        </BoxGridRow>

        {/* Full-width row for "Configure Your Own Package" */}
        <Box variant="full-width">
          <div className="flex justify-between items-start">
            <div>
              <BoxTitle>Configure your own package</BoxTitle>
              <BoxDescription>
                Put together a package of the services you need.
              </BoxDescription>
            </div>
            <div className="text-right w-1/3">
              <BoxPrice amount={139} period="month" />
              <Link href={`/packages/services?packageId=configure_your_own_package`} className="text-blue-500 text-xl font-medium">
                Read more
              </Link>
            </div>
          </div>
        </Box>
      </BoxGrid>
    </section>
  );
}