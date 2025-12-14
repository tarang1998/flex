import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/di';
import { Review } from '@/domain/entities/Review';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('id');

    const getReviewsFromHostAway = container().getReviewsFromHostAway();
    const getMockReviews = container().getMockReviews();
    const getReviewsFromGoogle = container().getReviewsFromGoogle();
    const getApprovedReviewIdsByListing = container().getApprovedReviewIdsByListing();

    // Fetch listing(s) based on whether ID is provided
    let filteredListings;
    if (listingId) {
      const getListingByIdUseCase = container().getListingByIdUseCase();
      const listing = await getListingByIdUseCase.execute(parseInt(listingId));
      filteredListings = listing ? [listing] : [];
    } else {
      const getListingsUseCase = container().getListingsUseCase();
      filteredListings = await getListingsUseCase.execute();
    }
    
    const listingIds = filteredListings.map(l => l.id);

    // Fetch all reviews and approved review IDs in parallel
    const [hostawayReviews, mockReviews, googleReviews, ...approvedReviewsByListing] = await Promise.all([
      getReviewsFromHostAway.execute({ 
        listingMapIds: listingIds,
        type: 'guest-to-host'
      }),
      getMockReviews.execute(listingIds),
      getReviewsFromGoogle.execute(),
      ...listingIds.map(listingId => getApprovedReviewIdsByListing.execute(listingId)),
    ]);

    // Create a map of listingId -> Set of approved review IDs
    const approvedReviewsMap = new Map<number, Set<number>>();
    listingIds.forEach((listingId, index) => {
      approvedReviewsMap.set(listingId, new Set(approvedReviewsByListing[index]));
    });

    // Combine all reviews
    const allReviews = [...hostawayReviews, ...mockReviews, ...googleReviews]
      .filter(r => r.type === 'guest-to-host');

    // Build properties list with approved reviews only
    const properties = filteredListings
      .filter(listing => listing.isActive)
      .map(listing => {
        // Get all reviews for this listing
        const listingReviews = allReviews.filter(
          review => review.listingMapId === listing.id || review.listingName === listing.name
        );

        // Get only approved reviews
        const approvedReviewIds = approvedReviewsMap.get(listing.id) || new Set<number>();
        const approvedReviews = listingReviews.filter(r => r.id && approvedReviewIds.has(r.id));

        // Calculate average rating from approved reviews
        const ratings = approvedReviews.map(review => {
          if (review.rating !== null && review.rating !== undefined) {
            return review.rating;
          }
          
          if (review.reviewCategory && review.reviewCategory.length > 0) {
            const sum = review.reviewCategory.reduce((acc, cat) => acc + cat.rating, 0);
            return sum / review.reviewCategory.length;
          }
          
          return 0;
        });

        const validRatings = ratings.filter(r => r > 0);
        const averageRating = validRatings.length > 0
          ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
          : 0;

        return {
          id: listing.id,
          name: listing.name,
          city: listing.city,
          country: listing.country,
          propertyType: listing.propertyType,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          maxGuests: listing.maxGuests,
          photos: listing.photos,
          starRating: listing.starRating,
          reviewCount: approvedReviews.length,
          averageRating: Number(averageRating.toFixed(2)),
        };
      })
      .filter(property => property.reviewCount > 0); // Only show properties with approved reviews

    // If requesting a single property, return just that property or null
    if (listingId) {
      const property = properties[0] || null;
      return NextResponse.json({
        success: true,
        data: property,
      });
    }

    // Otherwise return all properties
    return NextResponse.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error('Error in /api/properties:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch properties',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
