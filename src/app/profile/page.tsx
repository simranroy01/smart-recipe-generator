'use client'

export const runtime = 'nodejs'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import RecipeList from '@/components/RecipeList'
import Link from 'next/link'

interface Recipe {
  id: number
  title: string
  image_url: string
  difficulty?: string
  cooking_time_minutes?: number
  score?: number
  cuisine?: string
  description?: string
}

export default function ProfilePage() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      fetchFavorites()
    }
    checkAuth()
  }, [supabase, router])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to fetch favorites')
      }
      const { normal, ai } = await response.json()
      setAllRecipes([...normal, ...ai])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>
  }

  return (
    <div className="relative min-h-screen">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/favbg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 z-0 bg-white/40 dark:bg-black/60" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto p-4 my-10">
        <Link
          href="/"
          className="mb-8 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
        >
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">My Saved Recipes</h1>

        {allRecipes.length > 0 ? (
          <RecipeList recipes={allRecipes} onBack={() => router.push('/')} />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg">No saved recipes yet.</p>
            <Link href="/" className="text-indigo-600 hover:text-indigo-800">Start exploring recipes!</Link>
          </div>
        )}
      </div>
    </div>
  )
}
