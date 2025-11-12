'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';

interface RatingWidgetProps {
  planId: string;
  rank: number;
  onRatingSubmit?: (rating: number) => void;
}

export function RatingWidget({ planId, rank, onRatingSubmit }: RatingWidgetProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleThumbsUp = async () => {
    await submitRating(1);
  };

  const handleThumbsDown = async () => {
    setShowFeedback(true);
    await submitRating(-1);
  };

  const handleStarClick = async (stars: number) => {
    await submitRating(stars);
  };

  const submitRating = async (value: number) => {
    setLoading(true);
    try {
      // Get session ID from sessionStorage or generate one
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('sessionId', sessionId);
      }

      const response = await fetch('/api/recommendations/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          rank,
          rating: value,
          ratingType: value === 1 || value === -1 ? 'thumbs' : 'star',
          feedback: showFeedback ? feedback : undefined,
          sessionId,
        }),
      });

      if (response.ok) {
        setRating(value);
        setSubmitted(true);
        onRatingSubmit?.(value);
      } else {
        console.error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-sm text-green-600 flex items-center gap-2">
        <span>✓ Thank you for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-600">Was this helpful?</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleThumbsUp}
          disabled={loading}
          className="min-h-[44px] min-w-[44px]"
          aria-label="Thumbs up"
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleThumbsDown}
          disabled={loading}
          className="min-h-[44px] min-w-[44px]"
          aria-label="Thumbs down"
        >
          <ThumbsDown className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-sm text-slate-600 mr-2">Rate:</span>
        {[1, 2, 3, 4, 5].map((stars) => (
          <button
            key={stars}
            onClick={() => handleStarClick(stars)}
            disabled={loading}
            className="p-1 hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50"
            aria-label={`Rate ${stars} stars`}
          >
            <Star
              className={`w-5 h-5 ${
                rating && rating >= stars
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className="mt-2">
          <textarea
            placeholder="What could be improved? (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 border rounded text-sm text-base"
            rows={2}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}

