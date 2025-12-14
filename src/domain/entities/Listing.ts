/**
 * Domain Entity: Listing
 * Represents a property listing in the system
 */

export interface Listing {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  beds?: number;
  maxGuests: number;
  photos: string[];
  description: string;
  amenities: string[];
  isActive: boolean;
  starRating: number;
  averageReviewRating: number;
  checkInTimeStart?: number;
  checkInTimeEnd?: number;
  checkOutTime?: number;
  houseRules?: string;
  maxPetsAllowed?: number | null;
  maxChildrenAllowed?: number | null;
  maxInfantsAllowed?: number | null;
  cancellationPolicy?: string;
  minNights?: number;
  maxNights?: number;
  refundableDamageDeposit?: number;
  cleaningFee?: number;
  specialInstruction?: string;
  keyPickup?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilters {
  // API-supported filters (basic only)
  city?: string;
  country?: string;
  match?: string; // Search by listing name
  
  // Client-side filters (applied after fetching)
  propertyType?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
}
