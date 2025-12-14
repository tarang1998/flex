/**
 * Application Layer - Get Listing Details Use Case
 * Business logic for fetching comprehensive listing details including reviews and stats
 */

import { IListingRepository } from '@/domain/repositories/IListingRepository';
import { Listing } from '@/domain/entities/Listing';
import { Review } from '@/domain/entities/Review';
import { GetReviewsFromHostAway } from './GetReviewsFromHostAway';
import { GetMockReviews } from './GetMockReviews';
import { GetReviewsFromGoogle } from './GetReviewsFromGoogle';
import { GetApprovedReviewIdsByListing } from './GetApprovedReviewIdsByListing';

interface ActionItem {
  priority: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  action: string;
  impact: string;
}

interface ListingStats {
  totalReviews: number;
  totalApprovedReviews: number;
  averageReviewRating: number;
  approvedAverageReviewRating: number;
  attentionScore: number;
  categoryAverages: Record<string, number>;
  actionItems: ActionItem[];
}

export interface ListingDetailsResult {
  listing: Listing;
  reviews: Review[];
  stats: ListingStats;
}

export class GetListingDetailsUseCase {
  constructor(
    private listingRepository: IListingRepository,
    private getReviewsFromHostAway: GetReviewsFromHostAway,
    private getMockReviews: GetMockReviews,
    private getReviewsFromGoogle: GetReviewsFromGoogle,
    private getApprovedReviewIdsByListing: GetApprovedReviewIdsByListing
  ) {}

