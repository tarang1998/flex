import { Listing } from '@/domain/entities/Listing';
import { Review } from '@/domain/entities/Review';
import Link from 'next/link';

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

interface ListingCardProps {
  listing: ListingWithStats;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80';
  const imageUrl = listing.listing.photos[0] || defaultImage;
  
  // Use real review stats from API
  const totalReviews = listing.stats.totalReviews;
  const approvedReviews = listing.stats.totalApprovedReviews;
  const avgApprovedRating = listing.stats.approvedAverageReviewRating;
  const needsAttentionScore = listing.stats.attentionScore;
  
  // Determine border color based on attention score
  // Red (70-100), Orange (50-69), Yellow (30-49), Normal (0-29)
  const getBorderColor = () => {
    if (needsAttentionScore >= 70) return 'border-red-500 ring-2 ring-red-200';
    if (needsAttentionScore >= 50) return 'border-orange-500 ring-2 ring-orange-200';
    if (needsAttentionScore >= 30) return 'border-yellow-500 ring-1 ring-yellow-200';
    return 'border-gray-100';
  };
  
  const getPriorityBadge = () => {
    if (needsAttentionScore >= 70) {
      return (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg shadow-xl animate-pulse flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-sm">🚨 URGENT ACTION REQUIRED</span>
          </div>
          <div className="h-6 w-px bg-white/30"></div>
          <span className="font-bold text-lg">{needsAttentionScore}%</span>
        </div>
      );
    }
    if (needsAttentionScore >= 50) {
      return (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-sm">⚠️ HIGH PRIORITY</span>
          </div>
          <div className="h-6 w-px bg-white/30"></div>
          <span className="font-bold text-lg">{needsAttentionScore}%</span>
        </div>
      );
    }
    if (needsAttentionScore >= 30) {
      return (
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-sm">🔔 REVIEW NEEDED</span>
          </div>
          <div className="h-6 w-px bg-white/30"></div>
          <span className="font-bold text-lg">{needsAttentionScore}%</span>
        </div>
      );
    }
    return (
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3 border border-gray-300">
        <span className="text-sm font-medium">✅ All Good</span>
        <div className="h-6 w-px bg-gray-400"></div>
        <span className="font-bold text-lg">{needsAttentionScore}%</span>
      </div>
    );
  };

  const getCardBackground = () => {
    if (needsAttentionScore >= 70) return 'bg-red-50/80';
    if (needsAttentionScore >= 50) return 'bg-orange-50/80';
    if (needsAttentionScore >= 30) return 'bg-yellow-50/80';
    return 'bg-white';
  };

  return (
    <div className={`group ${getCardBackground()} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${getBorderColor()} hover:border-blue-400 transform hover:-translate-y-1`}>
      {/* Horizontal Layout */}
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0 overflow-hidden bg-gray-200">
          <img
            src={imageUrl}
            alt={listing.listing.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
          />
          {/* Photo count indicator */}
          {listing.listing.photos.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              {listing.listing.photos.length}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3 gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {listing.listing.name}
              </h3>
              <div className="flex items-center text-gray-600 text-sm">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{listing.listing.city}, {listing.listing.country}</span>
                <span className="mx-2">•</span>
                <span className="capitalize text-blue-600 font-medium">{listing.listing.propertyType.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {getPriorityBadge()}
            </div>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-6 mb-4 text-sm">
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">{listing.listing.bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <span className="font-medium">{listing.listing.bathrooms} Bathrooms</span>
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">Up to {listing.listing.maxGuests} Guests</span>
            </div>
          </div>

          {/* Rating & Reviews Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {/* Star Rating */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="text-2xl font-bold text-yellow-700">{listing.listing.starRating || '--'}</div>
              </div>
              <div className="text-xs text-gray-600 text-center font-medium">Property Rating</div>
            </div>

            {/* Average Review Rating */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="text-2xl font-bold text-green-700 text-center">{listing.stats.averageReviewRating.toFixed(2) || '--'}</div>
              <div className="text-xs text-gray-600 mt-1 text-center font-medium">Average Review Rating</div>
            </div>

            {/* Total Reviews */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700 text-center">{totalReviews}</div>
              <div className="text-xs text-gray-600 mt-1 text-center font-medium">Total Reviews</div>
            </div>

            {/* Approved Reviews */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
              <div className="text-2xl font-bold text-teal-700 text-center">{approvedReviews}</div>
              <div className="text-xs text-gray-600 mt-1 text-center font-medium">Approved Reviews</div>
            </div>

            {/* Avg Approved Rating */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700 text-center">{avgApprovedRating || '--'}</div>
              <div className="text-xs text-gray-600 mt-1 text-center font-medium">Approved Reviews Average Rating</div>
            </div>
          </div>

          {/* Category Ratings */}
          {Object.keys(listing.stats.categoryAverages).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Category Performance
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(listing.stats.categoryAverages).map(([category, rating]) => {
                  const getRatingColor = (score: number) => {
                    if (score >= 4.5) return 'bg-green-100 border-green-300 text-green-800';
                    if (score >= 4.0) return 'bg-blue-100 border-blue-300 text-blue-800';
                    if (score >= 3.5) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
                    if (score >= 3.0) return 'bg-orange-100 border-orange-300 text-orange-800';
                    return 'bg-red-100 border-red-300 text-red-800';
                  };

                  return (
                    <div
                      key={category}
                      className={`flex items-center justify-between px-3 py-2 rounded-md border ${getRatingColor(rating)}`}
                    >
                      <span className="text-xs font-medium truncate mr-2">{category}</span>
                      <span className="text-sm font-bold">{rating.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end mt-auto pt-4 border-t border-gray-200">
            <Link
              href={`/dashboard/listing/${listing.listing.id}`}
              className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border-2 border-gray-300 hover:border-blue-500 flex items-center gap-2"
            >
              <span>View Report</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
