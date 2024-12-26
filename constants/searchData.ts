// constants/searchData.ts

import { ALL_SERVICES } from "./services";
import { ROOMS } from "./rooms";
import { PACKAGES } from "./packages";

/**
 * A 'SearchItem' can represent a service, a room, or a package.
 * We restrict the 'type' property to those exact string literals.
 */
export interface SearchItem {
  type: "service" | "room" | "package";
  id: string;
  title: string;
  // You can store additional fields here (e.g. description, cost, etc.) if needed
}

/**
 * ALL_SEARCH_ITEMS: a unified array of 'SearchItem' objects, pulling data from
 * - ALL_SERVICES
 * - ROOMS (both indoor and outdoor)
 * - PACKAGES
 *
 * By assembling them into one array, any search logic in your HeroSection (or elsewhere)
 * can quickly search across all types (service, room, or package).
 */
export const ALL_SEARCH_ITEMS: SearchItem[] = [
  // 1) Services
  ...ALL_SERVICES.map((svc) => ({
    type: "service" as const, // Force 'type' to be the string literal "service"
    id: svc.id,
    title: svc.title,
  })),

  // 2) Rooms (indoor + outdoor)
  ...ROOMS.indoor.map((room) => ({
    type: "room" as const, // Force 'type' to be "room"
    id: room.id,
    title: room.title,
  })),
  ...ROOMS.outdoor.map((room) => ({
    type: "room" as const,
    id: room.id,
    title: room.title,
  })),

  // 3) Packages
  ...PACKAGES.map((pkg) => ({
    type: "package" as const, // Force 'type' to be "package"
    id: pkg.id,
    title: pkg.title,
  })),
];