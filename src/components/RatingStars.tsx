'use client'

import { useState, useEffect } from 'react'

interface RatingStarsProps {
  recipeId: number
  type: 'normal' | 'ai'
  initialRating?: number
  onRatingChange?: (rating: number) => void
}

export default function RatingStars({ recipeId, type, initialRating = 0, onRatingChange }: RatingStarsProps) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setRating(initialRating)
  }, [initialRating])

  const handleRating = async (value: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/rate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, type, rating: value })
      })
      if (response.ok) {
        setRating(value)
        onRatingChange?.(value)
      } else {
        console.error('Failed to rate recipe')
      }
    } catch (error) {
      console.error('Error rating recipe:', error)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={loading}
          className={`text-2xl ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
          onClick={() => handleRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
        {rating > 0 ? `${rating}/5` : 'Rate this recipe'}
      </span>
    </div>
  )
}
