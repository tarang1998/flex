import { Listing } from '@/domain/entities/Listing';
import { Review } from '@/domain/entities/Review';

interface ListingStatsData {
  totalReviews: number;
  totalApprovedReviews: number;
  averageReviewRating: number;
  approvedAverageReviewRating: number;
  attentionScore: number;
  categoryAverages: Record<string, number>;
}

interface ListingWithStats {
  listing: Listing;
  stats: ListingStatsData;
}

interface DashboardStats {
  totalListings: number;
  totalReviews: number;
  totalApprovedReviews: number;
  averageRating: number;
  highAttentionCount: number;
}

interface ListingStatsProps {
  listings: ListingWithStats[];
  overallStats?: DashboardStats | null;
}

export default function ListingStats({ listings, overallStats }: ListingStatsProps) {
  // Use overallStats from API if available, otherwise calculate from listings
  const totalListings = overallStats?.totalListings ?? listings.length;
  const activeListings = listings.filter((l) => l.listing.isActive).length;
  const cities = new Set(listings.map((l) => l.listing.city)).size;
  const totalReviews = overallStats?.totalReviews ?? 0;
  const approvedReviews = overallStats?.totalApprovedReviews ?? 0;
  const needsAttention = overallStats?.highAttentionCount ?? 0;

  // First row: Total Properties, Active Listings, Cities
  const topRowStats = [
    {
      label: 'Total Properties',
      value: totalListings,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-700',
      highlight: false,
    },
    {
      label: 'Active Listings',
      value: activeListings,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      textColor: 'text-green-700',
      highlight: false,
    },
    {
      label: 'Cities',
      value: cities,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-700',
      highlight: false,
    },
  ];

  // Second row: Total Reviews, Approved Reviews, Needs Attention
  const bottomRowStats = [
    {
      label: 'Total Reviews',
      value: totalReviews,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-50 to-indigo-100',
      textColor: 'text-indigo-700',
      highlight: false,
    },
    {
      label: 'Approved Reviews',
      value: approvedReviews,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'from-teal-500 to-teal-600',
      bgColor: 'from-teal-50 to-teal-100',
      textColor: 'text-teal-700',
      highlight: false,
    },
    {
      label: '🚨 Needs Attention',
      value: needsAttention,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100',
      textColor: 'text-red-700',
      highlight: true,
    },
  ];

  const renderStatCard = (stat: any, index: number) => (
    <div
      key={index}
      className={`relative bg-white rounded-xl overflow-hidden transition-all duration-300 transform ${
        stat.highlight
          ? 'shadow-2xl border-4 border-red-500 hover:shadow-red-500/50 hover:-translate-y-2 ring-4 ring-red-200 animate-pulse'
          : 'shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} ${
        stat.highlight ? 'opacity-70' : 'opacity-50'
      }`}></div>
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium mb-1 ${
              stat.highlight ? 'text-red-800 font-bold' : 'text-gray-600'
            }`}>
              {stat.label}
            </p>
            <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            {stat.highlight && stat.value > 0 && (
              <p className="text-xs text-red-600 font-medium mt-1">Requires immediate action</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${
            stat.highlight ? 'animate-bounce' : ''
          }`}>
            {stat.icon}
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className={`${
        stat.highlight ? 'h-2' : 'h-1'
      } bg-gradient-to-r ${stat.color}`}></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* First Row: Total Properties, Active Listings, Cities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topRowStats.map((stat, index) => renderStatCard(stat, index))}
      </div>
      
      {/* Second Row: Total Reviews, Approved Reviews, Needs Attention */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bottomRowStats.map((stat, index) => renderStatCard(stat, index + 3))}
      </div>
    </div>
  );
}
