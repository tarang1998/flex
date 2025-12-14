import { IReviewRepository } from '@/domain/repositories/IReviewRepository';
import { IListingRepository } from '@/domain/repositories/IListingRepository';
import { ReviewRepository } from '@/infrastructure/repositories/ReviewRepository';
import { ListingRepository } from '@/infrastructure/repositories/ListingRepository';
import { GetReviewsFromHostAway } from '@/application/use-cases/GetReviewsFromHostAway';
import { GetMockReviews } from '@/application/use-cases/GetMockReviews';
import { GetReviewsFromGoogle } from '@/application/use-cases/GetReviewsFromGoogle';
import { GetApprovedReviewIdsByListing } from '@/application/use-cases/GetApprovedReviewIdsByListing';
import { GetListingsUseCase } from '@/application/use-cases/GetListingsUseCase';
import { GetListingByIdUseCase } from '@/application/use-cases/GetListingByIdUseCase';
import { GetListingDetailsUseCase } from '@/application/use-cases/GetListingDetailsUseCase';
import { UpdateReviewApprovalUseCase } from '@/application/use-cases/UpdateReviewApprovalUseCase';
import { GetDashboardStatsUseCase } from '@/application/use-cases/GetDashboardStatsUseCase';
import { GetPropertyDetailsWithReviewsUseCase } from '@/application/use-cases/GetPropertyDetailsWithReviewsUseCase';
import { HostawayClient } from '@/infrastructure/api/HostawayClient';

export class DIContainer {
  private static instance: DIContainer;
  private reviewRepository?: IReviewRepository;
  private listingRepository?: IListingRepository;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  getHostawayClient(): HostawayClient {
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
    const apiKey = process.env.HOSTAWAY_API_KEY;
    
    if (!accountId || !apiKey) {
      throw new Error('Missing required environment variables: HOSTAWAY_ACCOUNT_ID and HOSTAWAY_API_KEY');
    }
    
    return new HostawayClient(accountId, apiKey);
  }

  getReviewRepository(): IReviewRepository {
    if (!this.reviewRepository) {
      this.reviewRepository = new ReviewRepository();
    }
    return this.reviewRepository;
  }

  getListingRepository(): IListingRepository {
    if (!this.listingRepository) {
      this.listingRepository = new ListingRepository();
    }
    return this.listingRepository;
  }

  getReviewsFromHostAway(): GetReviewsFromHostAway {
    return new GetReviewsFromHostAway(this.getReviewRepository());
  }

  getMockReviews(): GetMockReviews {
    return new GetMockReviews(this.getReviewRepository());
  }

  getReviewsFromGoogle(): GetReviewsFromGoogle {
    return new GetReviewsFromGoogle(this.getReviewRepository());
  }

  getApprovedReviewIdsByListing(): GetApprovedReviewIdsByListing {
    return new GetApprovedReviewIdsByListing(this.getReviewRepository());
  }

  getListingsUseCase(): GetListingsUseCase {
    return new GetListingsUseCase(this.getListingRepository());
  }

  getListingByIdUseCase(): GetListingByIdUseCase {
    return new GetListingByIdUseCase(this.getListingRepository());
  }

  getListingDetailsUseCase(): GetListingDetailsUseCase {
    return new GetListingDetailsUseCase(
      this.getListingRepository(),
      this.getReviewsFromHostAway(),
      this.getMockReviews(),
      this.getReviewsFromGoogle(),
      this.getApprovedReviewIdsByListing()
    );
  }

  getUpdateReviewApprovalUseCase(): UpdateReviewApprovalUseCase {
    return new UpdateReviewApprovalUseCase(this.getReviewRepository());
  }

  getDashboardStatsUseCase(): GetDashboardStatsUseCase {
    return new GetDashboardStatsUseCase(
      this.getListingRepository(),
      this.getReviewsFromHostAway(),
      this.getMockReviews(),
      this.getReviewsFromGoogle(),
      this.getApprovedReviewIdsByListing()
    );
  }

  getPropertyDetailsWithReviewsUseCase(): GetPropertyDetailsWithReviewsUseCase {
    return new GetPropertyDetailsWithReviewsUseCase(
      this.getListingRepository(),
      this.getReviewsFromHostAway(),
      this.getMockReviews(),
      this.getReviewsFromGoogle(),
      this.getApprovedReviewIdsByListing()
    );
  }

  reset(): void {
    this.reviewRepository = undefined;
  }
}

export const container = () => DIContainer.getInstance();
