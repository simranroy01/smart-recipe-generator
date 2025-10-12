import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's ratings
    const { data: userRatings, error: ratingsError } = await supabase
      .from('recipe_ratings')
      .select('recipe_id, type, rating')
      .eq('user_id', user.id)

    if (ratingsError) {
      console.error('Error fetching user ratings:', ratingsError)
      return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
    }

    // Get user's preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (prefsError && prefsError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching preferences:', prefsError)
    }

    // Get user's saved recipes
    const { data: savedNormal, error: savedNormalError } = await supabase
      .from('favorite_recipes')
      .select('recipe_id')
      .eq('user_id', user.id)

    const { data: savedAI, error: savedAIError } = await supabase
      .from('saved_ai_recipes')
      .select('recipe_data')
      .eq('user_id', user.id)

    if (savedNormalError || savedAIError) {
      console.error('Error fetching saved recipes:', savedNormalError || savedAIError)
    }

    // Analyze preferences from ratings and saved recipes
    const preferredCuisines = new Set<string>()
    const preferredDifficulties = new Set<string>()

    // Extract preferences from saved recipes
    if (savedNormal) {
      for (const saved of savedNormal) {
        const { data: recipe } = await supabase
          .from('recipes')
          .select('cuisine, difficulty')
          .eq('id', saved.recipe_id)
          .single()

        if (recipe) {
          preferredCuisines.add(recipe.cuisine)
          preferredDifficulties.add(recipe.difficulty)
        }
      }
    }

    if (savedAI) {
      for (const saved of savedAI) {
        try {
          const recipe = typeof saved.recipe_data === 'string'
            ? JSON.parse(saved.recipe_data)
            : saved.recipe_data
          preferredCuisines.add(recipe.cuisine)
          preferredDifficulties.add(recipe.difficulty)
        } catch (e) {
          console.error('Error parsing AI recipe data:', e)
        }
      }
    }

    // Get all recipes
    const { data: allRecipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, cuisine, difficulty, image_url')

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError)
      return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
    }

    // Calculate recommendation scores
    const recommendations = allRecipes?.map(recipe => {
      let score = 0

      // Base score from user ratings (if any)
      const userRating = userRatings?.find(r => r.recipe_id === recipe.id && r.type === 'normal')
      if (userRating) {
        score += userRating.rating * 2 // Weight user's own rating heavily
      }

      // Preference matching
      if (preferredCuisines.has(recipe.cuisine)) score += 3
      if (preferredDifficulties.has(recipe.difficulty)) score += 2

      // Database preferences (if set)
      if (preferences) {
        if (preferences.preferred_cuisines?.includes(recipe.cuisine)) score += 2
        if (preferences.preferred_difficulties?.includes(recipe.difficulty)) score += 2
      }

      // Avoid already saved recipes
      const isSaved = savedNormal?.some(s => s.recipe_id === recipe.id)
      if (isSaved) score -= 10

      return { ...recipe, recommendationScore: score }
    }).filter(recipe => recipe.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 10) // Top 10 recommendations

    return NextResponse.json({
      recommendations: recommendations || [],
      preferences: {
        cuisines: Array.from(preferredCuisines),
        difficulties: Array.from(preferredDifficulties),
        explicit: preferences || null
      }
    })

  } catch (error) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
