'use client'

import { useState, useEffect } from 'react'
import RecipeList from './RecipeList'

export interface Recipe {
  id: number;
  title: string;
  difficulty: string;
  cooking_time_minutes: number;
  cuisine: string;
  image_url: string;
  score?: number;
  description?: string;
}

export default function RecipeFinder() {
  // --- STATE MANAGEMENT ---
  const [inputMode, setInputMode] = useState<'image' | 'text'>('image')
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [masterIngredientList, setMasterIngredientList] = useState<string[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [textInput, setTextInput] = useState('')
  const [dietary, setDietary] = useState('any')
  const [maxTime, setMaxTime] = useState('')
  const [difficulty, setDifficulty] = useState('any')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [currentView, setCurrentView] = useState<'input' | 'results'>('input')

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch('/api/get-all-ingredients')
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setMasterIngredientList(data.ingredients)
      } catch (err) {
        setError('Could not load ingredient list.')
      }
    }
    fetchIngredients()
  }, [])

  // --- IMAGE HANDLING ---
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
    if (e.target.files) setFile(e.target.files[0])
  }

  const handleRecognizeIngredients = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file first.')
      return
    }
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const response = await fetch('/api/recognize-ingredients', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to recognize ingredients.')
      setSelectedIngredients(data.ingredients || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- TEXT/LIST HANDLING ---
  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    )
  }

  const handleAddTextIngredient = () => {
    if (textInput.trim() && !selectedIngredients.includes(textInput.trim())) {
      setSelectedIngredients(prev => [...prev, textInput.trim()])
      setTextInput('')
    }
  }

  // --- RECIPE SEARCH ---
  const handleFindRecipes = async () => {
    if (selectedIngredients.length === 0) {
      setError('Please select some ingredients first.')
      return
    }
    setLoading(true)
    setError(null)
    setRecipes([])
    try {
      const response = await fetch('/api/get-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          dietary,
          maxTime: maxTime ? parseInt(maxTime) : null,
          difficulty: difficulty !== 'any' ? difficulty : null,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setRecipes(data.recipes)
      setCurrentView('results')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- AI RECIPE GENERATION ---
  const handleGenerateAIRecipes = async () => {
    if (selectedIngredients.length === 0) {
      setError('Please select some ingredients first.')
      return
    }
    setLoading(true)
    setError(null)
    setRecipes([])
    try {
      const response = await fetch('/api/generate-ai-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          dietary,
          maxTime: maxTime ? parseInt(maxTime) : null,
          difficulty: difficulty !== 'any' ? difficulty : null,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setRecipes(data.recipes)
      setCurrentView('results')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- FILTERED MASTER LIST ---
  const filteredMasterList = masterIngredientList.filter(ing =>
    ing.toLowerCase().includes(textInput.toLowerCase())
  )

  // --- RENDER LOGIC ---
  if (currentView === 'results') {
    return <RecipeList recipes={recipes} onBack={() => setCurrentView('input')} />
  }

  return (
    <div
      className="
        w-full max-w-xl p-8 mx-auto my-10
        bg-gray-50 dark:bg-gray-800
        rounded-lg shadow-xl
        transition-transform duration-300
        hover:scale-105
      "
    >
      {/* --- TABS for Input Mode --- */}
      <div className="flex border-b">
        <button onClick={() => setInputMode('image')} className={`px-4 py-2 text-lg font-medium focus:outline-none ${inputMode === 'image' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-700 dark:text-gray-200'}`}>
          From Image
        </button>
        <button onClick={() => setInputMode('text')} className={`px-4 py-2 text-lg font-medium focus:outline-none ${inputMode === 'text' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-700 dark:text-gray-200'}`}>
          From Text / List
        </button>
      </div>

      {/* --- CONDITIONAL UI based on inputMode --- */}
      <div className="mt-6">
        {inputMode === 'image' && (
          <form onSubmit={handleRecognizeIngredients} className="space-y-6">
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-center text-gray-800 dark:text-gray-200">
                Upload an image of your ingredients
              </label>
              <div className="flex items-center justify-center w-full mt-2">
                <label className="flex flex-col w-full h-32 border-4 border-dashed rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500">
                  <div className="flex flex-col items-center justify-center pt-7">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z" /></svg>
                    <p className="pt-1 text-sm tracking-wider text-gray-500 dark:text-gray-300">{file ? file.name : 'Select a photo'}</p>
                  </div>
                  <input id="image-upload" type="file" className="opacity-0" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>
            {imagePreview && (
              <div className="flex justify-center mb-4">
                <img src={imagePreview} alt="Uploaded ingredients" className="max-h-48 rounded shadow" />
              </div>
            )}
            <button type="submit" disabled={loading || !file} className="w-full px-4 py-2 text-lg font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400 transition-colors">
              {loading ? 'Analyzing...' : 'Recognize Ingredients'}
            </button>
          </form>
        )}

        {inputMode === 'text' && (
          <div>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type to add or filter list..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button type="button" onClick={handleAddTextIngredient} className="w-full px-4 py-2 mt-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 transition-colors">Add Text Ingredient</button>
            <div className="mt-4 h-48 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-800">
              {filteredMasterList.map(ing => (
                <div key={ing} className="flex items-center">
                  <input
                    type="checkbox"
                    id={ing}
                    checked={selectedIngredients.includes(ing)}
                    onChange={() => handleIngredientToggle(ing)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor={ing} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">{ing}</label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- SHARED UI for Filters and Selected Ingredients --- */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Selected Ingredients:</h3>
        <div className="flex flex-wrap gap-2 my-2">
          {selectedIngredients.map(ing => (
            <div key={ing} className="flex items-center gap-2 px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-full">
              <span>{ing}</span>
              <button onClick={() => handleIngredientToggle(ing)} className="font-bold text-red-500 dark:text-red-300">x</button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
          <div>
            <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Dietary</label>
            <select
              id="dietary"
              value={dietary}
              onChange={e => setDietary(e.target.value)}
              className="block w-full px-3 py-2 mt-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 rounded-md"
            >
              <option value="any">Any</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten-Free</option>
            </select>
          </div>
          <div>
            <label htmlFor="maxTime" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Max Time (min)</label>
            <input
              id="maxTime"
              type="number"
              min={1}
              placeholder="e.g. 30"
              value={maxTime}
              onChange={e => setMaxTime(e.target.value)}
              className="block w-full px-3 py-2 mt-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Difficulty</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="block w-full px-3 py-2 mt-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 rounded-md"
            >
              <option value="any">Any</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
        <button onClick={handleFindRecipes} disabled={loading} className="w-full px-4 py-2 mt-6 text-lg font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">
          {loading ? 'Finding Recipes...' : 'Find Recipes'}
        </button>
        <p className="text-center text-gray-500 mt-4">OR</p>
        <button onClick={handleGenerateAIRecipes} disabled={loading} className="w-full px-4 py-2 mt-2 text-lg font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
          {loading ? 'Generating AI Recipes...' : 'Generate AI Recipes'}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}