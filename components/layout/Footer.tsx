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
  LucideIcon,
} from "lucide-react";

// Example arrays. Adjust them to your actual routes.
const popularServices = [
  { name: "Electrical", href: "calculate/services" },
  { name: "Plumbing", href: "calculate/services" },
  { name: "Painting", href: "calculate/services" },
  { name: "Tiling", href: "calculate/services" },
  { name: "Flooring", href: "calculate/services" },
];

const popularRooms = [
  { name: "Bathroom", href: "/rooms/services" },
  { name: "Kitchen", href: "/rooms/services" },
  { name: "Living Room", href: "/rooms/services" },
  { name: "Bedroom", href: "/rooms/services" },
  { name: "Patio", href: "/rooms/services" },
];

// For packages, we might have dynamic routes or query parameters
const packageLinks = [
  { name: "Basic", href: "/packages/services?packageId=basic_package" },
  { name: "Enhanced", href: "/packages/services?packageId=enhanced_package" },
  {
    name: "All-inclusive",
    href: "/packages/services?packageId=all_inclusive_package",
  },
];

// For "About"
const aboutLinks = [
  { name: "How it works", href: "/about" },
  { name: "About us", href: "/about" },
  // "Become a pro" might be a separate link
];

/**
 * Footer component:
 * - We only changed the bottom section for tablets (768px–1023px) 
 *   so elements go in two lines (flex-col).
 * - For desktop (≥1024px), they're in one line (flex-row).
 * - For phones (<768px), also in a column by default.
 */
export default function Footer() {
  return (
    <footer className="border-t max-w-7xl mx-auto px-4 py-4">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Popular services */}
          <div>
            <h3 className="text-2xl mb-4">Popular services</h3>
            <ul className="space-y-2">
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

          {/* Popular rooms renovation */}
          <div>
            <h3 className="text-2xl mb-4">Popular rooms renovation</h3>
            <ul className="space-y-2">
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
            <h3 className="text-2xl mb-4">Packages</h3>
            <ul className="space-y-2">
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
            <h3 className="text-2xl mb-4">About</h3>
            <ul className="space-y-2">
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
        <div className="mt-12 flex flex-col lg:flex-row justify-between items-center border-t pt-8">
          {/*
            First row (phone/tablet => flex-col, desktop => flex-row)
          */}
          <div className="flex flex-col lg:flex-row items-center gap-2">
            <span className="text-gray-500">We're Here to Help</span>
            <a href="tel:+14374601830" className="text-xl font-medium my-2">
              +1 437 460 18 30
            </a>
          </div>

          {/*
            Second row (phone/tablet => flex-col, desktop => flex-row)
          */}
          <div className="flex flex-col lg:flex-row items-center gap-2 text-gray-500 mt-4 lg:mt-0">
            <span>© 2024-25 Jamb. All Rights Reserved.</span>
            <span>Use of this site is subject to certain</span>
            <Link href="#" className="text-blue-600 hover:text-blue-700">
              Terms Of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}