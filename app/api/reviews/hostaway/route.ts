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

    console.log(searchParams)
    
    // Parse listing IDs from query parameters
    const listingIdsParam = searchParams.get('listingIds');
    const listingIds = listingIdsParam 
      ? listingIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : undefined;
    
        // Only allow valid values for type and statuses
        const validTypes = ['guest-to-host', 'host-to-guest'] as const;
        const validStatuses = ['awaiting', 'pending', 'scheduled', 'submitted', 'published', 'expired'] as const;


        // Validate type
        const typeParam = searchParams.get('type');
        let type: 'guest-to-host' | 'host-to-guest' | undefined = undefined;
        if (typeParam !== null) {
          if (!validTypes.includes(typeParam as any)) {
            return NextResponse.json({
              status: 'error',
              message: `Invalid type parameter. Allowed values: ${validTypes.join(', ')}`
            }, { status: 400 });
          }
          type = typeParam as 'guest-to-host' | 'host-to-guest';
        }

        // Validate statuses
        let statuses: ReviewFilters['statuses'] | undefined = undefined;
        if (searchParams.get('statuses')) {
          const statusesParam = searchParams.getAll('statuses').flatMap(s => s.split(',').map(x => x.trim()).filter(Boolean));
          const invalidStatuses = statusesParam.filter(s => !validStatuses.includes(s as any));
          if (invalidStatuses.length > 0) {
            return NextResponse.json({
              status: 'error',
              message: `Invalid statuses parameter. Allowed values: ${validStatuses.join(', ')}. Invalid: ${invalidStatuses.join(', ')}`
            }, { status: 400 });
          }
          statuses = statusesParam as ReviewFilters['statuses'];
        }


        // Validate limit and offset
        let limit: number | undefined = undefined;
        let offset: number | undefined = undefined;
        if (searchParams.get('limit') !== null) {
          const limitVal = Number(searchParams.get('limit'));
          if (isNaN(limitVal) || limitVal < 0) {
            return NextResponse.json({
              status: 'error',
              message: 'Invalid limit parameter. Must be a non-negative number.'
            }, { status: 400 });
          }
          limit = limitVal;
        }
        if (searchParams.get('offset') !== null) {
          const offsetVal = Number(searchParams.get('offset'));
          if (isNaN(offsetVal) || offsetVal < 0) {
            return NextResponse.json({
              status: 'error',
              message: 'Invalid offset parameter. Must be a non-negative number.'
            }, { status: 400 });
          }
          offset = offsetVal;
        }

        const filters: ReviewFilters = {
          listingMapIds: searchParams.get('listingMapIds')
            ? searchParams.get('listingMapIds')!.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
            : undefined,
          limit,
          offset,
          type,
          statuses,
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
