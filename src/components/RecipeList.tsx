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
