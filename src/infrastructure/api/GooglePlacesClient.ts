/**
 * Infrastructure Layer - Google Places API Client
 * Handles Google Places API requests for fetching reviews
 */

import { Review, ReviewCategory } from '@/domain/entities/Review';

interface GooglePlaceReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
  profile_photo_url?: string;
  language?: string;
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Search API error: ${response.status}`, errorText);
        return null;
      }

      const data = await response.json();
      
      if (!data.places || data.places.length === 0) {
        console.warn(`Place not found: ${name}, ${address}`);
        return null;
      }

      // The API returns id as just "ChIJ..." (not "places/ChIJ...")
      // We need to return just the place ID
      const placeId = data.places[0].id;
      console.log('Found place ID:', placeId);
      return placeId;
      
    } catch (error) {
      console.error('Error searching for place:', error);
      return null;
    }
  }

  /**
   * Fetch reviews for a specific place ID
   */
  async fetchReviewsByPlaceId(
    listingId: number, 
    placeId: string, 
    listingName?: string
  ): Promise<Review[]> {
    try {

      const url = `${this.baseUrl}/places/${placeId}`;
      
      console.log('Fetching reviews from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.reviews || data.reviews.length === 0) {
        console.warn(`No reviews found for place ID: ${placeId}`);
        return [];
      }

      // Map Google reviews to our Review entity
      return data.reviews.map((googleReview: any, index: number) => {
        // Extract review text from various possible formats
        const reviewText = 
          googleReview.text?.text || 
          googleReview.originalText?.text || 
          (typeof googleReview.text === 'string' ? googleReview.text : '') ||
          '';

        // Extract author name
        const authorName = 
          googleReview.authorAttribution?.displayName || 
          googleReview.author_name || 
          'Anonymous';

        return {
          id: Number(`${listingId}${String(index).padStart(3, '0')}`),
          type: 'guest-to-host',
          status: 'published',
          rating: typeof googleReview.rating === 'number' ? googleReview.rating : null,
          publicReview: reviewText,
          reviewCategory: [],
          submittedAt: googleReview.publishTime || new Date().toISOString(),
          guestName: authorName,
          listingName: listingName || '',
          listingMapId: listingId,
          channel: 'Google',
        };
      });
      
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
      console.warn('Could not find place ID for:', name, address);
      return [];
    }

    return this.fetchReviewsByPlaceId(listingId, placeId, name);
  }
}