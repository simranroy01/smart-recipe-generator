// src/components/RecipeList.tsx
import { Recipe } from './ImageUploader'
import RecipeCard from './RecipeCard' // This will show an error until we create the next file

interface RecipeListProps {
  recipes: Recipe[]
  onBack: () => void
}

export default function RecipeList({ recipes, onBack }: RecipeListProps) {
  return (
    <div className="w-full max-w-4xl p-8 mx-auto my-10">
      <button onClick={onBack} className="mb-6 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700">
        &larr; Back to Ingredients
      </button>
      <h2 className="text-3xl font-bold text-center text-gray-800">Matching Recipes</h2>
      
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