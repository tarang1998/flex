/**
 * Domain Layer - Review Entity
 * Core business object representing a review
 */

export interface ReviewCategory {
  category: string;
  rating: number;
}

export interface Review {
  id: number;
  type: 'host-to-guest' | 'guest-to-host';
  status: 'awaiting' | 'pending' | 'scheduled' | 'submitted' | 'published' | 'expired';
  rating: number | null;
  publicReview: string;
  reviewCategory: ReviewCategory[];
  submittedAt: string;
  guestName: string;
  listingName: string;
  listingMapId?: number;
  channel?: string;
  isApprovedForPublicDisplay?: boolean;
}

export interface ReviewFilters {
  listingMapIds?: number[];
  limit?: number;
  offset?: number;
  type?: 'guest-to-host' | 'host-to-guest';
  statuses?: ('awaiting' | 'pending' | 'scheduled' | 'submitted' | 'published' | 'expired')[];
  id?: number;
  listingName?: string;
  minRating?: number;
  maxRating?: number;
  approvedOnly?: boolean;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
  categoryAverages: Record<string, number>;
  reviewsByListing: Record<string, number>;
  reviewsByChannel: Record<string, number>;
  trends: {
    period: string;
    count: number;
    averageRating: number;
  }[];
}
