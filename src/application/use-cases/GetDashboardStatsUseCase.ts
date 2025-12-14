/**
 * Application Layer - Get Dashboard Stats Use Case
 * Business logic for fetching dashboard statistics and listings with reviews
 */

import { IListingRepository } from '@/domain/repositories/IListingRepository';
import { IReviewRepository } from '@/domain/repositories/IReviewRepository';
import { Listing } from '@/domain/entities/Listing';
import { Review, ReviewFilters } from '@/domain/entities/Review';

interface ListingStats {
  totalReviews: number;
  totalApprovedReviews: number;
  averageReviewRating: number;
  approvedAverageReviewRating: number;
  attentionScore: number;
  categoryAverages: Record<string, number>;
}

interface ListingWithStats {
  listing: Listing;
  stats: ListingStats;
}

interface DashboardStats {
  totalListings: number;
  totalReviews: number;
  totalApprovedReviews: number;
  averageRating: number;
  highAttentionCount: number;
}

interface GetReviewsFromHostAway {
  execute(filters?: ReviewFilters): Promise<Review[]>;
}

interface GetMockReviews {
  execute(listingIds: number[]): Promise<Review[]>;
}

interface GetReviewsFromGoogle {
  execute(): Promise<Review[]>;
}

interface GetApprovedReviewIdsByListing {
  execute(listingId: number): Promise<number[]>;
}

export class GetDashboardStatsUseCase {
  constructor(
    private listingRepository: IListingRepository,
    private getReviewsFromHostAway: GetReviewsFromHostAway,
    private getMockReviews: GetMockReviews,
    private getReviewsFromGoogle: GetReviewsFromGoogle,
    private getApprovedReviewIdsByListing: GetApprovedReviewIdsByListing
  ) {}

