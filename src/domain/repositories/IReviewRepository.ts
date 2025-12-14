/**
 * Domain Layer - Review Repository Interface
 * Defines the contract for data access
 */

import { Review, ReviewFilters } from '../entities/Review';

export interface IReviewRepository {
  getReviewsFromHostAway(filters?: ReviewFilters): Promise<Review[]>;
  getMockReviews(listingIds?: number[]): Promise<Review[]>;
  getReviewsFromGoogle(listingId: number, listingName?: string, listingAddress?: string): Promise<Review[]>;
  getApprovedReviewIdsByListing(listingId: number): Promise<number[]>;
  updateReviewApproval(reviewId: number, listingId: number, isApproved: boolean, approvedBy?: string): Promise<void>;
}
