/**
 * Application Layer - Get Review Stats Use Case
 * Business logic for calculating review statistics
 */

import { IReviewRepository } from '@/domain/repositories/IReviewRepository';
import { ReviewStats } from '@/domain/entities/Review';

export class GetReviewStatsUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(): Promise<ReviewStats> {
    const reviews = await this.reviewRepository.getReviewsFromHostAway();

    const totalReviews = reviews.length;
    const averageRating = this.calculateOverallAverage(reviews);
    const ratingDistribution = this.calculateRatingDistribution(reviews);
    const categoryAverages = this.calculateCategoryAverages(reviews);
    const reviewsByListing = this.calculateReviewsByListing(reviews);
    const reviewsByChannel = this.calculateReviewsByChannel(reviews);
    const trends = this.calculateTrends(reviews);

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      categoryAverages,
      reviewsByListing,
      reviewsByChannel,
      trends,
    };
  }

  private calculateOverallAverage(reviews: any[]): number {
    if (reviews.length === 0) return 0;

    const ratings = reviews.map(review => {
      if (review.rating !== null) return review.rating;
      if (review.reviewCategory.length === 0) return 0;
      const sum = review.reviewCategory.reduce((acc: number, cat: any) => acc + cat.rating, 0);
      return sum / review.reviewCategory.length;
    });

    return ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length;
  }

  private calculateRatingDistribution(reviews: any[]): Record<string, number> {
    const distribution: Record<string, number> = {
      '5': 0,
      '4': 0,
      '3': 0,
      '2': 0,
      '1': 0,
    };

    reviews.forEach(review => {
      let rating;
      if (review.rating !== null) {
        rating = review.rating;
      } else if (review.reviewCategory.length > 0) {
        const sum = review.reviewCategory.reduce((acc: number, cat: any) => acc + cat.rating, 0);
        rating = sum / review.reviewCategory.length;
      } else {
        return;
      }

      const roundedRating = Math.round(rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        distribution[roundedRating.toString()]++;
      }
    });

    return distribution;
  }

  private calculateCategoryAverages(reviews: any[]): Record<string, number> {
    const categoryTotals: Record<string, { sum: number; count: number }> = {};

    reviews.forEach(review => {
      review.reviewCategory.forEach((cat: any) => {
        if (!categoryTotals[cat.category]) {
          categoryTotals[cat.category] = { sum: 0, count: 0 };
        }
        categoryTotals[cat.category].sum += cat.rating;
        categoryTotals[cat.category].count++;
      });
    });

    const averages: Record<string, number> = {};
    Object.keys(categoryTotals).forEach(category => {
      averages[category] = categoryTotals[category].sum / categoryTotals[category].count;
    });

    return averages;
  }

  private calculateReviewsByListing(reviews: any[]): Record<string, number> {
    const byListing: Record<string, number> = {};

    reviews.forEach(review => {
      byListing[review.listingName] = (byListing[review.listingName] || 0) + 1;
    });

    return byListing;
  }

  private calculateReviewsByChannel(reviews: any[]): Record<string, number> {
    const byChannel: Record<string, number> = {};

    reviews.forEach(review => {
      const channel = review.channel || 'Unknown';
      byChannel[channel] = (byChannel[channel] || 0) + 1;
    });

    return byChannel;
  }

  private calculateTrends(reviews: any[]): Array<{ period: string; count: number; averageRating: number }> {
    const monthlyData: Record<string, { count: number; ratings: number[] }> = {};

    reviews.forEach(review => {
      const date = new Date(review.submittedAt);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[period]) {
        monthlyData[period] = { count: 0, ratings: [] };
      }

      monthlyData[period].count++;

      let rating;
      if (review.rating !== null) {
        rating = review.rating;
      } else if (review.reviewCategory.length > 0) {
        const sum = review.reviewCategory.reduce((acc: number, cat: any) => acc + cat.rating, 0);
        rating = sum / review.reviewCategory.length;
      }

      if (rating) {
        monthlyData[period].ratings.push(rating);
      }
    });

    return Object.keys(monthlyData)
      .sort()
      .map(period => ({
        period,
        count: monthlyData[period].count,
        averageRating:
          monthlyData[period].ratings.reduce((a, b) => a + b, 0) / monthlyData[period].ratings.length || 0,
      }));
  }
}
