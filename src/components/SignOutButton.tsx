// src/components/SignOutButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
    >
      Sign Out
    </button>
  )
}