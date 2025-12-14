/**
 * Application Layer - Get Listings Use Case
 * Business logic for fetching listings
 */

import { IListingRepository } from '@/domain/repositories/IListingRepository';
import { Listing, ListingFilters } from '@/domain/entities/Listing';

export class GetListingsUseCase {
  constructor(private listingRepository: IListingRepository) {}

  async execute(filters?: ListingFilters): Promise<Listing[]> {
    if (filters) {
      return await this.listingRepository.getFilteredListings(filters);
    }
    return await this.listingRepository.getAllListings();
  }
}
