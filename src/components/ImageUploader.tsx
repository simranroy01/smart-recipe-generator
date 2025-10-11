// src/components/ImageUploader.tsx
'use client'

import { useState, useEffect } from 'react'
import RecipeList from './RecipeList'

// Define the structure of a recipe object for TypeScript
export interface Recipe {
  id: number;
  title: string;
  difficulty: string;
  cooking_time_minutes: number;
  cuisine: string;
  image_url: string;
  // This is a new property for the score
  score?: number;
}

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null) // <-- Added
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  // This state will track which view to show
  const [currentView, setCurrentView] = useState<'uploader' | 'editor' | 'results'>('uploader')

  // Handle image preview
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setImagePreview(null)
    }
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleRecognizeIngredients = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file first.')
      return
    }

    setLoading(true)
    setError(null)
    setIngredients([])

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/recognize-ingredients', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to recognize ingredients.')
      }
      setIngredients(data.ingredients || [])
      setCurrentView('editor') // Switch to the editor view
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveIngredient = (indexToRemove: number) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove))
  }

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault()
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()])
      setNewIngredient('')
    }
  }

  const handleFindRecipes = async () => {
    setLoading(true)
    setError(null)
    setRecipes([])
    try {
      const response = await fetch('/api/get-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setRecipes(data.recipes)
      setCurrentView('results') // Switch to the results view
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- Render Logic ---

  if (currentView === 'results') {
    return <RecipeList recipes={recipes} onBack={() => setCurrentView('editor')} />
  }

  return (
    <div className="w-full max-w-xl p-8 mx-auto my-10 bg-white rounded-lg shadow-xl">
      {currentView === 'uploader' && (
        <form onSubmit={handleRecognizeIngredients} className="space-y-6">
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-center text-gray-700">
              Upload an image of your ingredients
            </label>
            <div className="flex items-center justify-center w-full mt-2">
              <label className="flex flex-col w-full h-32 border-4 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 hover:border-gray-300">
                <div className="flex flex-col items-center justify-center pt-7">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z" /></svg>
                  <p className="pt-1 text-sm tracking-wider text-gray-400">{file ? file.name : 'Select a photo'}</p>
                </div>
                <input id="image-upload" type="file" className="opacity-0" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>
          <button type="submit" disabled={loading || !file} className="w-full px-4 py-2 text-lg font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400">
            {loading ? 'Analyzing...' : 'Recognize Ingredients'}
          </button>
        </form>
      )}

      {currentView === 'editor' && (
        <div>
          <button onClick={() => setCurrentView('uploader')} className="mb-4 text-sm text-indigo-600 hover:text-indigo-800">
            &larr; Upload a different image
          </button>
          {/* Show the uploaded image */}
          {imagePreview && (
            <div className="flex justify-center mb-4">
              <img src={imagePreview} alt="Uploaded ingredients" className="max-h-48 rounded shadow" />
            </div>
          )}
          <h3 className="text-lg font-medium leading-6 text-gray-900">Confirm Your Ingredients:</h3>
          <div className="flex flex-wrap gap-2 my-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full">
                <span>{ingredient}</span>
                <button onClick={() => handleRemoveIngredient(index)} className="font-bold text-red-500 hover:text-red-700">x</button>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleAddIngredient} className="flex gap-2">
            <input 
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Add a missing ingredient"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700">Add</button>
          </form>

          <button onClick={handleFindRecipes} disabled={loading} className="w-full px-4 py-2 mt-6 text-lg font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-400">
            {loading ? 'Finding Recipes...' : 'Find Recipes'}
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
    </div>
  )
}