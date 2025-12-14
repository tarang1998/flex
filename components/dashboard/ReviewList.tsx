/**
 * Review List Component
 * Displays reviews with approval controls
 */

'use client';

import { Review } from '@/domain/entities/Review';

interface ReviewListProps {
  reviews: Review[];
  onApprovalChange: (reviewId: number, isApproved: boolean) => void;
}

export default function ReviewList({ reviews, onApprovalChange }: ReviewListProps) {
  const calculateAverageRating = (review: Review): number => {
    if (review.rating !== null) return review.rating;
    if (review.reviewCategory.length === 0) return 0;
    const sum = review.reviewCategory.reduce((acc: number, cat: { category: string; rating: number }) => acc + cat.rating, 0);
    return sum / review.reviewCategory.length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </h2>
      </div>

      {reviews.map((review) => {
        const avgRating = calculateAverageRating(review);

        return (
          <div
            key={review.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {review.listingName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">{review.guestName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{formatDate(review.submittedAt)}</span>
                        {review.channel && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {review.channel}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 mb-4">{review.publicReview}</p>

                  {/* Categories */}
                  {review.reviewCategory.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {review.reviewCategory.map((category: { category: string; rating: number }, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 capitalize mb-1">
                            {category.category.replace(/_/g, ' ')}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {category.rating}/10
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Approval Controls */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <span className="text-sm font-medium text-gray-700">
                      Public Display:
                    </span>
                    {review.isApprovedForPublicDisplay ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ✓ Approved
                        </span>
                        <button
                          onClick={() => onApprovalChange(review.id, false)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          Not Approved
                        </span>
                        <button
                          onClick={() => onApprovalChange(review.id, true)}
                          className="px-4 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
