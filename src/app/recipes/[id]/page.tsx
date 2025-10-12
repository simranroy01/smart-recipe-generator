import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SaveButton from '@/components/SaveButton'

interface RecipePageParams {
  params: Promise<{
    id: string
  }>
}

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

  const { id } = await params

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (!recipe) {
    notFound()
  }

  const ingredients: RecipeIngredient[] = recipe.ingredients || []
  const nutrition: RecipeNutrition = recipe.nutrition || { calories: 'N/A', protein: 'N/A' }
  const instructions: string[] = recipe.instructions || []

  return (
    <div className="max-w-4xl min-h-screen p-4 mx-auto my-10 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl sm:p-8 transition">
      <Link
        href="/"
        className="mb-8 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
      >
        &larr; Back to Home
      </Link>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{recipe.title}</h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{recipe.cuisine}</p>
      <div className="mt-4">
        <SaveButton recipe={recipe} type="normal" />
      </div>

      <img
        src={recipe.image_url}
        alt={recipe.title}
        className="object-cover w-full h-64 mt-6 rounded-xl shadow-lg border-4 border-gray-200 dark:border-gray-700"
      />

      <div className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-3">
        <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow">
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Details</h3>
          <p className="text-gray-800 dark:text-gray-200"><strong>Difficulty:</strong> {recipe.difficulty}</p>
          <p className="text-gray-800 dark:text-gray-200"><strong>Cooking Time:</strong> {recipe.cooking_time_minutes} mins</p>
          <p className="text-gray-800 dark:text-gray-200"><strong>Servings:</strong> {recipe.servings}</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow md:col-span-2">
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Nutrition</h3>
          <p className="text-gray-800 dark:text-gray-200"><strong>Calories:</strong> {nutrition.calories}</p>
          <p className="text-gray-800 dark:text-gray-200"><strong>Protein:</strong> {nutrition.protein}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 mt-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300">Ingredients</h2>
          <ul className="mt-4 space-y-2 list-disc list-inside">
            {ingredients.map((ing, index) => (
              <li key={index} className="text-gray-900 dark:text-gray-100">
                <span className="font-semibold text-indigo-600 dark:text-indigo-300">{ing.quantity}</span> {ing.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300">Instructions</h2>
          <ol className="mt-4 space-y-4 list-decimal list-inside">
            {instructions.map((step, index) => (
              <li key={index} className="pl-2 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 rounded-md py-2 px-3 shadow-sm">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}