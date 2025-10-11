// src/app/api/get-recipes/route.ts
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const { ingredients, dietary, maxTime, difficulty } = await request.json()

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

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}