  async execute(): Promise<{
    listingsWithReviews: ListingWithStats[];
    overallStats: DashboardStats;
  }> {
    // Fetch all listings
    const listings = await this.listingRepository.getAllListings();
    const listingIds = listings.map((l: Listing) => l.id);

    // Fetch all reviews and approved review IDs in parallel
    const [hostawayReviews, mockReviews, googleReviews, ...approvedReviewsByListing] = await Promise.all([
      this.getReviewsFromHostAway.execute({ 
        listingMapIds: listingIds,
        type: 'guest-to-host'
      }),
      this.getMockReviews.execute(listingIds),
      this.getReviewsFromGoogle.execute(),
      ...listingIds.map((listingId: number) => this.getApprovedReviewIdsByListing.execute(listingId)),
    ]);

    // Create a map of listingId -> Set of approved review IDs
    const approvedReviewsMap = new Map<number, Set<number>>();
    listingIds.forEach((listingId: number, index: number) => {
      approvedReviewsMap.set(listingId, new Set(approvedReviewsByListing[index] as number[]));
    });

    // Combine all reviews
    const allReviews = [...hostawayReviews, ...mockReviews, ...googleReviews]
      .filter(r => r.type === 'guest-to-host');

    // Build listings with review stats
    const listingsWithReviews: ListingWithStats[] = listings.map((listing: Listing) => {
      // Get all reviews for this listing
      const listingReviews = allReviews.filter(
        review => review.listingMapId === listing.id || review.listingName === listing.name
      );

      // Get only approved reviews
      const approvedReviewIds = approvedReviewsMap.get(listing.id) || new Set<number>();
      const approvedReviews = listingReviews.filter(r => r.id && approvedReviewIds.has(r.id));

      // Calculate stats
      const totalReviews = listingReviews.length;
      const totalApprovedReviews = approvedReviews.length;
      const averageReviewRating = this.calculateAverageRating(listingReviews);
      const approvedAverageReviewRating = this.calculateAverageRating(approvedReviews);
      const categoryAverages = this.calculateCategoryAverages(listingReviews);
      
      const attentionScore = this.calculateAttentionScore(
        listing,
        totalReviews,
        totalApprovedReviews,
        averageReviewRating,
        approvedAverageReviewRating,
        categoryAverages
      );

      return {
        listing,
        stats: {
          totalReviews,
          totalApprovedReviews,
          averageReviewRating: Number(averageReviewRating.toFixed(2)),
          approvedAverageReviewRating: Number(approvedAverageReviewRating.toFixed(2)),
          attentionScore,
          categoryAverages,
        },
      };
    });

    // Calculate overall stats
    const totalReviews = listingsWithReviews.reduce((sum, l) => sum + l.stats.totalReviews, 0);
    const totalApprovedReviews = listingsWithReviews.reduce((sum, l) => sum + l.stats.totalApprovedReviews, 0);
    const totalRatings = listingsWithReviews.reduce((sum, l) => {
      return sum + (l.stats.averageReviewRating * l.stats.totalReviews);
    }, 0);
    const averageRating = totalReviews > 0 ? totalRatings / totalReviews : 0;
    const highAttentionCount = listingsWithReviews.filter(l => l.stats.attentionScore >= 50).length;

    const overallStats: DashboardStats = {
      totalListings: listings.length,
      totalReviews,
      totalApprovedReviews,
      averageRating: Number(averageRating.toFixed(2)),
      highAttentionCount,
    };

    return {
      listingsWithReviews,
      overallStats,
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

  private calculateCategoryAverages(reviews: Review[]): Record<string, number> {
    const categoryTotals: Record<string, { sum: number; count: number }> = {};

    reviews.forEach(review => {
      if (review.reviewCategory && review.reviewCategory.length > 0) {
        review.reviewCategory.forEach(cat => {
          if (!categoryTotals[cat.category]) {
            categoryTotals[cat.category] = { sum: 0, count: 0 };
          }
          categoryTotals[cat.category].sum += cat.rating;
          categoryTotals[cat.category].count++;
        });
      }
    });

    const averages: Record<string, number> = {};
    Object.keys(categoryTotals).forEach(category => {
      averages[category] = Number(
        (categoryTotals[category].sum / categoryTotals[category].count).toFixed(2)
      );
    });

    return averages;
  }

  private calculateAttentionScore(
    listing: Listing,
    totalReviews: number,
    totalApprovedReviews: number,
    averageRating: number,
    approvedAverageRating: number,
    categoryAverages: Record<string, number>
  ): number {
    let score = 0;

    if (totalReviews === 0) {
      score += 35;
    }

    if (averageRating > 0 && averageRating < 2) {
      score += 40;
    } else if (averageRating >= 2 && averageRating < 3) {
      score += 30;
    } else if (averageRating >= 3 && averageRating < 3.5) {
      score += 20;
    } else if (averageRating >= 3.5 && averageRating < 4) {
      score += 10;
    }

    const pendingReviews = totalReviews - totalApprovedReviews;
    if (pendingReviews > 5) {
      score += 20;
    } else if (pendingReviews >= 3) {
      score += 15;
    } else if (pendingReviews >= 1) {
      score += 10;
    }

    if (listing.starRating > 0 && listing.starRating < 3) {
      score += 15;
    } else if (listing.starRating >= 3 && listing.starRating < 4) {
      score += 10;
    }

    const categoryValues = Object.values(categoryAverages);
    if (categoryValues.length > 0) {
      const lowCategoryCount = categoryValues.filter(rating => rating < 3.5).length;
      if (lowCategoryCount >= 3) {
        score += 15;
      } else if (lowCategoryCount >= 2) {
        score += 10;
      } else if (lowCategoryCount >= 1) {
        score += 5;
      }
    }

    if (totalReviews > 0) {
      const approvalRate = totalApprovedReviews / totalReviews;
      if (approvalRate < 0.5) {
        score += 10;
      } else if (approvalRate < 0.7) {
        score += 5;
      }
    }

    return Math.min(score, 100);
  }
}
