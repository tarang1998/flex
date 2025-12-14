/**
 * Infrastructure Layer - Review Repository Implementation
 * Implements data access logic
 */

import { IReviewRepository } from '@/domain/repositories/IReviewRepository';
import { Review, ReviewFilters } from '@/domain/entities/Review';
import { mockReviews } from '../data/mockReviews';
import { HostawayClient } from '../api/HostawayClient';
import { GooglePlacesClient } from '../api/GooglePlacesClient';
import { supabase } from '../database/supabase';

export class ReviewRepository implements IReviewRepository {
  private reviews: Review[] = [...mockReviews];
  private hostawayClient: HostawayClient;
  private googlePlacesClient?: GooglePlacesClient;

  constructor() {
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
    const apiKey = process.env.HOSTAWAY_API_KEY;
    
    if (!accountId || !apiKey) {
      throw new Error('Missing required environment variables: HOSTAWAY_ACCOUNT_ID and HOSTAWAY_API_KEY');
    }
    
    this.hostawayClient = new HostawayClient(accountId, apiKey);

    // Initialize Google Places client if API key is available
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (googleApiKey) {
      this.googlePlacesClient = new GooglePlacesClient(googleApiKey);
    } else {
      console.warn('Google Places API key not configured. Google reviews will not be available.');
    }
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

  async getReviewsFromGoogle(listingId: number,listingName: string, listingAddress: string): Promise<Review[]> {
    if (!this.googlePlacesClient) {
      console.warn('Google Places client not initialized. Returning empty reviews.');
      return [];
    }

    try {
      // Search by name and address
      if (listingName && listingAddress) {
        return await this.googlePlacesClient.fetchReviewsByNameAndAddress(listingId,listingName, listingAddress);
      }

      console.warn('Insufficient information to fetch Google reviews. Need listingName and listingAddress');
      return [];
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
      return [];
    }
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
