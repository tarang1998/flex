/**
 * API Route - PATCH /api/reviews/[id]/approval
 * Updates review approval status (Legacy endpoint - use /api/reviews/approval instead)
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/di';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isApproved, listingId, approvedBy } = body;

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { status: 'error', message: 'isApproved must be a boolean' },
        { status: 400 }
      );
    }

    if (!listingId) {
      return NextResponse.json(
        { status: 'error', message: 'listingId is required' },
        { status: 400 }
      );
    }

    const updateReviewApprovalUseCase = container().getUpdateReviewApprovalUseCase();

    await updateReviewApprovalUseCase.execute({
      reviewId: Number(id),
      listingId: Number(listingId),
      isApproved,
      approvedBy,
    });

    return NextResponse.json({
      status: 'success',
      message: `Review ${id} ${isApproved ? 'approved' : 'disapproved'} successfully`,
      data: {
        reviewId: Number(id),
        listingId: Number(listingId),
        isApproved,
      },
    });
  } catch (error) {
    console.error('Error updating review approval:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update review',
      },
      { status: 500 }
    );
  }
}
