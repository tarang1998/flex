/**
 * Application Layer - Update Review Approval Use Case
 * Business logic for approving/disapproving reviews
 * Stores approval status in Supabase database
 */

import { IReviewRepository } from '@/domain/repositories/IReviewRepository';

export interface UpdateReviewApprovalInput {
  reviewId: number;
  listingId: number;
  isApproved: boolean;
  approvedBy?: string;
}

export class UpdateReviewApprovalUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(input: UpdateReviewApprovalInput): Promise<void> {
    const { reviewId, listingId, isApproved, approvedBy } = input;
    await this.reviewRepository.updateReviewApproval(
      reviewId,
      listingId,
      isApproved,
      approvedBy
    );
  }
}
