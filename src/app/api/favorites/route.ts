import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch normal saved recipes - first get recipe_ids
    const { data: normalFavorites, error: normalError } = await supabase
      .from('favorite_recipes')
      .select('recipe_id')
      .eq('user_id', user.id)

    if (normalError) {
      throw new Error(`Normal favorites error: ${normalError.message}`)
    }

    const recipeIds = normalFavorites?.map(fav => fav.recipe_id) || []

    // Then fetch the recipes
    let normalRecipes: any[] = []
    if (recipeIds.length > 0) {
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('id, title, image_url, difficulty, cooking_time_minutes, cuisine')
        .in('id', recipeIds)

      if (recipesError) {
        throw new Error(`Recipes fetch error: ${recipesError.message}`)
      }

      normalRecipes = recipesData || []
    }

    // Fetch AI saved recipes
    const { data: aiFavorites, error: aiError } = await supabase
      .from('saved_ai_recipes')
      .select('recipe_data')
      .eq('user_id', user.id)

    // AI recipes are already JSON, or empty if table not found
    const aiRecipes = aiError ? [] : aiFavorites?.map(fav => fav.recipe_data) || []

    return NextResponse.json({
      normal: normalRecipes,
      ai: aiRecipes
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
