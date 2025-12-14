import { IReviewRepository } from '@/domain/repositories/IReviewRepository';
import { Review } from '@/domain/entities/Review';

export class GetMockReviews {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(): Promise<Review[]> {
    return await this.reviewRepository.getMockReviews();
  }
}
