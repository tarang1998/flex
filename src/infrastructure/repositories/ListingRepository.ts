/**
 * Infrastructure Layer - Listing Repository Implementation
 * Implements data access logic for listings
 */

import { IListingRepository } from '@/domain/repositories/IListingRepository';
import { Listing, ListingFilters } from '@/domain/entities/Listing';
import { HostawayClient } from '../api/HostawayClient';

export class ListingRepository implements IListingRepository {
  private hostawayClient: HostawayClient;

  constructor() {
    // Initialize Hostaway client with credentials from environment
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
    const apiKey = process.env.HOSTAWAY_API_KEY;
    
    if (!accountId || !apiKey) {
      throw new Error('Missing required environment variables: HOSTAWAY_ACCOUNT_ID and HOSTAWAY_API_KEY');
    }
    
    this.hostawayClient = new HostawayClient(accountId, apiKey);
  }

  async getAllListings(): Promise<Listing[]> {
    try {
      return await this.hostawayClient.fetchListings();
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }

  async getListingById(id: number): Promise<Listing | null> {
    try {
      // Use the dedicated API endpoint for single listing
      return await this.hostawayClient.fetchListingById(id);
    } catch (error) {
      console.error('Error fetching listing by ID:', error);
      throw error;
    }
  }

  async getFilteredListings(filters: ListingFilters): Promise<Listing[]> {
    try {
      // Basic API-supported filters only
      const apiFilters: any = {};
      
      if (filters.city) apiFilters.city = filters.city;
      if (filters.country) apiFilters.country = filters.country;
      if (filters.match) apiFilters.match = filters.match;
      
      // Fetch from API with basic filters
      let listings = await this.hostawayClient.fetchListings(
        Object.keys(apiFilters).length > 0 ? apiFilters : undefined
      );

      // Apply client-side filters
      if (filters.propertyType) {
        listings = listings.filter(listing =>
          listing.propertyType === filters.propertyType
        );
      }

      if (filters.minBedrooms !== undefined) {
        listings = listings.filter(listing => listing.bedrooms >= filters.minBedrooms!);
      }

      if (filters.maxBedrooms !== undefined) {
        listings = listings.filter(listing => listing.bedrooms <= filters.maxBedrooms!);
      }

      return listings;
    } catch (error) {
      console.error('Error filtering listings:', error);
      throw error;
    }
  }
}
