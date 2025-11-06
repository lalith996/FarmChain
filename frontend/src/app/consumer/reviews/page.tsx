'use client';

import React, { useState } from 'react';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import AdvancedStatCard, { StatCardsGrid } from '@/components/dashboard/AdvancedStatCard';
import AdvancedDataTable, { Column } from '@/components/shared/AdvancedDataTable';
import { getRoleTheme } from '@/config/roleThemes';
import { StarIcon, HandThumbUpIcon, PencilIcon, TrashIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
  images?: string[];
}

export default function ReviewsPage() {
  const theme = getRoleTheme('CONSUMER');
  const user = { name: 'John Customer', email: 'john@example.com' };
  const [activeTab, setActiveTab] = useState<'my-reviews' | 'write-review'>('my-reviews');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
  });

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'REV-001',
      productId: 'P-001',
      productName: 'Organic Tomatoes',
      productImage: '🍅',
      rating: 5,
      title: 'Amazing quality!',
      comment: 'These tomatoes are incredibly fresh and flavorful. Will definitely order again!',
      date: '2025-11-04',
      helpful: 12,
      verified: true,
    },
    {
      id: 'REV-002',
      productId: 'P-002',
      productName: 'Fresh Lettuce',
      productImage: '🥬',
      rating: 4,
      title: 'Good but could be fresher',
      comment: 'The lettuce was good overall, but some leaves were slightly wilted.',
      date: '2025-11-02',
      helpful: 5,
      verified: true,
    },
    {
      id: 'REV-003',
      productId: 'P-003',
      productName: 'Red Apples',
      productImage: '🍎',
      rating: 5,
      title: 'Perfect apples!',
      comment: 'Crispy, sweet, and absolutely delicious. Best apples I have had in a while.',
      date: '2025-10-30',
      helpful: 18,
      verified: true,
    },
    {
      id: 'REV-004',
      productId: 'P-004',
      productName: 'Greek Yogurt',
      productImage: '🥛',
      rating: 3,
      title: 'Average taste',
      comment: 'It is okay, but I have had better yogurt elsewhere. Not bad though.',
      date: '2025-10-28',
      helpful: 3,
      verified: true,
    },
  ]);

  const filteredReviews = filterRating === 'all'
    ? reviews
    : reviews.filter(r => r.rating === filterRating);

  const totalReviews = reviews.length;
  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const fiveStarReviews = reviews.filter(r => r.rating === 5).length;
  const totalHelpful = reviews.reduce((sum, r) => sum + r.helpful, 0);

  const RatingStars = ({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (rating: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            {star <= rating ? (
              <StarSolidIcon className={`h-6 w-6 ${interactive ? 'text-purple-500' : 'text-yellow-400'}`} />
            ) : (
              <StarIcon className={`h-6 w-6 ${interactive ? 'text-gray-300' : 'text-gray-300'}`} />
            )}
          </button>
        ))}
      </div>
    );
  };

  const submitReview = () => {
    if (newReview.rating === 0 || !newReview.title || !newReview.comment) {
      alert('Please fill in all fields');
      return;
    }
    // Add review logic here
    console.log('Submitting review:', newReview);
    setNewReview({ rating: 0, title: '', comment: '' });
    setActiveTab('my-reviews');
  };

  const deleteReview = (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const columns: Column<Review>[] = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="text-3xl">{r.productImage}</div>
          <div>
            <div className="font-semibold text-gray-900">{r.productName}</div>
            <div className="text-xs text-gray-500">{r.productId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <RatingStars rating={r.rating} />
          <span className="font-semibold text-gray-700">{r.rating}.0</span>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Review',
      render: (r) => (
        <div>
          <div className="font-semibold text-gray-900">{r.title}</div>
          <div className="text-sm text-gray-600 line-clamp-2">{r.comment}</div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (r) => <span className="text-sm text-gray-600">{r.date}</span>,
    },
    {
      key: 'helpful',
      label: 'Helpful',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1">
          <HandThumbUpIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{r.helpful}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button className="rounded-lg p-2 text-purple-600 hover:bg-purple-50">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteReview(r.id)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <RoleBasedLayout role="CONSUMER" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>

        {/* Stats */}
        <StatCardsGrid>
          <AdvancedStatCard
            title="Total Reviews"
            value={totalReviews}
            subtitle="Reviews written"
            icon={ChatBubbleLeftRightIcon}
            gradient={theme.gradients.primary}
          />
          <AdvancedStatCard
            title="Average Rating"
            value={averageRating}
            subtitle="Your avg rating"
            icon={StarIcon}
            gradient="from-yellow-500 to-orange-500"
          />
          <AdvancedStatCard
            title="5-Star Reviews"
            value={fiveStarReviews}
            subtitle={`${((fiveStarReviews / totalReviews) * 100).toFixed(0)}% of total`}
            icon={StarIcon}
            gradient="from-green-500 to-emerald-500"
          />
          <AdvancedStatCard
            title="Helpful Votes"
            value={totalHelpful}
            subtitle="From community"
            icon={HandThumbUpIcon}
            gradient="from-blue-500 to-cyan-500"
          />
        </StatCardsGrid>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'my-reviews', label: 'My Reviews', count: reviews.length },
            { id: 'write-review', label: 'Write a Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-600'}`}
            >
              {tab.label}
              {tab.count && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />}
            </button>
          ))}
        </div>

        {/* My Reviews Tab */}
        {activeTab === 'my-reviews' && (
          <>
            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
              <div className="flex gap-2">
                {['all', 5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating as any)}
                    className={`rounded-full px-4 py-1 text-sm font-medium ${
                      filterRating === rating
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {rating === 'all' ? 'All' : `${rating} ⭐`}
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews Table */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <AdvancedDataTable data={filteredReviews} columns={columns} searchPlaceholder="Search reviews..." />
            </div>

            {/* Detailed Reviews */}
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="rounded-xl bg-white p-6 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{review.productImage}</div>
                      <div>
                        <h3 className="font-bold text-gray-900">{review.productName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <RatingStars rating={review.rating} />
                          <span className="text-sm text-gray-500">{review.date}</span>
                          {review.verified && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-lg border-2 border-gray-300 p-2 text-purple-600 hover:border-purple-500">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="rounded-lg border-2 border-gray-300 p-2 text-red-600 hover:border-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-gray-900">{review.title}</h4>
                    <p className="mt-2 text-gray-600">{review.comment}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-4 border-t pt-4">
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-600">
                      <HandThumbUpIcon className="h-4 w-4" />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Write Review Tab */}
        {activeTab === 'write-review' && (
          <div className="rounded-xl bg-white p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Write a New Review</h2>

            <div className="space-y-6">
              {/* Product Selection (placeholder) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                  <option>Organic Tomatoes</option>
                  <option>Fresh Lettuce</option>
                  <option>Red Apples</option>
                  <option>Greek Yogurt</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <RatingStars
                  rating={newReview.rating}
                  interactive
                  onRate={(rating) => setNewReview({ ...newReview, rating })}
                />
                {newReview.rating > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {newReview.rating === 5 && 'Excellent! 🌟'}
                    {newReview.rating === 4 && 'Very Good 👍'}
                    {newReview.rating === 3 && 'Good 👌'}
                    {newReview.rating === 2 && 'Fair 😐'}
                    {newReview.rating === 1 && 'Poor 😞'}
                  </p>
                )}
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
                <input
                  type="text"
                  placeholder="Summarize your review in one line"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  placeholder="Share your experience with this product"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              {/* Photo Upload (placeholder) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Photos (Optional)</label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  onClick={submitReview}
                  className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-bold text-white hover:shadow-lg"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setActiveTab('my-reviews')}
                  className="rounded-lg border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
