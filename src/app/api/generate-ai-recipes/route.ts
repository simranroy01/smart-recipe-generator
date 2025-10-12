import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

async function getUnsplashImage(query: string): Promise<string> {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
      console.warn('Unsplash API key not found')
      return 'https://via.placeholder.com/400x300?text=No+Image' // Fallback placeholder
    }

    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' food recipe')}&per_page=1&orientation=landscape`, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()
    const imageUrl = data.results[0]?.urls?.regular || 'https://via.placeholder.com/400x300?text=No+Image'
    return imageUrl
  } catch (error) {
    console.error('Unsplash Image Fetch Error:', error)
    return 'https://via.placeholder.com/400x300?text=No+Image'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ingredients, dietary, maxTime, difficulty } = await request.json()

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: 'Ingredients are required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' })

    const prompt = `
Generate 3 creative recipes using these ingredients: ${ingredients.join(', ')}.
Consider dietary preference: ${dietary || 'any'}.
Max cooking time: ${maxTime ? `${maxTime} minutes` : 'no limit'}.
Difficulty level: ${difficulty || 'any'}.

For each recipe, provide:
- title: A catchy name
- difficulty: Easy, Medium, or Hard
- cooking_time_minutes: A number within the max time if specified
- cuisine: e.g., Italian, Indian, etc.
- description: A brief summary of the recipe
- servings: A number, e.g., 4
- ingredients: An array of objects, each with "quantity" (e.g., "1 cup") and "name" (e.g., "flour")
- instructions: An array of 4-6 brief strings, each a concise step (keep each under 50 words)
- nutrition: An object with "calories" (e.g., "300 kcal") and "protein" (e.g., "20g")

Return as a JSON array of objects, no extra text.
Example: [{"title": "Chicken Stir Fry", "difficulty": "Easy", "cooking_time_minutes": 20, "cuisine": "Chinese", "description": "Quick stir fry with chicken and veggies", "servings": 4, "ingredients": [{"quantity": "1 lb", "name": "chicken"}, {"quantity": "2 cups", "name": "vegetables"}], "instructions": ["Step 1", "Step 2"], "nutrition": {"calories": "300 kcal", "protein": "20g"}}]
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let recipes
    try {
      // Extract JSON array from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      recipes = JSON.parse(jsonMatch[0])
    } catch (e) {
      console.error('Failed to parse AI response:', text)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    // Add image_url from Unsplash and id
    const formattedRecipes = await Promise.all(recipes.map(async (recipe: any, index: number) => {
      const imageUrl = await getUnsplashImage(recipe.title)
      return {
        id: Date.now() + index, // Simple unique id
        title: recipe.title,
        difficulty: recipe.difficulty,
        cooking_time_minutes: recipe.cooking_time_minutes,
        cuisine: recipe.cuisine,
        image_url: imageUrl,
        score: Math.floor(Math.random() * 100) + 1, // Random score
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        nutrition: recipe.nutrition,
        description: recipe.description,
      }
    }))

    return NextResponse.json({ recipes: formattedRecipes })
  } catch (error) {
    console.error('Error generating AI recipes:', error)
    return NextResponse.json({ error: 'Failed to generate recipes' }, { status: 500 })
  }
}
