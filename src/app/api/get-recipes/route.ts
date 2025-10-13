// src/app/api/get-recipes/route.ts
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

interface FilterRequest {
  ingredients: string[]
  dietary?: string
  maxTime?: number
  difficulty?: string
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const { ingredients, dietary, maxTime, difficulty }: FilterRequest = await request.json()

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: 'No ingredients provided.' }, { status: 400 })
    }

    // Call the database function (RPC) with the parameters
    const { data: recipes, error } = await supabase.rpc('filter_recipes', {
      p_ingredients: ingredients,
      p_dietary: dietary !== 'any' ? dietary : null,
      p_max_time: maxTime,
      p_difficulty: difficulty !== 'any' ? difficulty : null,
    })

    if (error) {
      throw new Error(`Database Function Error: ${error.message}`)
    }

    return NextResponse.json({ recipes })

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
