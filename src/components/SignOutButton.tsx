// src/components/SignOutButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="group relative inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600/70 to-rose-600/70 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-out overflow-hidden"
    >
      <span className="relative z-10 flex items-center">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-red-700/70 to-rose-700/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
    </button>
  )
}