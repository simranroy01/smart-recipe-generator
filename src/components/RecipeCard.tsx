import Link from 'next/link'
// ...other imports...

interface RecipeCardProps {
  recipe: {
    id: number
    title: string
    image_url: string
    difficulty?: string
    cooking_time_minutes?: number
    // ...other fields as needed
  }
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block rounded-lg shadow hover:shadow-lg transition p-4 bg-white">
      <img src={recipe.image_url} alt={recipe.title} className="w-full h-40 object-cover rounded mb-3" />
      <h3 className="text-lg font-semibold mb-1">{recipe.title}</h3>
      {/* Optional: show difficulty and cooking time if available */}
      <div className="flex justify-between text-xs text-gray-600">
        {recipe.difficulty && <span>{recipe.difficulty}</span>}
        {recipe.cooking_time_minutes && <span>{recipe.cooking_time_minutes} mins</span>}
      </div>
      {/* ...other card content... */}
    </Link>
  )
}