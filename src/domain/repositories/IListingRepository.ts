/**
 * Domain Layer - Listing Repository Interface
 */

import { Listing, ListingFilters } from '../entities/Listing';

export interface IListingRepository {
  getAllListings(): Promise<Listing[]>;
  getListingById(id: number): Promise<Listing | null>;
  getFilteredListings(filters: ListingFilters): Promise<Listing[]>;
}
