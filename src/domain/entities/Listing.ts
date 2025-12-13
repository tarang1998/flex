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
  city?: string;
  country?: string;
  propertyType?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  isActive?: boolean;
}
