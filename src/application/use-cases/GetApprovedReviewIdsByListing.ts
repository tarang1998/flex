import { IReviewRepository } from '@/domain/repositories/IReviewRepository';

export class GetApprovedReviewIdsByListing {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(listingId: number): Promise<number[]> {
    return await this.reviewRepository.getApprovedReviewIdsByListing(listingId);
  }
}
