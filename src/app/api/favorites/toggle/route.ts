import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, recipeId, recipeData } = await request.json()

    if (type === 'normal') {
      if (!recipeId) {
        return NextResponse.json({ error: 'recipeId required for normal recipes' }, { status: 400 })
      }

      // Check if already saved
      const { data: existing, error: checkError } = await supabase
        .from('favorite_recipes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`Check error: ${checkError.message}`)
      }

      if (existing) {
        // Unsave
        const { error: deleteError } = await supabase
          .from('favorite_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId)

        if (deleteError) {
          throw new Error(`Delete error: ${deleteError.message}`)
        }

        return NextResponse.json({ saved: false })
      } else {
        // Save
        const { error: insertError } = await supabase
          .from('favorite_recipes')
          .insert({ user_id: user.id, recipe_id: recipeId })

        if (insertError) {
          throw new Error(`Insert error: ${insertError.message}`)
        }

        return NextResponse.json({ saved: true })
      }
    } else if (type === 'ai') {
      if (!recipeData) {
        return NextResponse.json({ error: 'recipeData required for AI recipes' }, { status: 400 })
      }

      // Check if already saved (match recipe_data)
      const { data: existing, error: checkError } = await supabase
        .from('saved_ai_recipes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_data->>id', recipeData.id)

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`AI check error: ${checkError.message}`)
      }

      if (existing && existing.length > 0) {
        // Unsave
        const { error: deleteError } = await supabase
          .from('saved_ai_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_data->>id', recipeData.id)

        if (deleteError) {
          throw new Error(`AI delete error: ${deleteError.message}`)
        }

        return NextResponse.json({ saved: false })
      } else {
        // Save
        const { error: insertError } = await supabase
          .from('saved_ai_recipes')
          .insert({ user_id: user.id, recipe_data: recipeData })

        if (insertError) {
          throw new Error(`AI insert error: ${insertError.message}`)
        }

        return NextResponse.json({ saved: true })
      }
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
