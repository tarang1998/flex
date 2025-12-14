/**
 * API Route - GET /api/reviews/hostaway
 * Fetches and normalizes reviews from Hostaway API
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/di';
import { ReviewFilters } from '@/domain/entities/Review';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse listing IDs from query parameters
    const listingIdsParam = searchParams.get('listingIds');
    const listingIds = listingIdsParam 
      ? listingIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : undefined;
    
    // Parse query parameters for filtering
    const filters: ReviewFilters = {
      listingMapIds: searchParams.get('listingMapIds') ? searchParams.get('listingMapIds')!.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      maxRating: searchParams.get('maxRating') ? Number(searchParams.get('maxRating')) : undefined,
    };

    // Clean up undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof ReviewFilters] === undefined) {
        delete filters[key as keyof ReviewFilters];
      }
    });

    const getReviewsFromHostAway = container().getReviewsFromHostAway();

    const reviewFilters: ReviewFilters = {
      ...filters,
      listingMapIds: listingIds,
    };

    const reviews = await getReviewsFromHostAway.execute(reviewFilters);

    return NextResponse.json({
      status: 'success',
      data: reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Error in /api/reviews/hostaway:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch reviews',
      },
      { status: 500 }
    );
  }
}
