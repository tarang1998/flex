/**
 * Application Layer - Get Listing By ID Use Case
 * Business logic for fetching a single listing
 */

import { IListingRepository } from '@/domain/repositories/IListingRepository';
import { Listing } from '@/domain/entities/Listing';

export class GetListingByIdUseCase {
  constructor(private listingRepository: IListingRepository) {}

  async execute(id: number): Promise<Listing | null> {
    return await this.listingRepository.getListingById(id);
  }
}
