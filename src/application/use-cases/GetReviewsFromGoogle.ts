import { IReviewRepository } from '@/domain/repositories/IReviewRepository';
import { Review } from '@/domain/entities/Review';

export class GetReviewsFromGoogle {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(
    listingId: number,
    listingName?: string,
    listingAddress?: string
  ): Promise<Review[]> {
    return await this.reviewRepository.getReviewsFromGoogle(
      listingId,
      listingName,
      listingAddress
    );
  }
}