  async execute(listingId: number): Promise<ListingDetailsResult | null> {
    // Get all listings and find the specific one
    const listings = await this.listingRepository.getAllListings();
    const listing = listings.find(l => l.id === listingId);

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
      this.getReviewsFromGoogle.execute(),
      this.getApprovedReviewIdsByListing.execute(listingId),
    ]);

    // Combine all reviews and filter for this listing
    const allReviews = [...hostawayReviews, ...mockReviews, ...googleReviews]
      .filter(r => r.type === 'guest-to-host')
      .filter(review => review.listingMapId === listingId || review.listingName === listing.name);

    // Calculate stats
    const approvedReviewIdsSet = new Set(approvedReviewIds);
    const approvedReviews = allReviews.filter(r => r.id && approvedReviewIdsSet.has(r.id));
    
    const totalReviews = allReviews.length;
    const totalApprovedReviews = approvedReviews.length;
    const averageReviewRating = this.calculateAverageRating(allReviews);
    const approvedAverageReviewRating = this.calculateAverageRating(approvedReviews);
    const categoryAverages = this.calculateCategoryAverages(allReviews);
    
    const attentionScore = this.calculateAttentionScore(
      listing,
      totalReviews,
      totalApprovedReviews,
      averageReviewRating,
      approvedAverageReviewRating,
      categoryAverages
    );

    const actionItems = this.generateActionItems(
      listing,
      totalReviews,
      totalApprovedReviews,
      averageReviewRating,
      approvedAverageReviewRating,
      categoryAverages
    );

    return {
      listing,
      reviews: allReviews,
      stats: {
        totalReviews,
        totalApprovedReviews,
        averageReviewRating: Number(averageReviewRating.toFixed(2)),
        approvedAverageReviewRating: Number(approvedAverageReviewRating.toFixed(2)),
        attentionScore,
        categoryAverages,
        actionItems,
      },
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

  private generateActionItems(
    listing: Listing,
    totalReviews: number,
    totalApprovedReviews: number,
    averageRating: number,
    approvedAverageRating: number,
    categoryAverages: Record<string, number>
  ): ActionItem[] {
    const actionItems: ActionItem[] = [];

    // Check for no reviews
    if (totalReviews === 0) {
      actionItems.push({
        priority: 'high',
        issue: 'No guest reviews yet',
        action: 'Encourage guests to leave reviews after their stay. Send follow-up messages and provide excellent service to motivate positive feedback.',
        impact: 'Reviews build trust and credibility, directly impacting booking rates.',
      });
    }

    // Check for very low ratings
    if (averageRating > 0 && averageRating < 2) {
      actionItems.push({
        priority: 'critical',
        issue: `Critical: Average rating is ${averageRating.toFixed(1)}/5`,
        action: 'URGENT: Review all recent feedback, identify major issues (cleanliness, amenities, communication), and implement immediate fixes. Consider temporarily pausing bookings until issues are resolved.',
        impact: 'Extremely low ratings severely damage property reputation and bookings.',
      });
    } else if (averageRating >= 2 && averageRating < 3) {
      actionItems.push({
        priority: 'critical',
        issue: `Very low average rating: ${averageRating.toFixed(1)}/5`,
        action: 'Address critical guest complaints immediately. Focus on: cleanliness standards, accurate property descriptions, responsive communication, and working amenities.',
        impact: 'Ratings below 3 stars significantly reduce booking conversions.',
      });
    } else if (averageRating >= 3 && averageRating < 3.5) {
      actionItems.push({
        priority: 'high',
        issue: `Below-average rating: ${averageRating.toFixed(1)}/5`,
        action: 'Analyze recent negative reviews to identify patterns. Implement improvements in problem areas and update property listing to set accurate expectations.',
        impact: 'Ratings below 3.5 limit visibility and competitiveness.',
      });
    } else if (averageRating >= 3.5 && averageRating < 4) {
      actionItems.push({
        priority: 'medium',
        issue: `Rating needs improvement: ${averageRating.toFixed(1)}/5`,
        action: 'Focus on consistency in service quality. Address any recurring minor issues mentioned in reviews. Consider small upgrades or amenities to exceed guest expectations.',
        impact: 'Improving from 3.5 to 4+ significantly boosts bookings.',
      });
    }

    // Check for pending reviews
    const pendingReviews = totalReviews - totalApprovedReviews;
    if (pendingReviews > 5) {
      actionItems.push({
        priority: 'high',
        issue: `${pendingReviews} reviews pending approval`,
        action: 'Review and approve pending reviews promptly. Approved reviews improve search visibility and build trust with potential guests.',
        impact: 'Unapproved reviews don\'t contribute to your public rating or visibility.',
      });
    } else if (pendingReviews >= 3) {
      actionItems.push({
        priority: 'medium',
        issue: `${pendingReviews} reviews awaiting approval`,
        action: 'Process pending reviews. Respond professionally to all reviews, especially critical ones, to show potential guests you care about feedback.',
        impact: 'Timely review management improves guest perception and platform ranking.',
      });
    } else if (pendingReviews >= 1) {
      actionItems.push({
        priority: 'low',
        issue: `${pendingReviews} review(s) pending`,
        action: 'Approve pending reviews and respond thoughtfully to maintain good guest relations.',
        impact: 'Regular review management maintains credibility.',
      });
    }

    // Check property star rating
    if (listing.starRating > 0 && listing.starRating < 3) {
      actionItems.push({
        priority: 'critical',
        issue: `Low property rating: ${listing.starRating}/5`,
        action: 'This indicates systemic issues. Conduct a full property audit: deep clean, repair/replace broken items, upgrade essential amenities, improve photos and description accuracy.',
        impact: 'Platform star ratings directly affect search ranking and guest trust.',
      });
    } else if (listing.starRating >= 3 && listing.starRating < 4) {
      actionItems.push({
        priority: 'high',
        issue: `Property rating below 4 stars: ${listing.starRating}/5`,
        action: 'Identify and fix recurring issues. Consider professional photography, minor renovations, or adding desirable amenities (WiFi upgrade, coffee maker, etc.).',
        impact: 'Moving above 4 stars unlocks premium positioning in search results.',
      });
    }

    // Check for low category ratings
    const categoryValues = Object.values(categoryAverages);
    if (categoryValues.length > 0) {
      const lowCategories = Object.entries(categoryAverages)
        .filter(([_, rating]) => rating < 3.5)
        .sort((a, b) => a[1] - b[1]);

      if (lowCategories.length >= 3) {
        actionItems.push({
          priority: 'high',
          issue: `Multiple categories below 3.5: ${lowCategories.map(([cat]) => cat).join(', ')}`,
          action: `Focus on improving: ${lowCategories.slice(0, 3).map(([cat, rating]) => `${cat} (${rating.toFixed(1)})`).join(', ')}. Each category requires specific action - e.g., Cleanliness: professional cleaning; Communication: faster response times; Location: provide better directions/recommendations.`,
          impact: 'Category ratings directly impact guest satisfaction and repeat bookings.',
        });
      } else if (lowCategories.length >= 2) {
        actionItems.push({
          priority: 'medium',
          issue: `Categories needing attention: ${lowCategories.map(([cat]) => cat).join(', ')}`,
          action: `Improve ${lowCategories.map(([cat, rating]) => `${cat} (${rating.toFixed(1)})`).join(' and ')}. Review guest comments to understand specific pain points.`,
          impact: 'Addressing these categories will improve overall ratings.',
        });
      } else if (lowCategories.length >= 1) {
        const [category, rating] = lowCategories[0];
        actionItems.push({
          priority: 'low',
          issue: `${category} rating is ${rating.toFixed(1)}/5`,
          action: `Focus on improving ${category}. Review guest feedback for specific suggestions.`,
          impact: 'Improving this category will boost overall guest satisfaction.',
        });
      }
    }

    // Check approval rate
    if (totalReviews > 0) {
      const approvalRate = totalApprovedReviews / totalReviews;
      if (approvalRate < 0.5) {
        actionItems.push({
          priority: 'medium',
          issue: `Low approval rate: ${(approvalRate * 100).toFixed(0)}% of reviews approved`,
          action: 'Review your approval process. Most positive reviews should be approved to build credibility. Only reject spam or policy-violating reviews.',
          impact: 'Higher approval rates improve public rating and search visibility.',
        });
      } else if (approvalRate < 0.7) {
        actionItems.push({
          priority: 'low',
          issue: `Approval rate at ${(approvalRate * 100).toFixed(0)}%`,
          action: 'Consider approving more reviews to increase social proof and transparency.',
          impact: 'More approved reviews build trust with potential guests.',
        });
      }
    }

    return actionItems;
  }
}
