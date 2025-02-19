"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

/**
 * Example link arrays. Replace them with your actual routes/data if needed.
 */
const popularServices = [
  { name: "Electrical", href: "/calculate/services" },
  { name: "Plumbing", href: "/calculate/services" },
  { name: "Painting", href: "/calculate/services" },
  { name: "Tiling", href: "/calculate/services" },
  { name: "Flooring", href: "/calculate/services" },
];

const popularRooms = [
  { name: "Bathroom", href: "/rooms/services" },
  { name: "Kitchen", href: "/rooms/services" },
  { name: "Living Room", href: "/rooms/services" },
  { name: "Bedroom", href: "/rooms/services" },
  { name: "Patio", href: "/rooms/services" },
];

const packageLinks = [
  { name: "Basic", href: "/packages/services?packageId=basic_package" },
  { name: "Enhanced", href: "/packages/services?packageId=enhanced_package" },
  {
    name: "All-inclusive",
    href: "/packages/services?packageId=all_inclusive_package",
  },
];

const aboutLinks = [
  { name: "How it works", href: "/about" },
  { name: "About us", href: "/about" },
];

export default function Footer() {
  return (
    <footer className="border-t w-full">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Top section: grids of links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Popular services */}
          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl mb-4 font-semibold">
              Popular services
            </h3>
            <ul className="space-y-2 text-sm sm:text-base">
              {popularServices.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular rooms */}
          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl mb-4 font-semibold">
              Popular rooms renovation
            </h3>
            <ul className="space-y-2 text-sm sm:text-base">
              {popularRooms.map((room) => (
                <li key={room.name}>
                  <Link
                    href={room.href}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {room.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Packages */}
          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl mb-4 font-semibold">
              Packages
            </h3>
            <ul className="space-y-2 text-sm sm:text-base">
              {packageLinks.map((pkg) => (
                <li key={pkg.name}>
                  <Link
                    href={pkg.href}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {pkg.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl mb-4 font-semibold">
              About
            </h3>
            <ul className="space-y-2 text-sm sm:text-base">
              {aboutLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Become a pro →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div
          className="
            mt-8 sm:mt-12
            flex flex-col lg:flex-row
            items-start lg:items-center
            justify-between
            border-t
            pt-6
            gap-4
          "
        >
          {/* Left side => email CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
            <span className="text-sm sm:text-base text-gray-500">
              We're Here to Help
            </span>
            <a
              href="mailto:info@thejamb.com"
              className="text-base sm:text-base font-light text-blue-600 underline"
            >
              info@thejamb.com
            </a>
          </div>

          {/* Right side => disclaimers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-gray-500 text-xs sm:text-sm mt-4 lg:mt-0">
            <span>© 2024-25 Jamb. All Rights Reserved.</span>
            <span>Use of this site is subject to certain</span>
            <Link
              href="#"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Terms Of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}