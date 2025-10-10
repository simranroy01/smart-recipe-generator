// src/app/auth/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signIn') // 'signIn' or 'signUp'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [awaitingVerification, setAwaitingVerification] = useState(false)
  const [message, setMessage] = useState('')
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
    })
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setAwaitingVerification(true)
      setMessage('Account created! Please check your email for the OTP.')
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
    } else if (session) {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('signIn')}
            className={`px-4 py-2 w-1/2 font-medium ${
              activeTab === 'signIn'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signUp')}
            className={`px-4 py-2 w-1/2 font-medium ${
              activeTab === 'signUp'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
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
              <label htmlFor="email_signin" className="block text-sm font-medium text-gray-700">Email address</label>
              <input id="email_signin" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="password_signin" className="block text-sm font-medium text-gray-700">Password</label>
              <input id="password_signin" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign In
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signUp' && !awaitingVerification && (
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Email and Password fields */}
            <div>
              <label htmlFor="email_signup" className="block text-sm font-medium text-gray-700">Email address</label>
              <input id="email_signup" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="password_signup" className="block text-sm font-medium text-gray-700">Password</label>
              <input id="password_signup" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Create Account
            </button>
          </form>
        )}

        {/* OTP Verification Form */}
        {activeTab === 'signUp' && awaitingVerification && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <p className="text-center text-sm">An OTP has been sent to <strong>{email}</strong>. Please enter it below.</p>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">One-Time Password</label>
              <input id="otp" type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Verify OTP and Sign In
            </button>
          </form>
        )}

        {/* Message block */}
        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
      </div>
    </div>
  )
}