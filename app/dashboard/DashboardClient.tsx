'use client';

import { useState, useEffect } from 'react';
import { Listing } from '@/domain/entities/Listing';
import ListingCard from '@/components/listings/ListingCard';
import ListingFilters from '@/components/listings/ListingFilters';
import ListingStats from '@/components/listings/ListingStats';

interface ListingStats {
  totalReviews: number;
  totalApprovedReviews: number;
  averageReviewRating: number;
  approvedAverageReviewRating: number;
  attentionScore: number;
  categoryAverages: Record<string, number>;
}

interface ListingWithStats {
  listing: Listing;
  stats: ListingStats;
}

interface DashboardStats {
  totalListings: number;
  totalReviews: number;
  totalApprovedReviews: number;
  averageRating: number;
  highAttentionCount: number;
}

interface ListingFiltersType {
  search: string;
  city: string;
  propertyType: string;
  minBedrooms: number;
  maxBedrooms: number;
  sortBy: 'starRating' | 'avgReviewRating' | 'personCapacity' | 'needsAttention' | 'reviewCount';
  sortDirection: 'asc' | 'desc';
}

interface DashboardClientProps {
  initialListings: ListingWithStats[];
  initialStats: DashboardStats;
}

export default function DashboardClient({ initialListings, initialStats }: DashboardClientProps) {
  const [listings] = useState<ListingWithStats[]>(initialListings);
  const [filteredListings, setFilteredListings] = useState<ListingWithStats[]>(initialListings);
  const [overallStats] = useState<DashboardStats>(initialStats);
  const [filters, setFilters] = useState<ListingFiltersType>({
    search: '',
    city: '',
    propertyType: '',
    minBedrooms: 0,
    maxBedrooms: 10,
    sortBy: 'needsAttention',
    sortDirection: 'desc',
  });

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const applyFilters = () => {
    let filtered = [...listings];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.listing.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.listing.city.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.listing.address.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter((item) => item.listing.city === filters.city);
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter((item) => item.listing.propertyType === filters.propertyType);
    }

    // Bedrooms filter
    filtered = filtered.filter(
      (item) =>
        item.listing.bedrooms >= filters.minBedrooms &&
        item.listing.bedrooms <= filters.maxBedrooms
    );

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'starRating':
          comparison = (b.listing.starRating || 0) - (a.listing.starRating || 0);
          break;
        case 'avgReviewRating':
          comparison = (b.stats.averageReviewRating || 0) - (a.stats.averageReviewRating || 0);
          break;
        case 'personCapacity':
          comparison = b.listing.maxGuests - a.listing.maxGuests;
          break;
        case 'reviewCount':
          comparison = b.stats.totalReviews - a.stats.totalReviews;
          break;
        case 'needsAttention':
          comparison = b.stats.attentionScore - a.stats.attentionScore;
          break;
        default:
          comparison = 0;
      }
      
      // Apply sort direction
      return filters.sortDirection === 'desc' ? comparison : -comparison;
    });

    setFilteredListings(filtered);
  };

  const handleFilterChange = (newFilters: Partial<ListingFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      city: '',
      propertyType: '',
      minBedrooms: 0,
      maxBedrooms: 10,
      sortBy: 'needsAttention',
      sortDirection: 'desc',
    });
  };

  // Get unique cities and property types for filter options
  const cities = Array.from(new Set(listings.map((l) => l.listing.city))).sort();
  const propertyTypes = Array.from(new Set(listings.map((l) => l.listing.propertyType))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Flex Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and view all your properties
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ListingStats listings={listings} overallStats={overallStats} />
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <ListingFilters
          filters={filters}
          cities={cities}
          propertyTypes={propertyTypes}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((item) => (
              <ListingCard key={item.listing.id} listing={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
