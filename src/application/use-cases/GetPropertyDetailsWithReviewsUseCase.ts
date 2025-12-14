/**
 * Application Layer - Get Property Details with Reviews Use Case
 * Fetches property details along with approved reviews from all sources
 */

import { IListingRepository } from '@/domain/repositories/IListingRepository';
import { GetReviewsFromHostAway } from './GetReviewsFromHostAway';
import { GetMockReviews } from './GetMockReviews';
import { GetReviewsFromGoogle } from './GetReviewsFromGoogle';
import { GetApprovedReviewIdsByListing } from './GetApprovedReviewIdsByListing';
import { Review } from '@/domain/entities/Review';

export interface PropertyDetailsWithReviews {
  id: number;
  name: string;
  address?: string;
  city: string;
  country?: string;
  propertyType?: string;
  description?: string;
  maxGuests: number;
  bedrooms: number;
  beds?: number;
  bathrooms: number;
  images?: Array<{ imageId: number; url: string }>;
  photos?: string[];
  amenities?: string[];
  amenityDetails?: Array<{ amenityId: number; amenityName: string }>;
  isActive?: boolean;
  starRating?: number;
  averageReviewRating?: number;
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
  createdAt?: string;
  updatedAt?: string;
  approvedReviews: Review[];
  reviewCount: number;
  calculatedAverageRating: number;
}

export class GetPropertyDetailsWithReviewsUseCase {
  constructor(
    private listingRepository: IListingRepository,
    private getReviewsFromHostAway: GetReviewsFromHostAway,
    private getMockReviews: GetMockReviews,
    private getReviewsFromGoogle: GetReviewsFromGoogle,
    private getApprovedReviewIdsByListing: GetApprovedReviewIdsByListing
  ) {}

  async execute(listingId: number): Promise<PropertyDetailsWithReviews | null> {
    // Fetch the listing
    const listing = await this.listingRepository.getListingById(listingId);
    
    if (!listing) {
      return null;
    }

    // Fetch all reviews and approved review IDs in parallel
    const [hostawayReviews, mockReviews, googleReviews, approvedReviewIds] = await Promise.all([
      this.getReviewsFromHostAway.execute({ 
        listingMapIds: [listingId],
        type: 'guest-to-host'
      }),
      this.getMockReviews.execute([listingId]),
      this.getReviewsFromGoogle.execute(
        listingId,
        listing.name,
        listing.city + ', ' + listing.country
      ),
      this.getApprovedReviewIdsByListing.execute(listingId),
    ]);

    // Combine all reviews
    const allReviews = [...hostawayReviews, ...mockReviews, ...googleReviews]
      .filter(r => r.type === 'guest-to-host');

    // Filter to only reviews for this specific listing
    const listingReviews = allReviews.filter(
      review => review.listingMapId === listing.id || review.listingName === listing.name
    );

    // Get only approved reviews
    const approvedReviewIdsSet = new Set(approvedReviewIds);
    const approvedReviews = listingReviews.filter(r => r.id && approvedReviewIdsSet.has(r.id));

    // Calculate average rating from approved reviews
    const calculatedAverageRating = this.calculateAverageRating(approvedReviews);

    return {
      id: listing.id,
      name: listing.name,
      address: listing.address,
      city: listing.city,
      country: listing.country,
      propertyType: listing.propertyType,
      description: listing.description,
      maxGuests: listing.maxGuests,
      bedrooms: listing.bedrooms,
      beds: listing.beds,
      bathrooms: listing.bathrooms,
      photos: listing.photos,
      amenities: listing.amenities,
      isActive: listing.isActive,
      starRating: listing.starRating,
      averageReviewRating: listing.averageReviewRating,
      checkInTimeStart: listing.checkInTimeStart,
      checkInTimeEnd: listing.checkInTimeEnd,
      checkOutTime: listing.checkOutTime,
      houseRules: listing.houseRules,
      maxPetsAllowed: listing.maxPetsAllowed,
      maxChildrenAllowed: listing.maxChildrenAllowed,
      maxInfantsAllowed: listing.maxInfantsAllowed,
      cancellationPolicy: listing.cancellationPolicy,
      minNights: listing.minNights,
      maxNights: listing.maxNights,
      refundableDamageDeposit: listing.refundableDamageDeposit,
      cleaningFee: listing.cleaningFee,
      specialInstruction: listing.specialInstruction,
      keyPickup: listing.keyPickup,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      approvedReviews: approvedReviews,
      reviewCount: approvedReviews.length,
      calculatedAverageRating: Number(calculatedAverageRating.toFixed(2)),
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
