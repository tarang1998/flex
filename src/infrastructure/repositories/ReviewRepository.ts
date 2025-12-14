/**
 * Infrastructure Layer - Review Repository Implementation
 * Implements data access logic
 */

import { IReviewRepository } from '@/domain/repositories/IReviewRepository';
import { Review, ReviewFilters } from '@/domain/entities/Review';
import { mockReviews } from '../data/mockReviews';
import { HostawayClient } from '../api/HostawayClient';
import { supabase } from '../database/supabase';

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

  async getMockReviews(listingIds?: number[]): Promise<Review[]> {
    if (!listingIds || listingIds.length === 0) {
      return [...this.reviews];
    }
    return this.reviews.filter(review => 
      review.listingMapId && listingIds.includes(review.listingMapId)
    );
  }

  async getReviewsFromGoogle(): Promise<Review[]> {
    return [];
  }

  async getApprovedReviewIdsByListing(listingId: number): Promise<number[]> {
    const { data, error } = await supabase
      .from('approved_reviews')
      .select('review_id')
      .eq('listing_id', listingId)
      .eq('is_approved', true);

    if (error) {
      console.error('Error fetching approved reviews from Supabase:', error);
      return [];
    }

    return data?.map((row: { review_id: number }) => row.review_id) || [];
  }

  async updateReviewApproval(
    reviewId: number,
    listingId: number,
    isApproved: boolean,
    approvedBy?: string
  ): Promise<void> {
    if (isApproved) {
      // Insert or update the approval record
      const { error } = await supabase
        .from('approved_reviews')
        .upsert(
          {
            review_id: reviewId,
            listing_id: listingId,
            is_approved: true,
            approved_by: approvedBy || 'system',
            approved_at: new Date().toISOString(),
          },
          {
            onConflict: 'review_id',
          }
        );

      if (error) {
        throw new Error(`Failed to approve review: ${error.message}`);
      }
    } else {
      // Remove the approval or mark as not approved
      const { error } = await supabase
        .from('approved_reviews')
        .delete()
        .eq('review_id', reviewId);

      if (error) {
        throw new Error(`Failed to disapprove review: ${error.message}`);
      }
    }
  }

}
