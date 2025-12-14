import { IReviewRepository } from '@/domain/repositories/IReviewRepository';
import { Review, ReviewFilters } from '@/domain/entities/Review';

export class GetReviewsFromHostAway {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(filters?: ReviewFilters): Promise<Review[]> {
    return await this.reviewRepository.getReviewsFromHostAway(filters);
  }
}
