// src/app/page.tsx
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabaseServer' // <-- Updated import
import SignOutButton from '@/components/SignOutButton'

export default async function Home() {
  const supabase = createSupabaseServerClient() // <-- Simpler setup

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="absolute top-5 right-5">
        {session ? (
          <div className="flex items-center gap-4">
            <p>Welcome, {session.user.email}</p>
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

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {/* Your main page content goes here */}
        <h1 className="text-4xl font-bold">Smart Recipe Generator</h1>
      </div>
    </main>
  )
}