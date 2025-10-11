// src/app/api/get-all-ingredients/route.ts
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

interface RecipeIngredient {
  name: string
  quantity: string
}

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    // Fetch all recipes, but only select the ingredients column
    const { data: recipes, error } = await supabase.from('recipes').select('ingredients')

    if (error) {
      throw new Error(`Database Error: ${error.message}`)
    }

    // Use a Set to automatically handle uniqueness
    const allIngredients = new Set<string>()

    recipes.forEach(recipe => {
        const ingredients: RecipeIngredient[] = recipe.ingredients || []
        ingredients.forEach(ing => {
            // We can clean up the name a bit here if needed
            allIngredients.add(ing.name)
        })
    })

    // Convert the Set back to a sorted array
    const sortedIngredients = Array.from(allIngredients).sort()

    return NextResponse.json({ ingredients: sortedIngredients })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}