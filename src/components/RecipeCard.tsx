'use client'

import Link from 'next/link'
import { useState } from 'react'

interface RecipeCardProps {
  recipe: {
    id: number
    title: string
    image_url: string
    difficulty?: string
    cooking_time_minutes?: number
    score?: number
    cuisine?: string
    description?: string
    // ...other fields as needed
  }
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
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
      {recipe.score ? (
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-block px-4 py-2 mt-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition"
        >
          View AI Recipe
        </button>
      ) : (
        <Link
          href={`/recipes/${recipe.id}`}
          className="inline-block px-4 py-2 mt-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
        >
          View
        </Link>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{recipe.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Cuisine:</strong> {recipe.cuisine}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Difficulty:</strong> {recipe.difficulty}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Cooking Time:</strong> {recipe.cooking_time_minutes} mins</p>
            <p className="text-gray-600 dark:text-gray-300 mb-4"><strong>Description:</strong> {recipe.description}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
