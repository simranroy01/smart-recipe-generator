// src/components/RecipeList.tsx
import RecipeCard from './RecipeCard'

interface Recipe {
  id: number
  title: string
  image_url: string
  difficulty?: string
  cooking_time_minutes?: number
  // ...other fields as needed
}

interface RecipeListProps {
  recipes: Recipe[]
  onBack?: () => void
}

export default function RecipeList({ recipes, onBack }: RecipeListProps) {
  return (
    <div className="w-full max-w-4xl p-8 mx-auto my-10">
      {onBack && (
        <div className="mb-6 flex justify-start">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600/70 to-emerald-600/70 rounded-lg shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        </div>
      )}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-gray-500">No matching recipes found. Try adjusting your ingredients.</p>
      )}
    </div>
  )
}
