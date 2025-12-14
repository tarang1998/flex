/**
 * API Route - GET /api/reviews/google
 * Fetches and normalizes reviews from Google Places API
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/di';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;


    // Required parameters
    let listingIdParam = searchParams.get('listingId');
    const listingName = searchParams.get('listingName');
    const listingAddress = searchParams.get('listingAddress');

    // If listingId is missing, generate a random 6-digit id
    if (!listingIdParam) {
      listingIdParam = Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Validate required params (listingName and listingAddress are still required)
    if (!listingName || !listingAddress) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'listingName and listingAddress are required query parameters.'
        },
        { status: 400 }
      );
    }

    const listingId = Number(listingIdParam);
    if (isNaN(listingId)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'listingId must be a valid number.'
        },
        { status: 400 }
      );
    }

    const getReviewsFromGoogle = container().getReviewsFromGoogle();
    const reviews = await getReviewsFromGoogle.execute(listingId, listingName, listingAddress);

    return NextResponse.json({
      status: 'success',
      data: reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Error in /api/reviews/google:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch Google reviews',
      },
      { status: 500 }
    );
  }
}
