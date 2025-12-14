/**
 * Infrastructure Layer - Review Repository Implementation
 * Implements data access logic
 */

import { IReviewRepository } from '@/domain/repositories/IReviewRepository';
import { Review, ReviewFilters } from '@/domain/entities/Review';
import { mockReviews } from '../data/mockReviews';
import { HostawayClient } from '../api/HostawayClient';

export class ReviewRepository implements IReviewRepository {
  private reviews: Review[] = [...mockReviews];
  private hostawayClient: HostawayClient;

  constructor() {
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
    const apiKey = process.env.HOSTAWAY_API_KEY;
    
    if (!accountId || !apiKey) {
      throw new Error('Missing required environment variables: HOSTAWAY_ACCOUNT_ID and HOSTAWAY_API_KEY');
    }
    
    this.hostawayClient = new HostawayClient(accountId, apiKey);
  }

  async getReviewsFromHostAway(filters?: ReviewFilters): Promise<Review[]> {
    let reviews = await this.hostawayClient.fetchReviews(filters);
    return reviews;
  }

  async getMockReviews(): Promise<Review[]> {
    return [...this.reviews];
  }

  async getReviewsFromGoogle(): Promise<Review[]> {
    return [];
  }

  async updateReviewApproval(id: number, isApproved: boolean): Promise<Review> {
    const reviewIndex = this.reviews.findIndex(review => review.id === id);
    
    if (reviewIndex === -1) {
      throw new Error(`Review with id ${id} not found`);
    }

    this.reviews[reviewIndex].isApprovedForPublicDisplay = isApproved;
    return this.reviews[reviewIndex];
  }

}
