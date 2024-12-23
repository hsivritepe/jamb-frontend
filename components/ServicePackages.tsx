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

/**
 * Helper function to randomly pick a set of categories/tags from a larger array.
 * This function avoids repetition by shuffling the array and slicing the first `count` items.
 */
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
        {/* First row: showing three main packages (basic, enhanced, all-inclusive) */}
        <BoxGridRow>
          {PACKAGES.filter(
            (pkg) =>
              pkg.id === "basic_package" ||
              pkg.id === "enhanced_package" ||
              pkg.id === "all_inclusive_package"
          ).map((pkg) => {
            // Collect all indoor + outdoor services titles
            const allServices = [
              ...pkg.services.indoor.map((service) => service.title),
              ...pkg.services.outdoor.map((service) => service.title),
            ];
            // Pick 5 random categories/tags to show on the card
            const visibleCategories = getRandomCategories(allServices, 5);
            // The remainder that won't be shown unless you click "read more" inside the details page
            const remainingServicesCount = allServices.length - visibleCategories.length;

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

                  {/* Description text snippet */}
                  <BoxDescription>
                    {pkg.id === "basic_package" &&
                      "Perfect for homeowners looking for a comprehensive yet cost-effective solution to maintain their home and garden."}
                    {pkg.id === "enhanced_package" &&
                      "Designed for homeowners seeking a more extensive range of home and garden maintenance services."}
                    {pkg.id === "all_inclusive_package" &&
                      "The most comprehensive offering, tailored for homeowners who demand the highest level of care and attention for their property."}
                  </BoxDescription>

                  {/* Display some example service tags */}
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

                  {/* If not all services are displayed, show how many remain */}
                  {remainingServicesCount > 0 && (
                    <p className="mt-2 text-sm text-black">
                      more {remainingServicesCount} services
                    </p>
                  )}
                </div>

                {/* A link that shows the monthly price and leads to package details */}
                <Link
                  href={`/packages/details?packageId=${pkg.id}`}
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

        {/* A "full-width" box that offers a "Configure your own package" option */}
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
              <Link
                href={`/packages/details?packageId=configure_your_own_package`}
                className="text-blue-500 text-xl font-medium"
              >
                Read more
              </Link>
            </div>
          </div>
        </Box>
      </BoxGrid>
    </section>
  );
}