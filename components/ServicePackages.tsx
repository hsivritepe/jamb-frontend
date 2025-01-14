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

export default function ServicePackages() {
  // Grab the 4 packages from our PACKAGES array
  const basicPkg = PACKAGES.find((p) => p.id === "basic_package");
  const enhancedPkg = PACKAGES.find((p) => p.id === "enhanced_package");
  const allInclusivePkg = PACKAGES.find((p) => p.id === "all_inclusive_package");
  const customPkg = PACKAGES.find((p) => p.id === "configure_your_own_package");

  // A helper to compute leftover services
  // leftover = totalInPackage - featuredServices.length
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
        <BoxGridRow>
          {/* ====================== Basic Package ====================== */}
          {basicPkg && (
            <Box variant="default" isPopular={false}>
              <div>
                <BoxTitle>{basicPkg.title}</BoxTitle>
                <BoxDescription>
                  Perfect for homeowners looking for a cost-effective solution
                  covering essential home and garden maintenance.
                </BoxDescription>

                {/* Display the featured services as tags */}
                <BoxTags tags={basicPkg.featuredServices} variant="default" />

                {/* Display leftover if positive */}
                {(() => {
                  const leftover = getLeftoverServicesCount(basicPkg);
                  if (leftover > 0) {
                    return (
                      <p className="mt-2 text-sm text-gray-600">
                        and <span className="font-medium">{leftover}</span> more recommended services
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

          {/* ====================== Enhanced Package ====================== */}
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
                        and <span className="font-medium">{leftover}</span> more recommended services
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

          {/* ====================== All-Inclusive Package ====================== */}
          {allInclusivePkg && (
            <Box variant="primary" isPopular>
              <div>
                <BoxTitle>{allInclusivePkg.title}</BoxTitle>
                <BoxDescription>
                  The most comprehensive option, ideal for those
                  who demand maximum care for their property.
                </BoxDescription>

                <BoxTags tags={allInclusivePkg.featuredServices} variant="primary" />

                {(() => {
                  const leftover = getLeftoverServicesCount(allInclusivePkg);
                  if (leftover > 0) {
                    return (
                      <p className="mt-2 text-sm text-white">
                        and <span className="font-medium">{leftover}</span> more recommended services
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

        {/* ====================== Configure your own package (full-width) ====================== */}
        {customPkg && (
          <Box variant="full-width">
            <div className="flex justify-between items-start">
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
                        and <span className="font-medium">{leftover}</span> more recommended services
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="text-right w-1/3">
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