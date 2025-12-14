/**
 * API Route - GET /api/reviews/approved
 * Returns approved reviews for a specific listing
 * Query params: listingId (required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/di';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        {
          error: 'Missing required parameter',
          message: 'listingId query parameter is required',
        },
        { status: 400 }
      );
    }

    const listingIdNumber = parseInt(listingId, 10);
    if (isNaN(listingIdNumber)) {
      return NextResponse.json(
        {
          error: 'Invalid parameter',
          message: 'listingId must be a valid number',
        },
        { status: 400 }
      );
    }

    // Get approved review IDs
    const getApprovedReviewIdsByListing = container().getApprovedReviewIdsByListing();
    const approvedReviewIds = await getApprovedReviewIdsByListing.execute(listingIdNumber);

    // Fetch all reviews from all sources
    const getReviewsFromHostAway = container().getReviewsFromHostAway();
    const getMockReviews = container().getMockReviews();
    const getReviewsFromGoogle = container().getReviewsFromGoogle();
    const getListingByIdUseCase = container().getListingByIdUseCase();

    // Fetch the listing to get name and address
    const listing = await getListingByIdUseCase.execute(listingIdNumber);
    if (!listing) {
      return NextResponse.json(
        {
          error: 'Listing not found',
          message: `No listing found for id ${listingIdNumber}`,
        },
        { status: 404 }
      );
    }

    // Fetch from all sources in parallel
    const [hostawayReviews, mockReviews, googleReviews] = await Promise.all([
      getReviewsFromHostAway.execute({ 
        listingMapIds: [listingIdNumber],
        type: 'guest-to-host'
      }),
      getMockReviews.execute([listingIdNumber]),
      getReviewsFromGoogle.execute(listingIdNumber, listing.name, listing.city + ', ' + listing.country),
    ]);

    // Combine all reviews
    const allReviews = [...hostawayReviews, ...mockReviews, ...googleReviews];

    // Filter for approved reviews only for this listing
    const approvedReviews = allReviews.filter(review => 
      review.listingMapId === listingIdNumber && approvedReviewIds.includes(review.id)
    );

    return NextResponse.json({
      success: true,
      data: {
        listingId: listingIdNumber,
        reviews: approvedReviews,
        count: approvedReviews.length,
      },
    });
  } catch (error) {
    console.error('Error in /api/reviews/approved:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch approved reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
