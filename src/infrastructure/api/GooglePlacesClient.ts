/**
 * Infrastructure Layer - Google Places API Client
 * Handles Google Places API requests for fetching reviews
 */

import { Review, ReviewCategory } from '@/domain/entities/Review';

interface GooglePlaceReview {
  author_name: string;
  rating: number;
  text: string;
  time: number; // Unix timestamp
  relative_time_description: string;
  profile_photo_url?: string;
  language?: string;
}

interface GooglePlaceDetailsResponse {
  result: {
    place_id: string;
    name: string;
    rating?: number;
    user_ratings_total?: number;
    reviews?: GooglePlaceReview[];
  };
  status: string;
  error_message?: string;
}

interface GooglePlaceSearchResponse {
  results: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    rating?: number;
    user_ratings_total?: number;
  }>;
  status: string;
  error_message?: string;
}

export class GooglePlacesClient {
  private apiKey: string;
  private baseUrl = 'https://places.googleapis.com/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Google Places API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Search for a place by name and address to get its Place ID
   * Uses the new Places API (New)
   */
  async searchPlace(name: string, address: string): Promise<string | null> {
    console.log('Searching place for:', name, address);
    try {
      const url = `${this.baseUrl}/places:searchText`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
        },
        body: JSON.stringify({
          textQuery: `${name} ${address}`
        })
      });

      const data = await response.json();

      if (!data.places || data.places.length === 0) {
        console.warn(`Place not found: ${name}, ${address}`);
        return null;
      }

      // Return the first result's id (format: places/ChIJ...)
      // Extract the place ID without the "places/" prefix
      const placeId = data.places[0].id.replace('places/', '');
      return placeId;
    } catch (error) {
      console.error('Error searching for place:', error);
      return null;
    }
  }

  /**
   * Fetch reviews for a specific place ID
   * Uses the new Places API (New)
   */
  async fetchReviewsByPlaceId(listingId: number, placeId: string, listingName?: string): Promise<Review[]> {
    try {
      const url = `${this.baseUrl}/places/${placeId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews'
        }
      });

      const data = await response.json();

      if (!data.reviews || data.reviews.length === 0) {
        console.warn(`No reviews found for place ID: ${placeId}`);
        return [];
      }

      // Map Google reviews to our Review entity
      // Filter to only guest-to-host reviews (all Google reviews are guest reviews)
      return data.reviews
        // .slice(0, 5)
        .map((googleReview: any, index: number) => {
          // Map Google review fields to Review model
          return {
            id: Number(`${listingId}0${index}`),
            type: googleReview.type || 'guest-to-host',
            status: googleReview.status || 'published',
            rating: typeof googleReview.rating === 'number' ? googleReview.rating : null,
            publicReview: (googleReview.text && typeof googleReview.text === 'object' && 'text' in googleReview.text)
              ? googleReview.text.text
              : (typeof googleReview.text === 'string' ? googleReview.text : ''),
            reviewCategory: [],
            submittedAt: googleReview.publishTime,
            guestName: googleReview.authorAttribution?.displayName || googleReview.author_name || 'Anonymous',
            listingName: listingName || '',
            listingMapId: listingId,
            channel: 'Google',
            isApprovedForPublicDisplay: true,
          };
        })
        .filter((review: any) => review.type === 'guest-to-host');
    } catch (error) {
      console.error(`Error fetching reviews for place ID ${placeId}:`, error);
      return [];
    }
  }

  /**
   * Fetch reviews by searching for a place and then getting its reviews
   */
  async fetchReviewsByNameAndAddress(
    listingId: number,
    name: string,
    address: string
  ): Promise<Review[]> {
    const placeId = await this.searchPlace(name, address);
    if (!placeId) {
      return [];
    }

    return this.fetchReviewsByPlaceId(listingId,placeId, name);
  }


}
