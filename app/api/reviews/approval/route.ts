/**
 * API Route - POST /api/reviews/approval
 * Update review approval status and store in Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/di';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, listingId, isApproved, approvedBy } = body;

    // Validate required fields
    if (typeof reviewId !== 'number' || typeof listingId !== 'number') {
      return NextResponse.json(
        {
          error: 'Invalid input',
          message: 'reviewId and listingId must be numbers',
        },
        { status: 400 }
      );
    }

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json(
        {
          error: 'Invalid input',
          message: 'isApproved must be a boolean',
        },
        { status: 400 }
      );
    }

    const updateReviewApprovalUseCase = container().getUpdateReviewApprovalUseCase();
    
    await updateReviewApprovalUseCase.execute({
      reviewId,
      listingId,
      isApproved,
      approvedBy,
    });

    return NextResponse.json({
      success: true,
      message: `Review ${reviewId} ${isApproved ? 'approved' : 'disapproved'} successfully`,
      data: {
        reviewId,
        listingId,
        isApproved,
        approvedBy: approvedBy || 'system',
      },
    });
  } catch (error) {
    console.error('Error updating review approval:', error);

    return NextResponse.json(
      {
        error: 'Failed to update review approval',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
