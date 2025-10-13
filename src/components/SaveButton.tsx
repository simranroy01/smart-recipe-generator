'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'

interface SaveButtonProps {
  recipe: {
    id: number;
    title: string;
    image_url: string;
    difficulty?: string;
    cooking_time_minutes?: number;
    score?: number;
    cuisine?: string;
    description?: string;
  }
  type: 'normal' | 'ai'
}

export default function SaveButton({ recipe, type }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch('/api/favorites')
      if (response.ok) {
        const { normal, ai } = await response.json()
        if (type === 'ai') {
          setIsSaved(ai.some((r: { id: number; title: string; image_url: string; difficulty?: string; cooking_time_minutes?: number; score?: number; cuisine?: string; description?: string }) => JSON.stringify(r) === JSON.stringify(recipe)))
        } else {
          setIsSaved(normal.some((r: { id: number; title: string; image_url: string; difficulty?: string; cooking_time_minutes?: number; score?: number; cuisine?: string; description?: string }) => r.id === recipe.id))
        }
      }
    }
    checkSaved()
  }, [recipe, type, supabase])

  const handleToggleSave = async () => {
    setLoading(true)
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to toggle save:', errorData.error)
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggleSave}
      disabled={loading}
      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition disabled:bg-gray-400"
    >
      <svg
        className={`w-5 h-5 ${isSaved ? 'fill-current' : 'stroke-current fill-none'}`}
        viewBox="0 0 24 24"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{isSaved ? 'Saved' : 'Save Recipe'}</span>
    </button>
  )
}
