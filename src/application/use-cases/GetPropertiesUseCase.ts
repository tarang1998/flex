/**
 * Application Layer - Get Properties Use Case
 * Business logic for fetching properties with approved reviews and ratings
 */

import { IListingRepository } from '@/domain/repositories/IListingRepository';
import { GetReviewsFromHostAway } from './GetReviewsFromHostAway';
import { GetMockReviews } from './GetMockReviews';
import { GetReviewsFromGoogle } from './GetReviewsFromGoogle';
import { GetApprovedReviewIdsByListing } from './GetApprovedReviewIdsByListing';
import { Review } from '@/domain/entities/Review';

export interface PropertySummary {
  id: number;
  name: string;
  city: string;
  country: string;
  propertyType: string | null;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  photos: string[];
  starRating: number;
  reviewCount: number;
  averageRating: number;
}

export interface PropertyDetails {
  id: number;
  listingName?: string;
  name?: string;
  city: string;
  description?: string;
  personCapacity?: number;
  guestsAllowed?: number;
  totalBedrooms?: number | null;
  totalBeds?: number;
  totalBathrooms?: number;
  images?: Array<{ imageId: number; url: string }>;
  photos?: string[];
  amenities?: Array<{ amenityId: number; amenityName: string }>;
}

export class GetPropertiesUseCase {
  constructor(
    private listingRepository: IListingRepository,
    private getReviewsFromHostAway: GetReviewsFromHostAway,
    private getMockReviews: GetMockReviews,
    private getReviewsFromGoogle: GetReviewsFromGoogle,
    private getApprovedReviewIdsByListing: GetApprovedReviewIdsByListing
  ) {}

  async execute(listingId?: number): Promise<PropertySummary[] | PropertySummary | null> {
    // Fetch listing(s) based on whether ID is provided
    let filteredListings;
    if (listingId) {
      const listing = await this.listingRepository.getListingById(listingId);
      filteredListings = listing ? [listing] : [];
    } else {
      filteredListings = await this.listingRepository.getAllListings();
    }
    
    const listingIds = filteredListings.map(l => l.id);

    // Fetch all reviews and approved review IDs in parallel
    const [hostawayReviews, mockReviews, googleReviews, ...approvedReviewsByListing] = await Promise.all([
      this.getReviewsFromHostAway.execute({ 
        listingMapIds: listingIds,
        type: 'guest-to-host'
      }),
      this.getMockReviews.execute(listingIds),
      this.getReviewsFromGoogle.execute(),
      ...listingIds.map(id => this.getApprovedReviewIdsByListing.execute(id)),
    ]);

    // Create a map of listingId -> Set of approved review IDs
    const approvedReviewsMap = new Map<number, Set<number>>();
    listingIds.forEach((id, index) => {
      approvedReviewsMap.set(id, new Set(approvedReviewsByListing[index]));
    });

    // Combine all reviews
    const allReviews = [...hostawayReviews, ...mockReviews, ...googleReviews]
      .filter(r => r.type === 'guest-to-host');

    // Build properties list with approved reviews only
    const properties = filteredListings
      .filter(listing => listing.isActive)
      .map(listing => {
        // Get all reviews for this listing
        const listingReviews = allReviews.filter(
          review => review.listingMapId === listing.id || review.listingName === listing.name
        );

        // Get only approved reviews
        const approvedReviewIds = approvedReviewsMap.get(listing.id) || new Set<number>();
        const approvedReviews = listingReviews.filter(r => r.id && approvedReviewIds.has(r.id));

        // Calculate average rating from approved reviews
        const averageRating = this.calculateAverageRating(approvedReviews);

        return {
          id: listing.id,
          name: listing.name,
          city: listing.city,
          country: listing.country,
          propertyType: listing.propertyType,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          maxGuests: listing.maxGuests,
          photos: listing.photos,
          starRating: listing.starRating,
          reviewCount: approvedReviews.length,
          averageRating: Number(averageRating.toFixed(2)),
        };
      })
      .filter(property => property.reviewCount > 0); // Only show properties with approved reviews

    // If requesting a single property, return just that property or null
    if (listingId) {
      return properties[0] || null;
    }

    // Otherwise return all properties
    return properties;
  }

  async getPropertyDetails(listingId: number): Promise<PropertyDetails | null> {
    const listing = await this.listingRepository.getListingById(listingId);
    
    if (!listing) {
      return null;
    }

    return {
      id: listing.id,
      listingName: listing.name,
      name: listing.name,
      city: listing.city,
      description: listing.description,
      personCapacity: listing.maxGuests,
      guestsAllowed: listing.maxGuests,
      totalBedrooms: listing.bedrooms,
      totalBeds: listing.bedrooms, // Approximation
      totalBathrooms: listing.bathrooms,
      images: listing.photos.map((url, index) => ({ imageId: index, url })),
      photos: listing.photos,
      amenities: listing.amenities?.map((name, index) => ({ 
        amenityId: index, 
        amenityName: name 
      })) || [],
    };
  }

  private calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;

    const ratings = reviews.map(review => {
      if (review.rating !== null && review.rating !== undefined) {
        return review.rating;
      }
      
      if (review.reviewCategory && review.reviewCategory.length > 0) {
        const sum = review.reviewCategory.reduce((acc, cat) => acc + cat.rating, 0);
        return sum / review.reviewCategory.length;
      }
      
      return 0;
    });

    const validRatings = ratings.filter(r => r > 0);
    if (validRatings.length === 0) return 0;

    return validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
  }
}
