/**
 * Hostaway API Client - Handles communication with Hostaway API
 */

import { Review, ReviewFilters } from '@/domain/entities/Review';
import { Listing } from '@/domain/entities/Listing';

export interface HostawayReviewResponse {
  status: string;
  result: Array<{
    id: number;
    type: string;
    status: string;
    rating: number | null;
    publicReview: string;
    reviewCategory: Array<{
      category: string;
      rating: number;
    }>;
    submittedAt: string;
    guestName: string;
    listingName: string;
    channelId: number;
  }>;
}

export interface HostawayListingResponse {
  status: string;
  result: Array<{
    id: number;
    name: string;
    description: string;
    address: string;
    publicAddress: string;
    city: string;
    state: string;
    country: string;
    countryCode: string;
    zipcode: string;
    roomType: string;
    bedroomsNumber: number;
    bedsNumber?: number;
    bathroomsNumber: number;
    personCapacity: number;
    price: number;
    starRating: number;
    averageReviewRating: number;
    lat: number;
    lng: number;
    minNights: number;
    maxNights: number;
    cleaningFee: number;
    checkInTimeStart?: number;
    checkInTimeEnd?: number;
    checkOutTime?: number;
    houseRules?: string;
    maxPetsAllowed?: number | null;
    maxChildrenAllowed?: number | null;
    maxInfantsAllowed?: number | null;
    cancellationPolicy?: string;
    refundableDamageDeposit?: number;
    specialInstruction?: string;
    keyPickup?: string;
    listingImages: Array<{
      id: number;
      caption: string;
      url: string;
      sortOrder: number;
    }>;
    listingAmenities: Array<{
      id: number;
      amenityId: number;
    }>;
  }>;
}

interface TokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp
}

export class HostawayClient {
  private accountId: string;
  private clientSecret: string;
  private baseUrl: string = 'https://api.hostaway.com/v1';
  private tokenCache: TokenCache | null = null;

  private static readonly CHANNEL_MAP: Record<number, string> = {
    2018: 'Airbnb',
    2002: 'HomeAway',
    2005: 'Booking.com',
    2007: 'Expedia',
    2009: 'HomeAway iCal',
    2010: 'VRBO iCal',
    2000: 'Direct',
    2013: 'Booking Engine',
    2015: 'Custom iCal',
    2016: 'TripAdvisor iCal',
    2017: 'WordPress',
    2019: 'Marriott',
    2020: 'Partner',
    2021: 'GDS',
    2022: 'Google',
  };

  constructor(accountId: string, clientSecret: string) {
    this.accountId = accountId;
    this.clientSecret = clientSecret;
  }

  /**
   * Get valid access token (fetches new one if expired or missing)
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 1 hour buffer)
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 3600000) {
      return this.tokenCache.accessToken;
    }

    // Fetch new access token
    try {
      const response = await fetch(`${this.baseUrl}/accessTokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.accountId,
          client_secret: this.clientSecret,
          scope: 'general',
        }),
      });

      if (!response.ok) {
        throw new Error(`OAuth token request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the token with expiration time
      this.tokenCache = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000), // Convert seconds to ms
      };

      return this.tokenCache.accessToken;
    } catch (error) {
      console.error('Error fetching access token from Hostaway:', error);
      throw error;
    }
  }

  async fetchReviews(filters?: ReviewFilters): Promise<Review[]> {
    try {
      const accessToken = await this.getAccessToken();
      
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.listingMapIds && filters.listingMapIds.length > 0) {
          filters.listingMapIds.forEach((id: number) => queryParams.append('listingMapIds[]', id.toString()));
        }
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.offset) queryParams.append('offset', filters.offset.toString());
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.statuses && filters.statuses.length > 0) {
          filters.statuses.forEach((status: string) => queryParams.append('statuses[]', status));
        }
      }
      
      const url = `${this.baseUrl}/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Hostaway API error: ${response.status}`);
      }

      const data: HostawayReviewResponse = await response.json();
      
      return this.normalizeReviews(data);
    } catch (error) {
      console.error('Error fetching reviews from Hostaway:', error);
      throw error;
    }
  }

  /**
   * Fetch a single listing by ID from Hostaway API
   * @param listingId - The ID of the listing to fetch
   */
  async fetchListingById(listingId: number): Promise<Listing | null> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/listings/${listingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Hostaway API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Single listing response structure
      if (data.result) {
        const listings = this.normalizeListings({ status: 'success', result: [data.result] });
        return listings[0] || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching listing by ID from Hostaway:', error);
      throw error;
    }
  }

