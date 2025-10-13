import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

interface RecipeIngredient {
  name: string
  quantity: string
}

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const { data: recipes, error } = await supabase.from('recipes').select('ingredients')
    if (error) throw new Error(`Database Error: ${error.message}`)

    const allIngredients = new Set<string>()
    recipes?.forEach(recipe => {
      let ingredients: RecipeIngredient[] = []
      try {
        ingredients = typeof recipe.ingredients === 'string'
          ? JSON.parse(recipe.ingredients.replace(/""/g, '"'))
          : recipe.ingredients
      } catch {}
      ingredients?.forEach((ing: RecipeIngredient) => allIngredients.add(ing.name))
    })

    return NextResponse.json({ ingredients: Array.from(allIngredients).sort() })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
