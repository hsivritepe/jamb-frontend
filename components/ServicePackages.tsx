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
 * ServicePackages component:
 * - Desktop (≥1024px, lg:): unchanged (3 columns for the first row).
 * - Tablet (768px–1023px, md:): the first row becomes one column (md:grid-cols-1).
 * - Phone (<768px): in the "Configure your own package," 
 *   the <div className="flex justify-between"> is switched to flex-col on phone, 
 *   flex-row on md+.
 */
export default function ServicePackages() {
  // Grab 4 packages from PACKAGES array
  const basicPkg = PACKAGES.find((p) => p.id === "basic_package");
  const enhancedPkg = PACKAGES.find((p) => p.id === "enhanced_package");
  const allInclusivePkg = PACKAGES.find((p) => p.id === "all_inclusive_package");
  const customPkg = PACKAGES.find((p) => p.id === "configure_your_own_package");

  // Helper to compute leftover services
  function getLeftoverServicesCount(pkgObj: typeof PACKAGES[number] | undefined): number {
    if (!pkgObj) return 0;
    const indoorCount = pkgObj.services.indoor.length;
    const outdoorCount = pkgObj.services.outdoor.length;
    const total = indoorCount + outdoorCount;
    const featuredCount = pkgObj.featuredServices.length;
    return total - featuredCount;
  }

  return (
    <section className="py-16">
      <SectionBoxTitle>
        Tailored Service Packages for Every Home Solution
      </SectionBoxTitle>

      <BoxGrid>
        {/**
         * First row of packages:
         * For desktops: 3 columns (lg:3)
         * For tablets: 1 column (md:1)
         * For phones: 1 column (base:1)
         */}
        <BoxGridRow
          className="grid-cols-1 md:grid-cols-1 lg:grid-cols-3" // override default "md:grid-cols-3"
        >
          {/* Basic Package */}
          {basicPkg && (
            <Box variant="default" isPopular={false}>
              <div>
                <BoxTitle>{basicPkg.title}</BoxTitle>
                <BoxDescription>
                  Perfect for homeowners looking for a cost-effective
                  solution covering essential home and garden maintenance.
                </BoxDescription>

                {/* Display featured services as tags */}
                <BoxTags tags={basicPkg.featuredServices} variant="default" />

                {/* leftover services */}
                {(() => {
                  const leftover = getLeftoverServicesCount(basicPkg);
                  if (leftover > 0) {
                    return (
                      <p className="mt-2 text-sm text-gray-600">
                        and <span className="font-medium">{leftover}</span> more
                        recommended services
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Price + Link */}
              <Link
                href={`/packages/details?packageId=${basicPkg.id}`}
                className="text-blue-600 text-xl font-medium"
              >
                <BoxPrice amount={199} period="month" variant="default" />
                Read more
              </Link>
            </Box>
          )}

          {/* Enhanced Package */}
          {enhancedPkg && (
            <Box variant="light" isPopular={false}>
              <div>
                <BoxTitle>{enhancedPkg.title}</BoxTitle>
                <BoxDescription>
                  Designed for homeowners seeking a broader range
                  of indoor and outdoor services.
                </BoxDescription>

                <BoxTags tags={enhancedPkg.featuredServices} variant="light" />

                {(() => {
                  const leftover = getLeftoverServicesCount(enhancedPkg);
                  if (leftover > 0) {
                    return (
                      <p className="mt-2 text-sm text-gray-600">
                        and <span className="font-medium">{leftover}</span> more
                        recommended services
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <Link
                href={`/packages/details?packageId=${enhancedPkg.id}`}
                className="text-blue-600 text-xl font-medium"
              >
                <BoxPrice amount={399} period="month" />
                Read more
              </Link>
            </Box>
          )}

          {/* All-Inclusive Package */}
          {allInclusivePkg && (
            <Box variant="primary" isPopular>
              <div>
                <BoxTitle>{allInclusivePkg.title}</BoxTitle>
                <BoxDescription>
                  The most comprehensive option, ideal for those who
                  demand maximum care for their property.
                </BoxDescription>

                <BoxTags tags={allInclusivePkg.featuredServices} variant="primary" />

                {(() => {
                  const leftover = getLeftoverServicesCount(allInclusivePkg);
                  if (leftover > 0) {
                    return (
                      <p className="mt-2 text-sm text-white">
                        and <span className="font-medium">{leftover}</span> more
                        recommended services
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <Link
                href={`/packages/details?packageId=${allInclusivePkg.id}`}
                className="text-white text-xl font-medium"
              >
                <BoxPrice amount={899} period="month" variant="primary" />
                Read more
              </Link>
            </Box>
          )}
        </BoxGridRow>

        {/* Configure your own package (full-width) */}
        {customPkg && (
          <Box variant="full-width">
            {/**
             * For phones (<768px), we use flex-col,
             * for tablets/desktops (≥768px), flex-row.
             */}
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div>
                <BoxTitle>{customPkg.title}</BoxTitle>
                <BoxDescription>
                  Assemble a custom set of services tailored to your needs.
                </BoxDescription>

                {(() => {
                  const leftover = getLeftoverServicesCount(customPkg);
                  if (leftover > 0) {
                    return (
                      <p className="mt-2 text-sm text-gray-200">
                        and <span className="font-medium">{leftover}</span> more
                        recommended services
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="text-right w-full md:w-1/3 md:mt-0 mt-4">
                <BoxPrice amount={139} period="month" />
                <Link
                  href={`/packages/details?packageId=${customPkg.id}`}
                  className="text-blue-500 text-xl font-medium"
                >
                  Read more
                </Link>
              </div>
            </div>
          </Box>
        )}
      </BoxGrid>
    </section>
  );
}