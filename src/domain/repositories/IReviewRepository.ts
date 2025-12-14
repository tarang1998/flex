/**
 * Domain Layer - Review Repository Interface
 * Defines the contract for data access
 */

import { Review, ReviewFilters } from '../entities/Review';

export interface IReviewRepository {
  getReviewsFromHostAway(filters?: ReviewFilters): Promise<Review[]>;
  getMockReviews(): Promise<Review[]>;
  getReviewsFromGoogle(): Promise<Review[]>;
  updateReviewApproval(id: number, isApproved: boolean): Promise<Review>;
}
