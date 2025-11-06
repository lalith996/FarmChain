'use client';

import { useState } from 'react';
import { RatingStars } from './RatingStars';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  orderId: string;
  productId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ orderId, productId, onSuccess, onCancel }: ReviewFormProps) {
  const [ratings, setRatings] = useState({
    overall: 0,
    quality: 0,
    delivery: 0,
    communication: 0,
    valueForMoney: 0
  });
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ratings.overall === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login to submit a review');
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews`,
        {
          orderId,
          productId,
          ratings,
          title: title.trim(),
          comment: comment.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Review submitted successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Submit review error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h3>

      {/* Overall Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating <span className="text-red-500">*</span>
        </label>
        <RatingStars
          rating={ratings.overall}
          interactive
          size="lg"
          onChange={(rating) => setRatings({ ...ratings, overall: rating })}
        />
      </div>

      {/* Category Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality
          </label>
          <RatingStars
            rating={ratings.quality}
            interactive
            size="md"
            onChange={(rating) => setRatings({ ...ratings, quality: rating })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery
          </label>
          <RatingStars
            rating={ratings.delivery}
            interactive
            size="md"
            onChange={(rating) => setRatings({ ...ratings, delivery: rating })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Communication
          </label>
          <RatingStars
            rating={ratings.communication}
            interactive
            size="md"
            onChange={(rating) => setRatings({ ...ratings, communication: rating })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Value for Money
          </label>
          <RatingStars
            rating={ratings.valueForMoney}
            interactive
            size="md"
            onChange={(rating) => setRatings({ ...ratings, valueForMoney: rating })}
          />
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Summarize your experience"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={5}
          placeholder="Share your experience with this product..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          {comment.length}/1000 characters
        </p>
      </div>

      {/* Buttons */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
