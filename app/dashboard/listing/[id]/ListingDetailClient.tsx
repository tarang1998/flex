'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Listing } from '@/domain/entities/Listing';
import { Review } from '@/domain/entities/Review';

interface ActionItem {
  priority: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  action: string;
  impact: string;
}

interface ListingStats {
  totalReviews: number;
  totalApprovedReviews: number;
  averageReviewRating: number;
  approvedAverageReviewRating: number;
  attentionScore: number;
  categoryAverages: Record<string, number>;
  actionItems: ActionItem[];
}

interface ListingWithReviews {
  listing: Listing;
  reviews: Review[];
  stats: ListingStats;
}

interface Props {
  initialData: ListingWithReviews;
  listingId: number;
}

export default function ListingDetailClient({ initialData, listingId }: Props) {
  const [listingData] = useState<ListingWithReviews>(initialData);
  const [approvedReviewIds, setApprovedReviewIds] = useState<Set<number>>(new Set());
  const [channels, setChannels] = useState<string[]>([]);
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Extract unique channels from reviews
    const uniqueChannels = Array.from(
      new Set(initialData.reviews.map((r: Review) => r.channel).filter(Boolean))
    ) as string[];
    setChannels(uniqueChannels);
    
    fetchApprovedReviews();
  }, [initialData.reviews]);

  const fetchApprovedReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/approved?listingId=${listingId}`);
      const data = await response.json();
      if (data.success) {
        setApprovedReviewIds(new Set(data.data.approvedReviewIds));
      }
    } catch (error) {
      console.error('Error fetching approved reviews:', error);
    }
  };

  const toggleReviewApproval = async (reviewId: number, currentlyApproved: boolean) => {
    try {
      const response = await fetch('/api/reviews/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          listingId: listingId,
          isApproved: !currentlyApproved,
          approvedBy: 'Manager',
        }),
      });

      if (response.ok) {
        setApprovedReviewIds(prev => {
          const newSet = new Set(prev);
          if (currentlyApproved) {
            newSet.delete(reviewId);
          } else {
            newSet.add(reviewId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling review approval:', error);
    }
  };

  const { listing, reviews, stats } = listingData;
  const totalReviews = stats.totalReviews;
  const approvedReviews = stats.totalApprovedReviews;
  const pendingReviews = totalReviews - approvedReviews;
  const avgApprovedRating = stats.approvedAverageReviewRating;
  const needsAttentionScore = stats.attentionScore;

  // Get unique categories for filters
  const allCategories = Array.from(
    new Set(reviews.flatMap(r => r.reviewCategory?.map(c => c.category) || []))
  );

  // Apply filters and sorting
  const filteredReviews = reviews.filter(review => {
    if (filterRating !== 'all') {
      const rating = review.rating || 0;
      if (filterRating === '5' && rating < 5) return false;
      if (filterRating === '4' && (rating < 4 || rating >= 5)) return false;
      if (filterRating === '3' && (rating < 3 || rating >= 4)) return false;
      if (filterRating === 'low' && rating >= 3) return false;
    }
    
    if (filterChannel !== 'all' && review.channel !== filterChannel) return false;
    
    if (filterCategory !== 'all') {
      const hasCategory = review.reviewCategory?.some(c => c.category === filterCategory);
      if (!hasCategory) return false;
    }
    
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      const dateA = new Date(a.submittedAt || 0).getTime();
      const dateB = new Date(b.submittedAt || 0).getTime();
      comparison = dateB - dateA;
    } else if (sortBy === 'rating') {
      comparison = (b.rating || 0) - (a.rating || 0);
    }
    
    return sortDirection === 'desc' ? comparison : -comparison;
  });

  // Calculate trends
  const lowRatingCount = reviews.filter(r => (r.rating || 0) < 3.5).length;
  const recentReviews = reviews.slice(0, 5);
  const recentAvgRating = recentReviews.length > 0
    ? recentReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / recentReviews.length
    : 0;
  const trend = recentAvgRating > stats.averageReviewRating ? 'up' : 
                recentAvgRating < stats.averageReviewRating ? 'down' : 'stable';

  // Find common issues
  const categoryIssues = allCategories
    .map(category => {
      const categoryReviews = reviews.filter(r => 
        r.reviewCategory?.some(c => c.category === category)
      );
      const avgRating = categoryReviews.reduce((sum, r) => {
        const catRating = r.reviewCategory?.find(c => c.category === category)?.rating || 0;
        return sum + catRating;
      }, 0) / categoryReviews.length;
      
      return { category, avgRating, count: categoryReviews.length };
    })
    .filter(c => c.avgRating < 3.5)
    .sort((a, b) => a.avgRating - b.avgRating);

  const getScoreColor = () => {
    if (needsAttentionScore >= 70) return 'text-red-600';
    if (needsAttentionScore >= 50) return 'text-orange-600';
    if (needsAttentionScore >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreBg = () => {
    if (needsAttentionScore >= 70) return 'bg-red-50 border-red-200';
    if (needsAttentionScore >= 50) return 'bg-orange-50 border-orange-200';
    if (needsAttentionScore >= 30) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <Link
              href={`/property/${listing.id}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              View Full Property Details
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{listing.name}</h1>
          <p className="text-gray-600 flex items-center mt-2">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {listing.city}, {listing.country}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Attention Score */}
        <div className={`rounded-xl border-2 p-6 mb-8 ${getScoreBg()}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Needs Attention Score</h2>
              <p className="text-sm text-gray-600">Based on review metrics and property performance</p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${getScoreColor()}`}>{needsAttentionScore}%</div>
              <p className="text-sm text-gray-600 mt-1">
                {needsAttentionScore >= 70 ? '🚨 Urgent Action Required' : 
                 needsAttentionScore >= 50 ? '⚠️ High Priority' : 
                 needsAttentionScore >= 30 ? '🔔 Review Needed' : 
                 '✅ All Good'}
              </p>
            </div>
          </div>
        </div>

        {/* Review Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Property Rating</h3>
              <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{listing.starRating || '--'}</div>
            <p className="text-xs text-gray-500 mt-1">Overall platform rating</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Average Rating</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.averageReviewRating.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">All reviews</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Reviews</h3>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalReviews}</div>
            <p className="text-xs text-gray-500 mt-1">All time reviews</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Approved</h3>
              <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{approvedReviews}</div>
            <p className="text-xs text-gray-500 mt-1">Avg: {avgApprovedRating.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{pendingReviews}</div>
            <p className="text-xs text-gray-500 mt-1">Need approval</p>
          </div>
        </div>

        {/* Action Items */}
        {stats.actionItems && stats.actionItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">Action Items</h2>
              <p className="text-sm text-gray-600 mt-1">What needs attention and how to fix it</p>
            </div>
            <div className="p-6 space-y-4">
              {stats.actionItems.map((item, index) => {
                const getPriorityStyle = (priority: string) => {
                  switch (priority) {
                    case 'critical':
                      return {
                        bg: 'bg-red-50 border-red-200',
                        icon: 'text-red-600',
                        badge: 'bg-red-100 text-red-800',
                      };
                    case 'high':
                      return {
                        bg: 'bg-orange-50 border-orange-200',
                        icon: 'text-orange-600',
                        badge: 'bg-orange-100 text-orange-800',
                      };
                    case 'medium':
                      return {
                        bg: 'bg-yellow-50 border-yellow-200',
                        icon: 'text-yellow-600',
                        badge: 'bg-yellow-100 text-yellow-800',
                      };
                    default:
                      return {
                        bg: 'bg-blue-50 border-blue-200',
                        icon: 'text-blue-600',
                        badge: 'bg-blue-100 text-blue-800',
                      };
                  }
                };

                const style = getPriorityStyle(item.priority);

                return (
                  <div key={index} className={`border-2 rounded-lg p-4 ${style.bg}`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${style.bg}`}>
                        <svg className={`w-6 h-6 ${style.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {item.priority === 'critical' || item.priority === 'high' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${style.badge}`}>
                            {item.priority}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">{item.issue}</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-700">
                            <span className="font-semibold">Action: </span>
                            {item.action}
                          </div>
                          <div className="text-sm text-gray-600 italic">
                            <span className="font-semibold">Impact: </span>
                            {item.impact}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Insights & Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Channel Statistics */}
          {channels.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900">Channel Performance</h2>
                <p className="text-sm text-gray-600 mt-1">Reviews by platform</p>
              </div>
              <div className="p-6 space-y-3">
                {channels.map(channel => {
                  const channelReviews = reviews.filter(r => r.channel === channel);
                  const channelCount = channelReviews.length;
                  const channelAvgRating = channelReviews.length > 0
                    ? channelReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / channelReviews.length
                    : 0;
                  const channelPercentage = (channelCount / totalReviews) * 100;

                  return (
                    <div key={channel} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{channel}</span>
                        <span className="text-gray-600">
                          {channelCount} ({channelPercentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${channelPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {channelAvgRating.toFixed(2)} ⭐
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Ratings */}
          {Object.keys(stats.categoryAverages).length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900">Category Performance</h2>
                <p className="text-sm text-gray-600 mt-1">Average ratings by category</p>
              </div>
              <div className="p-6 space-y-3">
                {Object.entries(stats.categoryAverages)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, rating]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">{category.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              rating >= 4.5 ? 'bg-green-500' :
                              rating >= 4 ? 'bg-blue-500' :
                              rating >= 3.5 ? 'bg-yellow-500' :
                              rating >= 3 ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${(rating / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-10">{rating}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Trends & Issues */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900">Insights & Trends</h2>
              <p className="text-sm text-gray-600 mt-1">Recent patterns and issues</p>
            </div>
            <div className="p-6 space-y-4">
              {/* Rating Trend */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  trend === 'up' ? 'bg-green-100' :
                  trend === 'down' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  {trend === 'up' ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ) : trend === 'down' ? (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {trend === 'up' ? 'Ratings Improving' : trend === 'down' ? 'Ratings Declining' : 'Stable Ratings'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Recent avg: {recentAvgRating.toFixed(2)} vs Overall: {stats.averageReviewRating.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Low Ratings Alert */}
              {lowRatingCount > 0 && (
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">{lowRatingCount} Low Ratings</div>
                    <div className="text-sm text-gray-600">Reviews below 3.5 stars need attention</div>
                  </div>
                </div>
              )}

              {/* Category Issues */}
              {categoryIssues.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-700">Areas for Improvement:</div>
                  {categoryIssues.slice(0, 3).map(issue => (
                    <div key={issue.category} className="flex items-center justify-between text-sm p-2 bg-red-50 rounded">
                      <span className="text-gray-700 capitalize">{issue.category.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-red-600">{issue.avgRating.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Approval Rate */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-semibold text-gray-900">Approval Rate</div>
                  <div className="text-sm text-gray-600">
                    {totalReviews > 0 ? ((approvedReviews / totalReviews) * 100).toFixed(0) : 0}% of reviews approved ({approvedReviews}/{totalReviews})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reviews ({filteredReviews.length})</h2>
                <p className="text-sm text-gray-600 mt-1">Manage guest feedback and public display</p>
              </div>
            </div>

            {/* Filters & Sort */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
              {/* Rating Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4-4.9 Stars</option>
                  <option value="3">3-3.9 Stars</option>
                  <option value="low">Below 3 Stars</option>
                </select>
              </div>

              {/* Channel Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Channel</label>
                <select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Channels</option>
                  {channels.map(channel => (
                    <option key={channel} value={channel}>{channel}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* Sort Direction */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Newest / Highest</option>
                  <option value="asc">Oldest / Lowest</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(filterRating !== 'all' || filterChannel !== 'all' || filterCategory !== 'all') && (
              <button
                onClick={() => {
                  setFilterRating('all');
                  setFilterChannel('all');
                  setFilterCategory('all');
                }}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
          
          <div className="p-6">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
                <p className="text-gray-600">
                  {reviews.length === 0 
                    ? "This property hasn't received any reviews yet" 
                    : "Try adjusting your filters"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => {
                  const isApproved = review.id ? approvedReviewIds.has(review.id) : false;
                  
                  return (
                    <div 
                      key={review.id} 
                      className={`border-2 rounded-lg p-6 transition-all ${
                        isApproved 
                          ? 'border-green-200 bg-green-50/30' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{review.guestName || 'Anonymous'}</h3>
                            {review.channel && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                {review.channel}
                              </span>
                            )}
                            {isApproved && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Approved
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-semibold">{review.rating?.toFixed(1) || 'N/A'}</span>
                            </span>
                            {review.submittedAt && (
                              <span>
                                {new Date(review.submittedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleReviewApproval(review.id!, isApproved)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isApproved
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {isApproved ? 'Unapprove' : 'Approve'}
                        </button>
                      </div>
                      
                      {review.publicReview && (
                        <p className="text-gray-700 mb-4 leading-relaxed">{review.publicReview}</p>
                      )}
                      
                      {review.reviewCategory && review.reviewCategory.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Category Ratings:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {review.reviewCategory.map((cat, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                <span className="text-xs text-gray-600 capitalize">
                                  {cat.category.replace(/_/g, ' ')}
                                </span>
                                <span className="text-sm font-bold text-gray-900 ml-2">
                                  {cat.rating}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
