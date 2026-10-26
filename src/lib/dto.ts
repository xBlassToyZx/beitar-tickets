import type { SectionAvailability, SeatMap } from "@/server/availability";
import type { Cart } from "@/server/booking";

/** Shapes sent to client components (dates become ISO strings over the wire). */
export type CartDTO = Omit<Cart, "expiresAt"> & { expiresAt: string | null };
export type AvailabilityDTO = Record<string, SectionAvailability>;
export type SeatMapDTO = SeatMap;
