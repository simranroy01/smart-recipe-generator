'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SaveButton from '@/components/SaveButton'
import { scaleIngredients, scaleNutrition, RecipeIngredient, RecipeNutrition } from '@/utils/recipeUtils'

interface Recipe {
  id: number;
  title: string;
  difficulty: string;
  cooking_time_minutes: number;
  cuisine: string;
  image_url: string;
  score?: number;
  description?: string;
  servings?: number;
  ingredients?: RecipeIngredient[];
  instructions?: string[];
  nutrition?: RecipeNutrition;
}

export default function AIRecipePage() {
  const searchParams = useSearchParams()
  const dataStr = searchParams.get('data')

  if (!dataStr) {
    return <div className="text-center mt-10">Recipe not found.</div>
  }

  const recipe: Recipe = JSON.parse(decodeURIComponent(dataStr))
  const [selectedServings, setSelectedServings] = useState<number>(recipe.servings || 4)

  const baseServings = recipe.servings || 4
  const scaledIngredients: RecipeIngredient[] = scaleIngredients(recipe.ingredients || [], baseServings, selectedServings)
  const scaledNutrition: RecipeNutrition = scaleNutrition(recipe.nutrition || { calories: 'N/A', protein: 'N/A' }, baseServings, selectedServings)
  const instructions = recipe.instructions || []

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
        <SaveButton recipe={recipe} type="ai" />
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
          <div className="flex items-center space-x-2">
            <strong>Servings:</strong>
            <button
              onClick={() => setSelectedServings(Math.max(1, selectedServings - 1))}
              className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              -
            </button>
            <span className="text-lg font-semibold">{selectedServings}</span>
            <button
              onClick={() => setSelectedServings(Math.min(20, selectedServings + 1))}
              className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              +
            </button>
          </div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow md:col-span-2">
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Nutrition (per serving)</h3>
          <p className="text-gray-800 dark:text-gray-200"><strong>Calories:</strong> {scaledNutrition.calories}</p>
          <p className="text-gray-800 dark:text-gray-200"><strong>Protein:</strong> {scaledNutrition.protein}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 mt-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300">Ingredients</h2>
          <ul className="mt-4 space-y-2 list-disc list-inside">
            {scaledIngredients.map((ing: RecipeIngredient, index: number) => (
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
