import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/di';
import { Listing } from '@/domain/entities/Listing';
import { Review } from '@/domain/entities/Review';
import { ListingWithStats } from '@/domain/entities/Dashboard';

export async function GET(request: NextRequest) {
  try {
    const getListingsUseCase = container().getListingsUseCase();

    const getReviewsFromHostAway = container().getReviewsFromHostAway();
    const getMockReviews = container().getMockReviews();
    const getReviewsFromGoogle = container().getReviewsFromGoogle();
    const getApprovedReviewIdsByListing = container().getApprovedReviewIdsByListing();

    const listings = await getListingsUseCase.execute();
    const listingIds = listings.map(l => l.id);
    
    const [hostawayReviews, mockReviews, googleReviews, ...approvedReviewsByListing] = await Promise.all([
      getReviewsFromHostAway.execute({ 
        listingMapIds: listingIds,
        type: 'guest-to-host'
      }),
      getMockReviews.execute(listingIds),
      getReviewsFromGoogle.execute(),
      ...listingIds.map(listingId => getApprovedReviewIdsByListing.execute(listingId)),
    ]);
    
    // Create a map of listingId -> Set of approved review IDs for quick lookup
    const approvedReviewsMap = new Map<number, Set<number>>();
    listingIds.forEach((listingId, index) => {
      approvedReviewsMap.set(listingId, new Set(approvedReviewsByListing[index]));
    });
    
    const allReviews = [...hostawayReviews, ...mockReviews, ...googleReviews]
      .filter(r => r.type === 'guest-to-host');

    const listingsWithReviews: ListingWithStats[] = listings.map(listing => {
      const listingReviews = allReviews.filter(
        review => review.listingMapId === listing.id || review.listingName === listing.name
      );

      const totalReviews = listingReviews.length;
      const approvedReviewIds = approvedReviewsMap.get(listing.id) || new Set<number>();
      const approvedReviews = listingReviews.filter(r => r.id && approvedReviewIds.has(r.id));
      const totalApprovedReviews = approvedReviews.length;

      const averageReviewRating = calculateAverageRating(listingReviews);
      const approvedAverageReviewRating = calculateAverageRating(approvedReviews);
      const categoryAverages = calculateCategoryAverages(listingReviews);
      
      const attentionScore = calculateAttentionScore(
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

    const totalListings = listingsWithReviews.length;
    const totalReviews = listingsWithReviews.reduce((sum, l) => sum + l.stats.totalReviews, 0);
    const totalApprovedReviews = listingsWithReviews.reduce((sum, l) => sum + l.stats.totalApprovedReviews, 0);
    
    const allRatings = listingsWithReviews
      .filter(l => l.stats.averageReviewRating > 0)
      .map(l => l.stats.averageReviewRating);
    
    const averageRating = allRatings.length > 0
      ? Number((allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(2))
      : 0;

    const highAttentionCount = listingsWithReviews.filter(l => l.stats.attentionScore >= 50).length;

    return NextResponse.json({
      success: true,
      data: {
        listingsWithReviews,
        overallStats: {
          totalListings,
          totalReviews,
          totalApprovedReviews,
          averageRating,
          highAttentionCount,
        },
      },
    });
  } catch (error) {
    console.error('Error in /api/dashboard/stats:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateAverageRating(reviews: Review[]): number {
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

function calculateCategoryAverages(reviews: Review[]): Record<string, number> {
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

function calculateAttentionScore(
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
