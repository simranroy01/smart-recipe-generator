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
    <div
      className="
        block rounded-xl shadow-lg
        bg-gray-50 dark:bg-gray-800
        p-6
        transition-transform duration-300
        hover:scale-105
        hover:shadow-2xl
        text-gray-900 dark:text-gray-100
      "
    >
      <img
        src={recipe.image_url}
        alt={recipe.title}
        className="w-full h-56 object-cover rounded-lg mb-4"
      />
      <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
      <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-4">
        {recipe.difficulty && <span>{recipe.difficulty}</span>}
        {recipe.cooking_time_minutes && <span>{recipe.cooking_time_minutes} mins</span>}
      </div>
      <Link
        href={`/recipes/${recipe.id}`}
        className="inline-block px-4 py-2 mt-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
      >
        View
      </Link>
    </div>
  )
}