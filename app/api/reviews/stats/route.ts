/**
 * API Route - GET /api/reviews/stats
 * Returns review statistics and analytics
 */

import { NextResponse } from 'next/server';
import { container } from '@/di';

export async function GET() {
  try {
    const getReviewStatsUseCase = container().getReviewStatsUseCase();

    const stats = await getReviewStatsUseCase.execute();

    return NextResponse.json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    console.error('Error in /api/reviews/stats:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
