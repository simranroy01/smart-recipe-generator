// src/app/page.tsx
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import SignOutButton from '@/components/SignOutButton'
import ImageUploader from '@/components/ImageUploader' // <-- Import the new component

export default async function Home() {
  const supabase = createSupabaseServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <main className="flex flex-col items-center min-h-screen p-4 pt-20 bg-gray-50">
      <div className="absolute top-5 right-5">
        {session ? (
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">Welcome, {session.user.email}</p>
            <SignOutButton />
          </div>
        ) : (
          <Link
            href="/auth"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Log In / Sign Up
          </Link>
        )}
      </div>

      <div className="w-full max-w-5xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Smart Recipe Generator
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Have ingredients but no ideas? Upload a photo and find your next meal.
        </p>
      </div>

      {/* Conditionally render the ImageUploader if the user is logged in */}
      <div className="w-full mt-10">
        {session ? (
          <ImageUploader />
        ) : (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">
              Please Log In to Get Started
            </h2>
            <p className="mt-2 text-gray-500">
              Create an account or sign in to begin generating recipes.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}