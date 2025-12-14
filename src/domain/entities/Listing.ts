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
  maxGuests: number;
  photos: string[];
  description: string;
  amenities: string[];
  isActive: boolean;
  starRating: number;
  averageReviewRating: number;
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
