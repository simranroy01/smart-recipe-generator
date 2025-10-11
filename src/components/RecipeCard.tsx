// src/components/RecipeCard.tsx
import Link from 'next/link'
import { Recipe } from './ImageUploader'

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <img src={recipe.image_url} alt={recipe.title} className="object-cover w-full h-48" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{recipe.title}</h3>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>{recipe.difficulty}</span>
          <span>{recipe.cooking_time_minutes} mins</span>
        </div>
      </div>
    </Link>
  )
}