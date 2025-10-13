'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'

interface Recipe {
  id: number
  title: string
  image_url: string
  difficulty?: string
  cooking_time_minutes?: number
  score?: number
  cuisine?: string
  description?: string
  // ...other fields as needed
}

interface RecipeCardProps {
  recipe: Recipe
  showRating?: boolean
}

interface NormalRecipe {
  id: number
}

interface FavoritesResponse {
  normal: NormalRecipe[]
  ai: Recipe[]
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkSaved = async () => {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch('/api/favorites')
      if (response.ok) {
        const { normal, ai }: FavoritesResponse = await response.json()
        if (recipe.score) {
          // AI recipe
          setIsSaved(ai.some((r: Recipe) => JSON.stringify(r) === JSON.stringify(recipe)))
        } else {
          // Normal recipe
          setIsSaved(normal.some((r: NormalRecipe) => r.id === recipe.id))
        }
      }
    }
    checkSaved()
  }, [recipe, supabase])

  const handleToggleSave = async () => {
    setLoading(true)
    const type = recipe.score ? 'ai' : 'normal'
    const body = type === 'ai' ? { type, recipeData: recipe } : { type, recipeId: recipe.id }

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const { saved } = await response.json()
        setIsSaved(saved)
      } else {
        console.error('Failed to toggle save:', await response.text())
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    }
    setLoading(false)
  }

  return (
    <div
      className="
        block rounded-xl shadow-lg
        bg-gray-50 dark:bg-gray-800
        p-6
        transition-transform duration-300
        hover:scale-105
        hover:shadow-2xl
        text-gray-900 dark:text-gray-100
      "
    >
      <img
        src={recipe.image_url}
        alt={recipe.title}
        className="w-full h-56 object-cover rounded-lg mb-4"
        loading="lazy"
      />
      <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
      <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-4">
        {recipe.difficulty && <span>{recipe.difficulty}</span>}
        {recipe.cooking_time_minutes && <span>{recipe.cooking_time_minutes} mins</span>}
      </div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleToggleSave}
          disabled={loading}
          className="flex items-center space-x-1 text-red-500 hover:text-red-700 transition"
        >
          <svg
            className={`w-6 h-6 ${isSaved ? 'fill-current' : 'stroke-current fill-none'}`}
            viewBox="0 0 24 24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="text-sm">{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>
      {recipe.score ? (
        <Link
          href={`/ai-recipes/${recipe.id}?data=${encodeURIComponent(JSON.stringify(recipe))}`}
          className="inline-block px-4 py-2 mt-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition"
        >
          View AI Recipe
        </Link>
      ) : (
        <Link
          href={`/recipes/${recipe.id}`}
          className="inline-block px-4 py-2 mt-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
        >
          View
        </Link>
      )}
    </div>
  )
}
