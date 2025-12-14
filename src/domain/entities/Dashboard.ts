import { Listing } from './Listing';
import { Review } from './Review';

export interface ListingReviewStats {
  totalReviews: number;
  totalApprovedReviews: number;
  averageReviewRating: number;
  approvedAverageReviewRating: number;
  attentionScore: number;
  categoryAverages: Record<string, number>;
}

export interface ListingWithReviews {
  listing: Listing;
  reviews: Review[];
  stats: ListingReviewStats;
}

export interface ListingWithStats {
  listing: Listing;
  stats: ListingReviewStats;
}

export interface DashboardModel {
  listingsWithReviews: ListingWithReviews[];
  overallStats: {
    totalListings: number;
    totalReviews: number;
    totalApprovedReviews: number;
    averageRating: number;
    highAttentionCount: number;
  };
}