  /**
   * Fetch listings from Hostaway API with optional filters
   * @param filters - Basic API-supported filter parameters
   */
  async fetchListings(filters?: {
    city?: string;
    country?: string;
    match?: string;
  }): Promise<Listing[]> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Build query parameters - only basic filters
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.city) queryParams.append('city', filters.city);
        if (filters.country) queryParams.append('country', filters.country);
        if (filters.match) queryParams.append('match', filters.match);
      }
      
      const url = `${this.baseUrl}/listings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Hostaway API error: ${response.status}`);
      }

      const data: HostawayListingResponse = await response.json();
      
      return this.normalizeListings(data);
    } catch (error) {
      console.error('Error fetching listings from Hostaway:', error);
      throw error;
    }
  }

  /**
   * Normalize Hostaway API response to domain Listing entities
   */
  private normalizeListings(response: HostawayListingResponse): Listing[] {
    if (!response.result || response.result.length === 0) {
      return [];
    }

    return response.result.map((listing) => {
      const sortedImages = listing.listingImages?.sort((a, b) => a.sortOrder - b.sortOrder) || [];
      
      return {
        id: listing.id,
        name: listing.name,
        address: listing.publicAddress || listing.address,
        city: listing.city,
        country: listing.country,
        propertyType: listing.roomType,
        bedrooms: listing.bedroomsNumber,
        beds: listing.bedsNumber,
        bathrooms: listing.bathroomsNumber,
        maxGuests: listing.personCapacity,
        photos: sortedImages.map(img => img.url),
        description: listing.description || '',
        amenities: listing.listingAmenities?.map(a => `Amenity ${a.amenityId}`) || [],
        isActive: true,
        starRating: listing.starRating || 0,
        averageReviewRating: listing.averageReviewRating || 0,
        checkInTimeStart: listing.checkInTimeStart,
        checkInTimeEnd: listing.checkInTimeEnd,
        checkOutTime: listing.checkOutTime,
        houseRules: listing.houseRules,
        maxPetsAllowed: listing.maxPetsAllowed,
        maxChildrenAllowed: listing.maxChildrenAllowed,
        maxInfantsAllowed: listing.maxInfantsAllowed,
        cancellationPolicy: listing.cancellationPolicy,
        minNights: listing.minNights,
        maxNights: listing.maxNights,
        refundableDamageDeposit: listing.refundableDamageDeposit,
        cleaningFee: listing.cleaningFee,
        specialInstruction: listing.specialInstruction,
        keyPickup: listing.keyPickup,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Normalize Hostaway API response to domain Review entities
   */
  private normalizeReviews(response: HostawayReviewResponse): Review[] {
    if (!response.result || response.result.length === 0) {
      return [];
    }

    return response.result.map((review) => ({
      id: review.id,
      type: review.type as 'host-to-guest' | 'guest-to-host',
      status: review.status as 'awaiting' | 'pending' | 'scheduled' | 'submitted' | 'published' | 'expired',
      rating: review.rating,
      publicReview: review.publicReview,
      reviewCategory: review.reviewCategory,
      submittedAt: review.submittedAt,
      guestName: review.guestName,
      listingName: review.listingName,
      channel: HostawayClient.CHANNEL_MAP[review.channelId] || 'Unknown',
    }));
  }

}
