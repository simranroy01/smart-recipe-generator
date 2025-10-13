import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

interface RateRequest {
  recipeId: number
  type: string
  rating: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipeId, type, rating }: RateRequest = await request.json()

    if (!recipeId || !type || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Upsert rating
    const { error: upsertError } = await supabase
      .from('recipe_ratings')
      .upsert({
        user_id: user.id,
        recipe_id: recipeId,
        type,
        rating
      }, {
        onConflict: 'user_id,recipe_id,type'
      })

    if (upsertError) {
      throw new Error(`Upsert error: ${upsertError.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('recipeId')
    const type = searchParams.get('type')

    if (!recipeId || !type) {
      return NextResponse.json({ error: 'Missing recipeId or type' }, { status: 400 })
    }

    // Get user's rating
    const { data: userRating, error: userError } = await supabase
      .from('recipe_ratings')
      .select('rating')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .eq('type', type)
      .single()

    // Get average rating
    const { data: avgRating, error: avgError } = await supabase
      .from('recipe_ratings')
      .select('rating')
      .eq('recipe_id', recipeId)
      .eq('type', type)

    let average = 0
    if (avgRating && avgRating.length > 0) {
      average = avgRating.reduce((sum, r) => sum + r.rating, 0) / avgRating.length
    }

    return NextResponse.json({
      userRating: userRating?.rating || 0,
      averageRating: Math.round(average * 10) / 10 // Round to 1 decimal
    })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
