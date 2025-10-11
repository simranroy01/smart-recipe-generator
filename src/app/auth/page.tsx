// src/app/auth/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signIn') // 'signIn' or 'signUp'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [awaitingVerification, setAwaitingVerification] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success'>('error')
  const router = useRouter()
  const supabase = createClient()

  // Handler for the Sign In form
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setMessage(`Error: ${error.message}`)
      setMessageType('error')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  // Handler for the initial Sign Up step (email/password)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    if (error) {
      let errorMsg = error.message
      if (error.message.includes('Database error')) {
        errorMsg = 'Oops! There was an issue creating your account. Please try again later.'
      } else if (error.message.includes('already registered')) {
        errorMsg = 'An account with this email already exists. Please sign in instead.'
      } else if (error.message.includes('Password')) {
        errorMsg = 'Password must be at least 6 characters long.'
      } else {
        errorMsg = `Error: ${error.message}`
      }
      setMessage(errorMsg)
      setMessageType('error')
    } else {
      setAwaitingVerification(true)
      setMessage('Account created! Please check your email for the OTP.')
      setMessageType('success')
    }
  }

  // Handler for the OTP verification step
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    })
    if (error) {
      setMessage(`Error: ${error.message}`)
      setMessageType('error')
    } else if (session) {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <main className="relative flex flex-col items-center min-h-screen p-4 pt-32 bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/foodbg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 z-0 bg-white/40 dark:bg-black/60" aria-hidden="true" />

      <div className="w-full max-w-lg p-8 space-y-6 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg z-10">
        {/* Tabs */}
        <div className="flex border-b border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setActiveTab('signIn')}
            className={`px-4 py-2 w-1/2 font-medium ${
              activeTab === 'signIn'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signUp')}
            className={`px-4 py-2 w-1/2 font-medium ${
              activeTab === 'signUp'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Sign In Form */}
        {activeTab === 'signIn' && (
          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Email and Password fields */}
            <div>
              <label htmlFor="email_signin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <input id="email_signin" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="password_signin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input id="password_signin" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign In
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signUp' && !awaitingVerification && (
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Name, Email and Password fields */}
            <div>
              <label htmlFor="name_signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input id="name_signup" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="email_signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <input id="email_signup" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="password_signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input id="password_signup" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Create Account
            </button>
          </form>
        )}

        {/* OTP Verification Form */}
        {activeTab === 'signUp' && awaitingVerification && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <p className="text-center text-sm text-gray-700 dark:text-gray-300">An OTP has been sent to <strong>{email}</strong>. Please enter it below.</p>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">One-Time Password</label>
              <input id="otp" type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Verify OTP and Sign In
            </button>
          </form>
        )}

        {/* Message block */}
        {message && (
          <p className={`mt-4 text-center text-sm ${
            messageType === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {message}
          </p>
        )}
      </div>

      {/* Cute GIF at the bottom */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
        <Image
          src="/cute.gif"
          alt="Cute cooking animation"
          width={260}
          height={260}
          className="object-contain opacity-60"
          unoptimized
        />
      </div>
    </main>
  )
}