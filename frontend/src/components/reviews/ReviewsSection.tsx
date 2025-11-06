'use client';

import { useState, useEffect } from 'react';
import { ReviewCard } from './ReviewCard';
import { RatingStars } from './RatingStars';
import { reviewAPI } from '@/lib/review-api';
import toast from 'react-hot-toast';

interface ReviewsSectionProps {
  productId: string;
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');

  useEffect(() => {
    fetchReviews();
  }, [productId, page, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getProductReviews(productId, {
        page,
        limit: 10,
        sort: sortBy
      });

      setReviews(response.data.reviews);
      setStats(response.data.stats);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const getRatingPercentage = (rating: number) => {
    if (!stats || stats.totalReviews === 0) return 0;
    return Math.round((stats.distribution[rating] / stats.totalReviews) * 100);
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

      {/* Rating Summary */}
      {stats && stats.totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <RatingStars rating={stats.averageRating} size="lg" />
            <p className="text-gray-600 mt-2">
              Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 w-12">
                  {rating} star
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {getRatingPercentage(rating)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </h3>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as any);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating_high">Highest Rating</option>
          <option value="rating_low">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No reviews yet</p>
          <p className="text-gray-500 mt-2">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} onVote={fetchReviews} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
