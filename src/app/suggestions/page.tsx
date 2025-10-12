'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import RecipeCard from '@/components/RecipeCard'

interface Recipe {
  id: number
  title: string
  cuisine: string
  difficulty: string
  image_url: string
  score?: number
  recommendationScore: number
}

interface Preferences {
  cuisines: string[]
  difficulties: string[]
  explicit: any
}

export default function SuggestionsPage() {
  const [recommendations, setRecommendations] = useState<Recipe[]>([])
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('/api/suggestions')
        if (response.ok) {
          const data = await response.json()
          setRecommendations(data.recommendations)
          setPreferences(data.preferences)
        } else {
          setError('Failed to load suggestions')
        }
      } catch (err) {
        setError('Failed to load suggestions')
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [])

  if (loading) {
    return <div className="text-center mt-10">Loading your personalized suggestions...</div>
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-4 my-10">
      <Link
        href="/"
        className="mb-8 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
      >
        &larr; Back to Home
      </Link>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Personalized Recipe Suggestions
      </h1>

      {preferences && (
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
            Based on Your Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Favorite Cuisines</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {preferences.cuisines.length > 0 ? preferences.cuisines.join(', ') : 'None detected yet'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Preferred Difficulties</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {preferences.difficulties.length > 0 ? preferences.difficulties.join(', ') : 'None detected yet'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Explicit Preferences</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {preferences.explicit ? 'Set in profile' : 'Not set yet'}
              </p>
            </div>
          </div>
        </div>
      )}

      {recommendations.length > 0 ? (
        <div>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Here are some recipes we think you'll love based on your ratings and saved recipes:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                showRating={true}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            No suggestions available yet
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Rate some recipes and save your favorites to get personalized recommendations!
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
          >
            Browse Recipes
          </Link>
        </div>
      )}
    </div>
  )
}
