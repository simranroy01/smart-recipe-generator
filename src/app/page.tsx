import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import SignOutButton from '@/components/SignOutButton'
import ImageUploader from '@/components/RecipeFinder'
import TypingSubtitle from '@/components/TypingSubtitle'

// ...existing imports...

export default async function Home() {
  const supabase = createSupabaseServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <main className="relative flex flex-col items-center min-h-screen p-2 sm:p-4 pt-16 sm:pt-12 bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/foodbg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 z-0 bg-white/40 dark:bg-black/60" aria-hidden="true" />

      {/* Welcome message beside logo */}
      {session && (
        <div className="absolute top-3 sm:top-5 left-20 sm:left-32 z-10 animate-fade-in">
          <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 drop-shadow-sm">Welcome, {session.user.user_metadata?.name || session.user.email}!</p>
        </div>
      )}

      {/* Buttons in top-right */}
      <div className="absolute top-3 sm:top-5 right-2 sm:right-5 z-10">
        {session ? (
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <Link
              href="/profile"
              className="group relative inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-green-600/70 to-emerald-600/70 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-out overflow-hidden animate-pulse-scale"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="hidden sm:inline">My Favorite Recipes</span>
                <span className="sm:hidden">Favorites</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-700/70 to-emerald-700/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </Link>
            <SignOutButton />
          </div>
        ) : (
          <Link
            href="/auth"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Log In / Sign Up
          </Link>
        )}
      </div>

      <div className="w-full max-w-5xl text-center z-10 pt-16 sm:pt-20">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl mb-4 sm:mb-6">
          Smart Recipe Generator
        </h1>
        <TypingSubtitle />
        {session && (
          <div className="mt-4 sm:mt-6">
            <Link
              href="/suggestions"
              className="group relative inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-orange-300/70 to-orange-500/70 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Personalized Suggestions
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              <div className="absolute inset-0 rounded-full border-2 border-orange-200 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
            </Link>
          </div>
        )}
      </div>

      {/* Conditionally render the ImageUploader if the user is logged in */}
      <div className="w-full mt-12 sm:mt-16 z-10">
        {session ? (
          <ImageUploader />
        ) : (
          <div className="text-center bg-white/80 dark:bg-gray-800/80 p-4 sm:p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
              Please Log In to Get Started
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-300">
              Create an account or sign in to begin generating recipes.
            </p>
            <Image
              src="/cooking.gif"
              alt="Cooking animation"
              width={250}
              height={250}
              className="mt-6 sm:mt-8 mx-auto"
            />
          </div>
        )}
      </div>
    </main>
  )
}