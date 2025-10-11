// src/app/recipes/[id]/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// This interface tells TypeScript what the params object will look like
interface RecipePageParams {
  params: {
    id: string
  }
}

// Define the structure of the data we expect from Supabase
interface RecipeIngredient {
  name: string
  quantity: string
}
interface RecipeNutrition {
    calories: string
    protein: string
}

export default async function RecipePage({ params }: RecipePageParams) {
  const supabase = createSupabaseServerClient()

  // Fetch a single recipe whose 'id' matches the one from the URL
  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single() // .single() ensures we get one object, not an array

  // If no recipe is found, show the 404 Not Found page
  if (!recipe) {
    notFound()
  }
  
  // Cast the types for ingredients and nutrition to help TypeScript
  const ingredients: RecipeIngredient[] = recipe.ingredients || []
  const nutrition: RecipeNutrition = recipe.nutrition || { calories: 'N/A', protein: 'N/A' }
  const instructions: string[] = recipe.instructions || []


  return (
    <div className="max-w-4xl min-h-screen p-4 mx-auto my-10 bg-white rounded-lg shadow-xl sm:p-8">
       <Link href="/" className="mb-8 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
        &larr; Back to Home
      </Link>
      <h1 className="text-4xl font-bold text-gray-900">{recipe.title}</h1>
      <p className="mt-2 text-lg text-gray-500">{recipe.cuisine}</p>

      <img src={recipe.image_url} alt={recipe.title} className="object-cover w-full h-64 mt-6 rounded-lg shadow-md" />

      <div className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-3">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-800">Details</h3>
          <p><strong>Difficulty:</strong> {recipe.difficulty}</p>
          <p><strong>Cooking Time:</strong> {recipe.cooking_time_minutes} mins</p>
          <p><strong>Servings:</strong> {recipe.servings}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg md:col-span-2">
          <h3 className="font-semibold text-gray-800">Nutrition</h3>
          <p><strong>Calories:</strong> {nutrition.calories}</p>
          <p><strong>Protein:</strong> {nutrition.protein}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-12 mt-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Ingredients</h2>
          <ul className="mt-4 space-y-2 list-disc list-inside">
            {ingredients.map((ing, index) => (
              <li key={index}><strong>{ing.quantity}</strong> {ing.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Instructions</h2>
          <ol className="mt-4 space-y-4 list-decimal list-inside">
            {instructions.map((step, index) => (
              <li key={index} className="pl-2">{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}