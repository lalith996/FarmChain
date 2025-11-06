'use client';

import { useState } from 'react';
import { RatingStars } from './RatingStars';
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  FlagIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  reviewerId: {
    _id: string;
    profile: {
      name: string;
      avatar?: string;
    };
  };
  ratings: {
    overall: number;
    quality?: number;
    delivery?: number;
    communication?: number;
    valueForMoney?: number;
  };
  title?: string;
  comment?: string;
  media?: Array<{ type: string; url: string }>;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  sellerResponse?: {
    comment: string;
    respondedAt: string;
  };
  createdAt: string;
  isEdited?: boolean;
}

interface ReviewCardProps {
  review: Review;
  onVote?: () => void;
}

export function ReviewCard({ review, onVote }: ReviewCardProps) {
  const [userVote, setUserVote] = useState<number>(0);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulVotes);
  const [unhelpfulCount, setUnhelpfulCount] = useState(review.unhelpfulVotes);
  const [voting, setVoting] = useState(false);

  const handleVote = async (vote: number) => {
    try {
      setVoting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to vote');
        return;
      }

      // Toggle vote if clicking same button
      const newVote = userVote === vote ? 0 : vote;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/${review._id}/vote`,
        { vote: newVote },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setHelpfulCount(response.data.data.helpfulVotes);
      setUnhelpfulCount(response.data.data.unhelpfulVotes);
      setUserVote(newVote);
      
      if (onVote) onVote();
    } catch (error: any) {
      console.error('Vote error:', error);
      toast.error(error.response?.data?.error || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const handleFlag = async () => {
    const reason = prompt('Please provide a reason for flagging this review:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to flag reviews');
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/${review._id}/flag`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Review flagged for moderation');
    } catch (error: any) {
      console.error('Flag error:', error);
      toast.error(error.response?.data?.error || 'Failed to flag review');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 font-semibold text-lg">
              {review.reviewerId.profile.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">
                {review.reviewerId.profile.name}
              </h4>
              {review.isVerifiedPurchase && (
                <CheckBadgeIcon className="h-5 w-5 text-green-500" title="Verified Purchase" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
              {review.isEdited && ' (edited)'}
            </p>
          </div>
        </div>
        <button
          onClick={handleFlag}
          className="text-gray-400 hover:text-red-500 transition"
          title="Flag review"
        >
          <FlagIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Rating */}
      <div className="mb-3">
        <RatingStars rating={review.ratings.overall} showNumber size="md" />
      </div>

      {/* Title */}
      {review.title && (
        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>
      )}

      {/* Category Ratings */}
      {(review.ratings.quality || review.ratings.delivery || review.ratings.communication || review.ratings.valueForMoney) && (
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {review.ratings.quality && (
            <div>
              <span className="text-gray-600">Quality:</span>
              <RatingStars rating={review.ratings.quality} size="sm" />
            </div>
          )}
          {review.ratings.delivery && (
            <div>
              <span className="text-gray-600">Delivery:</span>
              <RatingStars rating={review.ratings.delivery} size="sm" />
            </div>
          )}
          {review.ratings.communication && (
            <div>
              <span className="text-gray-600">Communication:</span>
              <RatingStars rating={review.ratings.communication} size="sm" />
            </div>
          )}
          {review.ratings.valueForMoney && (
            <div>
              <span className="text-gray-600">Value:</span>
              <RatingStars rating={review.ratings.valueForMoney} size="sm" />
            </div>
          )}
        </div>
      )}

      {/* Media */}
      {review.media && review.media.length > 0 && (
        <div className="flex space-x-2 mb-4">
          {review.media.map((item, index) => (
            <img
              key={index}
              src={item.url}
              alt={`Review media ${index + 1}`}
              className="h-20 w-20 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Helpful Votes */}
      <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-600">Was this helpful?</span>
        <button
          onClick={() => handleVote(1)}
          disabled={voting}
          className={`
            flex items-center space-x-1 px-3 py-1 rounded-lg transition
            ${userVote === 1 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
            disabled:opacity-50
          `}
        >
          {userVote === 1 ? (
            <HandThumbUpSolidIcon className="h-4 w-4" />
          ) : (
            <HandThumbUpIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{helpfulCount}</span>
        </button>
        <button
          onClick={() => handleVote(-1)}
          disabled={voting}
          className={`
            flex items-center space-x-1 px-3 py-1 rounded-lg transition
            ${userVote === -1 
              ? 'bg-red-100 text-red-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
            disabled:opacity-50
          `}
        >
          {userVote === -1 ? (
            <HandThumbDownSolidIcon className="h-4 w-4" />
          ) : (
            <HandThumbDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{unhelpfulCount}</span>
        </button>
      </div>

      {/* Seller Response */}
      {review.sellerResponse && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-semibold text-gray-900">Seller Response</span>
            <span className="text-xs text-gray-500">
              {formatDate(review.sellerResponse.respondedAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700">{review.sellerResponse.comment}</p>
        </div>
      )}
    </div>
  );
}
